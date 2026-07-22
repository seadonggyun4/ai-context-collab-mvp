# 16. 운영 조치 작성 진입 Handoff 구현

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | 세 번째 QA 이후 feature |
| QA Cycle | After third QA |
| 참조 QA 결과 | `../../../qa/qa-results/third_qa_check.md` |
| 생성 근거 | QA3-001 carry-forward issue |
| 문서 상태 | Implemented |

## 참조 문서

- `../../Development.md`
- `../../../planning/feature/03_after_third_qa/13_operation_action_entry_handoff_policy.md`
- `../../../publishing/feature/03_after_third_qa/06_operation_action_entry_visual_followup.md`
- `../02_after_second_qa/15_operation_action_entry_handoff.md`
- `../../../qa/feature/05_operation_actions_qa.md`

## 역할 간 충족 게이트

| 게이트 | 참조 문서 | 충족 조건 | 상태 |
| --- | --- | --- | --- |
| Planning | `../../../planning/feature/03_after_third_qa/13_operation_action_entry_handoff_policy.md` | OperationActionsPage는 entry only, QualityIssuesPage가 canonical action form | 충족 |
| Publishing | `../../../publishing/feature/03_after_third_qa/06_operation_action_entry_visual_followup.md` | CTA, disabled, issue picker, focus handoff 시각 기준 확정 | 충족 |
| Development | 현재 문서 | OperationActionsPage에서 issue 선택 후 QualityIssuesPage action form으로 이동 구현 | 충족 |
| QA | `../../../qa/qa-results/fourth_qa_check.md` | QA3-001 재검증 | 통과 확정 |

## 원인

세 번째 QA에서 OperationActionsPage는 action timeline과 recurrence는 표시하지만, 사용자가 이 화면에서 조치 작성 흐름을 시작하는 CTA와 대상 issue 선택 handoff가 아직 구현되지 않은 것으로 확인되었다.

## 구현 TASK

- [x] `PipelineRelatedContext`를 일반화하거나 `ActionEntryContext`를 추가해 source를 `pipeline | operation-actions`로 확장
- [x] `ApcDataManagementShell`에서 action entry context를 관리
- [x] `OperationActionsPage`에 `조치 작성` CTA 추가
- [x] viewer 권한에서는 CTA disabled 및 helper text 표시
- [x] operator/admin 권한에서는 CTA 활성화
- [x] CTA 클릭 시 미확인/확인중 품질 이슈 선택 UI 표시
- [x] issue 선택 시 `QualityIssuesPage`로 tab 이동
- [x] 이동 후 선택 issue를 우선 선택하고 action form focus
- [x] OperationActionsPage 내부에 full action form이 없는 상태 유지
- [x] 조치 등록 후 `GET /api/monitoring/actions` 재조회 또는 timeline 갱신
- [x] QA3-001 검증을 위한 브라우저/소스 기준 체크 추가

## API 범위

신규 API는 추가하지 않는다.

사용 API:

- `GET /api/monitoring/issues`
- `GET /api/monitoring/actions`
- `POST /api/monitoring/issues/{issue_id}/actions`

## 완료 기준

- 운영 조치 내역 화면에서 `조치 작성` 흐름을 시작할 수 있다.
- 대상 issue 선택 후 데이터 품질 이슈 상세 탭으로 이동한다.
- action form이 focus되고 이동 출처 context가 표시된다.
- viewer는 CTA를 사용할 수 없다.
- operator/admin은 CTA를 사용할 수 있다.
- OperationActionsPage 내부에는 full action form이 렌더링되지 않는다.
- 조치 등록 후 운영 조치 내역 timeline에서 새 이력이 확인된다.

## 구현 결과

- `ActionEntryContext`를 추가해 `pipeline`과 `operation-actions` 출처를 동일한 handoff 구조로 처리한다.
- `actionEntryContext` service를 추가해 source별 metadata, context factory, 표시 label/value 계산을 한 곳에서 관리한다.
- `ApcDataManagementShell`이 action entry context를 소유하고, `OperationActionsPage`에서 선택한 issue를 `QualityIssuesPage`로 전달한다.
- `OperationActionsPage`는 `조치 작성` CTA와 미확인/확인중 issue picker만 제공하며, full action form은 렌더링하지 않는다.
- `QualityIssuesPage`는 `운영 조치 내역에서 이동` callout과 `.action-form-block.is-focused` 상태를 표시한다.
- viewer는 CTA disabled 및 helper text를 확인하고, operator/admin은 대상 issue 선택 flow를 시작할 수 있다.
- `rolePermissions`를 추가해 viewer/operator/admin의 CTA 권한, title, helper copy를 중앙화한다.
- `ActionIssuePickerPanel`과 `actionIssuePickerPolicy`를 추가해 대상 issue 필터/정렬/표시 정책을 페이지에서 분리한다.
- `useActionEntryFocus`를 추가해 선택 issue의 action form 이동, DOM focus, focus class 판단을 중앙화한다.
- `actionTimelineRefreshKey`를 추가해 조치 등록 성공 후 운영 조치 내역이 `GET /api/monitoring/actions` 기준으로 재조회되도록 연결한다.

## Action Context 일반화 보강

| 항목 | 구현 내용 |
| --- | --- |
| Source metadata | `pipeline`, `operation-actions`의 label, 설명, traceId 필요 여부를 `ACTION_ENTRY_SOURCE_META`로 중앙화 |
| Factory | `createPipelineActionEntry`, `createOperationActionEntry`로 화면별 object literal 생성을 제거 |
| 표시 정책 | `getActionEntrySourceLabel`, `getActionEntryPrimaryValue`로 `QualityIssuesPage`의 source 분기를 제거 |
| 확장 기준 | 새 handoff source가 추가되면 타입 union, source meta, factory만 추가하고 화면 컴포넌트는 동일 계약을 사용 |

## 권한별 CTA 상태 구현

| 역할 | CTA 상태 | helper 표시 | 구현 기준 |
| --- | --- | --- | --- |
| viewer | disabled | 표시 | `getIssueActionEntryCtaState("VIEWER")` |
| operator | enabled | 미표시 | `getIssueActionEntryCtaState("OPERATOR")` |
| admin | enabled | 미표시 | `getIssueActionEntryCtaState("ADMIN")` |

권한 정책은 `shared/auth/rolePermissions.ts`에 둔다. `OperationActionsPage`는 role literal을 직접 비교하지 않고, `useUserRole().canCreateIssueAction`과 `getIssueActionEntryCtaState(role)`만 사용한다.

## 대상 Issue Picker 구현

| 항목 | 구현 내용 |
| --- | --- |
| 정책 위치 | `features/monitoring/services/actionIssuePickerPolicy.ts` |
| UI 위치 | `features/monitoring/components/ActionIssuePickerPanel.tsx` |
| 대상 범위 | `OPEN`, `IN_PROGRESS` 이슈만 표시 |
| 정렬 기준 | `HIGH -> MEDIUM -> LOW`, 동일 심각도에서는 `lastOccurredAt` 최신 순 |
| 표시 정보 | APC, 품목, 입고/선별, 이슈 유형, 심각도, 상태, 최근 발생 시각 |
| 안내 문구 | picker summary에 필터/정렬 기준과 대상 건수 표시 |

## QualityIssues Form Focus 연결

| 항목 | 구현 내용 |
| --- | --- |
| Focus hook | `features/monitoring/hooks/useActionEntryFocus.ts` |
| Focus 조건 | `focusActionForm=true`이고 선택 issue가 context issue와 일치할 때 |
| 중복 방지 | `source:issueId:traceId` key 기준으로 같은 context는 한 번만 scroll/focus |
| DOM focus | action form block에 `tabIndex={-1}`, `aria-label="운영 조치 작성 영역"` 부여 |
| Focus style | hook의 `shouldFocus` 결과로 `.action-form-block.is-focused` 적용 |
| Callout 문구 | `getActionEntryCalloutMessage`로 source와 focus 상태 기반 메시지 중앙화 |
| 선택 issue 우선 | action entry context 진입 시 issue type을 전체로 초기화하고 context issue를 선택 |

## Timeline 갱신 검증

| 항목 | 구현 내용 |
| --- | --- |
| 등록 성공 신호 | `QualityIssuesPage`의 `onIssueActionCreated` callback |
| Shell 상태 | `ApcDataManagementShell`의 `actionTimelineRefreshKey` 증가 |
| Timeline 재조회 | `OperationActionsPage`가 `actionRefreshKey`를 `useAsyncResource` dependency로 사용 |
| API 기준 | `GET /api/monitoring/actions` 재호출 |
| 브라우저 결과 | action 등록 후 timeline 2건에서 3건으로 증가, 신규 memo 표시 |

## 검증 결과

| 검증 항목 | 결과 |
| --- | --- |
| `npm run typecheck` | 통과 |
| `npm run build` | 통과 |
| `projects/apc-monitoring-mvp/api/.venv/bin/python -m pytest` | 19 passed |
| 브라우저: operator에서 `조치 작성` CTA 활성화 | 통과 |
| 브라우저: admin에서 `조치 작성` CTA 활성화 | 통과 |
| 브라우저: issue 선택 후 `데이터 품질 이슈` 탭 이동 | 통과 |
| 브라우저: `운영 조치 내역에서 이동` callout 표시 | 통과 |
| 브라우저: action form focus 상태 표시 | 통과 |
| 브라우저: viewer에서 CTA disabled 및 helper text 표시 | 통과 |
| 브라우저: operator CTA 클릭 시 issue picker 표시 | 통과 |
| 브라우저: picker 필터/정렬 summary 표시 | 통과 |
| 브라우저: picker 미확인/확인중 7건 표시 | 통과 |
| 브라우저: OperationActionsPage issue 선택 후 데이터 품질 이슈 탭 이동 | 통과 |
| 브라우저: 선택 issue 우선 선택 및 출처 callout 표시 | 통과 |
| 브라우저: action form DOM focus 및 `.is-focused` 표시 | 통과 |
| 브라우저: 조치 등록 후 운영 조치 timeline 갱신 | 통과 |
| 브라우저: OperationActionsPage 내부 full form 미렌더링 | 통과 |
