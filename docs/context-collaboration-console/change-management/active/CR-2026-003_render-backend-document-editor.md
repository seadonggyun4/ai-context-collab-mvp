# CR-2026-003 Render·Backend·문서 Editor 기획

## 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-003` |
| 현재 상태 | `DEVELOPMENT_READY` |
| 요청일 | `2026-07-22` |
| 요청자 | 사용자 |
| 위험도 | 높음 |
| 승인 상태 | `APPROVED_FOR_PLANNING` |

## 요청

- Render를 통해 frontend와 backend를 함께 배포한다.
- backend 기능 기획과 기술 개발 계획을 정의한다.
- 문서 edit는 전문 code editor를 사용하고 Dracula dark와 조화로운 light theme를 제공한다.

## 결정

- Render Blueprint 하나로 React Static Site, FastAPI Web Service, PostgreSQL을 관리한다.
- Backend는 Python 3.12, FastAPI, PostgreSQL, SQLAlchemy 2, Alembic, Pydantic v2, uv를 사용한다.
- 문서 editor는 CodeMirror 6를 사용한다.
- dark editor는 Dracula, light editor는 제품 semantic token 기반 Porcelain theme를 사용한다.
- 문서 저장은 draft→validate→proposal→approval→Git write이며 main 직접 overwrite는 금지한다.

## 수용 기준

| ID | 조건 |
| --- | --- |
| AC-01 | backend 기능이 사용자 결과·보안·오류·감사까지 정의된다 |
| AC-02 | 언어·framework·DB·migration·test·module 단계가 개발 가능 수준으로 정의된다 |
| AC-03 | Render topology, rootDir, environment, migration, health와 복구가 정의된다 |
| AC-04 | CodeMirror 기능·FSD 배치·양 theme·validation·conflict UX가 정의된다 |
| AC-05 | requirement와 QA가 backend/editor/deploy까지 추적된다 |

## 승인 Gate

- production Render plan과 Postgres backup/PITR 수준
- 사용할 Git provider와 app/token 권한
- 회사 OIDC provider와 session 전략
- preview environment 비용과 secret 분리
- 문서 write 허용 repository/path/branch policy
