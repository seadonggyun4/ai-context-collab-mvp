# Phase 10 — Release Quality Gate QA

## 상태

`LOCAL_GATE_PASSED / FIELD_EVIDENCE_PENDING` — 2026-07-23

## P0 Matrix

| ID | 시나리오 | 자동화 | 증거 |
| --- | --- | --- | --- |
| QA-QUALITY-01 | loading/empty/error/permission/stale/offline/conflict 의미·announcement | Vitest | data-state test |
| QA-QUALITY-02 | DomainError code가 일관된 상태로 분류 | Vitest | classifier table test |
| QA-QUALITY-03 | 1280/1024/768/390px 가로 overflow와 핵심 content 접근 | Playwright | browser report |
| QA-QUALITY-04 | skip link, navigation, 주요 action keyboard focus | Playwright + manual | trace/checklist |
| QA-QUALITY-05 | route별 axe WCAG A/AA violation | Playwright axe | accessibility report |
| QA-QUALITY-06 | landing/dashboard light/dark visual regression | Playwright screenshot | approved baseline/diff |
| QA-QUALITY-07 | editor Porcelain/Dracula visual regression | Playwright screenshot | approved baseline/diff |
| QA-QUALITY-08 | 금지 카피·gradient/glass/glow/radius | Node policy test | violation 0 log |
| QA-QUALITY-09 | production gzip asset budget | Node budget test | asset report |
| QA-QUALITY-10 | production build와 전체 P0 regression | CI | quality-gate run |

## 수동 검증 유지 항목

- VoiceOver/NVDA에서 상태 announcement의 순서와 과도한 반복 여부
- 200% text zoom과 한글 조합 입력 중 focus/caret 안정성
- 고위험 승인·활성화 confirmation의 문맥 적절성
- 색상 외에도 상태·diff·graph 의미가 전달되는지
- production traffic의 LCP/INP/CLS 75 percentile

## 실패 판정

- 자동 검사 미실행은 통과가 아니다.
- snapshot 변경은 reviewer가 의도와 Change Manifest 연결을 확인하기 전 실패다.
- axe violation을 selector allowlist로 무기한 숨기지 않는다.
- performance budget 초과는 수치와 원인 chunk를 기록하고 승인된 budget 변경 또는 code splitting 후 재실행한다.

## 실행 증거

| 실행 | 결과 |
| --- | --- |
| `npm run lint` | JSX a11y strict 포함 오류·warning 0 |
| `npm run typecheck` | strict TypeScript 오류 0 |
| `npm test -- --run` | 27 files, 98 tests passed |
| `npm run quality:policy` | production source 183 files, violation 0 |
| `npm run build` | 2,151 modules transformed, production build 성공 |
| `npm run quality:performance` | initial JS gzip 159,910/165,000; JS max gzip 176,496/190,000; JS total 568,107/590,000; CSS 41,144/52,000; raw total 2,094,488/2,200,000 bytes |
| `npm run quality:browser` | 14 Playwright tests: 4 viewport, keyboard, editor, dark accessibility/reflow, WebGL 4 scene, 6 visual snapshots 통과 |
| backend quality | Ruff·format·mypy 통과, pytest 54 passed·local PostgreSQL 1 skipped |

실행 중 발견·수정한 회귀:

- lazy landing CSS에 기대던 dashboard CTA 스타일 소유권을 page slice로 이동했다.
- Astryx 전경색 상속과 product inverse token 충돌을 text ownership span과 semantic foreground token으로 분리해 양 테마 axe 대비를 통과했다.
- Dracula gutter line number가 3.9:1이던 문제를 `#a7a9b6`로 조정해 AA를 통과했다.
- 로그인·avatar·logout을 제거하고 해당 부재를 browser/snapshot/OpenAPI 계약으로 고정했다.
- seeded WebGL hero·burst·globe·stream 4개가 reduced-motion 정적 frame과 lifecycle gate를 유지하는지 확인했다.

수동 확인:

- landing/dashboard/editor의 1280 light/dark 기준 이미지를 실제 렌더로 시각 확인했다.
- 390 editor는 horizontal overflow 0이며 navigation, toolbar, CodeMirror, inspector 순서를 보존한다.
- VoiceOver/NVDA, production field LCP/INP/CLS는 로컬에서 실행할 수 없어 운영 evidence 대기다. 이를 통과로 기록하지 않는다.
