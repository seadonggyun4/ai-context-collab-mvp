"""Review workflow commands with server-owned identity and idempotency."""

import json
from collections.abc import Callable
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from hashlib import sha256

from app.application.ports import ChangeWorkflowRepository, GitPublisher, GitPublishSpec
from app.domain import (
    Actor,
    ActorRole,
    ChangeStatus,
    ChangeWorkflow,
    DomainError,
    EvidenceResult,
    GitPublication,
    ReviewDecision,
    activate_context,
    record_evidence,
    record_git_publication,
    record_review,
    transition_workflow,
    validate_git_publication,
)


class ActorDirectory:
    """Preview identity registry; replaceable with an OIDC-backed adapter."""

    def __init__(self, actors: tuple[Actor, ...] | None = None) -> None:
        configured = actors or (
            Actor("user-planning-01", "기획 담당자", ActorRole.CONTRIBUTOR),
            Actor("user-review-01", "검토 담당자", ActorRole.REVIEWER),
            Actor("user-admin-01", "운영 관리자", ActorRole.ADMIN),
            Actor("user-viewer-01", "조회 담당자", ActorRole.VIEWER),
            Actor("system-ci-01", "자동 검증", ActorRole.CONTRIBUTOR),
        )
        self._actors = {actor.id: actor for actor in configured}

    def resolve(self, actor_id: str) -> Actor:
        actor = self._actors.get(actor_id)
        if actor is None:
            raise DomainError(
                code="ACTOR_UNKNOWN",
                title="사용자를 확인할 수 없습니다",
                detail="등록된 사용자 식별자로 다시 요청하세요.",
                status_code=401,
            )
        return actor

    def register_authenticated(self, actor: Actor) -> None:
        """Register identity only after a trusted authentication adapter resolves its role."""

        self._actors[actor.id] = actor


@dataclass(frozen=True, slots=True)
class ReviewCommand:
    decision: ReviewDecision
    proposal_revision: int
    scope_fingerprint: str
    comment: str


@dataclass(frozen=True, slots=True)
class EvidenceCommand:
    test_id: str
    result: EvidenceResult


@dataclass(frozen=True, slots=True)
class TransitionCommand:
    target: ChangeStatus


@dataclass(frozen=True, slots=True)
class PublishGitCommand:
    expected_base_commit_sha: str
    proposal_revision: int
    scope_fingerprint: str
    implementation_revision: int


@dataclass(frozen=True, slots=True)
class ActivateContextCommand:
    version: str
    document_ids: tuple[str, ...]


Command = ReviewCommand | EvidenceCommand | TransitionCommand | PublishGitCommand | ActivateContextCommand


class ReviewWorkflowCommands:
    def __init__(
        self,
        repository: ChangeWorkflowRepository,
        actors: ActorDirectory | None = None,
        git_publisher: GitPublisher | None = None,
    ) -> None:
        self._repository = repository
        self.actors = actors or ActorDirectory()
        self._git_publisher = git_publisher

    async def get(self, change_id: str) -> ChangeWorkflow:
        workflow = await self._repository.get(change_id)
        if workflow is None:
            raise DomainError(
                code="CHANGE_REQUEST_NOT_FOUND",
                title="변경 요청을 찾을 수 없습니다",
                detail=f"변경 요청 '{change_id}'이(가) 등록되어 있지 않습니다.",
                status_code=404,
            )
        return workflow

    async def review(
        self,
        change_id: str,
        actor_id: str,
        command: ReviewCommand,
        idempotency_key: str,
    ) -> ChangeWorkflow:
        return await self._execute(
            change_id,
            actor_id,
            command,
            idempotency_key,
            lambda workflow, actor, now: record_review(
                workflow,
                actor,
                command.decision,
                command.proposal_revision,
                command.scope_fingerprint,
                command.comment,
                idempotency_key,
                now,
            ),
        )

    async def evidence(
        self,
        change_id: str,
        actor_id: str,
        command: EvidenceCommand,
        idempotency_key: str,
    ) -> ChangeWorkflow:
        return await self._execute(
            change_id,
            actor_id,
            command,
            idempotency_key,
            lambda workflow, actor, now: record_evidence(
                workflow,
                actor,
                command.test_id,
                command.result,
                idempotency_key,
                now,
            ),
        )

    async def transition(
        self,
        change_id: str,
        actor_id: str,
        command: TransitionCommand,
        idempotency_key: str,
    ) -> ChangeWorkflow:
        return await self._execute(
            change_id,
            actor_id,
            command,
            idempotency_key,
            lambda workflow, actor, now: transition_workflow(
                workflow,
                actor,
                command.target,
                idempotency_key,
                now,
            ),
        )

    async def publish_git(
        self,
        change_id: str,
        actor_id: str,
        command: PublishGitCommand,
        idempotency_key: str,
    ) -> ChangeWorkflow:
        fingerprint = _fingerprint(change_id, actor_id, command)
        replay = await self._replay(change_id, idempotency_key, fingerprint)
        if replay is not None:
            return replay
        workflow = await self.get(change_id)
        now = datetime.now(UTC)
        try:
            actor = self.actors.resolve(actor_id)
            validate_git_publication(
                workflow,
                actor,
                expected_base_commit_sha=command.expected_base_commit_sha,
                proposal_revision=command.proposal_revision,
                scope_fingerprint=command.scope_fingerprint,
                implementation_revision=command.implementation_revision,
            )
            if self._git_publisher is None:
                raise DomainError(
                    code="GIT_WRITE_NOT_CONFIGURED",
                    title="Git 쓰기 저장소가 구성되지 않았습니다",
                    detail="격리된 Git publisher 설정을 확인하세요.",
                    status_code=503,
                )
            branch = f"context/{workflow.id.lower()}-r{workflow.proposal_revision}"
            result = await self._git_publisher.publish(
                GitPublishSpec(
                    project_id=workflow.project_id,
                    change_id=workflow.id,
                    branch=branch,
                    base_commit_sha=workflow.base_commit_sha,
                    document_path=f"docs/{workflow.project_id}/changes/{workflow.id}.md",
                    document_content=workflow.raw_after,
                    commit_message=f"context({workflow.project_id}): apply {workflow.id}",
                )
            )
            publication = GitPublication(
                branch=result.branch,
                commit_sha=result.commit_sha,
                pull_request_url=result.pull_request_url,
                pull_request_status=result.pull_request_status,
                proposal_revision=workflow.proposal_revision,
                scope_fingerprint=workflow.scope_fingerprint,
                implementation_revision=workflow.implementation_revision,
                base_commit_sha=workflow.base_commit_sha,
                published_by=actor.id,
                published_at=now,
            )
            updated = record_git_publication(workflow, actor, publication, idempotency_key, now)
        except DomainError as error:
            await self._record_denial(change_id, actor_id, idempotency_key, type(command).__name__, error, now)
            raise
        await self._repository.save_command(
            updated,
            expected_revision=workflow.storage_revision,
            new_audit_offset=len(workflow.audit_events),
            idempotency_key=idempotency_key,
            input_fingerprint=fingerprint,
        )
        return updated

    async def activate(
        self,
        change_id: str,
        actor_id: str,
        command: ActivateContextCommand,
        idempotency_key: str,
    ) -> ChangeWorkflow:
        return await self._execute(
            change_id,
            actor_id,
            command,
            idempotency_key,
            lambda workflow, actor, now: activate_context(
                workflow,
                actor,
                version=command.version,
                document_ids=command.document_ids,
                request_id=idempotency_key,
                occurred_at=now,
            ),
        )

    async def _replay(
        self,
        change_id: str,
        idempotency_key: str,
        fingerprint: str,
    ) -> ChangeWorkflow | None:
        receipt = await self._repository.find_receipt(idempotency_key)
        if receipt is None:
            return None
        receipt_change_id, receipt_fingerprint = receipt
        if receipt_change_id != change_id or receipt_fingerprint != fingerprint:
            raise DomainError(
                code="IDEMPOTENCY_KEY_REUSED",
                title="멱등 키가 다른 명령에 사용되었습니다",
                detail="새로운 Idempotency-Key로 다시 요청하세요.",
                status_code=409,
            )
        return await self.get(change_id)

    async def _record_denial(
        self,
        change_id: str,
        actor_id: str,
        request_id: str,
        command_type: str,
        error: DomainError,
        occurred_at: datetime,
    ) -> None:
        await self._repository.append_denied_command(
            change_id=change_id,
            actor_id=actor_id,
            request_id=request_id,
            command_type=command_type,
            error_code=error.code,
            occurred_at=occurred_at,
        )

    async def _execute(
        self,
        change_id: str,
        actor_id: str,
        command: Command,
        idempotency_key: str,
        execute: Callable[[ChangeWorkflow, Actor, datetime], ChangeWorkflow],
    ) -> ChangeWorkflow:
        fingerprint = _fingerprint(change_id, actor_id, command)
        replay = await self._replay(change_id, idempotency_key, fingerprint)
        if replay is not None:
            return replay
        workflow = await self.get(change_id)
        now = datetime.now(UTC)
        try:
            actor = self.actors.resolve(actor_id)
            # Command handlers share the same pure aggregate signature.
            updated = execute(workflow, actor, now)
        except DomainError as error:
            await self._record_denial(change_id, actor_id, idempotency_key, type(command).__name__, error, now)
            raise
        await self._repository.save_command(
            updated,
            expected_revision=workflow.storage_revision,
            new_audit_offset=len(workflow.audit_events),
            idempotency_key=idempotency_key,
            input_fingerprint=fingerprint,
        )
        return updated


def _fingerprint(
    change_id: str,
    actor_id: str,
    command: Command,
) -> str:
    payload = {
        "actorId": actor_id,
        "changeId": change_id,
        "command": {key: str(value) for key, value in asdict(command).items()},
        "type": type(command).__name__,
    }
    return sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
