# 07. 데이터 조회 연계 개발 문서

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
- `../../../planning/Planning.md`
- `../../../publishing/Publishing.md`

## 구현 목표

기존 `데이터 조회` 메뉴의 필터, 목록, pagination, Excel 다운로드 기능은 유지하면서 모니터링 품질 경고를 연결한다.

기존 기능 근거:

- `/Users/dgseo/Desktop/JADX/jadx-fe/apps/jadx-tg/src/pages/ApcDataManagement/components/DataLookup.tsx`
- `/Users/dgseo/Desktop/JADX/jadx-fe/apps/jadx-tg/src/pages/ApcDataManagement/services/apis/apcApi.ts`

## 연계 API

사용 endpoint:

- `GET /api/monitoring/issues`

조회 조건 mapping:

| 기존 데이터 조회 필터 | monitoring query |
| --- | --- |
| 품목 | `crop` |
| 입고/선별 | `snpSe` |
| APC | `apc` |
| 조회 기간 | `startDate`, `endDate` |

농가명은 MVP monitoring query에는 직접 포함하지 않는다. 농가명 단위 품질 검사는 후속 범위다.

## 화면 연동 지점

| 영역 | 구현 기준 |
| --- | --- |
| 경고 banner | 현재 조회 조건의 품질 이슈 요약 표시 |
| 다운로드 confirm | 품질 이슈 존재 시 다운로드 전 확인 state 관리 |
| 이슈 상세 이동 | Button 또는 row link |
| 기존 목록 | 기존 table/pagination 유지 |

## Excel 다운로드 전 경고

현재 조회 조건에 `downloadRisk=true`인 품질 이슈가 있으면 다운로드 전 confirm을 표시한다.

confirm 선택지:

- 계속 다운로드
- 이슈 상세 보기
- 취소

## 구현 TASK

- [x] 기존 데이터 조회 필터와 monitoring query mapping 함수 정의
- [x] 현재 조회 조건의 품질 이슈 요약 fetch 구현
- [x] 품질 경고 banner 구현
- [x] Excel 다운로드 전 confirm 구현
- [x] `계속 다운로드` 선택 시 기존 다운로드 흐름 유지
- [x] `이슈 상세 보기` 선택 시 품질 이슈 메뉴로 이동
- [x] 품질 이슈가 없을 때 기존 화면 변화가 없도록 처리
- [x] warning 상태의 loading/error 정책 정의

## 수용 기준

- 품질 이슈가 있는 조회 조건에서는 다운로드 전 경고가 표시된다.
- 사용자는 경고를 확인하고도 다운로드를 계속할 수 있다.
- 기존 데이터 조회 기능은 모니터링 API 실패로 막히지 않는다.
