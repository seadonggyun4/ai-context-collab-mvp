# 02. 수신 현황

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | QA 이전 초기 feature |
| QA Cycle | Initial planning before first QA |
| 참조 QA 결과 | None |
| 생성 근거 | `../../../../Project_Context.md`, role context document |
| 문서 상태 | Initial scope baseline |


## 참조 문서

- `../../Planning.md`
- `../../../../Project_Context.md`

## 목적

수신 현황은 APC별 데이터가 언제 들어왔고, 기대 수신 주기 대비 정상인지 지연인지 확인하는 화면이다.

이 화면은 운영자가 `데이터가 안 들어온 것인지`, `들어왔지만 정제되지 않은 것인지`, `조회 가능한 상태까지 도달하지 못한 것인지`를 구분할 수 있게 한다.

## 필터

| 필터 | 설명 |
| --- | --- |
| 기간 | 기본값은 당일, 필요 시 기간 확장 |
| APC | 남원, 위미, 서귀, 중문, 구좌 |
| 품목 | 감귤, 당근 |
| 구분 | 입고, 선별 |
| 상태 | 정상, 지연, 오류, 미수신, 기준 미정 |

필터는 기존 `데이터 조회`의 품목, 입고/선별, APC 기준과 최대한 같은 용어를 사용한다.

## 목록 컬럼

| 컬럼 | 설명 |
| --- | --- |
| APC명 | 데이터를 전송한 APC |
| 품목 | 감귤, 당근 등 |
| 구분 | 입고 또는 선별 |
| 최근 수신 시각 | 마지막으로 API 수신이 확인된 시각 |
| 기대 수신 주기 | APC별 기준 수신 주기 |
| 기준 시각 | 현재 상태 판단에 사용한 기준 시각 |
| 지연 시간 | 기대 시각 대비 초과 시간 |
| 원천 저장 여부 | origin JSON 저장 여부 |
| 정제 저장 여부 | refined Parquet 저장 여부 |
| 상태 | 정상, 지연, 오류, 미수신, 기준 미정 |

## 상세 화면

APC row를 선택하면 해당 APC의 수신 이력을 timeline으로 표시한다.

| 단계 | 표시 정보 |
| --- | --- |
| API 수신 | 수신 시각, 요청 구분, APC명 |
| 인증/검증 | 인증 성공 여부, 스키마 검증 결과 |
| origin 저장 | 원천 저장 여부, 저장 시각 |
| refined 저장 | 정제 저장 여부, 저장 시각 |
| 적재/조회 | 화면 조회 가능 여부 |

## UX 정책

- 지연, 오류, 미수신 row는 상단에 우선 정렬한다.
- 최근 수신 시각만 보여주지 않고 기대 수신 기준도 함께 보여준다.
- 미수신 상태에서는 마지막 정상 수신 시각이 있으면 함께 표시한다.
- `기준 미정` 상태는 오류처럼 보이지 않게 구분하고, 기준 설정 화면으로 이동할 수 있게 한다.
- timeline은 기술 로그보다 운영자가 이해할 수 있는 문장으로 표시한다.

## JADX 근거

- APC API 수신 흐름: `/Users/dgseo/Desktop/JADX/jadx-apc-api/CLAUDE.md`
- API endpoint: `/Users/dgseo/Desktop/JADX/jadx-apc-api/app/routes.py`
- origin/refined 저장 구조: `/Users/dgseo/Desktop/JADX/jadx-apc-api/CLAUDE.md`의 object storage path 정책
- 기존 데이터 조회 필터: `/Users/dgseo/Desktop/JADX/jadx-fe/apps/jadx-tg/src/pages/ApcDataManagement/components/DataLookup.tsx`

## MVP 범위

- 실제 외부 알림 대신 화면 내 지연/미수신 경고만 표시한다.
- 원천/정제 저장 경로는 권한이 있는 운영자에게만 노출한다.
- 위미는 refined 저장 여부가 제한 상태일 수 있으므로 정상/오류와 별도로 설명한다.
