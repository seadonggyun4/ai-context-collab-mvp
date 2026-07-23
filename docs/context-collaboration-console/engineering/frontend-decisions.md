# Frontend Architecture Decisions

## 결정 요약

| ID | 결정 | 상태 |
| --- | --- | --- |
| ADR-FE-001 | Feature-Sliced Design(FSD)을 frontend architecture로 사용 | 승인 |
| ADR-FE-002 | Tailwind CSS를 기본 의존성에 추가하지 않음 | 승인 |
| ADR-FE-003 | system/light/dark theme preference 제공 | 승인 |

## ADR-FE-001 — FSD

기능·도메인·공통 UI가 늘어날수록 기술 폴더만으로는 변경 영향과 소유권이 흐려진다. FSD의 layer와 slice를 사용해 사용자 행동, 업무 entity, route 조합의 경계를 분명히 한다.

수용 조건:

- 계층 역방향 import가 architecture test에서 실패한다.
- slice 외부 소비는 `index.ts` public API로 제한한다.
- route page는 조합만 하고 repository 구현이나 상태 전이 규칙을 소유하지 않는다.
- fixture와 실제 API adapter가 entity model을 오염시키지 않는다.

## ADR-FE-002 — Tailwind CSS

결론은 현재 미도입이다. Astryx가 component, theme, spacing과 style composition 기반을 이미 제공하고 제품 semantic CSS token도 존재한다. Tailwind까지 추가하면 같은 시각 결정을 Astryx API, 제품 CSS, utility class 세 곳에서 추적해야 하므로 현재 규모에서는 유지보수 비용이 이점보다 크다.

기본 스타일링 순서:

- 1순위: Astryx component의 공식 prop, variant, theme와 layout API
- 2순위: `shared/ui` 제품 wrapper
- 3순위: semantic CSS variable을 사용하는 feature/widget co-located CSS
- 4순위: 전역 shell·reset·theme에 한정된 `app/styles`

금지:

- Astryx 내부 selector에 대한 강제 override와 `!important`
- 컴포넌트마다 전역 class를 추가하는 단일 거대 stylesheet
- semantic token을 우회하는 임의 hex, radius, shadow
- FSD slice 경계를 넘어 공유되는 비공식 CSS selector

재검토 조건:

- 3개 이상의 feature에서 동일 layout utility가 반복되고 Astryx API로 해소할 수 없다.
- responsive class 관리가 CSS module/co-located CSS보다 명확하다는 비교 증거가 있다.
- bundle, build, reset/cascade, dark mode 복잡도 증가가 허용 범위임을 spike로 입증한다.
- 도입 시 별도 Change Manifest와 ADR 승인을 받는다.

## ADR-FE-003 — Dark mode

다크모드는 단순 색 반전이 아니라 동일한 semantic token contract의 두 theme다. `system`이 기본값이며 사용자는 light/dark를 명시적으로 고정할 수 있다.

완료 조건:

- 새로고침과 route 이동 뒤에도 preference가 유지된다.
- system mode에서 OS 설정 변경이 반영된다.
- light/dark 모두 WCAG AA text·control·focus 대비를 만족한다.
- success/warning/danger와 diff 상태는 색 외 label/icon/pattern을 함께 사용한다.
- chart, code, YAML, graph, overlay, skeleton까지 theme token을 사용한다.
- 초기 render에서 잘못된 theme가 눈에 띄게 표시되지 않는다.

## Migration order

1. FSD target map과 import rule을 추가한다.
2. 기존 `domain`을 `entities`, layout을 `widgets`, route component를 `pages`로 이동한다.
3. Astryx API와 제품 semantic CSS의 스타일 소유 경계를 정리한다.
4. semantic token을 light/dark variable set으로 확장한다.
5. ThemeProvider와 ThemeSwitcher를 구현한다.
6. browser/visual/accessibility regression을 통과한 뒤 후속 feature 개발을 시작한다.
