# 01. 브라우저 시각 QA 및 반응형 검증 정책

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | publishing |
| 생성 시점 | 첫 번째 QA 이후 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../../../qa/qa-results/first_qa_check.md` |
| 생성 근거 | First QA open issue / partial-pass result |
| 문서 상태 | Follow-up scope |


## 발생 출처

- QA 결과: `../../../qa/qa-results/first_qa_check.md`
- 관련 QA 체크: `../../../qa/QA.md`
- 원인 ID: `QA-007`

## 원인

브라우저 자동화 세션이 반복 timeout되어 desktop/mobile screenshot, canvas 렌더링, 레이아웃 겹침 검증을 완료하지 못했다.

typecheck/build/API 응답은 검증했지만 실제 화면 렌더링은 별도 수동 또는 자동 브라우저 QA가 필요하다.

## Publishing 검증 기준

| 항목 | 기준 |
| --- | --- |
| 색상 | `../../Publishing.md`의 JADX_STATS 토큰만 사용 |
| Radius | card/table wrapper `5px` |
| 반응형 | desktop/mobile에서 텍스트 겹침 없음 |
| 차트 | ECharts canvas가 nonblank 상태 |
| Table | 모바일 overflow가 의도대로 동작 |

## 구현/검증 TASK

- [ ] 브라우저 플러그인 재시도
- [ ] 실패 시 Playwright CLI 기반 screenshot 스크립트 작성
- [ ] desktop viewport 검증
- [ ] mobile viewport 검증
- [ ] ECharts canvas nonblank 확인
- [ ] text overlap/table overflow 확인

## 완료 기준

- desktop/mobile screenshot QA 결과가 `../../qa/qa-results/`에 기록된다.
- 차트 canvas가 비어 있지 않음을 확인한다.
- 주요 UI 텍스트 겹침이 없다.
