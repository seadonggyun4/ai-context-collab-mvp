# 13. 운영 조치 작성 진입 Handoff 정책 보강

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | 세 번째 QA 이후 feature |
| QA Cycle | After third QA |
| 참조 QA 결과 | `../../../qa/qa-results/third_qa_check.md` |
| 생성 근거 | QA3-001 carry-forward issue |
| 문서 상태 | Implemented |

## 발생 출처

- QA 결과: `../../../qa/qa-results/third_qa_check.md`
- 원인 ID: `QA3-001`
- 이전 정책 문서: `../02_after_second_qa/12_operation_action_form_policy.md`

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | 현재 문서, `../02_after_second_qa/12_operation_action_form_policy.md` | 운영 조치 내역은 audit-first, 작성은 품질 이슈 상세 action form으로 handoff | 충족 |
| Publishing | `../../../publishing/feature/03_after_third_qa/06_operation_action_entry_visual_followup.md` | CTA/issue picker/focus handoff 시각 기준 연결 | 충족 |
| Development | `../../../development/feature/03_after_third_qa/16_operation_action_entry_handoff_implementation.md` | OperationActionsPage에서 작성 진입 handoff 구현 | 충족 |
| QA | `../../../qa/qa-results/fourth_qa_check.md` | QA3-001 재검증 항목 연결 | 통과 확정 |

## 정책 확정

세 번째 QA 결과, 운영 조치 내역 화면은 다음 정책을 유지한다.

- 운영 조치 내역 화면은 `조회/감사/재발 확인` 중심이다.
- 운영 조치 내역 화면 안에는 상태 변경 select, 메모 textarea, 저장 button으로 구성된 full form을 두지 않는다.
- 운영 조치 내역 화면에는 `조치 작성` 진입 CTA를 제공한다.
- CTA 클릭 후 대상 issue를 선택하면 데이터 품질 이슈 상세로 이동하고, 해당 issue의 action form을 focus한다.
- 조치 작성의 저장 기준은 데이터 품질 이슈 상세의 canonical action form 하나로 단일화한다.

## 사용자 흐름

```text
운영 조치 내역
  ├─ 조치 timeline 확인
  ├─ 조치 작성 CTA 선택
  ├─ 미확인/확인중 품질 이슈 중 대상 선택
  └─ 데이터 품질 이슈 상세로 이동
      └─ 조치 등록 form focus
```

## 완료 기준

- 사용자가 운영 조치 내역에서 조치 작성 흐름을 시작할 수 있다.
- 사용자가 작성 대상 issue를 선택할 수 있다.
- 실제 작성 form은 데이터 품질 이슈 상세에만 존재한다.
- viewer는 진입 CTA를 사용할 수 없고, operator/admin은 사용할 수 있다.
- 조치 등록 후 운영 조치 내역 timeline에서 이력이 확인되어야 한다.

## 구현 반영 결과

| 항목 | 결과 |
| --- | --- |
| 대상 issue 범위 | `미확인`, `확인중` 품질 이슈만 표시 |
| 정렬 기준 | 심각도 높은 순, 동일 심각도에서는 최근 발생 순 |
| 표시 정보 | APC, 품목, 입고/선별, 이슈 유형, 심각도, 상태, 최근 발생 시각 |
| 선택 후 흐름 | 선택 issue를 `QualityIssuesPage`로 handoff하고 action form focus |
| 저장 위치 | 데이터 품질 이슈 상세 canonical action form 유지 |

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| 브라우저: operator가 issue picker 열기 | 통과 |
| 브라우저: picker에 미확인/확인중 이슈 7건 표시 | 통과 |
| 브라우저: summary에 필터/정렬 기준 표시 | 통과 |
| 브라우저: 높은 심각도 및 최근 발생 기준 정렬 확인 | 통과 |
