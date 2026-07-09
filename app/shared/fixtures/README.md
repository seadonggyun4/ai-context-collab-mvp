# Fixtures

## 목적

MVP에서 실제 운영 DB, Object Storage, Airflow, APC API를 호출하지 않고도 동일한 시연 결과를 재현하기 위한 deterministic data를 둔다.

## 원칙

- 기준 시각을 고정한다.
- 정상/지연/오류/미수신/기준 미정 상태를 모두 포함한다.
- 개인정보 원문을 포함하지 않는다.
- 각 fixture는 어떤 feature 문서에 대응하는지 주석 또는 metadata로 남긴다.

## 파일

| 파일 | 설명 |
| --- | --- |
| `monitoring_fixture.json` | Phase 3 deterministic APC monitoring fixture |

## 포함 상태

- `NORMAL`: 남원 감귤 선별, 중문 감귤 입고
- `DELAYED`: 위미 감귤 선별
- `ERROR`: 중문 감귤 선별 정제 실패
- `MISSING`: 서귀 당근 입고 미수신
- `UNDEFINED_RULE`: 구좌 당근 선별 기준 미정
