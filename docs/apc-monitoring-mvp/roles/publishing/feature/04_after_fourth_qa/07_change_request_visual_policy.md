# Change Request Visual Policy

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | publishing |
| 생성 시점 | 네 번째 QA 이후 feature |
| QA Cycle | After fourth QA |
| 참조 QA 결과 | `roles/qa/qa-results/fourth_qa_check.md` |
| 생성 근거 | 사용자 수정 요청 시 퍼블리싱 영향 추적 누락 방지 |
| 문서 상태 | Follow-up scope |

## 목적

사용자 수정 요청이 화면 표현, 레이아웃, 컴포넌트, 상태 색상, 반응형, 접근성에 영향을 주는 경우 퍼블리싱 feature 문서로 먼저 산출한다.

## 분류 기준

| 수정 유형 | Publishing feature 생성 필요 여부 |
| --- | --- |
| 레이아웃 폭, 여백, 정렬 변경 | 필요 |
| 카드/table/panel/tabs/button 컴포넌트 표현 변경 | 필요 |
| 상태 색상, badge, warning, disabled 표현 변경 | 필요 |
| 반응형 breakpoint 또는 모바일 동작 변경 | 필요 |
| 접근성 label, focus, aria 상태 변경 | 필요 |
| 순수 API/데이터 구조 변경 | 영향 없음으로 기록 후 Development로 전달 |

## 산출 규칙

수정 요청이 퍼블리싱 영향을 가지면 최신 cycle의 publishing feature 디렉토리에 다음 순번 문서로 생성한다.

현재 기준 다음 생성 위치:

```text
roles/publishing/feature/04_after_fourth_qa/
```

문서는 반드시 관련 planning feature를 참조한다. planning 영향이 없다고 판단한 경우에도 “Planning 영향 없음”과 그 근거를 기록한다.

## Publishing 완료 기준

- 어떤 UI 요소가 변경되는지 명시되어 있다.
- `Publishing.md`의 Astryx Design System, JADX_STATS token, radius 5px 정책과 충돌하지 않는다.
- 반응형/접근성 영향이 기록되어 있다.
- 개발자가 CSS/컴포넌트 판단을 다시 하지 않아도 되는 수준의 조건이 있다.
- QA 체크 항목으로 전환 가능한 시각 검증 기준이 있다.

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `roles/planning/feature/04_after_fourth_qa/14_change_request_triage_policy.md` | 사용자 흐름 영향 분류 | 충족 |
| Publishing | 현재 문서 | UI/상태/레이아웃 영향 분류 | 충족 |
| Development | `roles/development/feature/04_after_fourth_qa/18_change_request_implementation_gate.md` | 퍼블리싱 조건 구현 반영 | 연결 필요 |
| QA | `roles/qa/feature/10_change_request_traceability_qa.md` | 시각/반응형 검증 연결 | 연결 필요 |
