# Reference Analysis

## Truthound 한국어 메인

- 참조 대상: `https://truthound.com/ko`
- 적용 범위: 메인 진입 화면의 section 순서, 타이포그래피 중심 계층, 제품 workflow를 실제 화면 맥락으로 보여주는 방식, 절제된 CTA 리듬.
- 적용하지 않는 것: Truthound 브랜드명, 로고, 일러스트·이미지 자산, 카피, 제품별 기능 주장, 그대로 복제한 색상.
- 확인 한계: 현재 자동 조사 환경에서 페이지의 시각 캡처를 안정적으로 확보하지 못했다. 구현 전 브라우저에서 desktop/mobile 캡처를 확보하고 Publishing review를 거쳐야 `reference-locked`로 판정한다.

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

## 구현 전 Reference Lock Checklist

- [ ] Truthound `/ko` desktop 1440px 전체 페이지 캡처
- [ ] Truthound `/ko` mobile 390px 전체 페이지 캡처
- [ ] header, hero, proof/workflow, product visual, closing CTA의 spacing과 alignment 기록
- [ ] 복제 가능한 구조와 복제 금지 브랜드 요소 분리
- [ ] 최종 primary와 contrast 검증
