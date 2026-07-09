# 09. 권한 정책 기획 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | 첫 번째 QA 이후 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../../../qa/qa-results/first_qa_check.md` |
| 생성 근거 | QA-001 권한 정책 미구현 |
| 문서 상태 | Follow-up scope |

## 발생 출처

- QA 결과: `../../../qa/qa-results/first_qa_check.md`
- 관련 QA 체크: `../../../qa/feature/02_ingestion_status_qa.md`, `../../../qa/feature/06_monitoring_rules_qa.md`
- 원인 ID: `QA-001`

## 기획 정책

| 역할 | 볼 수 있는 정보 | 제한 정보 | 수정 가능 범위 |
| --- | --- | --- | --- |
| viewer | 상태, 최근 수신 시각, 품질 이슈 요약 | origin/refined 상세 경로, 내부 로그 상세 | 없음 |
| operator | 상태, 품질 이슈 상세, 운영 조치 메모 | 시스템 설정 변경 | 이슈 상태/조치 메모 |
| admin | 전체 정보 | 없음 | 모니터링 기준 수정, 권한 필요 작업 |

## 화면 정책

- 제한 정보는 숨김 처리하고 `권한 필요` 라벨을 표시한다.
- 수정 불가 버튼은 사라지지 않고 disabled 상태로 노출한다.
- disabled 사유는 tooltip 또는 보조 문구로 제공한다.
- 권한 부족은 오류가 아니라 사용자 역할에 따른 정상 상태로 취급한다.

## 다음 역할 전달 조건

| 전달 대상 | 충족해야 할 조건 |
| --- | --- |
| Publishing | `권한 필요`, disabled button, tooltip, 민감 경로 숨김 표현 기준 정의 |
| Development | `UserRole` 타입, role별 노출/수정 정책, API/UI guard 구현 |
| QA | viewer/operator/admin별 기대 결과 체크표 추가 |

## 완료 기준

- viewer/operator/admin별 화면 차이가 기획 문서만으로 이해된다.
- 개발자가 권한 조건을 임의로 해석하지 않아도 된다.
