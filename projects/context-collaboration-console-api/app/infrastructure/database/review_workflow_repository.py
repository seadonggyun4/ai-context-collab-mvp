"""Transactional PostgreSQL adapter for review workflow commands."""

from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.domain import (
    Actor,
    ActorRole,
    AuditRecord,
    ChangeStatus,
    ChangeWorkflow,
    ContextVersionRecord,
    DomainError,
    EvidenceRecord,
    EvidenceResult,
    EvidenceType,
    GitPublication,
    QaScenario,
    ReviewDecision,
    ReviewRecord,
    SemanticDiff,
)
from app.infrastructure.database.models import (
    ChangeCommandReceiptRow,
    ChangeWorkflowRow,
    ContextVersionRow,
    ProjectRow,
    WorkflowAuditEventRow,
)


class SqlAlchemyChangeWorkflowRepository:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def get(self, change_id: str) -> ChangeWorkflow | None:
        async with self._session_factory() as session:
            row = await session.get(ChangeWorkflowRow, change_id)
            if row is None:
                return None
            audits = (
                await session.scalars(
                    select(WorkflowAuditEventRow)
                    .where(WorkflowAuditEventRow.change_request_id == change_id)
                    .order_by(WorkflowAuditEventRow.occurred_at, WorkflowAuditEventRow.id)
                )
            ).all()
            return _deserialize(row, tuple(_audit_from_row(item) for item in audits))

    async def find_receipt(self, idempotency_key: str) -> tuple[str, str] | None:
        async with self._session_factory() as session:
            row = await session.get(ChangeCommandReceiptRow, idempotency_key)
            if row is None:
                return None
            return row.change_request_id, row.input_fingerprint

    async def save_command(
        self,
        workflow: ChangeWorkflow,
        *,
        expected_revision: int,
        new_audit_offset: int,
        idempotency_key: str,
        input_fingerprint: str,
    ) -> None:
        async with self._session_factory.begin() as session:
            row = await session.scalar(
                select(ChangeWorkflowRow).where(ChangeWorkflowRow.id == workflow.id).with_for_update()
            )
            if row is None:
                raise _conflict("CHANGE_REQUEST_NOT_FOUND", "변경 요청을 찾을 수 없습니다")
            if row.storage_revision != expected_revision:
                raise _conflict("WORKFLOW_REVISION_CONFLICT", "다른 사용자가 변경 요청을 먼저 수정했습니다")
            row.storage_revision = workflow.storage_revision
            row.payload = _serialize(workflow)
            if workflow.status == ChangeStatus.ACTIVATED and workflow.context_versions:
                project = await session.scalar(
                    select(ProjectRow).where(ProjectRow.id == workflow.project_id).with_for_update()
                )
                if project is None:
                    raise _conflict("PROJECT_NOT_FOUND", "프로젝트를 찾을 수 없습니다")
                latest_context = workflow.context_versions[-1]
                existing_context = await session.scalar(
                    select(ContextVersionRow.id).where(ContextVersionRow.change_request_id == workflow.id)
                )
                if existing_context is None:
                    session.add(
                        ContextVersionRow(
                            project_id=latest_context.project_id,
                            version=latest_context.version,
                            change_request_id=latest_context.change_request_id,
                            document_ids=list(latest_context.document_ids),
                            source_commit_sha=latest_context.source_commit_sha,
                            activated_by=latest_context.activated_by,
                            activated_at=latest_context.activated_at,
                        )
                    )
                project.active_context_version = latest_context.version
                project.effective_date = latest_context.activated_at.date()
            session.add_all(_audit_to_row(item) for item in workflow.audit_events[new_audit_offset:])
            session.add(
                ChangeCommandReceiptRow(
                    idempotency_key=idempotency_key,
                    change_request_id=workflow.id,
                    input_fingerprint=input_fingerprint,
                    resulting_revision=workflow.storage_revision,
                )
            )

    async def append_denied_command(
        self,
        *,
        change_id: str,
        actor_id: str,
        request_id: str,
        command_type: str,
        error_code: str,
        occurred_at: datetime,
    ) -> None:
        event_id = f"{request_id}:command.denied"
        async with self._session_factory.begin() as session:
            existing = await session.scalar(
                select(WorkflowAuditEventRow.id).where(
                    WorkflowAuditEventRow.change_request_id == change_id,
                    WorkflowAuditEventRow.event_id == event_id,
                )
            )
            if existing is not None:
                return
            session.add(
                WorkflowAuditEventRow(
                    event_id=event_id,
                    change_request_id=change_id,
                    actor_id=actor_id,
                    action="command.denied",
                    target_type="CHANGE_REQUEST",
                    target_id=change_id,
                    before={},
                    after={"commandType": command_type, "errorCode": error_code},
                    request_id=request_id,
                    occurred_at=occurred_at,
                )
            )


def _conflict(code: str, title: str) -> DomainError:
    return DomainError(code=code, title=title, detail="최신 상태를 조회한 뒤 다시 시도하세요.", status_code=409)


def _actor(data: dict[str, Any]) -> Actor:
    return Actor(id=data["id"], display_name=data["displayName"], role=ActorRole(data["role"]))


def _actor_data(actor: Actor) -> dict[str, str]:
    return {"id": actor.id, "displayName": actor.display_name, "role": actor.role.value}


def _serialize(workflow: ChangeWorkflow) -> dict[str, Any]:
    review = workflow.current_review
    return {
        "title": workflow.title,
        "status": workflow.status.value,
        "risk": workflow.risk,
        "requester": _actor_data(workflow.requester),
        "contextSnapshot": workflow.context_snapshot,
        "proposalRevision": workflow.proposal_revision,
        "scopeFingerprint": workflow.scope_fingerprint,
        "implementationRevision": workflow.implementation_revision,
        "qaScenarios": [
            {"id": item.id, "title": item.title, "type": item.type.value, "required": item.required}
            for item in workflow.qa_scenarios
        ],
        "semanticDiff": [
            {
                "id": item.id,
                "section": item.section,
                "label": item.label,
                "before": item.before,
                "after": item.after,
                "changeType": item.change_type,
            }
            for item in workflow.semantic_diff
        ],
        "rawBefore": workflow.raw_before,
        "rawAfter": workflow.raw_after,
        "currentReview": None
        if review is None
        else {
            "id": review.id,
            "reviewer": _actor_data(review.reviewer),
            "decision": review.decision.value,
            "proposalRevision": review.proposal_revision,
            "scopeFingerprint": review.scope_fingerprint,
            "comment": review.comment,
            "decidedAt": review.decided_at.isoformat(),
        },
        "evidence": [
            {
                "id": item.id,
                "testId": item.test_id,
                "type": item.type.value,
                "result": item.result.value,
                "required": item.required,
                "command": item.command,
                "artifact": item.artifact,
                "implementationRevision": item.implementation_revision,
                "verifiedBy": item.verified_by,
                "verifiedAt": item.verified_at.isoformat(),
                "commitSha": item.commit_sha,
            }
            for item in workflow.evidence
        ],
        "baseCommitSha": workflow.base_commit_sha,
        "documentIds": list(workflow.document_ids),
        "gitPublication": None
        if workflow.git_publication is None
        else {
            "branch": workflow.git_publication.branch,
            "commitSha": workflow.git_publication.commit_sha,
            "pullRequestUrl": workflow.git_publication.pull_request_url,
            "pullRequestStatus": workflow.git_publication.pull_request_status,
            "proposalRevision": workflow.git_publication.proposal_revision,
            "scopeFingerprint": workflow.git_publication.scope_fingerprint,
            "implementationRevision": workflow.git_publication.implementation_revision,
            "baseCommitSha": workflow.git_publication.base_commit_sha,
            "publishedBy": workflow.git_publication.published_by,
            "publishedAt": workflow.git_publication.published_at.isoformat(),
        },
        "contextVersions": [
            {
                "version": item.version,
                "projectId": item.project_id,
                "changeRequestId": item.change_request_id,
                "documentIds": list(item.document_ids),
                "sourceCommitSha": item.source_commit_sha,
                "activatedBy": item.activated_by,
                "activatedAt": item.activated_at.isoformat(),
            }
            for item in workflow.context_versions
        ],
    }


def _deserialize(row: ChangeWorkflowRow, audits: tuple[AuditRecord, ...]) -> ChangeWorkflow:
    data = row.payload
    review_data = data.get("currentReview")
    review = None
    if isinstance(review_data, dict):
        review = ReviewRecord(
            id=str(review_data["id"]),
            change_request_id=row.id,
            reviewer=_actor(review_data["reviewer"]),
            decision=ReviewDecision(str(review_data["decision"])),
            proposal_revision=int(review_data["proposalRevision"]),
            scope_fingerprint=str(review_data["scopeFingerprint"]),
            comment=str(review_data["comment"]),
            decided_at=datetime.fromisoformat(str(review_data["decidedAt"])),
        )
    publication_data = data.get("gitPublication")
    publication = None
    if isinstance(publication_data, dict):
        publication = GitPublication(
            branch=str(publication_data["branch"]),
            commit_sha=str(publication_data["commitSha"]),
            pull_request_url=str(publication_data["pullRequestUrl"]),
            pull_request_status=str(publication_data["pullRequestStatus"]),
            proposal_revision=int(publication_data["proposalRevision"]),
            scope_fingerprint=str(publication_data["scopeFingerprint"]),
            implementation_revision=int(publication_data["implementationRevision"]),
            base_commit_sha=str(publication_data["baseCommitSha"]),
            published_by=str(publication_data["publishedBy"]),
            published_at=datetime.fromisoformat(str(publication_data["publishedAt"])),
        )
    return ChangeWorkflow(
        id=row.id,
        project_id=row.project_id,
        title=str(data["title"]),
        status=ChangeStatus(str(data["status"])),
        risk=str(data["risk"]),
        requester=_actor(data["requester"]),
        context_snapshot=str(data["contextSnapshot"]),
        proposal_revision=int(data["proposalRevision"]),
        scope_fingerprint=str(data["scopeFingerprint"]),
        implementation_revision=int(data["implementationRevision"]),
        qa_scenarios=tuple(
            QaScenario(str(item["id"]), str(item["title"]), EvidenceType(str(item["type"])), bool(item["required"]))
            for item in data["qaScenarios"]
        ),
        semantic_diff=tuple(
            SemanticDiff(
                str(item["id"]),
                str(item["section"]),
                str(item["label"]),
                item.get("before"),
                item.get("after"),
                str(item["changeType"]),
            )
            for item in data["semanticDiff"]
        ),
        raw_before=str(data["rawBefore"]),
        raw_after=str(data["rawAfter"]),
        current_review=review,
        evidence=tuple(
            EvidenceRecord(
                id=str(item["id"]),
                change_request_id=row.id,
                test_id=str(item["testId"]),
                type=EvidenceType(str(item["type"])),
                result=EvidenceResult(str(item["result"])),
                required=bool(item["required"]),
                command=item.get("command"),
                artifact=item.get("artifact"),
                implementation_revision=int(item["implementationRevision"]),
                verified_by=str(item["verifiedBy"]),
                verified_at=datetime.fromisoformat(str(item["verifiedAt"])),
                commit_sha=item.get("commitSha"),
            )
            for item in data["evidence"]
        ),
        audit_events=audits,
        storage_revision=row.storage_revision,
        base_commit_sha=str(data.get("baseCommitSha", "")),
        document_ids=tuple(str(item) for item in data.get("documentIds", [])),
        git_publication=publication,
        context_versions=tuple(
            ContextVersionRecord(
                version=str(item["version"]),
                project_id=str(item["projectId"]),
                change_request_id=str(item["changeRequestId"]),
                document_ids=tuple(str(document_id) for document_id in item["documentIds"]),
                source_commit_sha=str(item["sourceCommitSha"]),
                activated_by=str(item["activatedBy"]),
                activated_at=datetime.fromisoformat(str(item["activatedAt"])),
            )
            for item in data.get("contextVersions", [])
        ),
    )


def _audit_to_row(item: AuditRecord) -> WorkflowAuditEventRow:
    return WorkflowAuditEventRow(
        event_id=item.id,
        change_request_id=item.change_request_id,
        actor_id=item.actor_id,
        action=item.action,
        target_type=item.target_type,
        target_id=item.target_id,
        before=item.before,
        after=item.after,
        request_id=item.request_id,
        occurred_at=item.occurred_at,
    )


def _audit_from_row(row: WorkflowAuditEventRow) -> AuditRecord:
    return AuditRecord(
        id=row.event_id,
        change_request_id=row.change_request_id,
        actor_id=row.actor_id,
        action=row.action,
        target_type=row.target_type,
        target_id=row.target_id,
        before=row.before,
        after=row.after,
        request_id=row.request_id,
        occurred_at=row.occurred_at,
    )
