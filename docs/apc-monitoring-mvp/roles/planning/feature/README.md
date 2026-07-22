# Planning Feature Lifecycle

## 디렉토리 규칙

| 디렉토리 | 의미 |
| --- | --- |
| `00_initial/` | 첫 QA 이전 최초 기획 feature |
| `01_after_first_qa/` | 첫 번째 QA 결과에서 파생된 기획 보완 feature |
| `02_after_second_qa/` | 두 번째 QA 결과에서 파생될 기획 보완 feature |

기획 feature는 사용자 흐름, 화면 정책, 예외 처리, 운영 문구, drill-down 정책처럼 개발 구현 이전에 합의되어야 하는 내용을 담당한다.

## 생성 규칙

- QA 이전 기능 정의는 `00_initial/`에 작성한다.
- QA 실패/부분 통과 중 사용자 흐름 또는 정책 문제는 다음 QA cycle 디렉토리에 작성한다.
- 모든 feature 문서는 `공통 메타데이터`를 포함한다.
