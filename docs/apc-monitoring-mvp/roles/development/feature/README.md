# Development Feature Lifecycle

## 디렉토리 규칙

| 디렉토리 | 의미 |
| --- | --- |
| `00_initial/` | 첫 QA 이전 최초 개발 feature |
| `01_after_first_qa/` | 첫 번째 QA 결과에서 파생된 개발 보완 feature |
| `02_after_second_qa/` | 두 번째 QA 결과에서 파생될 개발 보완 feature |

개발 feature는 API 계약, 타입, 상태관리, 권한, fixture, 테스트, 배포와 직접 연결되는 구현 TASK를 담당한다.

## 생성 규칙

- QA 이전 구현 계획은 `00_initial/`에 작성한다.
- QA 실패/부분 통과 중 API, 상태관리, UI 동작, 테스트, 운영 반영 영향 분석 문제는 다음 QA cycle 디렉토리에 작성한다.
- 모든 feature 문서는 `공통 메타데이터`를 포함한다.
