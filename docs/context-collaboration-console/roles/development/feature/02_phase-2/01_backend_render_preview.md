# DF-003 Backend Foundation and Render Preview

## 구현 범위

- `projects/context-collaboration-console-api/`
- repository root `render.yaml`
- Project/Document read surface와 dependency-aware health

## Architecture 계약

```text
API → Application → Domain
  ↘ Composition Root → Infrastructure
```

- Domain: frozen dataclass와 안정적인 DomainError만 소유한다.
- Application: repository/readiness Protocol과 query use case를 소유한다.
- Infrastructure: SQLAlchemy, asyncpg, Alembic, Git subprocess adapter를 소유한다.
- API: FastAPI route, Pydantic DTO, request ID, error/CORS mapping을 소유한다.
- Main: 구체 adapter 조합과 resource lifecycle만 소유한다.

AST architecture test가 domain/application/API의 역방향 adapter import를 차단한다.

## Read API

| Method | Path | Source |
| --- | --- | --- |
| GET | `/health/live` | process |
| GET | `/health/ready` | DB connectivity + Alembic head |
| GET | `/api/v1/projects/{project_id}` | PostgreSQL |
| GET | `/api/v1/projects/{project_id}/documents` | PostgreSQL project + Git tree |
| GET | `/api/v1/documents/{document_id}` | Git blob |

## Security 계약

- `*` CORS, non-local HTTP origin, credential 포함 origin을 설정 단계에서 거부한다.
- 허용 method는 GET/OPTIONS, credentials는 false다.
- Git ref는 설정된 단일 값, path는 `docs/{project_id}` 아래로 제한한다.
- `git`은 shell 없이 argument vector로 실행하고 blob size 확인 후에만 본문을 읽는다.
- UTF-8 Markdown/YAML만 허용하며 binary, traversal, oversize를 구조화 error로 반환한다.
- DB password, raw source, Git stderr는 일반 log/error에 포함하지 않는다.

## 확장 경계

- GitHub/GitLab adapter는 `DocumentRepository` Protocol 구현으로 추가한다.
- Draft/write API는 현재 read model을 변경하지 않고 별도 application command와 transaction으로 추가한다.
- 인증과 RBAC는 API dependency와 application authorization port로 추가하고 domain을 framework에 결합하지 않는다.

## 외부 Gate

Render workspace에서 실제 resource를 생성하는 Blueprint sync는 비용·workspace 선택 승인이 필요하다. 코드와 schema 검증 완료를 실제 preview 배포 완료로 간주하지 않는다.
