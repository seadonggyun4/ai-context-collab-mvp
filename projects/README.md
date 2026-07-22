# Projects

`projects/`는 실행 가능한 애플리케이션과 서비스 코드를 프로젝트별로 관리한다.

```text
projects/
└── {project-name}/
    ├── frontend/
    ├── api/
    ├── shared/
    └── docs/       # 코드와 실행에 한정된 기술 문서
```

기획·퍼블리싱·개발·QA Context와 변경 이력은 실행 코드와 분리해 `../docs/{project-name}/`에서 관리한다.

현재 실행 프로젝트:

- `apc-monitoring-mvp/`: APC 데이터 운영 모니터링 React/FastAPI MVP
