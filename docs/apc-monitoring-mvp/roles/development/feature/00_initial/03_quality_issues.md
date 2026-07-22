# 03. 데이터 품질 이슈 개발 문서

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
- `../../../planning/feature/00_initial/03_quality_issues.md`
- `../../../publishing/Publishing.md`

## 구현 목표

필수값 누락, 형식 오류, 중복 의심, 비정상 중량/수량, 미지원 APC/품목, 정제 실패 이슈를 목록과 상세 drawer로 제공한다. 데이터 조회/Excel 다운로드 전 경고와도 연결한다.

## API

사용 endpoint:

- `GET /api/monitoring/issues`
- `POST /api/monitoring/issues/{issue_id}/actions`

Query:

- `startDate`
- `endDate`
- `apc`
- `crop`
- `snpSe`
- `status`
- `severity`
- `issueType`

목록 item 주요 필드:

- `issueId`
- `traceId`
- `status`
- `severity`
- `apc`
- `crop`
- `snpSe`
- `issueType`
- `issueTypeLabel`
- `affectedCount`
- `firstOccurredAt`
- `lastOccurredAt`
- `assignee`
- `downloadRisk`

## 화면 연동 지점

| 영역 | 구현 기준 |
| --- | --- |
| 필터 | 기간, APC, 품목, 입고/선별, 상태, 심각도, 이슈 유형 query state 관리 |
| 목록 | 품질 이슈 item을 row 데이터로 매핑 |
| 상세 | 선택된 이슈 상세 데이터와 drawer open state 연결 |
| 샘플 row | 이슈 상세의 sample row 데이터 표시 |
| 상태 변경 | 상태 변경 request와 성공/실패 feedback 연결 |

## Excel 다운로드 경고 연계

`downloadRisk`가 있는 이슈가 현재 조회 조건에 포함되면 데이터 조회 메뉴에서 다운로드 전 confirm을 표시한다.

경고에는 다음 정보를 포함한다.

- 이슈 개수
- 가장 높은 심각도
- 영향 APC/품목/구분
- 계속 다운로드 또는 이슈 상세 보기 선택지

## 구현 TASK

- [x] `QualityIssueItem` TypeScript type 정의
- [x] Pydantic `QualityIssueItem` schema 정의
- [x] issue type enum과 label map 구현
- [x] fixture repository에 품질 이슈 데이터 추가
- [x] `GET /api/monitoring/issues` route 구현
- [x] `POST /api/monitoring/issues/{issue_id}/actions` route 구현
- [ ] React API client `getQualityIssues` 구현
- [ ] React API client `createIssueAction` 구현
- [ ] 이슈 목록 table 구현
- [ ] severity badge 구현
- [ ] issue status badge 구현
- [ ] 상세 drawer 구현
- [ ] 샘플 row table 구현
- [x] 이슈 상태 변경 mock mutation 구현
- [ ] action 생성 후 toast 표시
- [ ] Excel 다운로드 경고 state와 연계
- [ ] loading/empty/error state 구현

## 수용 기준

- 미확인 고심각도 이슈가 먼저 노출된다.
- 이슈 상세에서 오류 요약, 영향 범위, 샘플 row, 조치 안내가 보인다.
- 상태 변경과 메모 등록이 가능하다.
- 품질 이슈가 있는 조건에서 Excel 다운로드 전 경고가 표시된다.
