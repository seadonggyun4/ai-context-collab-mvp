# 06. 모니터링 기준 설정 개발 문서

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
- `../../../planning/feature/00_initial/06_monitoring_rules.md`
- `../../../publishing/Publishing.md`

## 구현 목표

APC별 기대 수신 주기, 입고/선별별 허용 지연 시간, 품목별 필수값 기준, 중복 판단 기준, 심각도 기준을 조회하고 관리자 권한에서 수정한다.

## API

사용 endpoint:

- `GET /api/monitoring/rules`
- `PUT /api/monitoring/rules/{rule_id}`

rule item 주요 필드:

- `ruleId`
- `apc`
- `crop`
- `snpSe`
- `expectedIntervalMinutes`
- `allowedDelayMinutes`
- `requiredFields`
- `duplicateKeys`
- `severityPolicy`
- `isEditable`
- `lastUpdatedBy`
- `lastUpdatedAt`
- `changeHistory`

## 화면 연동 지점

| 영역 | 구현 기준 |
| --- | --- |
| 기준 목록 | rule item을 row 데이터로 매핑 |
| 수정 화면 | 선택된 rule과 edit state 연결 |
| 값 입력 | 변경 request payload 생성 |
| 변경 전/후 | 두 컬럼 diff layout |
| 권한 상태 | disabled form, tooltip |

## 권한 정책

- `admin`만 수정 가능하다.
- `operator`와 `viewer`는 조회만 가능하다.
- 권한이 없으면 수정 버튼을 disabled 처리하고 tooltip에 사유를 표시한다.

## MVP 기본값

- 중문은 입고와 선별을 분리해서 rule을 둔다.
- 위미는 `정제 미구현/제한` 상태 표시를 위한 rule flag를 둔다.
- 알림 대상/알림 방식은 후속 범위로 문서화하되 MVP 화면에서는 read-only 또는 disabled 처리한다.

## 구현 TASK

- [x] `MonitoringRuleItem` TypeScript type 정의
- [x] Pydantic `MonitoringRuleItem` schema 정의
- [x] fixture repository에 rule 데이터 추가
- [x] `GET /api/monitoring/rules` route 구현
- [x] `PUT /api/monitoring/rules/{rule_id}` route 구현
- [x] 변경 사유 required validation 구현
- [ ] React API client `getMonitoringRules` 구현
- [ ] React API client `updateMonitoringRule` 구현
- [ ] rules table 구현
- [ ] edit dialog 구현
- [ ] 변경 전/후 diff UI 구현
- [ ] admin-only disabled state 구현
- [ ] 변경 이력 표시 구현
- [ ] rule 변경 후 toast 표시

## 수용 기준

- 기준 목록에서 APC/품목/입고선별별 기준을 확인할 수 있다.
- 관리자는 기준을 수정하고 변경 사유를 남길 수 있다.
- 변경 전/후 값이 명확히 보인다.
- 기준 미정 항목은 모니터링 화면에서 오류와 구분되어 표시된다.
