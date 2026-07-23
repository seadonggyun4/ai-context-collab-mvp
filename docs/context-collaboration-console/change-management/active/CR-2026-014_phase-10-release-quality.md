# CR-2026-014 — Phase 10 품질 강화·Release Gate

## 변경 메타데이터

| 항목 | 값 |
| --- | --- |
| status | `IMPLEMENTED_LOCAL` |
| requested_at | `2026-07-23` |
| risk | `HIGH` |
| scope | 전 화면, 공통 상태, 테스트 도구, CI, Release Gate |
| approval | 사용자 요청 |

## 요청 요약

Context Collaboration Console의 품질 기준을 문서 체크리스트에서 자동 실행 가능한 Release Gate로 승격한다. 1280/1024/768/390px의 네 viewport, WCAG 2.2 AA 중심 접근성·키보드 흐름, 일곱 가지 데이터 상태, light/dark/editor 시각 회귀, 금지 카피·디자인 패턴, production asset 예산을 하나의 재현 가능한 계약으로 관리한다.

## 수용 기준

1. 모든 data-bound 화면은 `loading / empty / error / permission / stale / offline / conflict`를 동일한 공통 분류와 접근 가능한 상태 메시지로 표현한다.
2. 주요 화면이 1280/1024/768/390px에서 가로 overflow 없이 동작하고, 그래프·표·에디터의 대체 탐색 수단을 유지한다.
3. 키보드만으로 skip link, navigation, 주요 action, editor, conflict recovery를 사용할 수 있고 focus가 숨거나 소실되지 않는다.
4. Chromium 고정 실행 환경에서 light/dark/dashboard/editor 시각 snapshot을 비교한다.
5. 제품 source의 금지 카피와 금지 CSS 패턴, 과도한 radius를 정적 검사하고 위반 시 build를 차단한다.
6. production build 결과가 versioned gzip asset 예산을 초과하면 Release Gate가 실패한다.
7. lint, typecheck, unit/integration, browser accessibility/responsive/visual, policy, performance gate가 CI에 연결된다.

## 변경 경계

- 접근성 자동 검사는 보조 수단이며 수동 keyboard·screen reader 판단을 대체하지 않는다.
- Core Web Vitals 현장 데이터는 실제 production traffic이 있어야 확정할 수 있다. 이번 Gate는 bundle budget과 browser smoke를 선행 지표로 사용한다.
- visual baseline은 Chromium/Linux CI 환경에서 생성·비교하며 다른 OS 결과와 혼합하지 않는다.
- 제품 기능·업무 상태 전이·권한 정책은 변경하지 않는다.

## 위험과 완화

| 위험 | 완화 |
| --- | --- |
| 환경별 글꼴 렌더링으로 snapshot 변동 | CI OS·browser version 고정, animation 제거, 제한적 pixel tolerance |
| 자동 접근성 검사만으로 완료 오판 | keyboard scenario와 수동 QA 항목을 별도 유지 |
| 번들 예산이 신규 기능을 무조건 차단 | gzip 기준 예산을 별도 JSON 계약으로 version 관리하고 변경은 Change Manifest 요구 |
| error code 표현 불일치 | 공통 `classifyDataState`를 single mapping point로 사용 |

## 산출물

- `engineering/release-quality-gate.md`
- `roles/development/feature/10_phase-10/01_release_quality_gate.md`
- `roles/qa/feature/10_phase-10/01_release_quality_gate_qa.md`
- 공통 data-state classifier와 접근 가능한 UI
- browser/policy/performance test harness와 CI 연결

## 완료 기록

- 공통 일곱 상태와 DomainError classifier, live region/recovery 계약 구현
- WCAG 2.2 A/AA axe, keyboard, target size, 4 viewport reflow browser Gate 구현
- dashboard light/dark, editor Porcelain/Dracula baseline 확정
- 제품 source 191 files 금지 카피·시각 pattern 0건
- production asset budget 통과, frontend 104 unit/integration + 11 browser tests 통과
- GitHub Actions에 source/policy/build/performance/browser job 연결

Production field Core Web Vitals와 VoiceOver/NVDA 수동 검증은 실제 운영 환경 evidence로 남긴다.
