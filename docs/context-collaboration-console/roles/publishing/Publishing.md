# Publishing Context

## 방향

신뢰할 수 있는 운영 도구의 인상을 만든다. 시각적 새로움보다 정보 계층, 상태의 명확성, 검토 효율, 제품 전체의 리듬을 우선한다.

## 기준 문서

- `../../Project_Context.md`
- `../../../organization-standards/digital-product-ui-standards.md`
- `../../design/reference-analysis.md`
- `../../design/design-tokens.md`
- `../../design/screen-specifications.md`

## 불변 조건

- Truthound 한국어 메인 페이지의 차분한 편집형 계층과 넓고 명확한 section rhythm을 메인 진입 화면의 구조적 기준으로 사용한다.
- 컬러·제품명·카피·자산은 복제하지 않는다.
- 운영 화면은 Astryx의 table, input, menu, dialog, badge, tabs 등 접근 가능한 React 컴포넌트를 우선 사용한다.
- 카드와 border는 의미적 그룹에만 사용한다.
- primary는 deep teal 계열이며 보라·파랑 네온을 사용하지 않는다.
- light/dark는 동일한 정보 계층을 유지하며 dark를 단순 색 반전이나 검정 배경으로 처리하지 않는다.
- theme switcher는 `system/light/dark` 상태와 현재 적용 mode를 접근 가능한 label로 전달한다.

## 완료 게이트

- 1440, 1024, 768, 390px에서 정보 우선순위가 유지된다.
- 키보드 focus, 대비, 상태의 비색상 표현이 확인된다.
- 모든 주요 버튼은 역할과 위험도가 시각적으로 구분된다.
- loading, empty, error, permission, stale, unverified 상태가 정의된다.
- light/dark에서 text, focus, control, status, diff, graph, overlay 대비가 각각 검증된다.
