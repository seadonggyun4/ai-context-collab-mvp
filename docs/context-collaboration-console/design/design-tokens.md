# Design Tokens

## Color direction

primary는 신뢰·통제·안정감을 주되 흔한 SaaS blue와 AI purple을 피하기 위해 deep teal로 정한다. 색상은 장식이 아니라 선택, focus, active navigation, 핵심 행동에 제한한다.

| Token | Value | 사용 |
| --- | --- | --- |
| `color.primary.700` | `#115E59` | primary button, active navigation |
| `color.primary.600` | `#0F766E` | link, selected control, focus support |
| `color.primary.100` | `#CCFBF1` | selected row, subtle highlight |
| `color.ink.950` | `#17202A` | heading, primary text |
| `color.ink.700` | `#344054` | body text |
| `color.ink.500` | `#667085` | secondary metadata |
| `color.canvas` | `#F7F8FA` | app background |
| `color.surface` | `#FFFFFF` | workspace surface |
| `color.border` | `#D9DEE7` | meaningful boundary |
| `color.success` | `#207A4B` | passed, active |
| `color.warning` | `#A15C00` | pending, partial |
| `color.danger` | `#B42318` | failed, rejected, destructive |
| `color.info` | `#365E91` | informational state only |

## Theme modes

색상 token 이름은 `light/dark` 외형이 아니라 의미를 표현한다. 컴포넌트는 hex나 framework palette를 직접 사용하지 않고 `--color-canvas`, `--color-surface`, `--color-text-primary`, `--color-border`, `--color-primary` 같은 semantic variable을 사용한다.

| Semantic token | Light | Dark | 목적 |
| --- | --- | --- | --- |
| `canvas` | `#F5F7F6` | `#0D1211` | app background |
| `surface` | `#FFFFFF` | `#151B1A` | primary workspace |
| `surface.subtle` | `#EEF3F1` | `#1B2422` | grouped region |
| `surface.muted` | `#E2E9E6` | `#25302D` | disabled/quiet region |
| `text.primary` | `#16211F` | `#F1F5F4` | heading/body emphasis |
| `text.secondary` | `#5F6B68` | `#AAB7B3` | metadata |
| `border` | `#D8E0DD` | `#34423E` | meaningful boundary |
| `border.strong` | `#C3CFCA` | `#4A5B56` | active/strong boundary |
| `primary` | `#115E59` | `#67C7BC` | text link, selection, data accent |
| `primary.strong` | `#0B4945` | `#8ADBD1` | emphasized accent |
| `primary.soft` | `#DFF3EF` | `#193D39` | selected/subtle accent surface |
| `action.surface` | `#115E59` | `#67C7BC` | solid primary action background |
| `action.foreground` | `#FFFFFF` | `#082B28` | solid primary action text |
| `focus` | `#0F766E` | `#8ADBD1` | keyboard focus ring |
| `status.success` | `#207A4B` | `#6BD59A` | passed/active |
| `status.warning` | `#946000` | `#F1C46B` | pending/partial |
| `status.danger` | `#B42318` | `#FF8A80` | failed/rejected |
| `status.info` | `#365E91` | `#8FB9EA` | informational |

`primary`와 `action.surface`는 현재 값이 같더라도 역할을 합치지 않는다. dark theme에서 밝은 primary action 배경 위에는 반드시 `action.foreground`를 사용한다. selector별 `!important` 보정이나 theme 내부에서 특정 컴포넌트 목록을 열거하는 방식은 금지한다.

Landing WebGL palette는 theme token에서 파생한 teal/sage/gold 계열만 사용한다. canvas가 전달하는 상태와 관계는 같은 section의 HTML 제목·설명·label로도 완전히 이해할 수 있어야 한다.

상태색과 diff색은 dark surface에서 별도 대비 검증 후 확정한다. opacity만 낮춰 light token을 재사용하지 않는다. native control과 scrollbar에는 적용 mode에 맞는 `color-scheme`을 지정한다.

## Typography

- Korean/system UI: `Pretendard Variable`, `Inter`, `system-ui`, sans-serif.
- 코드·경로·YAML: `JetBrains Mono`, `SFMono-Regular`, monospace.
- hero display: 56/64, weight 650, desktop. 36/44 mobile.
- page title: 28/36, weight 650.
- section title: 20/28, weight 650.
- body: 15/23. dense table: 13/20. metadata: 12/18.
- uppercase eyebrow를 사용하지 않는다.

## Space and density

- base unit 4px. 주요 간격 8, 12, 16, 24, 32, 48, 72.
- 운영 shell page gutter: desktop 32px, tablet 24px, mobile 16px.
- table row: default 44px, comfortable 52px. 임의 64px 이상 금지.
- 메인 진입 section: 96~128px desktop, 64~80px mobile.

## Shape and depth

- control radius 6px, surface radius 8px, dialog 10px, 최대 12px.
- 기본 surface는 shadow 없음. overlay/dialog에만 낮은 elevation.
- border는 input, table, diff, selected group처럼 경계가 기능일 때만 사용.
- 제품 UI의 glass, CSS blur, neon glow, 장식용 CSS gradient mesh는 금지한다. public landing의 승인된 WebGL color field는 canvas 내부 시각화로 한정한다.

## Button hierarchy

| Variant | 표현 | 사용 |
| --- | --- | --- |
| Primary | solid deep teal | 페이지당 핵심 진행 행동 1개 |
| Secondary | neutral outline 또는 subtle fill | 보조 진행 행동 |
| Quiet | text/hover surface | navigation, low-risk utility |
| Destructive | red text 또는 solid only in confirm | 반려 후 폐기, 취소 |
| Icon action | icon + accessible label/tooltip | 반복 table actions |

버튼 label은 `검토 시작`, `변경 승인`, `수정 요청`, `검증 다시 실행`처럼 결과가 분명한 동사를 사용한다.
