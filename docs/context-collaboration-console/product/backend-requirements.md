# Backend Product Requirements

## 목적

Backend는 단순 CRUD API가 아니라 프로젝트 문맥, 변경 제안, 승인, 검증 증거와 문서 revision을 일관되게 통제하는 실행 경계다. 브라우저가 Git token, AI key, 승인 권한 또는 source of truth를 직접 소유하지 않게 한다.

## 사용자 기능

| ID | 기능 | 사용자 결과 |
| --- | --- | --- |
| BE-PROJECT-01 | 프로젝트 조회·설정 | repository, active Context, 정책과 상태를 동일 기준으로 조회 |
| BE-DOC-01 | 문서 목록·원본 조회 | 허용된 Markdown/YAML의 revision, metadata, relation 확인 |
| BE-DOC-02 | 문서 편집 초안 | 원본 revision 기준 draft 저장, 자동 저장과 복구 |
| BE-DOC-03 | 문서 검증 | Markdown metadata, YAML schema, 금지 정책, relation 검사 |
| BE-DOC-04 | 문서 변경 제안 | main에 직접 쓰지 않고 diff와 ChangeRequest revision 생성 |
| BE-CHANGE-01 | 변경 요청 lifecycle | 생성, 분석, 검토, 승인, 검증, 활성화 상태 전이 |
| BE-IMPACT-01 | 영향 분석 실행 | role, document, API, data, code, QA 영향과 근거 저장 |
| BE-REVIEW-01 | 승인·반려·수정 요청 | 역할·위험도·self-approval 제한을 서버에서 강제 |
| BE-EVIDENCE-01 | 검증 증거 수집 | 자동·수동 evidence와 artifact, commit SHA 연결 |
| BE-CONTEXT-01 | Context 활성화 | completion gate 통과 후 version과 audit 생성 |
| BE-AUDIT-01 | 감사 이력 | actor, action, target, before/after, request ID와 시각 보존 |
| BE-AUTH-01 | 인증·권한 | OIDC-ready identity와 viewer/contributor/reviewer/admin RBAC |

## 문서 편집·저장 흐름

1. 클라이언트는 `documentId`, `content`, `baseRevision`, `clientDraftId`로 draft를 저장한다.
2. 서버는 path allowlist, size, encoding과 현재 revision을 확인한다.
3. revision이 다르면 `409 DOCUMENT_REVISION_CONFLICT`와 최신 원본·merge 입력을 반환한다.
4. Markdown/YAML parser와 schema/policy validator가 diagnostic을 생성한다.
5. error가 있으면 제안 제출을 차단하고 line/column/code/message를 반환한다.
6. 유효한 draft만 ChangeRequest의 document proposal revision으로 고정한다.
7. 승인 후 Git adapter가 branch/commit/PR을 생성하며 main 직접 write는 기본 금지한다.

## 비기능 요구사항

- API는 `/api/v1` versioning과 OpenAPI contract를 제공한다.
- 모든 mutation은 authentication, authorization, validation, audit를 통과한다.
- idempotency key로 중복 change/evidence/job mutation을 방지한다.
- optimistic concurrency와 immutable revision으로 승인 이후 변조를 막는다.
- request ID와 actor ID가 구조화 log와 audit event에 연결된다.
- health/readiness endpoint는 DB migration 상태와 핵심 dependency를 구분한다.
- 문서 원본과 비밀값을 일반 application log에 기록하지 않는다.

## 초기 운영 경계

- Postgres가 application state와 audit metadata의 source of truth다.
- Git repository가 승인된 Markdown/YAML 원본의 source of truth다.
- Render filesystem은 ephemeral이므로 영속 문서 저장소로 사용하지 않는다.
- AI 분석과 CI 실행은 job interface로 분리한다. 초기에는 deterministic provider, 후속에는 background worker를 사용한다.
