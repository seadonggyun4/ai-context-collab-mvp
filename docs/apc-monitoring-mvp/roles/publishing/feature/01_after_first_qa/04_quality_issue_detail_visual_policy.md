# 04. 품질 이슈 상세 Table 시각 정책

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | publishing |
| 생성 시점 | 첫 번째 QA 이후 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../../../qa/qa-results/first_qa_check.md` |
| 생성 근거 | QA-005 sample row 및 전체 이슈 유형 표시 부족 |
| 문서 상태 | Follow-up scope |

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/01_after_first_qa/11_quality_issue_detail_policy.md` | sample row 표시 범위와 마스킹 정책 확인 | 충족 |
| Publishing | 현재 문서 | drawer/table/overflow/badge 표현 정의 | 충족 |
| Development | `../../../development/feature/01_after_first_qa/11_quality_issue_detail_coverage.md` | sample row table과 issue type grouping 반영 필요 | 대기 |
| QA | `../../../qa/feature/03_quality_issues_qa.md` | 모든 이슈 유형과 sample row 재검증 | 대기 |

## 시각 정책

- sample row table은 drawer 안에서 가로 overflow를 허용한다.
- 민감 정보는 `***` 또는 부분 마스킹으로 표시한다.
- 이슈 유형 filter는 badge 또는 segmented control로 제공한다.
- 심각도 badge는 색상만 쓰지 않고 `높음`, `중간`, `낮음` 텍스트를 포함한다.

## 개발 전달 조건

- drawer 폭은 desktop에서 table을 읽을 수 있도록 충분히 확보한다.
- 모바일에서는 table overflow가 drawer 밖으로 튀어나가지 않아야 한다.
