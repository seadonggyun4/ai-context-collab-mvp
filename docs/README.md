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
- `context-collaboration-console/`: 프로젝트 Context·변경 영향·승인·검증을 관리하는 협업 콘솔
