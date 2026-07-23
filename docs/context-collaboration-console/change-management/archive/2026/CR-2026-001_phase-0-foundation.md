# CR-2026-001 Phase 0 프로젝트 기반 구축

## 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-001` |
| 현재 상태 | `COMPLETE` |
| 현재 Phase | `ARCHIVIST` |
| 요청일 | `2026-07-22` |
| 요청자 | 사용자 |
| 위험도 | 중간 |
| 승인 상태 | `APPROVED` |

## 요청 원문

> Phase 0 프로젝트 기반 구축을 철저하게 확장성 높고 유지보수성 높게 진행해줘.

## 범위

- 포함: Vite React TypeScript, Astryx, 제품 theme, route shell, 메인/운영 shell skeleton, fixture/domain test harness, lint/type/test/build/시각 검증 기반.
- 제외: Phase 1의 완전한 workflow state machine, Phase 2 이후의 실기능 화면, 실제 AI/Git/CI/auth 연동.

## 수용 기준

| ID | 완료 조건 | 검증 |
| --- | --- | --- |
| AC-01 | Node 20+ 기반 Vite React TypeScript 프로젝트가 재현 가능하게 설치·빌드된다 | clean install, typecheck, build |
| AC-02 | app/features/domain/adapters/shared/tests 경계가 alias와 lint 규칙으로 유지된다 | structure, imports, lint |
| AC-03 | Astryx reset/base/neutral theme와 제품 semantic token override가 cascade layer로 적용된다 | CSS review, browser computed style |
| AC-04 | `/` 메인 shell과 `/projects/:projectId` 운영 shell skeleton이 라우팅된다 | router tests, browser navigation |
| AC-05 | 접근 가능한 navigation, skip link, focus, responsive 1440/1024/768/390 기반이 있다 | component tests, browser QA |
| AC-06 | deterministic fixture와 repository interface가 UI와 분리된다 | unit tests |
| AC-07 | error boundary, not-found, loading/empty/error primitives가 확장 가능한 공통 경계로 존재한다 | tests, static review |
| AC-08 | 제품 표면 금지어·금지 시각 패턴이 없다 | source scan, visual review |

## Context Snapshot

- `Active_Context.md`, `Project_Context.md`
- `roles/development/Development.md`, `roles/publishing/Publishing.md`, Phase 0 feature
- `design/design-tokens.md`, `design/component-mapping.md`, `design/screen-specifications.md`
- `engineering/architecture.md`, `engineering/implementation-plan.md`
- `governance/ui-policy.yaml`, `qa/test-matrix.md`
- Astryx 공식 Getting Started: core/theme-neutral/cli 설치, reset/astryx/theme CSS import, category subpath import, cascade layer 안전성.

## 계획된 구조

```text
projects/context-collaboration-console/
├── src/app/             # bootstrap, router, providers, layouts
├── src/features/        # vertical feature slices
├── src/domain/          # framework-independent contracts
├── src/adapters/        # fixture and future external adapters
├── src/shared/          # design system wrappers, tokens, states
├── src/test/            # test setup/builders
└── tests/               # architecture and smoke coverage
```

## 구현 계획

1. package/toolchain과 strict TypeScript·alias를 구성한다.
2. app composition root, route definitions, error/not-found boundary를 만든다.
3. Astryx CSS와 owned semantic theme, product primitives를 구성한다.
4. 메인 shell과 운영 shell을 fixture repository에 연결한다.
5. Vitest/Testing Library와 architecture smoke test를 만든다.
6. typecheck, lint, tests, build, browser responsive/a11y를 검증한다.

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| Astryx beta API 변경 | category subpath import를 wrapper 내부에 제한 |
| 디자인 토큰 이중화 | Astryx primitive token → product semantic token 단방향 override |
| fixture가 UI에 침투 | repository interface와 composition root에서만 adapter 선택 |
| router/feature 순환 의존 | domain/shared는 app/features를 import하지 않는 규칙과 architecture test |
| 초기 shell이 임시 코드로 고착 | route metadata, navigation model, state primitive를 typed contract로 정의 |

## Phase Transition Log

### PT-001
- Previous: `NONE`
- Next: `CONTEXT_READER`
- Result: 활성 기준과 Astryx 공식 설치 방식 확인

### PT-002
- Previous: `CONTEXT_READER`
- Next: `PLANNER`
- Result: AC-01~08, 구조, 위험, 테스트 계획 확정

### PT-003
- Previous: `PLANNER`
- Next: `IMPLEMENTER`
- Entry gate: 사용자 승인과 구현 입력 충족

### PT-004
- Previous: `IMPLEMENTER`
- Next: `VERIFIER`
- Result: typecheck, lint, Vitest, production build 및 브라우저 반응형 검증 통과

### PT-005
- Previous: `VERIFIER`
- Next: `ARCHIVIST`
- Result: 구현 계획과 영향 분석에 결과를 기록하고 변경을 완료 처리

## 검증 계획

| Test ID | 방법 | 성공 기준 |
| --- | --- | --- |
| TEST-01 | `npm run typecheck` | 오류 0 |
| TEST-02 | `npm run lint` | 오류 0 |
| TEST-03 | `npm run test` | 전체 통과 |
| TEST-04 | `npm run build` | production build 성공 |
| TEST-05 | browser desktop/mobile | shell, route, focus, responsive 확인 |
| TEST-06 | source policy scan | 금지 표면 카피·임의 색상 정책 위반 0 |

## 구현 결과

- Vite + React 19 + strict TypeScript 프로젝트와 Node 20+ 실행 계약을 구성했다.
- `app / features / domain / adapters / shared / test` 모듈 경계와 alias를 구성했다.
- Astryx core reset/base와 pre-built neutral theme를 cascade layer로 통합했다.
- 제품 semantic token을 deep teal 계열로 소유하고, Astryx 직접 사용은 provider와 wrapper 경계에 제한했다.
- 메인 진입 화면과 프로젝트 운영 shell을 동일한 repository contract에 연결했다.
- error boundary, 404, empty/error/loading/permission/stale 공통 상태 기반을 구성했다.
- skip link, 명시적 focus, semantic navigation, 900px/600px responsive 규칙을 적용했다.

## QA 결과

| Test ID | 결과 | 증거 |
| --- | --- | --- |
| TEST-01 | PASS | `npm run typecheck`, 오류 0 |
| TEST-02 | PASS | `npm run lint`, 오류·경고 0 |
| TEST-03 | PASS | Vitest 2 files, 4 tests 통과 |
| TEST-04 | PASS | Vite production build, 1905 modules transformed |
| TEST-05 | PASS | 1280px/390px 메인·운영 shell, horizontal overflow 0, console error 0 |
| TEST-06 | PASS | 렌더링 표면에 MVP·demo·prototype·AI hype 문구 없음; 금지 시각 패턴 없음 |

## Self-Review

- 실제 backend 전환은 `ProjectRepository` adapter 교체로 제한된다.
- Astryx beta API 변경 영향은 provider와 shared wrapper에 국소화된다.
- route와 page가 fixture 구현을 직접 import하지 않는다.
- 과도한 card/radius/border를 피하고 데이터 행과 section hierarchy 중심으로 구성했다.
- 알려진 비차단 제약: Astryx CLI 0.1.7 배포본은 내부 파일 누락으로 init 명령이 실행되지 않아 공식 package API와 pre-built theme를 직접 연결했다.
