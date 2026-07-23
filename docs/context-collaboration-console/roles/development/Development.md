# Development Context

## 기술 기준

- React + TypeScript + Vite를 사용한다.
- UI 기반은 `@astryxdesign/core`와 제품 theme wrapper다.
- 코드 구조는 FSD의 `app/pages/widgets/features/entities/shared` layer와 단방향 의존 규칙을 따른다.
- 스타일링은 Astryx 공식 API → 제품 wrapper → semantic token 기반 co-located CSS 순으로 사용하며 Tailwind CSS는 기본 설치하지 않는다.
- theme preference는 `system/light/dark`, resolved mode는 `light/dark`로 분리한다.
- 최초 릴리스는 deterministic fixture와 reducer/state machine으로 전체 흐름을 재현한다.
- UI에서 Markdown/YAML을 직접 조작하지 않고 parser/adapter 경계를 둔다.
- 실제 AI, Git, CI, 인증은 인터페이스로 분리하고 fixture adapter를 기본 구현으로 제공한다.
- release 품질은 `engineering/release-quality-gate.md`의 policy·asset·browser 계약을 따른다.

## 기준 문서

- `../../Project_Context.md`
- `../../../organization-standards/development-standards.md`
- `../../engineering/architecture.md`
- `../../engineering/contracts.md`
- `../../governance/workflow-policy.yaml`
- `../../governance/permissions.yaml`
- `../../engineering/release-quality-gate.md`

## 코드 경계

```text
src/
├── app/                 # bootstrap, router, providers, global theme
├── pages/               # route composition
├── widgets/             # shell, header, dashboard regions
├── features/            # change request, review, verification actions
├── entities/            # project, context, proposal, evidence
└── shared/              # Astryx wrappers, API, config, lib, tokens
```

## 완료 게이트

- 상태 전이는 UI 컴포넌트 내부가 아니라 domain layer에서 검증한다.
- fixture의 동일 Change ID가 모든 화면에서 같은 상태와 수치를 보여야 한다.
- 최신 proposal 승인 없이 `APPROVED`, 필수 검증 실패가 있는 `READY_TO_ACTIVATE`·`ACTIVATED` 전이를 거부한다.
- 디자인 토큰 외 임의 hex, 과도한 radius, 임의 box shadow 사용을 금지한다.
- FSD 역방향 import와 slice 내부 경로 직접 import가 없어야 한다.
- light/dark 양쪽에서 hydration/first-paint flash, 대비, route state 보존을 검증한다.
- 7개 data state, 4개 viewport, visual baseline, source policy와 asset budget을 CI에서 우회 없이 검증한다.
