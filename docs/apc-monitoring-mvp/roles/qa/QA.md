# QA.md

## 참조 문서

- `../../Project_Context.md`
- `../../../organization-standards/qa-standards.md`
- `../../Active_Context.md`
- `../../change-management/templates/verification-evidence-template.md`
- `../planning/Planning.md`
- `../publishing/Publishing.md`
- `../development/Development.md`

## QA 목적

APC(농산물산지유통센터) 모니터링 서비스의 QA는 단순 버그 확인이 아니라, 기획/퍼블리싱/개발 문서에 정의된 기준이 실제 구현에 동일하게 반영되었는지 검증하는 과정이다.

QA는 다음 질문에 답해야 한다.

- Project Context의 핵심 요구사항이 화면과 API에 반영되었는가?
- Planning 문서의 사용자 흐름과 예외 정책이 구현되었는가?
- Publishing 문서의 Astryx Design System, JADX_STATS 토큰, 상태 표시 기준이 지켜졌는가?
- Development 문서의 API 계약, 타입, fixture 정책, 배포 제약이 지켜졌는가?
- 변경이 발생했을 때 영향 분석 문서와 테스트 범위가 함께 갱신되었는가?
- 사용자 수정 요청이 역할별 feature 문서와 QA 체크표를 거친 뒤 구현되었는가?

## QA 범위

| 영역 | 검증 기준 |
| --- | --- |
| 모니터링 홈 | KPI, matrix, 최근 이슈, 상태 분포 |
| 수신 현황 | 필터, 정렬, 수신 timeline, origin/refined 권한 표시 |
| 데이터 품질 이슈 | 이슈 목록, 상세, 원인/영향/권장 조치, Excel 다운로드 경고 |
| 파이프라인 추적 | 단계별 상태, 실패 메시지, DAG/log preview |
| 데이터 조회 연계 | 기존 조회 유지, 품질 경고, 다운로드 확인 |
| 시각화 연계 | 기존 차트 유지, 데이터 신뢰도 경고 |
| Mock write 기능 제거 | 운영 조치/기준 설정 같은 DB 전제 기능이 MVP에서 노출되지 않는지 확인 |

## 공통 체크표

| 체크 항목 | 확인 |
| --- | --- |
| Project Context의 목적과 핵심 요구사항을 벗어난 기능이 없는가 | [ ] |
| Planning 문서의 상태 정의와 화면 흐름이 구현에 반영되었는가 | [ ] |
| Publishing 문서의 Astryx/JADX_STATS 스타일 기준이 적용되었는가 | [ ] |
| Development 문서의 API 계약과 타입이 구현 결과와 일치하는가 | [ ] |
| 정상/지연/오류/미수신/기준 미정 상태가 모두 확인되는가 | [ ] |
| loading/empty/error 상태가 모든 주요 영역에 있는가 | [ ] |
| 권한 없는 사용자의 제한 항목이 노출되지 않는가 | [ ] |
| 변경 사항이 impact-analysis 문서에 기록되었는가 | [ ] |

## Feature QA 문서

| 기능 | QA 문서 |
| --- | --- |
| 모니터링 홈 | `feature/01_monitoring_home_qa.md` |
| 수신 현황 | `feature/02_ingestion_status_qa.md` |
| 데이터 품질 이슈 | `feature/03_quality_issues_qa.md` |
| 파이프라인 추적 | `feature/04_pipeline_trace_qa.md` |
| 데이터 조회 연계 | `feature/07_data_lookup_integration_qa.md` |
| 시각화 연계 | `feature/08_visualization_integration_qa.md` |
| 수정 요청 추적성 | `feature/10_change_request_traceability_qa.md` |
| Mock write 기능 제거 | `feature/13_mock_write_feature_removal_qa.md` |
| 동적 갱신일 표시 | `feature/14_dynamic_refresh_date_qa.md` |

## 완료 기준

- 각 feature QA 체크표가 모두 작성되어 있다.
- 실패 항목은 미해결 이슈로 남아 있다.
- 변경 영향 분석 문서와 QA 범위가 연결되어 있다.
- QA 결과를 통해 기획/퍼블리싱/개발 중 어느 문서 기준을 수정해야 하는지 판단할 수 있다.
- 각 검증 결과가 표준 Verification Evidence 필드를 포함한다.
- 실행하지 않은 테스트, 없는 artifact, 변경 전 증거를 통과 근거로 사용하지 않는다.

## Verification Evidence 기록

```markdown
## Verification Evidence: EVID-NNN

- Target:
- Changed files:
- Test command:
- Exit code:
- Result: `PASSED | FAILED | PARTIALLY_VERIFIED | STATIC_REVIEW_ONLY | NOT_EXECUTED | NOT_APPLICABLE`
- Screenshot/log path:
- Not executed:
- Known limitations:
- Self-review verdict:
```

체크표의 `[x]`는 위 Evidence가 연결된 경우에만 완료를 의미한다. Evidence가 없으면 체크 여부와 관계없이 미검증이다.

## QA 실행 결과

| 일자 | 결과 문서 | 요약 |
| --- | --- | --- |
| 2026-07-09 | `qa-results/first_qa_check.md` | 자동 검증 통과, 권한/드릴다운/diff/pagination 등 미해결 이슈 도출 |
| 2026-07-09 | `qa-results/second_qa_check.md` | 자동 검증/브라우저 시각 검증 통과, matrix drill-down/pipeline CTA 등 잔여 이슈 도출 |
| 2026-07-09 | `qa-results/third_qa_check.md` | 세 번째 QA 실행, matrix drill-down/pipeline CTA 통과, operation action handoff 구현 대기 |
| 2026-07-09 | `qa-results/fifth_qa_check.md` | 중복 flow UI 제거와 수신 현황 전용 matrix selectbox 필터 검증 통과 |
| 2026-07-09 | `qa-results/sixth_qa_check.md` | 기능 없는 전역 필터와 중복 헤더 CTA 제거 검증 통과 |

## 실패 항목 후속 문서화 정책

- QA 실패/부분 통과 항목은 별도 디렉토리가 아니라 각 역할의 `feature/{cycle}/` 디렉토리에 다음 순번 문서로 생성한다.
- 첫 QA 이후 기획 흐름/정책 이슈는 `../planning/feature/01_after_first_qa/`에 생성한다.
- 첫 QA 이후 개발 구현/API/상태관리 이슈는 `../development/feature/01_after_first_qa/`에 생성한다.
- 첫 QA 이후 퍼블리싱/시각 검증 이슈는 `../publishing/feature/01_after_first_qa/`에 생성한다.
- 두 번째 QA 이후에는 각 역할의 `feature/02_after_second_qa/`에 생성한다.
- QA 재검증 항목은 `feature/`에 생성한다.
- 후속 feature 문서는 원인, 영향 범위, 참조 QA, 구현 TASK, 완료 기준을 포함한다.
- 후속 구현이 진행되면 기존 문서를 갱신하고, 재검증 결과를 `qa-results/`에 추가한다.

## 사용자 수정 요청 QA 정책

사용자 수정 요청은 QA 실패 항목과 동일한 추적 대상으로 본다. QA는 수정 결과뿐 아니라 수정 요청이 문서 엔진을 제대로 통과했는지도 검증한다.

| 체크 항목 | 기준 |
| --- | --- |
| 요청 요약 | 사용자 요청이 한 문장으로 남아 있는가 |
| 역할 분류 | planning / publishing / development / qa 영향 여부가 기록되어 있는가 |
| Feature 생성 | 최신 numbered cycle에 필요한 역할별 feature 문서가 생성되어 있는가 |
| 구현 연결 | development 문서가 planning/publishing 조건을 참조하는가 |
| 검증 연결 | QA 체크표 또는 QA result에 재검증 기준이 있는가 |
| 이력 연결 | impact-analysis 또는 변경 이력에 영향 범위가 남아 있는가 |
