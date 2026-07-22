# Change Request Implementation Gate

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | 네 번째 QA 이후 feature |
| QA Cycle | After fourth QA |
| 참조 QA 결과 | `roles/qa/qa-results/fourth_qa_check.md` |
| 생성 근거 | 사용자 수정 요청이 코드 변경으로 바로 진행되어 문서 히스토리가 누락되는 문제 방지 |
| 문서 상태 | Follow-up scope |

## 목적

사용자 수정 요청은 구현 전 반드시 역할 분류와 문서 산출을 거친다. Development feature는 Planning과 Publishing 조건을 확인한 뒤에만 구현 착수 상태가 될 수 있다.

## 구현 착수 전 체크

| 체크 항목 | 기준 |
| --- | --- |
| 요청 분류 | planning / publishing / development / qa 중 책임 역할이 명시되어 있는가 |
| 최신 cycle | 최신 QA 이후 cycle 폴더가 생성되어 있는가 |
| Planning 참조 | 사용자 흐름/정책 영향이 확인되었는가 |
| Publishing 참조 | UI/상태/레이아웃 영향이 확인되었는가 |
| QA 참조 | 재검증 체크표가 생성 또는 갱신되었는가 |
| Impact Analysis | 변경 영향 분석 문서 생성 대상인지 판단되었는가 |

## 구현 TASK

- [ ] 사용자 요청을 한 문장으로 요약한다.
- [ ] 요청을 planning / publishing / development / qa 영향으로 분류한다.
- [ ] 최신 cycle 디렉토리를 확인하고 없으면 생성한다.
- [ ] 필요한 역할별 feature 문서를 다음 순번으로 생성한다.
- [ ] Development feature에 Planning/Pubishing/QA 참조 링크를 명시한다.
- [ ] 구현 후 자동 검증과 필요한 브라우저 검증을 수행한다.
- [ ] QA 결과 또는 변경 영향 분석 문서를 갱신한다.
- [ ] 커밋 메시지에 변경 성격을 드러낸다.

## 금지 사항

- 사용자 수정 요청을 받자마자 코드만 수정하고 문서를 생략하지 않는다.
- development feature만 만들고 planning/publishing 영향 판단을 생략하지 않는다.
- QA 실패/보완 항목을 `follow-up-features` 같은 별도 디렉토리에 만들지 않는다.
- 이전 cycle 문서를 덮어써서 히스토리를 잃지 않는다.

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `roles/planning/feature/04_after_fourth_qa/14_change_request_triage_policy.md` | 사용자 흐름 영향 분류 | 충족 |
| Publishing | `roles/publishing/feature/04_after_fourth_qa/07_change_request_visual_policy.md` | UI 영향 분류 | 충족 |
| Development | 현재 문서 | 구현 전 문서 산출 게이트 정의 | 충족 |
| QA | `roles/qa/feature/10_change_request_traceability_qa.md` | 재검증 체크표 연결 | 연결 필요 |
