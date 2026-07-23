# Phase 10 — Release Quality Gate 개발 계약

## 상태

`COMPLETE_LOCAL` — 2026-07-23

## 설계 원칙

1. 상태 표현은 page가 아니라 shared classifier가 소유한다.
2. policy/performance 검사는 framework와 독립적인 Node script로 작성한다.
3. browser scenario는 사용자 관점의 route와 accessible role을 사용하고 내부 class name에 결합하지 않는다.
4. visual baseline과 asset budget은 review 가능한 versioned artifact로 둔다.
5. FSD production layer는 test runner를 import하지 않는다.

## 구현 단위

- `DataStateKind`, `classifyDataState`, `DataErrorState`
- 상태별 `role/status/alert`, `aria-live`, `aria-busy` 계약
- global reduced-motion/focus/forced-colors 보강
- product policy analyzer와 unit test
- production gzip asset budget analyzer
- Playwright four-viewport/accessibility/keyboard/visual suites
- CI browser dependency와 gate ordering

## 오류 분류 우선순위

`conflict → permission → stale → offline → error` 순서로 code를 분류한다. 더 구체적인 상태가 일반 network/error 문자열에 가려지지 않도록 conflict와 permission을 먼저 판정한다.

## Public API

Page layer는 `@shared/ui/data-state`에서만 상태 UI와 classifier를 import한다. classifier 내부 구현과 policy script는 FSD slice 외부에서 deep import하지 않는다.

## 완료 조건

- lint/typecheck/unit/browser/build/policy/performance 명령이 모두 통과한다.
- 4 viewport horizontal overflow 0, critical axe violation 0, keyboard P0 flow 통과
- light/dark/editor baseline의 무승인 변경 0
- production source 금지 카피·패턴 0

## 구현 결과

- `DataStateKind` 7종과 classifier를 shared Public API로 제공하고 모든 page error path가 이를 사용한다.
- ESLint JSX a11y strict, Playwright, axe, screenshot baseline을 production FSD와 분리했다.
- 금지 카피·CSS와 gzip asset budget을 독립 Node script/JSON contract로 구현했다.
- reduced motion, forced colors, focus/skip link와 action contrast를 보강했다.
- CI는 static/unit/build와 macOS Chromium browser Gate를 분리해 실패 증거를 보관한다.
