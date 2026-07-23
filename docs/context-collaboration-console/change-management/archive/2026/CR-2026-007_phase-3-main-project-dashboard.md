# CR-2026-007 Phase 3 메인·프로젝트 대시보드

## 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-007` |
| 현재 상태 | `COMPLETED` |
| 현재 Phase | `ARCHIVIST` |
| 요청일 | `2026-07-22` |
| 요청자 | 사용자 |
| 위험도 | 중간 |
| 승인 상태 | `APPROVED` |

## 요청 원문

> Phase 3 메인·프로젝트 대시보드를 문서시스템에 따라 확장성 높고 유지보수성 높게 추상화해서 개발 진행해줘.

## Active Context snapshot

- 프로젝트 기준: `Project_Context.md`
- 화면 기준: `SCR-01`, `SCR-02`
- 요구사항: `REQ-DASH-001`~`REQ-DASH-005`
- QA: `QA-DASH-01`~`QA-DASH-05`, `QA-RESP-01`, `QA-ARCH-01`, `QA-STYLE-01`, `QA-THEME-03`
- frontend 기준: FSD, Astryx 우선, semantic CSS, system/light/dark

## 결정

- 메인 화면은 Truthound의 타이포그래피 중심 section rhythm과 실제 제품 화면을 증거로 사용하는 구조만 참조한다. 브랜드·카피·색상·자산은 복제하지 않는다.
- 프로젝트 대시보드는 route page가 데이터를 조립하지 않는다. `ProjectDashboard` read model과 `ProjectRepository` 계약을 사용한다.
- fixture와 HTTP adapter는 같은 비동기 repository 계약을 구현한다. 실행 중 자동 fallback은 오류를 숨기므로 금지하고 build-time data source로 명시적으로 선택한다.
- 운영 화면은 `상태 → 원인 → 다음 행동` 순서로 구성하고, 지표는 큰 카드 네 개가 아닌 compact strip으로 표시한다.
- 진행 변경, attention queue, 역할별 최신 산출물, QA 이력, 정합성 근거를 독립 widget section으로 조합한다.

## 수용 기준

| ID | 조건 |
| --- | --- |
| AC-01 | SCR-01의 header, hero, product proof, problem/shift, 6단계 workflow, role views, governance, closing CTA가 실제 운영 데이터 맥락으로 렌더링된다 |
| AC-02 | 활성 Context version·시행일·마지막 검증 시각과 네 개의 compact metric이 표시된다 |
| AC-03 | 진행 요청이 상태·위험·담당·최근 갱신 기준으로 표시되고 attention queue가 원인과 이동 대상을 제공한다 |
| AC-04 | 역할별 최신 산출물과 최근 QA/evaluation 결과가 버전·상태·시각·근거와 함께 표시된다 |
| AC-05 | 정합성 비율뿐 아니라 검사 시각과 불일치 원인을 표시한다 |
| AC-06 | fixture/HTTP adapter가 동일한 repository contract와 runtime validation을 사용하고 error/loading/empty 상태를 보존한다 |
| AC-07 | 1280/1024/768/390px에서 핵심 정보·행동 손실 없이 route와 keyboard 흐름이 유지된다 |
| AC-08 | typecheck, lint, Vitest, FSD architecture, production build, light/dark browser QA가 통과한다 |

## 제외 범위

- 변경 요청 등록 화면과 실제 mutation
- dashboard backend endpoint 구현 및 인증
- 문서 editor, 영향 graph, 승인·활성화 실행
- Truthound 자산·문구·레이아웃의 픽셀 단위 복제

## 구현 Gate

- HTTP mode는 `VITE_DATA_SOURCE=http`일 때만 선택하고 API 오류를 fixture로 숨기지 않는다.
- route page 내부에 fixture 배열, 상태 label mapping, fetch 상세를 두지 않는다.
- 색상만으로 상태를 구분하지 않고 label과 원인을 함께 제공한다.
- 390px에서 dense table은 essential column과 행 내부 상세로 재배치한다.

## 구현 결과

- SCR-01 메인을 header, outcome hero, 실제 workspace proof, problem/shift, 6단계 workflow, 역할별 판단, governance, closing CTA 순서로 재구성했다.
- Project core와 `ProjectDashboard` projection을 분리하고 async `ProjectRepository` 뒤에 route를 배치했다.
- fixture/HTTP adapter가 동일한 runtime parser를 사용하며 `VITE_DATA_SOURCE`에서만 구현을 선택한다.
- compact metric strip, priority change table, attention queue, 역할별 산출물, 정합성 원인, QA timeline을 각각 다른 정보 구조로 구현했다.
- loading/not-found/error를 repository result에서 분기하고 HTTP 404/network/non-2xx/schema failure를 구분했다.
- 담당 정보의 desktop 좁은 열 문제와 동작 없는 utility control을 브라우저 QA에서 발견해 수정했다.

## QA 결과

| 검증 | 결과 |
| --- | --- |
| TypeScript / ESLint | 오류·경고 0 |
| Vitest | 10 files, 38 tests 통과 |
| REQ-DASH-001~005 | route requirement tests 통과 |
| Fixture/HTTP contract | deterministic, URL, 404, network, non-2xx, schema 반례 통과 |
| FSD architecture | 역방향·private import 0건 |
| Production build | 성공, 1941 modules transformed |
| Browser responsive | 1280/1024/768/390px 페이지 가로 overflow 0건 |
| Theme / console | light·dark 확인, error/warning 0건 |

## 계획과 실제 변경 차이

- backend dashboard endpoint는 제외 범위를 유지했다. HTTP adapter는 예상 계약을 구현했으며 기본 실행은 fixture다.
- table 60% 영역에서 담당 열이 읽기 어려워 별도 열 대신 요청 제목 metadata로 재배치했다. 상태·위험·담당 요구 정보는 모두 유지된다.
- 후속 화면으로 이동하지 않는 utility button은 false affordance를 막기 위해 비상호작용 label로 변경했다.

## Self-Review

- route page에는 fixture 배열, HTTP 상세, 상태 label mapping이 없다.
- entity slice가 dashboard schema/parser/repository를 소유하고 widget은 read model만 표현한다.
- HTTP 오류가 fixture 성공 화면으로 바뀌지 않는다.
- 상태는 색뿐 아니라 label과 원인으로 구분한다.
- 제품 표면에 `MVP`, AI 과장 카피, neon/glow/glass, 반복 카드 grid를 사용하지 않았다.
- 실제 Render HTTP smoke는 backend dashboard endpoint 구현 전 완료로 표현하지 않는다.

## 완료 판정

AC-01~AC-08과 연결된 자동·브라우저 검증이 통과했다. Phase 3을 완료하고 archive한다.
