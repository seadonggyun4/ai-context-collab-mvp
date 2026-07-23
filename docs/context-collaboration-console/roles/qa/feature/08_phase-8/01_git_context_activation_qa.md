# QF-009 Git publication and Context activation QA

## P0

- READY 이전·승인 범위 불일치·stale base SHA에서 Git write 0건.
- server-generated branch/commit과 sandbox 외부 경로 write 0건.
- publication commit SHA와 required evidence 연결.
- reviewer/viewer activation 403, admin activation 성공.
- duplicate publication/activation idempotent replay.
- ContextVersion·Project active version·workflow·audit 일치.
- SCR-09 loading/error/blocked/published/activated 상태.
- 1280/768/390px, light/dark, keyboard/focus와 금지 디자인·카피.

## 실행 결과

- `npm run lint`, `npm run typecheck`: 오류 0.
- `npm test -- --run`: 26 files, 81 tests 통과.
- `npm run build`: 2147 modules production build 성공.
- `uv run ruff check .`, `uv run mypy app`: 오류 0.
- `uv run pytest`: 42 passed, PostgreSQL 환경 의존 1 skipped.
- 실제 임시 Git repository에서 branch·commit·content·PR projection과 idempotent replay 검증.
- READY 전 publish가 `GitPublisher`에 도달하지 않으며 stale base와 path escape를 차단함.
- API contract에서 reviewer activation 403, admin activation·commit evidence·audit 성공.
- 브라우저: 1265px light/390px dark, publication→activation, 결과/후속 링크, horizontal overflow 0건.
- 키보드 Enter 흐름은 route test로 검증했으며 주요 action은 native button semantics를 유지한다.
