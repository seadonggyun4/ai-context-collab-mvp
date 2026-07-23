# 문서 엔진

`docs/`는 회사 공용 규칙과 프로젝트별 협업 문서를 관리한다.

```text
docs/
├── organization-standards/  # 모든 프로젝트에 적용되는 회사 공용 규칙
└── {project-name}/          # 프로젝트별 독립 문서 엔진
    ├── Active_Context.md
    ├── Project_Context.md
    ├── roles/
    ├── change-management/
    ├── evaluations/
    └── impact-analysis/
```

회사 공용 규칙은 특정 프로젝트 디렉토리로 복사하지 않는다. 각 프로젝트의 `Active_Context.md`가 적용할 공용 규칙과 프로젝트 기준을 함께 등록한다.

현재 프로젝트 문서 엔진:

- `apc-monitoring-mvp/`: APC 모니터링 MVP의 Context, 역할 산출물, 변경 이력과 검증 증거

CTX Flow 제품 코드와 문서 엔진은 `/Users/dgseo/Desktop/ctxflow` 독립 저장소로 분리되었다.
