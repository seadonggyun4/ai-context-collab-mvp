# 09. 브라우저 시각 QA 체크표

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | qa |
| 생성 시점 | 첫 번째 QA 이후 재검증 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../qa-results/first_qa_check.md` |
| 생성 근거 | QA checklist lifecycle |
| 문서 상태 | Executed |


## 발생 출처

- QA 결과: `../qa-results/first_qa_check.md`
- 관련 Publishing 문서: `../../publishing/feature/01_after_first_qa/01_browser_visual_qa_policy.md`
- 원인 ID: `QA-007`

## 체크표

| 구분 | 체크 항목 | 확인 |
| --- | --- | --- |
| 환경 | 브라우저 자동화 또는 수동 브라우저 검증 환경이 준비되었는가 | [ ] |
| Desktop | desktop viewport에서 주요 패널과 table이 겹치지 않는가 | [ ] |
| Mobile | mobile viewport에서 filter/tabs/table overflow가 깨지지 않는가 | [ ] |
| Chart | ECharts canvas가 nonblank로 렌더링되는가 | [ ] |
| Publishing | 색상/radius/font가 `../../publishing/Publishing.md` 기준과 충돌하지 않는가 | [ ] |
| 증적 | screenshot 또는 검증 로그가 `../qa-results/`에 기록되었는가 | [ ] |

## 검증 결과

| 체크 항목 | 결과 |
| --- | --- |
| 브라우저 자동화 또는 수동 브라우저 검증 환경이 준비되었는가 | 통과 |
| desktop viewport에서 주요 패널과 table이 겹치지 않는가 | 통과 |
| mobile viewport에서 filter/tabs/table overflow가 깨지지 않는가 | 통과 |
| ECharts canvas가 nonblank로 렌더링되는가 | 통과 |
| 색상/radius/font가 `../../publishing/Publishing.md` 기준과 충돌하지 않는가 | 통과 |
| screenshot 또는 검증 로그가 `../qa-results/`에 기록되었는가 | 통과 |

## 미해결 이슈

- 없음

## 비고

- 두 번째 QA 중 모바일 body overflow가 발견되었으나 즉시 수정 후 재검증했다.
- 상세 결과는 `../qa-results/second_qa_check.md`에 기록한다.
