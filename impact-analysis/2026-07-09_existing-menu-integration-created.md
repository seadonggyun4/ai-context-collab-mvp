# 2026-07-09 기존 메뉴 연계 구현 영향 분석

## 변경 요약

기존 `데이터 조회`와 `시각화` 메뉴에 모니터링 품질 이슈 경고를 연결했다. 기존 메뉴의 목적은 유지하고, 현재 조회/차트 조건에 품질 이슈가 있을 때만 warning과 상세 이동 CTA를 표시한다.

추가된 구현:

- 공통 `QualityWarningBanner`
- 데이터 조회 연계 화면
- Excel 다운로드 전 confirm 흐름
- 시각화 신뢰도 warning
- 기존 차트 목적을 유지한 ECharts preview
- 품질 이슈 메뉴 이동 CTA

## 변경 원인

APC 모니터링 서비스는 신규 탭에서 상태를 보여주는 것만으로는 부족하다. 실제 사용자가 기존 데이터 조회나 시각화 메뉴에서 데이터를 소비할 때, 현재 데이터가 신뢰 가능한지 같은 문맥으로 판단할 수 있어야 한다.

## 영향 문서

| 문서 | 영향 |
| --- | --- |
| `Project_Context.md` | Phase 7 변경 이력 추가 |
| `app/docs/phase-plan.md` | 현재 상태를 Phase 7 완료로 갱신 |
| `app/frontend/README.md` | frontend 구현 상태 갱신 |
| `roles/development/feature/00_initial/07_data_lookup_integration.md` | TASK 완료 체크 |
| `roles/development/feature/00_initial/08_visualization_integration.md` | TASK 완료 체크 |

## 기획 영향

- 데이터 조회 메뉴에서 품질 이슈가 있는 조회 조건은 Excel 다운로드 전 경고를 표시한다.
- 사용자는 경고를 확인하고 계속 다운로드, 이슈 상세 보기, 취소 중 선택할 수 있다.
- 시각화 메뉴에서는 차트 데이터와 모니터링 상태를 섞지 않고 상단 신뢰도 warning으로만 연결한다.

## 퍼블리싱 영향

- warning banner는 `JADX_STATS` 색상 토큰과 `5px` radius를 사용한다.
- 차트는 `Publishing.md`의 ECharts 기준과 색상 토큰을 따른다.
- 기존 table/panel 스타일과 충돌하지 않도록 동일 shell 구조 안에서 확장했다.

## 개발 영향

- `GET /api/monitoring/issues`를 데이터 조회/시각화 연계에 재사용한다.
- 품질 경고 컴포넌트를 공통화해 Phase 8 QA와 후속 메뉴 연계에서 재사용할 수 있다.
- 기존 메뉴 API는 MVP 범위에서 mock surface로 유지하고, 모니터링 품질 경고만 실제 API에 연결했다.

## QA 영향

- typecheck/build/backend regression이 통과했다.
- 실행 중인 FastAPI에서 품질 이슈 API 응답을 확인했다.
- Excel confirm의 세 선택지와 시각화 warning CTA는 수동 QA 체크 대상이다.

## 리스크

- 운영 JADX 데이터 조회 API와 Excel 다운로드 함수에는 연결하지 않았다. 이번 범위는 독립 MVP의 연계 시나리오다.
- 농가명 단위 품질 검사는 MVP monitoring query에 포함하지 않았다.
- 시각화 차트는 대표 preview이며 기존 운영 차트 데이터와 직접 연결된 것은 아니다.

## 후속 조치

- Phase 8에서 QA feature 체크표 기준으로 warning/confirm/CTA 흐름을 검증한다.
- 운영 JADX `DataLookup.tsx`, `Visualization.tsx`에 실제 반영할 경우에는 별도 의사결정 후 filter mapping을 운영 API 파라미터에 맞춘다.
