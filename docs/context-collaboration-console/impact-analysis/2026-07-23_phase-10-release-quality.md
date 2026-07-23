# Phase 10 Release Quality 영향 분석

## 변경 경로

`CR-2026-014` → 공통 UI 상태 계약 → 각 page error boundary → browser 품질 시나리오 → CI Release Gate → 배포 승인

## 역할별 영향

| 역할 | 영향 | 검토 기준 |
| --- | --- | --- |
| 기획 | 일곱 상태와 recovery 문구가 제품 요구사항으로 고정 | 상태별 다음 행동과 책임이 명확한가 |
| 퍼블리싱 | 4개 viewport, 양 theme, focus/reduced motion, 금지 패턴 | 정보 밀도와 의미가 viewport/theme에서 보존되는가 |
| 개발 | 공통 classifier, Playwright, axe, policy/performance script, CI | FSD public API와 결정론적 Gate를 유지하는가 |
| QA | P0 자동/수동 경계, visual baseline, 접근성·성능 증거 | 실행 환경·결과·미실행 항목을 분리하는가 |
| 운영 | Release Gate 실패 시 배포 차단과 예산 변경 승인 | 우회 없이 재현 가능한가 |

## 영향 대상

- `src/shared/ui/data-state`: 상태 taxonomy, ARIA live region, recovery 표시
- `src/pages/*`: repository error를 공통 분류로 위임
- `src/app/styles`: reduced motion와 focus visibility
- `e2e/`, `playwright.config.ts`: responsive/accessibility/visual contract
- `scripts/`, `quality/`: 카피·디자인·asset budget 계약
- `.github/workflows/quality-gate.yml`: browser와 release 검사
- 제품 requirements, test matrix, implementation plan, Active Context

## 비영향 대상

- backend domain transition과 RBAC 의미
- Git publication/Context activation의 server gate
- Render resource 생성과 production 배포 실행

## 회귀 우선순위

1. 인증 경계와 session 만료
2. document editor의 IME·autosave·conflict recovery
3. review/activation의 고위험 action과 focus
4. impact graph의 목록 대체 탐색
5. dashboard와 landing의 4개 viewport reflow
