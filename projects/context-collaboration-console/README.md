# Context Collaboration Console

변경 요청의 분석·검토·승인·검증·Context 활성화를 관리하는 React 운영 콘솔이다.

## Requirements

- Node.js 20 이상
- npm 10 이상

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

## Architecture

| 경로 | 책임 | 의존 가능 대상 |
| --- | --- | --- |
| `src/app` | bootstrap, provider, router, layout | pages, widgets, features, entities, shared |
| `src/pages` | route composition과 data state | widgets, features, entities, shared |
| `src/widgets` | 독립적인 화면 영역 composition | features, entities, shared |
| `src/features` | 사용자 command와 interaction | entities, shared |
| `src/entities` | domain contract, selector, fixture/HTTP repository | shared |
| `src/shared` | Astryx wrapper, semantic token, 공통 상태 | 외부 package만 |
| `src/test` | test setup/builders | 모든 production module |

앱 기준 문서는 `../../docs/context-collaboration-console/`에 있다.

## 구현 범위

- 프로젝트 Dashboard, 자연어 변경 요청과 분석 제안
- Context Browser와 CodeMirror Markdown/YAML 편집기
- 접근 가능한 영향 그래프와 관계 목록
- semantic/raw diff, 승인·검증 evidence, 완료 gate와 audit
- revision-locked Git publication, commit-linked evidence와 Context 활성화 결과
- OIDC server session boundary, CSRF transport, session expiry와 login/logout 상태
- fixture/HTTP repository 교체 경계, system/light/dark theme
- Vitest, Testing Library, ESLint, strict TypeScript와 FSD dependency 검사

환경 변수는 `.env.example`을 기준으로 한다. Production에서는 Render Blueprint가 HTTP data source와 인증 필수를 주입하며 secret은 frontend build variable에 두지 않는다.
