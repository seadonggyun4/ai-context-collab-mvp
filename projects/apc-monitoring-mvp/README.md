# APC Monitoring MVP App

## 목적

이 디렉토리는 APC(농산물산지유통센터) 모니터링 서비스 MVP의 실행 영역이다.

상위 README와 역할별 문서에서 정의한 기획, 퍼블리싱, 개발, QA 기준이 실제 React/FastAPI 구현물로 이어지는지 보여준다.

상위 문서:

- `../../README.md`
- `../../docs/apc-monitoring-mvp/Project_Context.md`
- `../../docs/apc-monitoring-mvp/roles/planning/Planning.md`
- `../../docs/apc-monitoring-mvp/roles/publishing/Publishing.md`
- `../../docs/apc-monitoring-mvp/roles/development/Development.md`
- `../../docs/apc-monitoring-mvp/roles/qa/QA.md`

## 구조

```text
projects/apc-monitoring-mvp/
├── frontend/       # React.js + TypeScript + Vite 앱
├── api/            # Python FastAPI 앱
├── shared/         # 프론트/백엔드 공통 계약과 fixture
└── docs/           # 구현 아키텍처와 phase 기록
```

QA 결과는 실행 코드 하위가 아니라 `../../docs/apc-monitoring-mvp/roles/qa/qa-results/`에서 관리한다. QA 실패/부분 통과로 생긴 후속 feature는 각 역할의 `../../docs/apc-monitoring-mvp/roles/{part}/feature/{cycle}/`에 다음 순번 문서로 생성한다.

## 구현 원칙

- 문서 기준을 코드에 중복해서 흩뿌리지 않는다.
- API, 타입, fixture는 `shared/`와 `api/`에서 관리한다.
- 화면 스타일과 컴포넌트 판단은 `../../docs/apc-monitoring-mvp/roles/publishing/Publishing.md`를 따른다.
- 기능 구현 순서는 `docs/phase-plan.md`를 따른다.
- 변경이 생기면 `../../docs/apc-monitoring-mvp/impact-analysis/`에 영향 범위를 남긴다.
