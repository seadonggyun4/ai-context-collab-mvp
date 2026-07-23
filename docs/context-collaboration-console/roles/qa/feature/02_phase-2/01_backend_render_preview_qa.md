# QF-003 Backend Foundation and Render Preview QA

## 자동 검증 결과

| 범위 | 결과 |
| --- | --- |
| Ruff format/lint | 오류 0 |
| strict mypy | 37 source files, 오류 0 |
| pytest | 27 tests 통과 |
| 실제 PostgreSQL | 14.20 disposable instance 통과 |
| Alembic | base downgrade → head upgrade → final downgrade 통과 |
| Seed | 2회 실행 후 단일 project 유지 |
| Readiness | current=200, stale migration=not ready 확인 |
| API/OpenAPI | 5 route read surface와 camelCase DTO 계약 통과 |
| CORS | allowlisted origin 허용, wildcard/attacker origin 거부 |
| Git | committed blob read, uncommitted worktree 격리, ref/path/size 반례 통과 |
| Backend architecture | 역방향 import 0건 |
| Render Blueprint | local contract + 공식 JSON Schema 통과 |
| Frontend regression | typecheck/lint, 31 tests, production build 통과 |

## External QA 대기

| ID | 조건 | 상태 |
| --- | --- | --- |
| QA-DEPLOY-01 | Render workspace Blueprint semantic/conflict validation | workspace 필요 |
| QA-DEPLOY-02 | Static Site SPA rewrite와 security header | preview URL 필요 |
| QA-DEPLOY-03 | API `/health/ready`와 PostgreSQL migration | preview resource 필요 |
| QA-DEPLOY-04 | browser origin CORS와 frontend→API 연결 | preview URL 필요 |
| QA-DEPLOY-05 | PR preview 생성과 3일 expiry | Render Blueprint sync 필요 |

Render CLI는 설치하고 실행했지만 active workspace가 없어 semantic/conflict validation을 수행하지 않았다. 외부 resource를 생성하거나 workspace를 임의 선택하지 않는다.
