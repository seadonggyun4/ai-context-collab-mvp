# FSD·스타일링·다크모드 영향 분석

- Change ID: `CR-2026-002`
- 상태: 구현·검증 완료

## 영향 요약

| 노드 | 예상 영향 |
| --- | --- |
| Architecture | 기존 app/features/domain/adapters/shared에서 FSD 6-layer로 migration |
| Styling | Astryx·제품 wrapper·semantic CSS의 소유 순서 확정; 신규 build dependency 없음 |
| Design system | Astryx는 component behavior, product variable은 semantic theme 소유 |
| UX | system/light/dark 선택과 persistence 추가 |
| Accessibility | 양 theme 대비·focus·비색상 상태 표현 검증 확대 |
| QA | architecture/style/theme P0 test 5건 추가 |

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| Astryx와 제품 CSS 책임 중복 | Astryx API 우선순위와 wrapper 경계를 강제 |
| 전역 CSS 비대화 | FSD slice별 co-located CSS와 app global style 역할 분리 |
| FSD를 폴더명으로만 적용 | dependency test와 public API lint를 완료 gate로 지정 |
| dark mode hard-coded 색상 누락 | semantic variable만 사용하고 양 theme visual regression 수행 |
| 초기 theme flash | first paint 전 resolved mode 적용 |

## 비영향 영역

- APC 모니터링 프로젝트 코드와 문서는 변경하지 않는다.
- backend/API/Git/AI integration contract는 이번 결정으로 변경되지 않는다.

## 실제 변경과 증거

- 예상한 FSD 6-layer migration을 완료했다.
- 예상한 Tailwind 미도입 결정을 유지하고 CSS ownership만 분리했다.
- Astryx가 root `data-theme`를 직접 보존하지 않는 동작을 브라우저에서 확인해 제품 전용 `data-resolved-theme`를 추가했다.
- 자동 검사 10건, production build, desktop/mobile light/dark browser QA를 통과했다.
