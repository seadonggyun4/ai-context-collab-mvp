# CR-2026-011 Phase 7 승인·검증

## 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-011` |
| 현재 상태 | `COMPLETED` |
| 현재 Phase | `ARCHIVIST` |
| 요청일 | `2026-07-23` |
| 요청자 | 사용자 |
| 위험도 | 높음 |
| 승인 상태 | `APPROVED` |
| 완료일 | `2026-07-23` |

## 요청 원문

> Phase 7 승인·검증을 문서시스템에 따라 확장성 높고 유지보수성 높게 추상화해서 개발 진행해줘.

## Active Context snapshot

- 화면: `SCR-08`
- 요구사항: `REQ-REVIEW-001`~`003`, `REQ-VERIFY-001`~`002`, `REQ-BE-001`
- QA: `QA-REVIEW-01`~`03`, `QA-VERIFY-01`~`02`, `QA-BE-01`~`02`
- 정책: `workflow-policy.yaml`, `permissions.yaml`
- 선행 계약: Phase 1 ChangeRequest aggregate·Review·Evidence·AuditEvent, Phase 5 document revision, Phase 6 impact route

## 결정

- semantic/raw diff는 동일한 versioned `ReviewWorkspace` projection에서 생성하며 UI가 diff 의미를 재추론하지 않는다.
- review decision은 proposal revision과 scope fingerprint를 함께 제출하고 backend가 최신 범위와 재검증한다.
- actor ID는 요청에서 전달할 수 있지만 role/permission은 서버 actor registry에서만 결정한다. Phase 9 OIDC는 identity transport만 교체한다.
- 승인·수정 요청·반려·evidence·transition mutation은 모두 idempotency key, RBAC, state guard와 audit append를 통과한다.
- automated/manual evidence를 별도 group으로 표시하고 현재 implementation revision의 latest evidence만 gate에 사용한다.
- READY_TO_ACTIVATE gate는 required failure, not executed, partial, unresolved manual, approved scope mismatch를 각각 구조화된 blocker로 노출한다.
- fixture와 HTTP repository는 같은 command/result contract를 구현하고 HTTP 실패를 fixture로 fallback하지 않는다.

## 수용 기준

| ID | 조건 |
| --- | --- |
| AC-01 | field/semantic diff 기본과 raw diff 보조가 동일 before/after revision을 표시한다 |
| AC-02 | approve/request changes/reject action이 권한·상태·필수 comment에 따라 활성화된다 |
| AC-03 | self approval, 고위험 비관리자 승인, stale proposal scope가 backend/domain에서 거부된다 |
| AC-04 | 승인 결과가 proposal revision·scope fingerprint와 고정되고 audit event에 actor/request ID가 남는다 |
| AC-05 | automated/manual evidence가 분리되고 latest implementation revision만 현재 결과로 사용된다 |
| AC-06 | 필수 실패·미실행·부분 확인·미해결 manual·scope mismatch가 완료 gate를 차단한다 |
| AC-07 | graph 없이 keyboard로 decision, diff mode, evidence와 audit을 탐색할 수 있다 |
| AC-08 | FSD/type/lint/test/build, backend policy/API, light/dark와 responsive browser QA가 통과한다 |

## 제외 범위

- OIDC 로그인·session·조직 directory 연동
- 실제 CI provider 실행과 artifact upload
- Git branch/commit/PR 및 Context activation
- 다자 승인 quorum과 병렬 approval policy

## 구현 결과

- Backend에 순수 `ChangeWorkflow` aggregate, actor registry, review/evidence/transition command service를 구성했다.
- PostgreSQL에는 versioned workflow, append-only audit, idempotency receipt를 분리하고 Alembic `20260723_0003`으로 고정했다.
- `ReviewWorkspace` 단일 projection이 semantic/raw diff, 권한 capability, 현재 evidence, gate blocker와 audit을 전달한다.
- Frontend는 FSD `entity → feature → widget → page` 경계와 fixture/HTTP repository 동형 계약을 유지한다.
- SCR-08에서 승인·수정 요청·반려, 자동·수동 검증, 완료 gate와 역순 audit timeline을 제공한다.

## 완료 증거

- Backend Ruff·mypy 오류 0, Pytest `38 passed`, PostgreSQL 환경 의존 integration `1 skipped`
- Frontend ESLint·TypeScript 오류 0, Vitest `23 files / 74 tests passed`, production build 성공
- API contract에서 self approval, high-risk reviewer, stale scope, idempotency key reuse와 forbidden READY 전이를 차단
- 거부된 권한·정책 명령도 상태 revision을 변경하지 않고 actor·request ID·error code 감사 이벤트를 기록
- 브라우저에서 승인→구현→검증→evidence 2건→READY 전이와 audit 8건 확인
- 1280px light, 390px dark에서 pane 전환·keyboard 접근·가로 overflow 없음 확인
- 브라우저 console error/warning 0건
