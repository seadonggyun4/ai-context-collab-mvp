# CR-2026-002 FSD·스타일링·다크모드 기준 반영

## 식별 정보

| 항목 | 값 |
| --- | --- |
| Change ID | `CR-2026-002` |
| 현재 상태 | `COMPLETED` |
| 현재 Phase | `ARCHIVIST` |
| 요청일 | `2026-07-22` |
| 요청자 | 사용자 |
| 위험도 | 중간 |
| 승인 상태 | `APPROVED` |

## 요청 원문

> 프론트엔드 개발 아키텍처는 FSD. 스타일링은 테일윈드가 좋을지? 다크모드 기능 추가를 문서 시스템에 반영해줘.

## 결정

- FSD를 공식 frontend architecture로 확정한다.
- Tailwind CSS는 현재 도입하지 않고 Astryx와 제품 semantic CSS를 우선한다.
- `system/light/dark` theme preference와 light/dark resolved mode를 추가한다.
- Phase 0.1에서 현재 코드를 FSD와 다중 theme 구조로 migration한다.

## 수용 기준

| ID | 조건 |
| --- | --- |
| AC-01 | architecture·역할·구현 계획에 FSD layer와 의존 규칙이 일치한다 |
| AC-02 | Astryx와 제품 CSS의 소유 경계 및 Tailwind 재검토 조건이 정의된다 |
| AC-03 | dark mode의 preference, persistence, OS sync, first-paint, token 계약이 정의된다 |
| AC-04 | requirement와 QA matrix가 architecture/style/theme 검증까지 추적된다 |
| AC-05 | YAML 정책이 안전하게 parse된다 |

## 영향

- 기존 Phase 0 코드 구조는 후속 구현에서 FSD로 이동해야 한다.
- 현재 global CSS는 FSD 소유 경계에 맞춰 global theme와 co-located composition style로 분리해야 한다.
- 모든 후속 화면은 light/dark visual·contrast evidence를 추가해야 한다.

## 구현 전 Gate

- Astryx가 제공하는 style API와 현재 CSS 결손을 먼저 inventory한다.
- Tailwind 도입은 측정 가능한 반복·결손이 생길 때 별도 ADR로만 검토한다.
- FSD migration과 theme provider가 완료되기 전 Phase 1 feature 확장을 시작하지 않는다.

## 구현 결과

- `app/pages/widgets/features/entities/shared` 6개 layer로 코드 구조를 이관했다.
- Project model·repository·fixture는 `entities/project`, 화면은 `pages`, shell은 `widgets`로 이동했다.
- route 계약을 `shared/config`로 내려 widget→app 역방향 의존을 제거했다.
- entity, feature, widget 외부 소비는 slice `index.ts` Public API를 사용한다.
- architecture test가 layer 역방향 import, slice private import, 폐기 alias를 검사한다.
- Tailwind는 설치하지 않았고 Astryx API→제품 wrapper→semantic CSS ownership을 유지했다.
- CSS를 app token, shared UI, feature, widget, page 단위 co-location으로 분리했다.
- `system/light/dark` preference, localStorage version key, OS change listener, first-paint bootstrap을 구현했다.
- accessible theme selector를 public/operational shell에 적용했다.
- Astryx system mode와 제품 token의 적용 기준을 `data-resolved-theme`로 분리해 혼합 theme를 방지했다.

## QA 결과

| 검증 | 결과 |
| --- | --- |
| TypeScript | 오류 0 |
| ESLint | 오류·경고 0 |
| Vitest | 4 files, 10 tests 통과 |
| FSD architecture | dependency/public API/deprecated alias 3 tests 통과 |
| Theme behavior | dark persistence, system default, OS change 3 tests 통과 |
| Production build | Vite build 성공, 1930 modules transformed |
| Desktop browser | light/dark main·project route, horizontal overflow 0 |
| Mobile browser | 390px dark project shell, 2-column metric, navigation 유지 |
| Browser console | fresh session warning/error 0 |

## Self-Review

- system preference와 resolved visual mode를 별도 상태로 유지한다.
- theme 전환은 router와 project repository provider를 remount하지 않는다.
- 시각값 hex는 app semantic token 선언부에만 존재한다.
- Tailwind 재검토 조건은 유지하되 현재 runtime dependency는 추가하지 않았다.
- Phase 1은 FSD entity/feature Public API 위에서 확장할 수 있다.
