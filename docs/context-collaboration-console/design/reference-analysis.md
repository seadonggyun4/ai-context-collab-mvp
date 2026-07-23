# Reference Analysis

## Truthound 한국어 메인

- 참조 대상: `https://truthound.com/ko`
- 로컬 기준 소스: `Truthound-project/truthound-depot/frontend/src/features/public-home/`.
- 확인한 구조: full-bleed WebGL hero → 운영 수치 → copy/visual이 교차하는 3개 feature section → compact feature grid → closing action.
- 확인한 motion: hero reveal, viewport 1회 reveal, radial burst, rotating point globe, falling evidence stream.
- performance 기준: scene viewport 진입 시 mount/run, document hidden 시 중지, reduced motion 정지 프레임, device pixel ratio 제한.
- 적용 범위: section rhythm, 타이포그래피 중심 계층, 실제 workflow를 시각화하는 canvas, 절제된 CTA와 motion lifecycle.
- 적용하지 않는 것: Truthound 브랜드명·로고·카피·색상·GLSL 원문·제3자 이미지/visual asset.
- Context Console은 동일 motion class를 새 geometry/shader와 teal 중심 제품 palette로 구현한다.

## Astryx

- 공식 사이트: `https://astryx.atmeta.com/`
- 확인된 기준: React와 StyleX 기반, themeable·accessible 컴포넌트, 160개 이상의 컴포넌트, table/keyboard navigation, production-ready templates.
- 적용: primitives를 직접 재구현하지 않고 Astryx를 기반으로 제품 의미 wrapper와 theme token을 만든다.
- 주의: Astryx의 commerce 예시·mascot·기본 theme를 제품 정체성으로 복제하지 않는다.

## 운영형 B2B 레퍼런스에서 채택한 원칙

- 역할별 첫 화면은 같은 데이터를 보여주더라도 사용자가 내려야 할 판단을 우선한다.
- 대시보드는 데이터 나열이 아니라 `상태 → 원인 → 다음 행동` 순서를 제공한다.
- 감사 이력, 권한, 승인, 실패 상태를 부가 설정이 아니라 핵심 화면으로 다룬다.
- 실사용 화면 레퍼런스를 우선하며, Dribbble식 단일 hero shot을 제품 기준으로 사용하지 않는다.

참조:

- https://astryx.atmeta.com/
- https://www.saasui.design/blog/b2b-saas-design
- https://www.ibm.com/think/topics/internal-developer-platform
- https://truthound.netlify.app/en/ai/prompt-hardening/

## Reference Lock Checklist

- [x] Truthound `/ko` desktop 실행 화면과 hero/3개 scene 확인
- [x] header, hero, proof/workflow, product visual, closing CTA의 spacing과 alignment 기록
- [x] 복제 가능한 동작 원리와 복제 금지 브랜드 요소 분리
- [ ] Context Console 1440/390px 양 테마 시각 QA
- [ ] 최종 primary/action/status contrast 검증
