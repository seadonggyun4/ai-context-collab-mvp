# 08. 시각화 연계 개발 문서

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

기존 `시각화` 메뉴의 APC별 당산도, 등급 분포, 총 선별 중량 차트는 유지하면서, 현재 차트 데이터의 신뢰도 경고를 연결한다.

기존 기능 근거:

- `/Users/dgseo/Desktop/JADX/jadx-fe/apps/jadx-tg/src/pages/ApcDataManagement/components/Visualization.tsx`
- `/Users/dgseo/Desktop/JADX/jadx-fe/apps/jadx-tg/src/pages/ApcDataManagement/services/apis/apcApi.ts`

## Chart 기준

- 신규 chart 구현은 Apache ECharts + React wrapper를 사용한다.
- 기존 차트를 교체하는 경우에도 차트 시각 스타일은 `../../../publishing/Publishing.md`를 따른다.
- 모니터링 상태를 차트 데이터와 직접 섞지 않는다.
- 신뢰도 경고는 chart 상단 banner 또는 panel header에 표시한다.

## 연계 API

사용 endpoint:

- `GET /api/monitoring/issues`
- 필요 시 `GET /api/monitoring/summary`

조회 조건 mapping:

| 기존 시각화 조건 | monitoring query |
| --- | --- |
| 선택 연도 | `startDate`, `endDate` |
| APC | `apc` |
| 품목 | `crop` |
| 차트 유형 | 직접 mapping 없음 |

## 화면 연동 지점

| 영역 | 구현 기준 |
| --- | --- |
| 신뢰도 warning | 차트 조건 기준 품질 이슈 요약 표시 |
| 차트 | Apache ECharts |
| 상세 이동 | 품질 이슈 메뉴 이동 CTA |
| 빈 상태 | 데이터 없음 state 관리 |

## 구현 TASK

- [x] 기존 시각화 조건과 monitoring query mapping 함수 정의
- [x] 차트 조건 기준 품질 이슈 요약 fetch 구현
- [x] 데이터 신뢰도 warning banner 구현
- [x] ECharts option과 퍼블리싱 기준 연결 항목 정의
- [x] 당산도 차트 ECharts option 기준 문서화
- [x] 등급 분포 차트 ECharts option 기준 문서화
- [x] 총 선별 중량 차트 ECharts option 기준 문서화
- [x] 품질 이슈 메뉴 이동 CTA 구현
- [x] 모니터링 API 실패 시 차트 표시를 막지 않는 fallback 구현

## 수용 기준

- 시각화 화면은 기존 차트 목적을 유지한다.
- 품질 이슈가 있으면 차트 상단에서 데이터 신뢰도 경고를 확인할 수 있다.
- 모니터링 상태와 차트 데이터가 섞여 해석되지 않는다.
- 차트 구현 결과가 `Publishing.md`와 충돌하지 않는다.
