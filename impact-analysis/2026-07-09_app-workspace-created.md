# 2026-07-09 app 작업공간 생성 영향 분석

## 변경 요약

문서 기반 MVP를 실제 구현으로 전환하기 위해 `app/` 디렉토리를 생성했다.

생성 구조:

```text
app/
├── frontend/
├── api/
├── shared/
└── docs/
```

## 변경 원인

문서만으로는 시연 설득력이 부족하므로, Project Context와 직군별 문서를 실제 구현물로 번역하는 작업공간이 필요하다.

## 영향 문서

| 문서 | 영향 |
| --- | --- |
| `Project_Context.md` | 협업 문서 구조에 `app/` 반영 |
| `roles/development/Development.md` | Phase 1 이후 실제 구현 기준으로 사용 |
| `roles/qa/QA.md` | 구현 결과 검증 기록을 `roles/qa/qa-results/`와 연결 |
| `app/docs/phase-plan.md` | 개발 phase 진행 기준 추가 |

## 기획 영향

- 메뉴 구조와 기능 범위 변경 없음
- Planning 문서의 feature 단위가 frontend feature 구조로 전환될 준비가 됨

## 퍼블리싱 영향

- `frontend/src/shared/styles`가 Publishing 기준 적용 위치로 예약됨
- 실제 스타일 구현은 후속 phase에서 진행

## 개발 영향

- `frontend`, `api`, `shared` 경계를 분리함
- FastAPI monitoring domain은 router/schema/service/repository/adapter 구조로 확장 가능하게 준비됨
- fixture와 contract를 shared 영역에서 관리할 수 있게 됨

## QA 영향

- QA 체크 결과는 이후 `roles/qa/qa-results/`로 이동해 QA 역할 문서 체계에서 관리함
- QA 문서의 체크표가 실제 구현 검증 기록으로 연결될 수 있음

## 리스크

- Phase 1에서 scaffold 도구가 기존 구조를 덮어쓰지 않도록 주의해야 함
- 프론트/백엔드 계약을 `shared/contracts`와 실제 코드 양쪽에서 중복 관리하지 않도록 후속 정책이 필요함

## 후속 조치

- Phase 1에서 Vite React, FastAPI entrypoint, Vercel 설정을 추가한다.
- Phase 2에서 공통 타입과 Pydantic schema를 구현한다.
- Phase 3에서 deterministic fixture를 추가한다.
