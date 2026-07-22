# 12. 운영 조치 내역 Action Form 정책 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | 두 번째 QA 이후 feature |
| QA Cycle | After second QA |
| 참조 QA 결과 | `../../../qa/qa-results/second_qa_check.md`, `../../../qa/qa-results/third_qa_check.md` |
| 생성 근거 | Second QA residual UX policy issue |
| 문서 상태 | Planning confirmed |

## 발생 출처

- QA 결과: `../../../qa/qa-results/second_qa_check.md`
- 관련 QA 체크: `../../../qa/feature/05_operation_actions_qa.md`
- 원인 ID: `QA2-003`
- 연결 구현: `../../../development/feature/02_after_second_qa/14_pipeline_related_cta_implementation.md`

## 기획 질문

운영 조치 내역 화면 안에도 상태 변경/메모 작성 form을 둘 것인가?

현재 운영 조치 등록은 데이터 품질 이슈 상세 화면에서 가능하다. 그러나 운영 조치 내역 화면은 timeline 조회 중심이므로, 해당 화면 안에서 직접 action form을 제공하면 사용자가 같은 조치를 두 위치에서 작성할 수 있다.

이 문서는 MVP 기준으로 조치 작성 위치를 확정하고, 이후 퍼블리싱/개발/QA가 같은 기준을 보도록 한다.

## 레퍼런스 조사 요약

| 레퍼런스 | 관찰 내용 | APC MVP에 주는 시사점 |
| --- | --- | --- |
| Datadog Incident Timeline | incident timeline은 incident 중 수행된 작업의 primary source로, 변경 내용/작성자/시간을 시간순으로 남긴다. responder note는 timeline에 직접 추가할 수 있다. | 조치 이력은 시간순 감사 기록으로 보여야 하며, 작성자와 시각이 명확해야 한다. |
| Datadog Incident Follow-ups | follow-up은 incident 이후 추적해야 할 항목으로 관리되며 Case Management/Jira로 export하고 status/assignee sync를 고려한다. | 장기 작업/외부 ticket 연동은 MVP 후속 범위로 두고, MVP는 내부 조치 기록만 남긴다. |
| PagerDuty Incident Timeline | incident details의 Timeline tab은 incident status, action, notification을 함께 보여주고 event/action filter를 제공한다. | 운영 조치 내역은 작성보다는 추적, 필터, 패턴 확인 중심이 적합하다. |
| PagerDuty Incident Tasks | ad-hoc task는 task name, description, status, assignee를 입력하고, 이후 assignee/status를 수정한다. | 조치 작성에 필요한 최소 필드는 상태, 담당자, 메모이며 대상 issue가 반드시 선행되어야 한다. |
| PagerDuty Status Update Templates | status update template은 incident response 중 stakeholder 커뮤니케이션을 표준화한다. | 운영 문구는 자유 입력만 두지 않고 “현재 확인 내용/다음 조치/완료 사유”처럼 일관된 문장 구조를 유도해야 한다. |

## 확정 정책

MVP에서는 `운영 조치 작성의 기준 위치`를 `데이터 품질 이슈 상세`로 고정한다.

`운영 조치 내역` 화면 안에는 전체 action form을 두지 않는다. 운영 조치 내역 화면은 조회, 필터, 재발 여부 확인, 관련 이슈 이동에 집중한다.

단, 운영 조치 내역 화면에서 사용자가 새 조치를 남겨야 하는 경우를 막지는 않는다. 화면 상단 또는 empty state에 `조치 작성` CTA를 제공하고, 클릭 시 다음 흐름으로 이동한다.

```text
운영 조치 내역
  └─ 조치 작성 CTA
      └─ 대상 이슈 선택
          └─ 데이터 품질 이슈 상세
              └─ 조치 등록 form focus
```

즉, 작성 진입점은 여러 화면에 둘 수 있지만, 실제 작성 form과 저장 기준은 하나만 둔다.

## 화면별 책임

| 화면 | 책임 | 작성 가능 여부 |
| --- | --- | --- |
| 데이터 품질 이슈 상세 | 특정 issue의 상태 변경, 담당자 메모, 조치 등록, sample row 확인 | 가능 |
| 파이프라인 추적 | 실패 trace에서 관련 issue 확인 및 조치 작성 진입 | CTA만 가능 |
| 운영 조치 내역 | 전체 조치 이력 조회, 재발 확인, 필터, 관련 issue 이동 | 전체 form 없음, CTA만 가능 |
| 데이터 조회/시각화 | 데이터 신뢰도 warning에서 관련 품질 이슈 확인 | CTA만 가능 |

## 운영 조치 내역 화면 UX 정책

| 항목 | 정책 |
| --- | --- |
| 기본 성격 | write-first가 아니라 audit-first 화면 |
| 주요 CTA | `조치 작성` 또는 `관련 이슈에서 조치 작성` |
| CTA 위치 | 화면 상단 우측, empty state, 선택 action 상세 영역 |
| CTA 동작 | 대상 issue가 이미 있으면 품질 이슈 상세로 바로 이동, 없으면 issue 선택 UI를 먼저 표시 |
| 직접 form | 운영 조치 내역 화면 안에는 상태 변경 select, 메모 textarea, 저장 버튼을 직접 배치하지 않음 |
| 권한 | viewer는 CTA disabled, operator/admin은 CTA 사용 가능 |
| 중복 방지 | 같은 issue에 미완료 action이 있으면 “진행 중 조치가 있음” 안내 후 기존 issue 상세로 이동 |
| 히스토리 | 등록된 action은 운영 조치 내역 timeline에 즉시 반영되어야 함 |

## 대상 이슈 선택 정책

운영 조치 내역 화면에서 `조치 작성`을 누른 경우, 대상 issue를 알 수 없는 상태일 수 있다. 이때는 전체 form을 바로 열지 않고 대상 선택을 먼저 요구한다.

| 항목 | 정책 |
| --- | --- |
| 선택 대상 | 미확인/확인중 품질 이슈 |
| 기본 정렬 | 심각도 높은 순, 최근 발생 순 |
| 표시 정보 | APC, 품목, 입고/선별, 이슈 유형, 심각도, 최근 발생 시각 |
| 선택 후 동작 | 데이터 품질 이슈 상세 탭으로 이동하고 action form을 focus |
| 선택 취소 | 운영 조치 내역 화면에 머무름 |

## Action Form 필드 정책

실제 form은 데이터 품질 이슈 상세에만 존재한다.

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| 대상 issue | 필수 | 운영 조치는 반드시 하나의 품질 이슈에 연결된다. |
| 상태 변경 | 필수 | `확인중`, `조치완료`, `무시` 중 선택한다. |
| 담당자 | 필수 | MVP는 현재 사용자 또는 운영 담당자 기본값을 사용한다. |
| 메모 | 필수 | 운영자가 이해할 수 있는 문장으로 작성한다. |
| 사유 | 조건부 필수 | `무시` 또는 `조치완료` 시 사유를 요구한다. |

## 권한 정책

| 역할 | 운영 조치 내역 조회 | 조치 작성 CTA | 실제 조치 등록 |
| --- | --- | --- | --- |
| viewer | 가능 | disabled | 불가 |
| operator | 가능 | 가능 | 가능 |
| admin | 가능 | 가능 | 가능 |

## MVP 범위와 후속 범위

| 구분 | 범위 |
| --- | --- |
| MVP 포함 | 운영 조치 내역 조회, action timeline, 조치 작성 CTA, issue 선택 후 품질 이슈 상세 form 이동 |
| MVP 제외 | 운영 조치 내역 화면 내부 full form, 외부 ticket 생성, Slack/Teams 연동, 자동 follow-up export |
| 후속 검토 | 조치가 장기 작업으로 커질 경우 별도 `follow-up task` 모델과 Jira/Case export 정책 추가 |

## 역할 간 전달 조건

| 전달 대상 | 전달 내용 | 상태 |
| --- | --- | --- |
| Publishing | 운영 조치 내역은 audit-first 화면이며, CTA/disabled/issue picker/focus handoff 시각 기준 필요 | 전달 필요 |
| Development | Operation Actions 화면에는 full form을 만들지 않고, issue 선택 후 QualityIssues action form으로 이동하는 handoff 구현 필요 | 전달 필요 |
| QA | 운영 조치 내역에 full form이 없는지, CTA handoff와 권한 제한이 동작하는지 재검증 필요 | 전달 필요 |

## 완료 기준

- 운영 조치 작성의 기준 화면이 `데이터 품질 이슈 상세`로 명확하다.
- 운영 조치 내역 화면은 조회/감사/재발 확인 화면으로 이해된다.
- 사용자는 운영 조치 내역 화면에서도 조치 작성 흐름을 시작할 수 있지만, 실제 저장 form은 하나만 사용한다.
- viewer/operator/admin 권한별 작성 가능 범위가 분리된다.
- 후속 publishing/development feature가 이 정책을 직접 참조한다.

## 참조 링크

- Datadog Incident Timeline: https://docs.datadoghq.com/incident_response/incident_management/investigate/timeline/
- Datadog Incident Follow-ups: https://docs.datadoghq.com/incident_response/incident_management/post_incident/follow-ups/
- PagerDuty Incidents: https://support.pagerduty.com/main/docs/incidents
- PagerDuty Incident Tasks: https://support.pagerduty.com/main/docs/incident-tasks
- PagerDuty Status Update Templates: https://support.pagerduty.com/main/docs/status-update-templates
