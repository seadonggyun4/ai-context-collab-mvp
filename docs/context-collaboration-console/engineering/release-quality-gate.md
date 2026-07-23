# Release Quality Gate

## 목적

Release 품질을 개인의 기억이나 특정 화면의 수동 확인에 의존하지 않고, versioned contract와 재현 가능한 명령으로 판정한다. Gate는 빠른 정적 검사에서 실제 browser 검사 순서로 실행한다.

## Gate 구조

| Gate | 명령 | 실패 조건 |
| --- | --- | --- |
| Source quality | `npm run lint`, `npm run typecheck` | lint/type 오류 또는 FSD 규칙 위반 |
| Product policy | `npm run quality:policy` | 금지 카피·CSS pattern·radius 위반 |
| Domain/UI | `npm test -- --run` | unit/integration/상태 계약 실패 |
| Production asset | `npm run build`, `npm run quality:performance` | build 실패 또는 gzip budget 초과 |
| Browser | `npm run quality:browser` | 접근성·keyboard·4 viewport·visual contract 실패 |

## Viewport 계약

| 이름 | viewport | 검증 초점 |
| --- | --- | --- |
| desktop | 1280×900 | 전체 navigation, multi-column 정보 구조 |
| compact desktop | 1024×900 | table/queue 재배치와 control 밀도 |
| tablet | 768×1024 | navigation, editor split, graph/list 전환 |
| mobile | 390×844 | single-column reflow, touch target, horizontal overflow |

viewport는 device label이 아니라 layout boundary다. 기능을 숨길 때는 동등한 accessible path를 제공한다.

## Data state taxonomy

| 상태 | 의미 | 기본 recovery |
| --- | --- | --- |
| loading | 응답 대기 | status announcement, duplicate action 차단 |
| empty | 정상 응답이나 항목 없음 | 생성/필터 초기화 경로 |
| error | 분류되지 않은 처리 실패 | 안전한 재시도 또는 상위 화면 |
| permission | 인증됐으나 권한 없음 | project로 복귀, 권한 요청 안내 |
| stale | 화면 기준 revision이 뒤처짐 | 최신 상태 다시 읽기 |
| offline | network 또는 dependency 연결 불가 | 연결 복구 후 재시도, 입력 보존 |
| conflict | 동시 변경으로 revision 불일치 | 내 draft 보존, 최신본 비교·복구 |

error code의 표현 차이는 `shared/ui/data-state` classifier 한 곳에서 흡수한다. 화면은 자체 문자열 비교를 만들지 않는다.

## 접근성 기준

- WCAG 2.2 Level AA를 P0 기준으로 사용한다.
- bypass block, heading/name-role-value, visible focus, focus not obscured, keyboard/no trap, reflow, status message를 자동·수동 양쪽에서 확인한다.
- pointer target은 WCAG 2.2 AA의 24 CSS px 최소 영역 또는 spacing exception을 지킨다. 제품 주요 버튼·입력은 38px 이상을 기본으로 한다.
- `prefers-reduced-motion`에서는 장식 animation과 smooth transition을 제거한다.
- axe 자동 검사는 위반 후보 탐지이며 한글 문구 의미, focus order의 업무 적합성, screen reader 경험은 수동 검증한다.

## Visual regression

- baseline과 comparison은 동일 Playwright Chromium/Linux image에서 수행한다.
- animation/caret/clock과 같은 비결정 요소를 숨기거나 고정한다.
- dashboard light, dashboard dark, document editor Porcelain, document editor Dracula를 최소 baseline으로 둔다.
- snapshot 갱신은 독립적인 결과물이 아니라 Change Manifest와 reviewer 승인 대상이다.

## Performance contract

`quality/performance-budget.json`이 production asset의 gzip budget을 소유한다. Vite manifest 기준 initial import graph와 landing/editor 같은 비동기 chunk 전체를 분리해 검사한다. CR-2026-017의 Three.js는 landing 진입 때만 로드되며 initial JavaScript 165KB gzip, 단일 async chunk 190KB gzip, 전체 JavaScript 590KB gzip 상한을 각각 통과해야 한다. 예산 수정은 기능 구현과 분리해 review한다. 이 budget은 Core Web Vitals의 대체물이 아니며, production에서는 LCP/INP/CLS의 75 percentile을 별도 관찰한다.

## 금지 정책

제품 source에서 `MVP`, `데모`, `프로토타입`, `실험용`, `AI-powered`, `Next-generation`, `Revolutionary`와 같은 카피를 금지한다. CSS에서는 neon/glow 목적의 filter, glass/backdrop blur, 의미 없는 gradient와 12px 초과 radius를 금지한다. 원형 avatar/icon의 50% radius는 명시적 예외다.

## 운영 규칙

- Gate 실패를 skip하거나 `continue-on-error`로 우회하지 않는다.
- flaky browser test는 재시도로 숨기지 않고 원인을 기록한다.
- visual baseline, performance budget, policy allowlist 변경은 코드와 동일한 review를 받는다.
- 실제 production Core Web Vitals와 screen reader 검증은 Release 후 운영 evidence로 이어간다.

## 기준 출처

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/): keyboard, reflow, focus, target size, status message의 규범 기준
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots): screenshot baseline 생성·비교와 동일 실행 환경 원칙
- [web.dev Web Vitals](https://web.dev/articles/vitals): LCP/INP/CLS와 75 percentile field 관찰 기준
