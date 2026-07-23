# QF-008 Review and Verification QA

## P0

- REQ-REVIEW-001 semantic/raw diff가 같은 revision과 scope를 표시한다.
- REQ-REVIEW-002 approve/request changes/reject 권한·comment·state guard.
- REQ-REVIEW-003 approval revision/scope lock과 stale response.
- REQ-VERIFY-001 automated/manual group, current implementation revision filter.
- REQ-VERIFY-002 failed/not executed/partial/manual unresolved/scope mismatch blocker.
- self approval, high-risk reviewer, forged role, forbidden transition 차단.
- mutation idempotency와 audit actor/action/target/request ID.
- FSD/type/lint/test/build, 1280/768/390px, light/dark, keyboard와 focus.

## 실행 결과

| 항목 | 결과 | 증거 |
| --- | --- | --- |
| semantic/raw 동일 revision | 통과 | `context-v1.3 → proposal-r1`, semantic 8건과 raw before/after |
| 승인·수정 요청·반려/comment guard | 통과 | route·fixture·backend domain/API tests |
| self/high-risk/stale scope | 통과 | 서버 403/409 구조화 오류와 `command.denied` audit contract |
| idempotency/audit | 통과 | 동일 명령 replay audit 불변, key 재사용 409, 정상 흐름 audit 8건 |
| automated/manual evidence | 통과 | 구현 r1에서 두 group 별도 기록과 latest revision 적용 |
| completion gate | 통과 | 미실행 시 409, evidence 2건 뒤 READY_TO_ACTIVATE 허용 |
| FSD/type/lint/build | 통과 | frontend 74 tests, backend 38 tests, 오류 0 |
| desktop/mobile/theme | 통과 | 1280 light, 390 dark, pane 전환과 overflow 0 |
| 브라우저 runtime | 통과 | console error/warning 0 |

PostgreSQL integration test 1건은 `TEST_DATABASE_URL`이 없는 로컬 환경에서 의도적으로 skip됐다. Migration single-head와 repository 코드는 contract 검사에 통과했으며 실제 DB smoke는 Render preview 환경에서 재실행한다.
