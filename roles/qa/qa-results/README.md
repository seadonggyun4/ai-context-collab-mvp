# QA Results

## 관리 위치

QA 결과는 `roles/qa/qa-results/`에서 관리한다.

이 디렉토리는 QA 파트가 소유하지만, 결과는 기획/퍼블리싱/개발/QA가 함께 참조하는 협업 기록이다.

## 파일명 규칙

| QA cycle | 파일명 | 상태 |
| --- | --- | --- |
| 첫 번째 QA | `first_qa_check.md` | 작성 완료 |
| 두 번째 QA | `second_qa_check.md` | 실행 전 |
| 세 번째 QA 이후 | `{ordinal}_qa_check.md` | 필요 시 생성 |

## 실패 항목 처리

- QA 실패/부분 통과 항목은 별도 후속 디렉토리에 만들지 않는다.
- 담당 역할의 `feature/{cycle}/` 하위에 다음 순번 feature 문서로 생성한다.
- 재검증 결과는 새 QA 결과 문서에 기록하고, 관련 role feature의 상태를 갱신한다.
