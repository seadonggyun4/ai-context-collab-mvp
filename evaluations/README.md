# Document-Based Evaluation Workflow

## 문서 메타데이터

| 항목 | 값 |
| --- | --- |
| status | `ACTIVE` |
| scope | Golden Cases 실행, 결과 기록, 지표와 문서 개선 루프 |
| approved_by | 프로젝트 사용자 |
| effective_at | `2026-07-16` |
| supersedes | 없음 |

## 목적

대표 변경 요청을 동일한 단일 AI 운영 지침으로 반복 수행하고, 누락·회귀·QA 반복·사람 수정 여부를 공통 기준으로 비교한다. 별도 평가 프로그램이나 외부 플랫폼 없이 Markdown 문서로 운영한다.

## 구조

```text
evaluations/
├── README.md
├── templates/
│   ├── golden-case-template.md
│   └── evaluation-result-template.md
├── golden-cases/
│   ├── README.md
│   └── GC-001_document-only-change.md
└── results/
    └── README.md
```

## Golden Case 원칙

- 실제로 반복될 가능성이 높고 실패 시 의미 있는 학습을 주는 대표 요청을 선정한다.
- 입력 요청, 초기 조건, 적용 지침 버전, 기대 결과, 금지 결과, 검증 방법을 고정한다.
- 특정 구현 결과를 정답으로 강제하기보다 지켜야 할 계약과 관찰 가능한 결과를 정의한다.
- Case가 바뀌면 기존 결과와 직접 비교하지 않고 Case version을 올린다.
- 민감정보와 실제 운영 비밀은 Golden Case에 넣지 않는다.

## 실행 절차

1. Golden Case와 당시 활성 `Active_Context.md`를 읽는다.
2. 새 Change ID 또는 평가 전용 Run ID를 발급한다.
3. 같은 State/Phase/Self-Review/Evidence 지침으로 요청을 수행한다.
4. `evaluation-result-template.md`로 결과를 기록한다.
5. 기대 결과, 금지 결과, 증거, 실제 diff를 대조한다.
6. 실패 원인을 `요청 해석`, `Context`, `계획`, `구현`, `테스트`, `Self-Review`, `보고` 중 하나 이상으로 분류한다.
7. 반복 실패면 `Project_Context.md`, `Active_Context.md`, 조직 표준 또는 Change Management 지침의 개선안을 만든다.
8. 지침을 바꾼 뒤 동일 Case를 다시 수행하고 이전 결과와 비교한다.

## 실행 주기

- Project Context 또는 Change Management 핵심 규칙 변경 시
- 단일 AI 지침 또는 모델 운용 방식 변경 시
- 같은 유형의 실패가 두 번 이상 발생했을 때
- 중요한 배포 전 또는 사용자가 요청했을 때

날짜만 지났다는 이유로 형식적으로 재실행하지 않는다. 비교 목적과 변경된 입력을 결과 문서에 명시한다.

## 공통 지표

| 지표 | 기록 방법 |
| --- | --- |
| 요구사항 누락 수 | 수용 기준 중 미구현 또는 잘못 해석된 항목 수 |
| 회귀 수 | 변경 전 충족했으나 변경 후 실패한 기존 기준 수 |
| QA 반복 횟수 | `TESTER → IMPLEMENTER` 회귀 후 다시 수행한 QA cycle 수 |
| 사람 수정 여부 | AI 완료 판정 후 사용자가 문서·구현을 수정했는지 `예/아니오` |
| 최초 통과 여부 | 첫 `TESTER`와 첫 `SELF_REVIEWER`에서 회귀 없이 통과했는지 |
| 범위 밖 변경 수 | 계획에 없고 요청에도 필요하지 않았던 변경 수 |
| 미검증 항목 수 | 최종 보고의 `NOT_EXECUTED`, `PARTIALLY_VERIFIED` 항목 수 |
| 승인 위반 수 | 승인 필요 작업을 승인 없이 적용한 횟수 |

## 결과 판정

| 판정 | 기준 |
| --- | --- |
| `PASS` | 필수 기대 결과 충족, 금지 결과 없음, blocker 없음 |
| `PARTIAL` | 핵심 결과 일부 충족하나 누락·미검증·사람 수정 필요 |
| `FAIL` | 필수 계약 위반, 회귀, 승인 위반 또는 근거 없는 완료 선언 |

## 개선 반영 루프

평가 실패는 결과 문서로 끝내지 않는다.

```text
Golden Case 실행
→ 공통 평가표
→ 실패 유형과 원인
→ 변경할 기준 문서 지정
→ Change Manifest로 지침 수정
→ Active Context 갱신
→ 같은 Case 재실행
→ 이전/이후 지표 비교
```

반복 실패를 지침에 반영할 때는 규칙을 무조건 추가하지 않는다. 기존 규칙의 모호성, 중복, 발견 가능성을 먼저 검토하고 가장 상위의 적절한 문서 한곳을 수정한다.
