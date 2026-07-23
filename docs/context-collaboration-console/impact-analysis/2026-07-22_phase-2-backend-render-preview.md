# Phase 2 Backend·Render Preview 영향 분석

- Change ID: `CR-2026-006`
- 상위 결정: `CR-2026-003`
- 상태: 코드·로컬 QA 완료, Render sync 대기

## 실제 영향

| 노드 | 영향 |
| --- | --- |
| Repository | `projects/context-collaboration-console-api/`, root `render.yaml` 추가 |
| Domain | Project, Document, DomainError Python read model 추가 |
| Application | Project/Document repository port와 query service 추가 |
| Database | PostgreSQL projects table, Alembic `20260722_0001`, idempotent seed 추가 |
| Git | `ls-tree -z`/`cat-file blob` read adapter와 path/ref/size/encoding policy 추가 |
| HTTP | health 2개, `/api/v1` read 3개, OpenAPI/error/request-ID/CORS 계약 추가 |
| Render | Static Site, Web Service, Postgres, pre-deploy migration/seed, preview expiry 추가 |
| Frontend | runtime 코드는 비영향, Render build/env contract만 추가 |
| QA | backend 27 tests와 실제 PostgreSQL integration 추가 |

## 설계 변경

기존 문서는 API Render root를 backend directory로 계획했다. 그러나 root 밖 파일은 Render build/runtime에서 사용할 수 없으므로 문서 Git source를 읽을 수 없다. API root를 repository root로 바꾸고 command의 `cd`와 repository-relative build filter로 scope를 제한했다.

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| API DTO와 DB row 결합 | domain/DTO/row를 별도 class로 유지 |
| migration 설정값 위조 | expected revision을 코드 상수로 고정하고 Alembic head test |
| Git shell/path injection | shell 미사용, argument vector, ref allowlist, PurePosixPath 검증 |
| 미커밋 문서를 source로 노출 | worktree가 아니라 commit blob object만 반환 |
| DB는 정상이나 migration stale | readiness 503과 database/migration check 분리 |
| wildcard CORS | HTTPS origin allowlist와 제한된 method/header |
| 문서 원본 log 노출 | public error에 Git stderr/raw source 미포함 |
| Render resource 비용 발생 | workspace sync를 외부 승인 Gate로 유지 |

## 미완료 영향

- 실제 Render resource는 생성하지 않았다.
- preview hostname에서의 SPA/CORS/API/DB smoke는 미검증이다.
- Render runtime의 Git metadata 제공 여부는 preview smoke에서 확인해야 하며, 미제공 시 provider API adapter를 활성화해야 한다.
- production backup/PITR, OIDC, RBAC, Git write는 이후 Phase 범위다.
