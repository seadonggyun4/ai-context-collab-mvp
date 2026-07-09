# 11. 품질 이슈 상세 정보 기획 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | 첫 번째 QA 이후 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../../../qa/qa-results/first_qa_check.md` |
| 생성 근거 | QA-005 sample row 및 전체 이슈 유형 표시 부족 |
| 문서 상태 | Follow-up scope |

## 발생 출처

- QA 결과: `../../../qa/qa-results/first_qa_check.md`
- 관련 QA 체크: `../../../qa/feature/03_quality_issues_qa.md`
- 원인 ID: `QA-005`

## 기획 정책

- 품질 이슈 상세는 오류 요약만 보여주지 않고 실제 영향을 받은 샘플 row를 제공한다.
- 샘플 row는 운영 판단에 필요한 최소 컬럼만 표시한다.
- 개인정보 또는 농가 식별 가능 정보는 마스킹한다.
- 이슈 유형은 fixture/API에 존재하는 항목이 화면에서 누락되지 않아야 한다.

## 이슈 유형 표시 범위

| 이슈 유형 | 표시 정책 |
| --- | --- |
| 필수값 누락 | 누락 필드명과 샘플 row 표시 |
| 형식 오류 | 기대 형식과 실제 값 표시 |
| 중복 의심 | 중복 판단 기준과 중복 후보 수 표시 |
| 비정상 중량/수량 | 기준 범위와 실제 값 표시 |
| 미지원 APC/품목 | 미지원 코드와 처리 필요 문구 표시 |
| 정제 실패 | 실패 단계와 조치 안내 표시 |

## 다음 역할 전달 조건

| 전달 대상 | 충족해야 할 조건 |
| --- | --- |
| Publishing | drawer/table 밀도, sample row overflow, 민감 정보 마스킹 표현 정의 |
| Development | `sampleRows`, issue type filter/group summary, masking 구현 |
| QA | 모든 이슈 유형과 sample row 표시 재검증 |

## 완료 기준

- 이슈 상세에서 샘플 row와 이슈 유형을 확인할 수 있다.
- 민감 정보가 그대로 노출되지 않는다.
