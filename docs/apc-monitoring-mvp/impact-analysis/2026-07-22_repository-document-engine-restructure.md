# 저장소 문서 엔진 및 프로젝트 구조 개편 영향 분석

- Change ID: `CR-2026-004`
- 대상: 저장소 최상위 디렉토리 구조와 내부 경로 참조
- 요청일: `2026-07-22`
- 상태: 완료

## 변경 목적

회사 공용 규칙, 프로젝트별 문서 엔진, 실행 프로젝트의 물리적 경계를 분리해 다중 프로젝트 확장과 비개발자용 문서 관리 UI의 기반을 만든다.

## 목표 구조

```text
docs/
├── organization-standards/
└── apc-monitoring-mvp/
    ├── Active_Context.md
    ├── Project_Context.md
    ├── roles/
    ├── change-management/
    ├── evaluations/
    └── impact-analysis/

projects/
└── apc-monitoring-mvp/
```

## 예상 영향

- 공용 조직 표준의 참조 경로가 `docs/organization-standards/`로 변경된다.
- APC 프로젝트의 Context, 역할, 변경관리, 평가, 영향분석 문서가 프로젝트 문서 루트로 이동한다.
- 기존 `projects/apc-monitoring-mvp/` 실행·배포 경로가 `projects/apc-monitoring-mvp/`로 변경된다.
- 문서의 상대 링크와 저장소 구조 설명을 모두 새 경로에 맞춰야 한다.
- 앱 기능과 데이터 계약에는 의도된 변화가 없다.

## 검증

- 새 구조 및 기존 경로 부재 확인: 통과
- 핵심 Markdown 상대 참조 확인: 통과
- 새 프로젝트 위치 API 테스트: 16개 통과
- 프론트엔드 TypeScript 검사와 production build: 통과
- 미검증: 외부 Vercel 프로젝트의 Root Directory 설정과 재배포
