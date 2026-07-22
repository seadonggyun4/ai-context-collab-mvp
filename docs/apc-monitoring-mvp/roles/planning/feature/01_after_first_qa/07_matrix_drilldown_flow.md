# 07. Matrix Drill-down Flow 기획 문서

## 공통 메타데이터

| 항목 | 값 |
| --- | --- |
| 소유 역할 | planning |
| 생성 시점 | 첫 번째 QA 이후 feature |
| QA Cycle | After first QA |
| 참조 QA 결과 | `../../../qa/qa-results/first_qa_check.md` |
| 생성 근거 | First QA open issue / partial-pass result |
| 문서 상태 | Follow-up scope |


## 발생 출처

- QA 결과: `../../../qa/qa-results/first_qa_check.md`
- 관련 QA 체크: `../../../qa/feature/01_monitoring_home_qa.md`
- 원인 ID: `QA-002`

## 원인

APC 상태 matrix cell 선택 이벤트가 필터 상태나 상세 탭 상태와 연결되지 않았다.

Phase 5에서는 matrix를 shell UI로 만들었고, Phase 6에서는 summary API 매핑을 우선했다. tab 간 공유 filter state 설계가 없어 cell click 결과를 수신 현황/이슈/파이프라인으로 전달하지 못했다.

## 사용자 흐름 보완

| 선택 상태 | 이동 대상 | 전달 조건 |
| --- | --- | --- |
| `ERROR` | 데이터 품질 이슈 또는 파이프라인 추적 | `apc`, `crop`, `snpSe`, `traceId` |
| `MISSING` | 수신 현황 | `apc`, `crop`, `snpSe`, `status` |
| `DELAYED` | 수신 현황 | `apc`, `crop`, `snpSe`, `status` |
| `UNDEFINED_RULE` | 모니터링 기준 설정 | `apc`, `crop`, `snpSe` |
| `NORMAL` | 수신 현황 | `apc`, `crop`, `snpSe` |

## 구현 요청 TASK

- [ ] matrix cell 클릭 정책 확정
- [ ] 이동 대상 우선순위 확정
- [ ] 이동 후 필터 표시 문구 정의
- [ ] 뒤로 가기/탭 전환 시 선택 조건 유지 정책 정의

## 완료 기준

- matrix cell을 클릭하면 관련 상세 확인 흐름이 이어진다.
- 이동 후 필터 조건이 화면에 명시된다.
