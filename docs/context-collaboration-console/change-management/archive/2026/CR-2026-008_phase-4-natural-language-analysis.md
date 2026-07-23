# CR-2026-008 Phase 4 자연어 요청·분석 제안

## 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-008` |
| 현재 상태 | `COMPLETED` |
| 현재 Phase | `ARCHIVIST` |
| 요청일 | `2026-07-22` |
| 요청자 | 사용자 |
| 위험도 | 중간 |
| 승인 상태 | `APPROVED` |

## 요청 원문

> Phase 4 자연어 요청·분석 제안을 문서시스템에 따라 확장성 높고 유지보수성 높게 추상화해서 개발 진행해줘.

## Active Context snapshot

- 화면: `SCR-03`, `SCR-04`
- 요구사항: `REQ-CHANGE-001`~`REQ-CHANGE-004`
- QA: `QA-CHANGE-01`~`QA-CHANGE-04`, architecture/theme/responsive 공통 Gate
- 선행 계약: Phase 1 ChangeRequest·Proposal·Impact, Phase 3 ProjectRepository·operational shell

## 결정

- raw request는 정규화하거나 요약한 문자열로 대체하지 않고 그대로 보존한다.
- 분석은 즉시 응답이 아니라 `AnalysisJob`으로 모델링해 context 확인→요청 구조화→영향 탐색→검증안 생성 상태를 가진다.
- 중복 방지는 project·Context snapshot·원문 기반 idempotency key와 서버 계약으로 강제한다.
- fixture와 HTTP adapter는 동일한 job/outcome parser와 repository contract를 사용하며 HTTP 오류를 fixture로 fallback하지 않는다.
- 실패 시 입력과 job 이력을 보존하고 명시적인 retry command로 새 attempt를 생성한다.
- 제안 화면은 요약·수용 기준을 우선하고 역할·화면·API·데이터·파일·QA 영향을 구획별로 비교한다.

## 수용 기준

| ID | 조건 |
| --- | --- |
| AC-01 | 넓은 요청 입력, project scope, 예시, raw request 보존 안내와 draft 복원이 제공된다 |
| AC-02 | 4개 분석 단계와 queued/running/failed/completed 상태가 접근 가능하게 표시된다 |
| AC-03 | 동일 idempotency key의 연속 제출이 새 job/change를 만들지 않는다 |
| AC-04 | 실패 후 입력을 잃지 않고 retry하여 같은 요청의 다음 attempt를 실행한다 |
| AC-05 | 제안에 요약, P0/P1 수용 기준, confidence, unknowns, clarification, risk가 표시된다 |
| AC-06 | 역할·화면·API·데이터·파일·QA 영향이 모두 근거와 함께 표시된다 |
| AC-07 | fixture/HTTP start·poll·retry·detail 계약과 오류 code가 자동 테스트된다 |
| AC-08 | typecheck, lint, Vitest, build와 1280/768/390px light/dark 브라우저 QA가 통과한다 |

## 제외 범위

- 실제 LLM 호출과 prompt/version 관리
- backend analysis job/queue endpoint 구현
- 변경 요청 목록, 승인 mutation, 영향 graph
- 제안 편집·revision 생성

## 구현 Gate

- 화면 component가 job 상태를 임의로 증가시키지 않는다.
- double submit과 route 재진입으로 중복 change ID를 생성하지 않는다.
- 실패·오류에서 textarea를 초기화하지 않는다.
- 분석 결과를 AI 확정 판단처럼 표현하지 않고 불확실성과 검토 필요 항목을 노출한다.

## 구현 결과

- raw request와 versioned session draft를 분석 job state와 분리해 보존했다.
- `AnalysisJob`, 4개 stage, attempt, stable idempotency key와 repository contract를 추가했다.
- fixture가 queued→running→completed와 첫 attempt 실패→retry 성공을 결정론적으로 재현한다.
- HTTP adapter에 start/poll/retry/detail 경로, Idempotency-Key, request payload와 오류 구분을 구현했다.
- SCR-03 request form과 progress panel, SCR-04 proposal summary/criteria/confidence/unknown/clarification/impact/files/QA 화면을 구현했다.
- 완료된 fixture outcome을 session에 저장해 상세 route 새로고침에서도 원문과 제안을 복원한다.
- Phase 3의 변경 요청 등록 action을 실제 new-change route로 연결했다.

## QA 결과

| 검증 | 결과 |
| --- | --- |
| TypeScript / ESLint | 오류·경고 0 |
| Vitest | 13 files, 45 tests 통과 |
| REQ-CHANGE-001~004 | route/repository tests 통과 |
| Idempotency | duplicate start/retry 추가 job·attempt 0건 |
| HTTP contract | URL/header/payload/404/network/schema 반례 통과 |
| FSD architecture | 역방향·private import 0건 |
| Production build | 성공, 1960 modules transformed |
| Browser | 1280/768/390px, light/dark, success/failure/retry/reload 통과 |
| Browser console | error/warning 0건 |

## 계획과 실제 변경 차이

- backend analysis endpoint와 실제 LLM은 제외 범위를 유지했다. HTTP adapter만 예상 계약으로 제공한다.
- fixture 상세 route의 새로고침 복원이 필요해 완료 outcome의 versioned session persistence를 추가했다.
- 후속 review route가 아직 없으므로 `검토 시작`은 현재 화면의 수용 기준으로 이동해 검토 첫 지점을 명확히 했다.

## Self-Review

- 원문은 title/summary 생성과 별개 필드로 byte-equivalent 보존된다.
- component가 stage를 직접 증가시키지 않고 repository poll 결과만 표현한다.
- double submit은 UI disable과 repository idempotency 두 경계에서 막힌다.
- 실패 시 textarea와 session draft가 초기화되지 않는다.
- confidence, unknown, clarification이 요약 옆에 노출되어 AI 결과를 확정으로 오인하지 않는다.
- 실제 server transaction/queue/LLM 검증을 완료로 표현하지 않는다.

## 완료 판정

AC-01~AC-08과 연결된 자동·브라우저 검증이 통과했다. Phase 4를 완료하고 archive한다.
