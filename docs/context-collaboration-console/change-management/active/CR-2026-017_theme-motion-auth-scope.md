# CR-2026-017 Theme·Landing motion·인증 범위 재정렬

## 변경 메타데이터

| 항목 | 값 |
| --- | --- |
| status | `VERIFIED_LOCAL` |
| requested_at | `2026-07-23` |
| risk | `HIGH` |
| scope | semantic theme token, public landing, Three.js runtime, frontend authentication boundary, Render frontend environment |
| approval | 사용자 직접 요청 |

## 문제

- light/dark 전환 시 일부 컴포넌트가 의미 token 대신 직접 색상과 `!important` 보정에 의존해 전경/배경 대비가 뒤집힌다.
- 메인 화면은 Truthound의 정보 구조만 일부 반영했으며, 실제 reference의 WebGL hero와 세 가지 Three.js product scene을 반영하지 못했다.
- 현재 단계에 필요하지 않은 login/session UI가 제품 진입을 가로막고 운영 shell에 사용자·logout affordance를 노출한다.

## 결정

1. 모든 제품 색상은 동일한 semantic token 이름의 light/dark 값으로 정의한다. 컴포넌트별 theme 강제 보정과 제품 CSS의 직접 hex를 제거한다.
2. Truthound main의 동작 원리와 화면 리듬을 reference로 삼되 브랜드 자산·카피·shader 원문은 복제하지 않는다.
3. public landing에 project palette 기반 WebGL color field와 `burst / context globe / evidence stream` Three.js scene을 구현한다.
4. Three.js는 landing 전용 lazy chunk로 격리하고 viewport·page visibility·reduced motion·DPR 제한과 자원 dispose를 적용한다.
5. frontend login/session boundary, 사용자 avatar/logout, 인증 환경변수를 제거한다. 이 릴리스의 사용자는 별도 login 없이 console에 진입한다.
6. 승인·검증·self-approval 차단 등 workflow의 업무 규칙은 인증과 분리해 유지한다. OIDC/실사용자 RBAC는 별도 변경 승인 전까지 `DEFERRED`다.

## 수용 기준

- `system / light / dark` 전환과 새로고침 후 canvas·surface·text·line·action·focus·status token이 일관되게 적용된다.
- 메인에서 hero color field와 세 개의 Three.js scene이 project teal palette로 렌더링되고, motion 제한 환경에서는 정적인 첫 프레임을 제공한다.
- landing motion은 화면 밖/숨김 탭에서 animation loop를 중지하고 route unmount 시 WebGL resource를 해제한다.
- login, logout, session-expired UI와 frontend auth provider가 production bundle에 존재하지 않는다.
- 승인·검증 domain guard와 기존 반례 테스트는 계속 통과한다.
- lint, typecheck, unit, policy, build, performance, light/dark browser QA가 통과한다.

## 제외

- Truthound 브랜드·문구·원본 WebGL shader와 시각 자산의 복제
- backend 업무 API의 actor·audit 모델 제거
- 조직 OIDC, 계정 관리, 실제 사용자 권한 설정

## 검증 증거

- Frontend: lint·strict typecheck, 27 files / 98 tests, production build 통과
- 제품 정책: 183 files / violation 0
- 성능: initial JS gzip 159,910/165,000, largest chunk 176,496/190,000, total JS gzip 568,107/590,000 bytes
- Browser: 14 scenarios 통과 — 4 breakpoints, keyboard, axe, WebGL scene 4개, landing/dashboard/editor 양 테마 snapshot 6개
- Backend: Ruff·format·mypy 통과, 54 passed / local PostgreSQL 1 skipped
- API contract: `/api/v1/auth/*` OpenAPI path 0건, runtime 404
