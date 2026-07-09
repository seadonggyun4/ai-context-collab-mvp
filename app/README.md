# APC Monitoring MVP App

## 목적

이 디렉토리는 문서 기반 협업 구조가 실제 구현물로 이어지는 것을 보여주는 실행 영역이다.

상위 문서:

- `../Project_Context.md`
- `../roles/planning/Planning.md`
- `../roles/publishing/Publishing.md`
- `../roles/development/Development.md`
- `../roles/qa/QA.md`

## 구조

```text
app/
├── frontend/       # React.js + TypeScript + Vite 앱
├── api/            # Python FastAPI 앱
├── shared/         # 프론트/백엔드 공통 계약과 fixture
└── docs/           # 구현 아키텍처와 phase 기록
```

QA 결과는 실행 코드 하위가 아니라 `../roles/qa/qa-results/`에서 관리한다. QA 실패/부분 통과로 생긴 후속 feature는 각 역할의 `../roles/{part}/feature/{cycle}/`에 다음 순번 문서로 생성한다.

## 구현 원칙

- 문서 기준을 코드에 중복해서 흩뿌리지 않는다.
- API, 타입, fixture는 `shared/`와 `api/`에서 관리한다.
- 화면 스타일과 컴포넌트 판단은 `../roles/publishing/Publishing.md`를 따른다.
- 기능 구현 순서는 `docs/phase-plan.md`를 따른다.
- 변경이 생기면 `../impact-analysis/`에 영향 범위를 남긴다.

## Phase 0 완료 기준

- 실제 구현물과 문서 산출물이 분리되어 있다.
- 프론트엔드, 백엔드, 공통 계약, QA 결과를 담을 위치가 명확하다.
- 이후 phase에서 파일을 추가할 때 경계가 흔들리지 않는다.
