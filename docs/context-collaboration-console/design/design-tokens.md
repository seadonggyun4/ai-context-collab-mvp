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
| `canvas` | `#F7F8FA` | `#101514` | app background |
| `surface` | `#FFFFFF` | `#171E1D` | primary workspace |
| `surface.subtle` | `#F0F4F2` | `#1E2826` | grouped region |
| `text.primary` | `#17202A` | `#F1F5F4` | heading/body emphasis |
| `text.secondary` | `#667085` | `#A9B5B2` | metadata |
| `border` | `#D9DEE7` | `#34413E` | meaningful boundary |
| `primary` | `#115E59` | `#5FC2B7` | primary action/selection |
| `focus` | `#0F766E` | `#7DD3C7` | keyboard focus |

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
- glass, blur, glow, gradient mesh 금지. 단색 또는 미세한 tonal surface 사용.

## Button hierarchy

| Variant | 표현 | 사용 |
| --- | --- | --- |
| Primary | solid deep teal | 페이지당 핵심 진행 행동 1개 |
| Secondary | neutral outline 또는 subtle fill | 보조 진행 행동 |
| Quiet | text/hover surface | navigation, low-risk utility |
| Destructive | red text 또는 solid only in confirm | 반려 후 폐기, 취소 |
| Icon action | icon + accessible label/tooltip | 반복 table actions |

버튼 label은 `검토 시작`, `변경 승인`, `수정 요청`, `검증 다시 실행`처럼 결과가 분명한 동사를 사용한다.
