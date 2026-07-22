# 2026-07-09 UI Shell 구현 영향 분석

## 변경 요약

APC 데이터 관리 화면의 기본 UI shell을 React/Vite에 구현했다. Astryx Design System 패키지를 설치하고, `JADX_STATS` 기반 색상/폰트/radius 정책을 `global.css`와 공통 wrapper 컴포넌트에 적용했다.

추가된 구현:

- Astryx CSS/theme import
- React 19 + Astryx dependency alignment
- APC 데이터 관리 sidebar/header/filter/tabs layout
- 모니터링 KPI card, status matrix, 최근 이슈 table
- 수신 현황/품질 이슈 preview shell
- 공통 `ShellButton`, `ShellPanel`, `ShellTabs`, `ShellSelect`
- 공통 `StatusBadge`, `MetricCard`
- Publishing token 기반 CSS variables

## 변경 원인

Phase 6의 실제 monitoring core 기능을 구현하기 전에, 기획/퍼블리싱/개발 문서가 공유하는 화면 골격과 상태 표현 규칙을 먼저 고정해야 한다. UI shell은 이후 API client와 상세 상호작용이 붙어도 레이아웃과 컴포넌트 기준이 흔들리지 않도록 하는 기반이다.

## 영향 문서

| 문서 | 영향 |
| --- | --- |
| `Project_Context.md` | Phase 5 변경 이력 추가 |
| `projects/apc-monitoring-mvp/docs/phase-plan.md` | 현재 상태를 Phase 5 완료로 갱신 |
| `projects/apc-monitoring-mvp/frontend/README.md` | frontend 구현 상태와 실행 방법 갱신 |
| `roles/publishing/Publishing.md` | Astryx + JADX_STATS 기준을 실제 코드에 적용 |

## 기획 영향

- APC 데이터 관리의 상위 메뉴가 화면 tab 구조로 표현된다.
- 모니터링, 수신 현황, 데이터 품질 이슈는 preview 수준으로 실제 운영 콘솔 흐름을 확인할 수 있다.
- 파이프라인 추적, 운영 조치 내역, 기준 설정, 데이터 조회, 시각화는 shell placeholder로 진입 위치가 고정된다.

## 퍼블리싱 영향

- 색상은 `../roles/publishing/Publishing.md`의 JADX_STATS 토큰만 사용한다.
- 카드/패널/table wrapper radius는 `5px`로 적용했다.
- Astryx Button/Card와 theme CSS를 사용하되, 시각 표현은 JADX_STATS 기준 CSS로 오버라이드한다.

## 개발 영향

- Phase 6에서는 `shellPreviewData`를 API client 호출로 교체하면 된다.
- `shared/components` wrapper를 유지하면 Astryx 내부 API가 바뀌어도 feature 화면 영향이 줄어든다.
- Vite alias를 TypeScript paths와 동일하게 맞췄다.

## QA 영향

- frontend `typecheck`와 production `build`가 통과했다.
- dev server는 `http://127.0.0.1:5173/`에서 정상 응답한다.
- 브라우저 플러그인 연결 검증은 지연으로 완료하지 못했으므로, 시각 QA는 사용자가 직접 화면을 열어 확인하거나 후속 재시도 대상이다.

## 리스크

- Astryx `@astryxdesign/core@0.1.4`는 React `>=19`를 요구하므로 frontend를 React 19로 정렬했다.
- `npm audit` 기준 moderate vulnerability 1건이 보고되었으며, 자동 강제 수정은 breaking change 가능성이 있어 수행하지 않았다.
- Phase 5는 UI shell이며 실제 API fetch/loading/error state는 Phase 6 범위다.

## 후속 조치

- Phase 6에서 `/api/monitoring/*` API client를 연결한다.
- 시각 QA에서 desktop/mobile viewport별 table overflow와 tab wrapping을 확인한다.
- Astryx Table/Selector/DateRangeInput의 실제 API가 안정화되면 wrapper 내부 구현을 점진적으로 교체한다.
