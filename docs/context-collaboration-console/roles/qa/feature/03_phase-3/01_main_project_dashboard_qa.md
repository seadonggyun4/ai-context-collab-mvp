# QF-004 Main and Project Dashboard QA

## 요구사항 시나리오

| Test | 검증 |
| --- | --- |
| QA-DASH-01 | 활성 Context version과 시행일 표시 |
| QA-DASH-02 | 진행 요청의 상태·위험·담당·최근 갱신 및 priority 순서 |
| QA-DASH-03 | 승인 대기·검증 필요·정합성 항목의 원인과 drill-down target |
| QA-DASH-04 | 역할별 최신 산출물과 최근 QA의 role/version/status/updated/result |
| QA-DASH-05 | 정합성 비율·검사 시각·불일치 근거 |

## 공통 Gate

- SCR-01 section과 금지 표면 카피 검사
- fixture deterministic/deep copy와 HTTP URL/status/schema/abort 계약
- loading, empty, error route state
- FSD 역방향·private import 0건
- 1280/1024/768/390px responsive와 keyboard focus
- light/dark에서 텍스트·상태·focus 의미 유지
- TypeScript, ESLint, Vitest, production build

## 실행 결과

| 검사 | 결과 |
| --- | --- |
| QA-DASH-01~05 | Vitest requirement route test 통과 |
| Fixture/HTTP adapter | deterministic, URL encoding, 404, non-2xx, network, invalid schema 통과 |
| TypeScript/ESLint | 오류·경고 0 |
| Vitest | 10 files, 38 tests 통과 |
| FSD architecture | 역방향·private import 0건 |
| Production build | 성공, 1941 modules transformed |
| Responsive | 1280/1024/768/390px 핵심 정보 손실·페이지 가로 overflow 0건 |
| Theme | light mobile, dark desktop, runtime theme 전환 확인 |
| Browser console | error/warning 0건 |

## 브라우저 조정 이력

- 1280px의 60/40 grid에서 담당 열이 글자 단위로 줄바꿈되는 문제를 발견했다.
- 담당을 요청 제목 아래 metadata로 옮겨 위험·상태·최근 시각의 비교 폭을 확보했다.
- 동작이 없는 검색 및 section utility button을 제거하거나 비상호작용 next label로 바꿔 keyboard false affordance를 없앴다.

## 미검증 범위

- 실제 `GET /api/v1/projects/{projectId}/dashboard` backend endpoint는 Phase 3 범위에 포함하지 않았다.
- `VITE_DATA_SOURCE=http`의 transport/schema failure는 자동 테스트했으나 실제 Render URL smoke는 backend endpoint 구현 뒤 수행한다.
