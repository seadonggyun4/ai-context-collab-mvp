# 05. 운영 조치 내역 개발 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | development |
| 생성 시점 | QA 이전 초기 feature |
| QA Cycle | Initial planning before first QA |
| 참조 QA 결과 | None |
| 생성 근거 | `../../../../Project_Context.md`, role context document |
| 문서 상태 | Initial scope baseline |


## 참조 문서

- `../../Development.md`
- `../../../../Project_Context.md`
- `../../../planning/feature/00_initial/05_operation_actions.md`
- `../../../publishing/Publishing.md`

## 구현 목표

이슈별 조치 상태 변경, 담당자 메모, 조치 완료 기록, 재발 여부 확인을 구현한다. 조치 기록은 개발 로그가 아니라 운영자용 문장으로 관리한다.

## API

사용 endpoint:

- `GET /api/monitoring/actions`
- `POST /api/monitoring/issues/{issue_id}/actions`

Query:

- `issueId`
- `apc`
- `status`
- `assignee`

action item 주요 필드:

- `actionId`
- `issueId`
- `createdAt`
- `author`
- `previousStatus`
- `nextStatus`
- `memo`
- `recurrenceCount`

## 상태 변경 정책

허용 상태:

- `OPEN`
- `IN_PROGRESS`
- `RESOLVED`
- `IGNORED`

MVP에서는 모든 상태 간 변경을 허용하되, `IGNORED`와 `RESOLVED`로 변경할 때는 memo를 필수로 한다.

## 화면 연동 지점

| 영역 | 구현 기준 |
| --- | --- |
| 조치 이력 목록 | action item을 row 데이터로 매핑 |
| 이슈 상세 timeline | action history를 시간순으로 매핑 |
| 상태 변경 form | issue status mutation request 생성 |
| 저장 결과 | 성공/실패 feedback state 관리 |
| 재발 표시 | `recurrenceCount` 기준 표시 |

## 구현 TASK

- [x] `OperationActionItem` TypeScript type 정의
- [x] Pydantic `OperationActionItem` schema 정의
- [x] fixture repository에 action history 추가
- [x] `GET /api/monitoring/actions` route 구현
- [x] action 생성 request schema 정의
- [x] memo required validation 구현
- [ ] React API client `getOperationActions` 구현
- [ ] React API client `createIssueAction` 재사용
- [ ] action timeline 컴포넌트 구현
- [ ] action form 구현
- [ ] 상태 전환 UI 구현
- [x] 조치 완료 후 기존 이슈 보존 정책 문서화
- [ ] recurrence indicator 구현
- [ ] 저장 성공/실패 toast 구현

## 수용 기준

- 이슈 상세에서 조치 이력이 timeline으로 표시된다.
- 상태 변경과 메모 등록이 가능하다.
- 조치 완료 후에도 원본 이슈가 삭제되지 않는다.
- `무시` 처리 시 사유 입력이 필요하다.
