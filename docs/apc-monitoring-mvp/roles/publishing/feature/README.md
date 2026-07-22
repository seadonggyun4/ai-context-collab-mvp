# Publishing Feature Lifecycle

## 디렉토리 규칙

| 디렉토리 | 의미 |
| --- | --- |
| `00_initial/` | 첫 QA 이전 최초 퍼블리싱 feature |
| `01_after_first_qa/` | 첫 번째 QA 결과에서 파생된 퍼블리싱 보완 feature |
| `02_after_second_qa/` | 두 번째 QA 결과에서 파생될 퍼블리싱 보완 feature |

퍼블리싱 feature는 Astryx Design System, JADX_STATS token, 상태 표현, 반응형, 시각 QA 기준처럼 화면 품질과 스타일 일관성을 담당한다.

## 생성 규칙

- QA 이전 퍼블리싱 기준 feature는 `00_initial/`에 작성한다.
- QA 실패/부분 통과 중 시각 검증, 스타일, 반응형, 접근성 문제는 다음 QA cycle 디렉토리에 작성한다.
- 모든 feature 문서는 `공통 메타데이터`를 포함한다.
