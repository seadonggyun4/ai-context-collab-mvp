# CR-2026-016 Render 초기 시연 data source 복구

## 변경 메타데이터

| 항목 | 값 |
| --- | --- |
| status | `IMPLEMENTED_LOCAL` |
| requested_at | `2026-07-23` |
| risk | `MEDIUM` |
| scope | Render Static Site build-time data source, 배포 문서, Blueprint contract test |
| approval | 배포 오류 복구 요청 |

## 증상과 원인

- 배포된 Static Site는 정상 로드되지만 첫 화면이 project dashboard 로딩/오류 상태에 머문다.
- Blueprint의 `VITE_DATA_SOURCE=http`가 아직 미구현인 `GET /api/v1/projects/{projectId}/dashboard`를 호출했다.
- preview CORS는 credentialed frontend 호출 계약과도 불일치했지만, 초기 시연의 활성 문서는 HTTP integration이 아니라 deterministic fixture를 기본으로 정한다.

## 결정

1. 초기 무료 시연 Static Site의 data source를 `fixture`로 복구한다.
2. 실행 중 HTTP 실패를 fixture로 fallback하지 않고 build-time adapter 선택을 계속 명시한다.
3. FastAPI·PostgreSQL·Key Value는 계속 배포하고 health, migration, Project/Document read API를 독립적으로 smoke한다.
4. Dashboard·analysis·impact backend 계약과 credentialed CORS를 함께 구현·검증한 뒤에만 `http`로 전환한다.

## 수용 기준

- Blueprint contract test가 frontend data source `fixture`를 고정해 회귀를 차단한다.
- 재배포된 메인에서 APC dashboard proof가 보이고 project route로 이동한다.
- `/health/live`, `/health/ready`는 200을 유지한다.
- Blueprint의 무료 자원·preview off·checksPass 계약은 변경하지 않는다.
