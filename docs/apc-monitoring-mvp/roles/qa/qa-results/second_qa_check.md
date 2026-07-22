# Second QA Check

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | qa |
| 생성 시점 | 두 번째 QA 실행 결과 |
| QA Cycle | After second QA |
| 참조 QA 결과 | `first_qa_check.md` |
| 생성 근거 | Project Context의 QA lifecycle 구조 |
| 문서 상태 | Executed |

## 검증 일자

2026-07-09

## 검증 목적

첫 번째 QA에서 도출된 미해결/부분 통과 항목이 기획, 퍼블리싱, 개발 문서 기준에 맞게 보완되었는지 확인한다.

이번 QA는 단순 빌드 확인이 아니라 다음 기준을 함께 검증한다.

- Project Context의 목적과 협업 문서 구조를 벗어나지 않았는가
- Planning feature의 사용자 흐름과 예외 정책이 구현에 반영되었는가
- Publishing feature의 Astryx/JADX_STATS 스타일, 반응형, 상태 표현 기준이 지켜졌는가
- Development feature의 API 계약, 타입, 권한, fixture, UI 상태가 동작하는가
- QA 실패/부분 통과 항목이 역할별 feature 문서와 impact-analysis에 연결되는가

## 참조 문서

- `../../../Project_Context.md`
- `../QA.md`
- `../feature/01_monitoring_home_qa.md`
- `../feature/02_ingestion_status_qa.md`
- `../feature/03_quality_issues_qa.md`
- `../feature/04_pipeline_trace_qa.md`
- `../feature/05_operation_actions_qa.md`
- `../feature/06_monitoring_rules_qa.md`
- `../feature/07_data_lookup_integration_qa.md`
- `../feature/08_visualization_integration_qa.md`
- `../feature/09_browser_visual_qa.md`
- `../../development/feature/01_after_first_qa/09_role_permission_policy.md`
- `../../development/feature/01_after_first_qa/10_rule_diff_and_admin_state.md`
- `../../development/feature/01_after_first_qa/11_quality_issue_detail_coverage.md`
- `../../development/feature/01_after_first_qa/12_jadx_menu_integration_scenario.md`

## 자동 검증 결과

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| Frontend typecheck | 통과 | `npm run typecheck` |
| Frontend production build | 통과 | `npm run build` |
| Backend pytest | 통과 | `19 passed` |
| Health API | 통과 | `GET /api/health` |
| Monitoring summary API | 통과 | `GET /api/monitoring/summary` |
| Browser console error | 통과 | error log `[]` |

## 브라우저 시각 검증 결과

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| Desktop 주요 패널 | 통과 | 1265px viewport에서 shell, filter, scenario rail, monitoring panels 렌더링 확인 |
| Mobile scenario rail | 통과 | 390px viewport에서 4개 step이 viewport 안에 배치됨 |
| Mobile body overflow | 통과 | QA 중 `metric-grid` overflow 발견 후 수정, 재검증 결과 `bodyOverflowX=false` |
| Shell tabs overflow | 통과 | 모바일에서 탭 영역 내부 가로 스크롤로 제한됨 |
| ECharts 렌더링 | 통과 | 시각화 화면에서 chart frame 3개와 canvas 3개 확인 |
| Excel confirm | 통과 | 데이터 조회 화면 내부 `Excel 다운로드` 클릭 시 confirm 표시 |
| 권한/disabled 시각 상태 | 통과 | viewer 역할에서 기준 저장 disabled, 사유 textarea disabled, 권한 안내 표시 |

## 공통 체크표 결과

| 체크 항목 | 결과 | 근거 |
| --- | --- | --- |
| Project Context의 목적과 핵심 요구사항을 벗어난 기능이 없는가 | 통과 | 독립 MVP와 운영 JADX 반영 범위를 화면/문서에서 분리 |
| Planning 문서의 상태 정의와 화면 흐름이 구현에 반영되었는가 | 부분 통과 | 주요 화면은 반영, matrix drill-down과 pipeline CTA는 아직 미구현 |
| Publishing 문서의 Astryx/JADX_STATS 스타일 기준이 적용되었는가 | 통과 | 색상/radius/font/상태 label 기준 유지, 모바일 overflow 수정 |
| Development 문서의 API 계약과 타입이 구현 결과와 일치하는가 | 통과 | TypeScript/Pydantic/FastAPI 계약과 pytest 통과 |
| 정상/지연/오류/미수신/기준 미정 상태가 모두 확인되는가 | 통과 | fixture/API와 상태 badge 기준으로 확인 |
| loading/empty/error 상태가 주요 영역에 있는가 | 통과 | 주요 API 화면에서 `ResourceState` 사용 |
| 권한 없는 사용자의 제한 항목이 노출되지 않는가 | 통과 | viewer origin/refined masking, rule edit disabled 확인 |
| 변경 사항이 impact-analysis 문서에 기록되었는가 | 통과 | 권한, rule diff, 품질 상세, 메뉴 시나리오 문서 확인 |

## Feature 체크표 결과

| Feature | 결과 | 통과 항목 | 남은 항목 |
| --- | --- | --- | --- |
| 01 Monitoring Home | 부분 통과 | KPI, matrix, 최근 이슈, 상태 label, summary API, desktop/mobile 렌더링 | matrix cell click 후 관련 조건으로 상세 이동 미구현 |
| 02 Ingestion Status | 통과 | 우선 정렬, 최근/기대 수신 시각, 상태 label, trace 선택, viewer 경로 masking | 고급 필터 UI는 후속 고도화 범위 |
| 03 Quality Issues | 통과 | 6개 이슈 유형, 유형 filter/count, 상세 sample row, 마스킹, 상태 변경 API, Excel warning | 실제 운영 데이터 민감 field key 목록은 운영 연동 시 확정 필요 |
| 04 Pipeline Trace | 부분 통과 | 단계 timeline, 실패 메시지, next action, log preview, pipeline API | 관련 이슈/운영 조치 CTA 직접 연결 미구현 |
| 05 Operation Actions | 부분 통과 | 조치 timeline, memo/status 이력, recurrence 표시 | 운영 조치 화면 내부 직접 action form은 미구현, 품질 이슈 상세에서만 조치 등록 가능 |
| 06 Monitoring Rules | 통과 | rule list, 기준 미정, 변경 전/후 diff, 사유 required, admin-only disabled, changeHistory |
| 07 Data Lookup Integration | 통과 | 조회 조건 유지, 품질 warning, Excel confirm, 독립 MVP 범위 안내 |
| 08 Visualization Integration | 통과 | 차트 3종 유지, 데이터 신뢰도 warning, monitoring 상태와 차트 데이터 분리 |
| 09 Browser Visual QA | 통과 | desktop/mobile layout, chart canvas, console error, confirm flow 확인 |

## 첫 QA 이슈 재검증 결과

| QA ID | 대상 | 결과 | 근거 |
| --- | --- | --- | --- |
| QA-001 | viewer/admin 권한 정책 | 통과 | Backend pytest 19 passed, frontend typecheck/build 통과, browser disabled/masking 확인 |
| QA-002 | matrix cell 클릭 후 filter/detail drill-down | 미통과 | `MonitoringSummaryShell` matrix cell은 button이나 shared filter/tab handoff가 없음 |
| QA-003 | 모니터링 기준 변경 전/후 diff UI | 통과 | browser에서 변경 전/후, 권한 안내, 저장 disabled 확인 |
| QA-004 | pipeline timeline 관련 이슈/운영 조치 CTA | 미통과 | `PipelineTracePanel`은 related issue/action CTA를 렌더링하지 않음 |
| QA-005 | 품질 이슈 sample row 및 전체 이슈 유형 표시 | 통과 | API 6개 유형 테스트, browser sample row/filter/badge 확인 |
| QA-006 | 독립 MVP의 JADX 데이터 조회/시각화 메뉴 흐름 시나리오 | 통과 | scenario rail, 독립 MVP 안내, Excel confirm, chart warning 확인 |
| QA-007 | 브라우저 시각 검증 | 통과 | desktop/mobile/browser console/chart/confirm 검증 완료 |

## QA 중 발견 및 즉시 수정한 항목

| ID | 증상 | 원인 | 조치 | 결과 |
| --- | --- | --- | --- | --- |
| QA2-FIX-001 | 모바일에서 body 가로 overflow 발생 | grid item의 기본 `min-width:auto`와 table min-content가 parent track을 확장 | `.shell-panel`, `.monitoring-grid`, `.metric-grid`, `.metric-card`, grid children, `.table-wrap`에 `min-width:0` 보강 | 재검증 통과, `bodyOverflowX=false` |

## 신규/잔여 미해결 이슈

| ID | Severity | Area | Issue | 후속 문서 |
| --- | --- | --- | --- | --- |
| QA2-001 | Medium | Monitoring Home | matrix cell 선택이 수신 현황/품질 이슈/파이프라인으로 조건을 전달하지 못함 | `../../development/feature/02_after_second_qa/13_matrix_drilldown_implementation.md` |
| QA2-002 | Medium | Pipeline Trace | pipeline timeline에서 related issue/action CTA가 직접 연결되지 않음 | `../../development/feature/02_after_second_qa/14_pipeline_related_cta_implementation.md` |
| QA2-003 | Low | Operation Actions | 운영 조치 화면 내부 직접 action form은 아직 없음 | `../../planning/feature/02_after_second_qa/12_operation_action_form_policy.md` |

## 역할별 후속 feature 생성 기준

| QA ID | 역할 | 생성/갱신 대상 | 이유 |
| --- | --- | --- | --- |
| QA2-001 | Development | `../../development/feature/02_after_second_qa/13_matrix_drilldown_implementation.md` | Planning 문서는 이미 있으나 실제 shared filter/tab handoff 구현이 없음 |
| QA2-002 | Development | `../../development/feature/02_after_second_qa/14_pipeline_related_cta_implementation.md` | Planning 문서는 이미 있으나 timeline CTA 구현이 없음 |
| QA2-003 | Planning | `../../planning/feature/02_after_second_qa/12_operation_action_form_policy.md` | 운영 조치 화면 내부 action form이 필요한지 UX 정책 확정 필요 |

## 결론

두 번째 QA 결과, 첫 QA의 주요 보완 항목 중 권한 정책, 기준 변경 diff, 품질 이슈 상세 coverage, 독립 MVP 메뉴 흐름 시나리오, 브라우저 시각 검증은 통과했다.

남은 핵심 이슈는 `matrix drill-down`과 `pipeline related CTA`다. 두 항목은 화면 간 상태 전달과 tab handoff 설계가 필요하므로 두 번째 QA 이후 development follow-up feature로 넘긴다.

운영 조치 화면 내부 action form은 품질 이슈 상세에서 이미 조치 등록이 가능하므로 즉시 개발 실패로 처리하지 않고, 기획 정책 확정이 필요한 후속 항목으로 분리한다.
