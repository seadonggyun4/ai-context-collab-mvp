# Role Feature Workflow

## 목적

이 문서는 QA 이후 생성되는 후속 feature가 개발 TODO로 바로 떨어지지 않도록, 기획/퍼블리싱/개발의 순차 충족 관계를 정의한다.

사용자가 배포 화면이나 문서를 보고 수정사항을 요청하는 경우도 이 workflow를 따른다. AI는 사용자 요청을 받으면 즉시 구현하지 않고, 먼저 역할 영향 분류와 최신 numbered cycle feature 문서 생성을 수행한다.

최종 구현 feature는 다음 조건을 모두 만족해야 한다.

```text
Planning feature 탐색/확정
        ↓
Publishing feature 탐색/확정
기획 feature의 화면/상태/문구/반응형 조건 충족
        ↓
Development feature 구현
기획 요구사항 + 퍼블리싱 기준 + QA 재검증 조건 모두 충족
        ↓
QA 결과 문서 갱신
```

## 역할별 책임

| 역할 | 책임 | 다음 역할로 넘기는 조건 |
| --- | --- | --- |
| Planning | 사용자 흐름, 화면 정책, 예외 처리, 상태/문구, 완료 기준 정의 | 퍼블리싱과 개발이 해석 없이 사용할 수 있는 acceptance criteria가 있어야 한다. |
| Publishing | 기획 feature를 충족하는 컴포넌트, 상태 표현, 레이아웃, 반응형, 접근성 기준 정의 | 개발자가 스타일 판단을 다시 하지 않도록 UI 조건과 금지 조건이 있어야 한다. |
| Development | 기획 요구사항과 퍼블리싱 조건을 모두 만족하도록 API, 상태관리, UI 동작, 테스트 구현 | QA가 문서 기준으로 검증 가능한 테스트 조건과 완료 기준이 있어야 한다. |
| QA | 구현 결과가 Project Context, Planning, Publishing, Development 문서를 모두 충족하는지 검증 | 실패/부분 통과 항목은 다음 QA cycle의 role feature로 분해되어야 한다. |

## Feature 탐색 순서

1. 같은 QA ID가 있는 planning feature를 먼저 찾는다.
2. planning feature가 없으면 기존 initial planning feature가 해당 요구사항을 충분히 정의하는지 확인한다.
3. publishing feature가 planning feature의 UI/상태/레이아웃 조건을 충족하는지 확인한다.
4. publishing feature가 없으면 `Publishing.md`의 공통 기준만으로 충분한지 확인한다.
5. development feature는 planning/publishing 참조와 충족 조건을 명시한 뒤 구현 TASK를 진행한다.
6. QA는 development 결과만 보지 않고 planning/publishing 조건의 충족 여부를 함께 검증한다.

## QA Cycle 자동 생성 규칙

QA 결과 문서가 새로 생성되면 AI는 해당 QA cycle의 역할별 feature 디렉토리를 반드시 생성한다.

```text
roles/planning/feature/{cycle}/
roles/publishing/feature/{cycle}/
roles/development/feature/{cycle}/
```

실패 항목이 완전히 새로운 요구사항이 아니더라도, 이전 QA cycle에서 넘어온 미완료 항목이면 최신 cycle에 carry-forward feature를 생성한다. 이 규칙은 각 역할 담당자가 최신 QA cycle 디렉토리만 확인해도 현재 남은 일을 파악할 수 있도록 하기 위한 것이다.

| QA 결과 상태 | 자동 문서화 방식 |
| --- | --- |
| 실패 | 해당 역할의 최신 cycle feature로 생성 |
| 부분 통과 | 해당 역할의 최신 cycle feature로 생성 |
| 정책 확정 후 구현 대기 | planning/publishing/development 최신 cycle feature를 모두 생성하고 역할 간 게이트 연결 |
| 이전 cycle 미완료 이월 | 최신 cycle에 carry-forward feature 생성 |
| 완전 통과 | QA 결과 문서에 통과로 기록하고, 필요 시 완료 이력만 impact-analysis에 기록 |

최신 cycle feature는 이전 cycle 문서를 대체하지 않는다. 이전 문서는 히스토리로 남고, 최신 cycle feature는 현재 작업자의 진입점이 된다.

## 사용자 수정 요청 Intake 규칙

사용자 수정 요청은 QA 실패 항목과 동일하게 관리한다. 요청이 들어오면 AI는 다음 절차를 따른다.

1. 사용자 요청을 한 문장으로 요약한다.
2. 요청을 planning / publishing / development / qa 영향으로 분류한다.
3. 최신 QA cycle의 다음 numbered folder를 확인한다.
4. 필요한 경우 다음 폴더를 생성한다.

```text
roles/planning/feature/{cycle}/
roles/publishing/feature/{cycle}/
roles/development/feature/{cycle}/
```

5. 각 역할에 필요한 feature 문서를 다음 순번으로 생성한다.
6. QA 재검증이 필요한 경우 `roles/qa/feature/` 체크표를 생성하거나 갱신한다.
7. impact-analysis가 필요한 변경이면 `impact-analysis/`에 변경 영향 문서를 생성한다.
8. 문서 게이트가 충족된 뒤에 구현한다.

| 요청 예시 | Planning | Publishing | Development | QA |
| --- | --- | --- | --- | --- |
| 메뉴 제거 | 메뉴 구조/사용자 흐름 영향 판단 | 레이아웃/내비게이션 표현 기준 | 컴포넌트 제거/라우팅 영향 | 화면 회귀 검증 |
| max-width 변경 | 화면 정책 영향 판단 | desktop/mobile layout 기준 | CSS 구현 | 반응형 검증 |
| 버튼 동작 변경 | CTA 흐름/완료 기준 | 버튼 상태/disabled/focus 기준 | 이벤트/state/API 구현 | 동작 검증 |
| API 응답 변경 | 사용자 노출 정책 영향 판단 | loading/error 표현 영향 | schema/service/test 구현 | API 계약 검증 |

수정 요청이 특정 역할 하나에만 해당하더라도 나머지 역할의 영향 없음 판단을 문서에 기록한다. 이 기록이 있어야 후속 담당자가 왜 문서가 생성되지 않았는지 추적할 수 있다.

## Development Ready 조건

development feature는 아래 체크가 모두 채워져야 구현 완료 상태로 볼 수 있다.

| 조건 | 설명 |
| --- | --- |
| Planning 참조 | 상위 planning feature 또는 initial planning 문서가 연결되어 있다. |
| Planning acceptance 충족 | 사용자 흐름, 예외, 상태, 문구, 완료 기준이 구현 TASK에 반영되어 있다. |
| Publishing 참조 | 관련 publishing feature 또는 `Publishing.md` 기준이 연결되어 있다. |
| Publishing acceptance 충족 | 컴포넌트, 상태 표현, 레이아웃, 반응형, 접근성 조건이 구현 TASK에 반영되어 있다. |
| QA 참조 | 원인 QA ID와 재검증 체크표가 연결되어 있다. |
| 테스트 조건 | 자동 검증 또는 수동 QA 기준이 명시되어 있다. |

## 공통 메타데이터 확장

후속 feature는 기본 공통 메타데이터 아래에 다음 섹션을 추가한다.

```md
## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `...` | 사용자 흐름/정책/완료 기준 확정 | 충족/부분/미충족 |
| Publishing | `...` | 기획 조건을 만족하는 UI 기준 확정 | 충족/부분/미충족 |
| Development | `...` | 기획+퍼블리싱 조건을 구현 TASK에 반영 | 충족/부분/미충족 |
| QA | `...` | 재검증 체크표와 연결 | 충족/부분/미충족 |
```
