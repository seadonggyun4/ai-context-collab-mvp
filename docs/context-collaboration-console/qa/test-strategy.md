# Test Strategy

## Layers

| Layer | 검증 |
| --- | --- |
| Schema | YAML parse, enum, required field, relation integrity |
| Domain | workflow transitions, permission guards, completion gate |
| Component | Astryx wrappers, state variants, keyboard behavior |
| Integration | fixture adapter에서 route와 상태 동기화 |
| Browser | P0 end-to-end flow, responsive, focus, visual hierarchy |
| Content | 금지 카피, 실제 업무 문구, error recovery |
| Visual | Truthound reference lock, token, density, card/border/radius audit |
| Architecture | FSD layer dependency, slice public API, circular import |
| Theme | system/light/dark persistence, OS sync, first paint, contrast, visual regression |
| Backend | API contract, domain transition, RBAC, audit, concurrency, migration |
| Editor | Markdown/YAML language, diagnostic, IME, theme, draft/conflict recovery |
| Deploy | Render Blueprint, SPA rewrite, health, CORS, migration, web→API smoke |
| Release | policy scan, gzip asset budget, Playwright axe/keyboard/reflow/screenshot gate |

## 필수 반례

- 승인되지 않은 제안을 구현 상태로 전환
- 승인 이후 proposal revision 변경
- 실패 evidence가 있는데 활성화
- 구현 변경 후 이전 evidence 재사용
- contributor가 high-risk 승인
- graph만 제공해 키보드 사용자가 관계를 탐색하지 못함
- loading/error 상태에서 이전 데이터가 현재 데이터처럼 노출됨
- dark mode에서 light token hard-code로 text/status/diff 의미가 사라짐
- system mode인데 OS theme 변경이 반영되지 않거나 업무 state가 초기화됨
- 하위 FSD layer가 상위 layer 또는 다른 slice 내부 파일을 직접 import함

## 브라우저 크기

- 1280×900 desktop
- 1024×900 compact desktop
- 768×1024 tablet
- 390×844 mobile

## 증거

- 명령, exit code, 결과 요약
- P0 화면별 screenshot
- keyboard flow와 focus 결과
- 미검증 항목과 fixture 한계
- light/dark 동일 viewport screenshot과 contrast 결과
- FSD dependency test 및 Astryx/제품 CSS 소유 경계 검사 결과
- CodeMirror 양 theme, 한글 IME, revision conflict evidence
- Render preview의 frontend/API/DB smoke와 migration 결과
- 동일 Chromium 환경의 visual baseline/diff와 production gzip budget 결과
