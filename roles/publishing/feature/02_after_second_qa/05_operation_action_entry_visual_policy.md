# 05. 운영 조치 작성 진입 시각 정책

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | publishing |
| 생성 시점 | 두 번째 QA 이후 feature |
| QA Cycle | After second QA |
| 참조 QA 결과 | `../../../qa/qa-results/second_qa_check.md`, `../../../qa/qa-results/third_qa_check.md` |
| 생성 근거 | Planning confirmed: `../../../planning/feature/02_after_second_qa/12_operation_action_form_policy.md` |
| 문서 상태 | Follow-up scope |

## 참조 문서

- `../../Publishing.md`
- `../../../planning/feature/02_after_second_qa/12_operation_action_form_policy.md`
- `../../../development/feature/02_after_second_qa/14_pipeline_related_cta_implementation.md`

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/02_after_second_qa/12_operation_action_form_policy.md` | 운영 조치 내역은 audit-first, 작성 form은 품질 이슈 상세로 고정 | 충족 |
| Publishing | 현재 문서 | CTA, disabled, issue picker, handoff focus 시각 기준 정의 | 진행 필요 |
| Development | `../../../development/feature/02_after_second_qa/15_operation_action_entry_handoff.md` | 시각 정책을 구현 TASK에 반영 | 대기 |
| QA | `../../../qa/feature/05_operation_actions_qa.md` | 운영 조치 작성 진입 UX 재검증 | 대기 |

## 시각 정책

운영 조치 내역 화면은 조치 이력을 보는 audit-first 화면이다. 따라서 화면 내부에 상태 변경 select, 메모 textarea, 저장 button으로 구성된 full form을 직접 노출하지 않는다.

대신 사용자가 조치 작성 흐름을 시작할 수 있도록 `조치 작성` CTA를 제공한다.

## 컴포넌트 정책

| 요소 | Astryx 기준 | 시각 정책 |
| --- | --- | --- |
| 조치 작성 CTA | Button | primary button, 화면 상단 우측 배치 |
| viewer disabled CTA | Button disabled + helper text | disabled 상태와 사유를 함께 표시 |
| 대상 이슈 선택 | Dialog 또는 Drawer | 좁은 화면에서는 full-width drawer, desktop에서는 dialog 권장 |
| 이슈 목록 | Table 또는 List | 심각도 badge, APC/품목/구분, 최근 발생 시각 표시 |
| 선택 후 handoff | Context callout | 품질 이슈 상세 상단에 이동 출처 표시 |
| Action form focus | Focus block | 기존 `action-form-block.is-focused` 스타일 재사용 |

## 상태 표현

| 상태 | 표현 |
| --- | --- |
| 조치 가능한 이슈 있음 | `조치 작성` button 활성 |
| 조치 가능한 이슈 없음 | empty state에 `현재 작성 가능한 품질 이슈가 없습니다` 표시 |
| viewer 권한 | CTA disabled, `조회 권한은 조치 등록을 할 수 없습니다` helper 표시 |
| 동일 이슈 진행 중 | warning tone callout, `진행 중 조치가 있음` 표시 |

## 레이아웃 정책

- 카드/패널/dialog/list wrapper의 `border-radius`는 `5px`로 유지한다.
- 색상은 `Publishing.md`의 JADX_STATS token과 상태 색상만 사용한다.
- 운영 조치 내역 timeline과 CTA 영역을 같은 카드 안에 과도하게 섞지 않는다.
- CTA 영역은 화면 상단 command 영역 또는 empty state의 보조 command로 둔다.
- 모바일에서는 CTA가 timeline 제목과 겹치지 않도록 한 줄 아래로 떨어뜨린다.

## 완료 기준

- 운영 조치 내역 화면이 작성 화면으로 오해되지 않는다.
- 사용자는 CTA를 통해 작성 흐름을 시작할 수 있다.
- 실제 form은 품질 이슈 상세의 canonical action form으로 이어진다.
- viewer/operator/admin 권한 차이가 시각적으로 명확하다.
