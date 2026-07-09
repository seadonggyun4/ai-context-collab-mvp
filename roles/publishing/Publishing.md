# Publishing.md

## 참조 문서

- `../../Project_Context.md`
- `../../organization-standards/publishing-standards.md`
- `../planning/Planning.md`

## 기준 프로젝트

APC(농산물산지유통센터) 모니터링 서비스의 퍼블리싱 기준은 Astryx Design System 컴포넌트를 기본 UI 체계로 사용하고, `JADX_STATS`의 기존 CSS, Tailwind 설정, 색상 토큰, 폰트, 업무형 대시보드 스타일을 테마 기준으로 따른다.

참조 대상:

- `/Users/dgseo/Desktop/JADX/jadx_stats/src/index.css`
- `/Users/dgseo/Desktop/JADX/jadx_stats/src/main.tsx`
- `/Users/dgseo/Desktop/JADX/jadx_stats/tailwind.config.js`
- `/Users/dgseo/Desktop/JADX/jadx_stats/src/components/Button.tsx`
- `/Users/dgseo/Desktop/JADX/jadx_stats/src/components/SideMenu.tsx`
- `/Users/dgseo/Desktop/JADX/jadx_stats/src/features/visualization/components/common`

## 디자인 시스템 고정

APC(농산물산지유통센터) 모니터링 서비스의 디자인 시스템은 `Enterprise Data Operations Dashboard`로 고정한다.

이는 장식 중심의 글래스모피즘, 뉴모피즘, 마케팅형 SaaS 랜딩 UI가 아니라, 운영자가 반복적으로 상태를 확인하고 문제를 추적하는 업무형 데이터 관제 UI다.

최종 디자인 성격:

```text
Flat Enterprise Dashboard
+ Dense Operational Console
+ Astryx Design System
+ JADX_STATS Dark Panel Theme
```

한 문장 기준:

> APC 모니터링 서비스는 세련된 장식형 대시보드가 아니라, 오류를 놓치지 않고 빠르게 추적하는 전문 운영 콘솔이다.

## Feature Lifecycle

퍼블리싱 feature는 QA cycle 기준으로 관리한다.

| Cycle | 디렉토리 | 관리 범위 |
| --- | --- | --- |
| Initial | `feature/00_initial/` | 첫 QA 이전에 합의한 스타일/컴포넌트 feature가 있을 때 사용 |
| After first QA | `feature/01_after_first_qa/` | 첫 QA에서 드러난 시각 검증, 반응형, 스타일 보완 |
| After second QA | `feature/02_after_second_qa/` | 두 번째 QA 이후 추가될 퍼블리싱 보완 범위 |

첫 QA 이후 생성된 퍼블리싱 보완 feature:

| QA ID | 문서 | 목적 |
| --- | --- | --- |
| QA-007 | `feature/01_after_first_qa/01_browser_visual_qa_policy.md` | 브라우저 시각 QA 기준과 screenshot/canvas 검증 정책 정의 |
| QA-001 | `feature/01_after_first_qa/02_permission_state_visual_policy.md` | 권한 필요/disabled/tooltip/마스킹 시각 정책 정의 |
| QA-003 | `feature/01_after_first_qa/03_rule_diff_visual_policy.md` | 기준 변경 전/후 diff layout과 강조 정책 정의 |
| QA-005 | `feature/01_after_first_qa/04_quality_issue_detail_visual_policy.md` | 품질 이슈 상세 table, overflow, badge 시각 정책 정의 |

## 기획 Feature 충족 기준

퍼블리싱 feature는 항상 관련 기획 feature를 먼저 확인하고, 기획 조건을 UI 기준으로 번역한다.

| 확인 항목 | 기준 |
| --- | --- |
| 기획 흐름 | 사용자가 이동해야 하는 화면/상태가 UI 구조에 반영되었는가 |
| 상태 표현 | 정상/지연/오류/미수신/권한 필요 같은 상태가 색상과 텍스트로 함께 표현되는가 |
| 레이아웃 | 기획에서 요구한 정보 우선순위가 화면 밀도와 배치에 반영되는가 |
| 반응형 | desktop/mobile에서 기획상 필수 정보가 숨겨지거나 겹치지 않는가 |
| 개발 전달 | 개발자가 임의 스타일 판단 없이 구현할 수 있는 컴포넌트/상태 기준이 있는가 |

## 레퍼런스 조사 결과

### Astryx Design System

Astryx Design System은 React 기반 업무형 UI를 구성하기 위한 컴포넌트 체계다. APC 모니터링 서비스의 화면 컴포넌트는 Astryx를 우선 사용하고, 시각 스타일은 `JADX_STATS`의 색상/폰트/간격/radius 기준으로 맞춘다.

적용 원칙:

- Form, Select, Date Range Input, Table, Dialog, Drawer/Popover, Tooltip, Pagination은 Astryx 컴포넌트를 우선 사용한다.
- Astryx 컴포넌트의 색상, 폰트, radius, 상태 표현은 `JADX_STATS` 토큰 기준으로 커스터마이징한다.
- 새로운 UI 패턴을 만들기보다 기존 패턴을 조합한다.

### IBM Carbon Data Visualization

Carbon Charts는 정확하고 설득력 있으며 접근 가능한 데이터 시각화를 목표로 한다. APC 모니터링 서비스는 데이터 신뢰도, 오류 상태, 수신 지연을 보여주는 화면이므로 장식보다 정확성, 상태 구분, 접근성을 우선한다.

적용 원칙:

- 상태/오류/지연 정보는 색상만으로 표현하지 않고 텍스트와 수치를 함께 제공한다.
- 차트보다 테이블과 상태 요약을 우선한다.
- 데이터 시각화는 운영 판단에 필요한 최소 단위로 제한한다.

### NN/g Usability Heuristics

관제 화면은 사용자가 현재 시스템 상태를 즉시 이해해야 한다. 따라서 `Visibility of system status`, `Consistency and standards`, `Error prevention`을 핵심 원칙으로 삼는다.

적용 원칙:

- 현재 수신 상태, 오류 상태, 마지막 갱신 시각을 항상 노출한다.
- 같은 상태는 모든 화면에서 같은 색상, 같은 라벨, 같은 위치 규칙을 따른다.
- 오류가 있는 데이터 다운로드나 후속 처리 전에는 경고/확인을 제공한다.

## 채택하지 않는 스타일

| 스타일 | 채택 여부 | 이유 |
| --- | --- | --- |
| Glassmorphism | 사용하지 않음 | 반투명/blur 레이어는 데이터 밀도와 가독성을 떨어뜨리고, 운영 화면에서 상태 판단을 방해한다. |
| Neumorphism | 사용하지 않음 | 낮은 대비와 약한 경계 표현 때문에 접근성과 테이블 가독성에 불리하다. |
| Marketing SaaS Dashboard | 사용하지 않음 | KPI 카드 중심의 홍보형 구성은 APC 데이터 오류 추적 업무와 맞지 않는다. |
| Heavy Dark Mode | 부분 사용 | JADX_STATS의 다크 패널은 유지하되, 전체 화면을 완전 다크 모드로 전환하지 않는다. |
| Editorial/Data Storytelling | 사용하지 않음 | 설명형 리포트보다 운영자가 반복 확인하는 관리 화면이 목적이다. |

## 시각 원칙

- flat하고 명확한 면 분리를 사용한다.
- elevation은 낮게 유지하고, shadow는 보조적인 깊이 표현에만 사용한다.
- 텍스트 대비를 우선한다.
- 반복 업무에 적합한 정보 밀도를 유지한다.
- 색상은 상태 판단과 인터랙션 피드백에만 제한적으로 사용한다.
- 카드 장식보다 테이블, 필터, 상태 요약을 우선한다.
- 다크 패널과 흰 데이터 영역의 대비를 활용한다.

## 색상 토큰

JADX_STATS에서 사용 중인 색상을 그대로 사용한다. 신규 색상은 추가하지 않는다.

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `color-primary` | `#37445E` | 주요 버튼, 다크 컨테이너, 툴팁 배경 |
| `color-primary-panel` | `#43506E` | 페이지 내부 다크 패널, 버튼 배경, 페이지네이션 아이템 |
| `color-panel` | `#43516D` | 필터 패널, 차트 컨테이너, 정보 박스 |
| `color-panel-hover` | `#486185` | 리스트/선택 영역 hover |
| `color-panel-selected` | `#42597B` | 선택된 리스트 row, 강조 패널 |
| `color-secondary-panel` | `#505F7C` | 빈 상태, 보조 패널 |
| `color-accent` | `#FFC132` | 선택 강조, 슬라이더 track, 스위치 checked, 중요 포인트 |
| `color-menu-active` | `#011E58` | 메뉴 선택 텍스트, 사이드 메뉴 제목 |
| `color-segmented` | `#1D3A8A` | segmented control border/selected |
| `color-muted-blue` | `#7387A6` | 다크 테이블 border, 비활성/보조 라인 |
| `color-body` | `#222222` | 기본 본문 텍스트 |
| `color-body-muted` | `#606060` | 보조 텍스트, 메뉴 보조 텍스트 |
| `color-gray-bg` | `#EEEEEE` | 전체 페이지 배경, 메뉴 선택 배경 |
| `color-soft-bg` | `#F5F5F5` | 서브 메뉴 배경 |
| `color-disabled-bg` | `#E9E9E9` | disabled input/button 배경 |
| `color-border-light` | `#D9D9D9` | 기본 border |
| `color-border-muted` | `#80899C` | 사이드 메뉴 구분선 |
| `color-white` | `#FFFFFF` | 다크 패널 위 텍스트/배경 |

상태 색상은 JSX/Tailwind 기본색을 임의로 늘리지 않고, 아래 범위에서만 사용한다.

| 상태 | 색상 |
| --- | --- |
| 정상 | `#22C55E` |
| 지연 | `#FFC132` |
| 오류 | `#D11B1B` |
| 미수신/비활성 | `#9CA3AF` |
| 정보 | `#1890FF` |

## 폰트

JADX_STATS의 Tailwind 설정을 그대로 따른다.

```text
font-family: "Pretendard GOV", sans-serif
```

## 폰트 크기

JADX_STATS에서 반복 사용되는 크기를 기준으로 고정한다.

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `font-xs` | `13px` | 보조 안내, 준비중/주의 문구 |
| `font-sm` | `14px` | 필터 label, 표 보조 텍스트 |
| `font-md` | `15px` | 설명문, 패널 내부 본문 |
| `font-base` | `16px` | 입력값, 선택 옵션, 일반 본문 |
| `font-menu` | `17px` | 사이드 메뉴 항목 |
| `font-title-sm` | `18px` | 필터 패널 제목, 섹션 소제목, 탭/버튼 텍스트 |
| `font-title-md` | `20px` | 차트 제목, 주요 카드 제목 |
| `font-title-lg` | `24px` | 페이지 섹션 제목 |
| `font-display-sm` | `36px` | 대시보드 주요 섹션 헤드라인 |
| `font-display-lg` | `48px` | 메인 비주얼/큰 타이틀 |

폰트 굵기:

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `font-regular` | `400` | 일반 본문 |
| `font-medium` | `500` | 메뉴, 버튼, 필터 label |
| `font-semibold` | `600` | 제목, 선택 메뉴, 강조 텍스트 |
| `font-bold` | `700` | 핵심 수치, 강한 제목 |

## 레이아웃

APC(농산물산지유통센터) 모니터링 서비스 화면은 JADX_STATS의 업무형 대시보드 구조를 따른다.

- 페이지 배경은 `#EEEEEE`를 사용한다.
- 필터/차트/상태 요약은 기존 다크 패널 스타일 `#43516D` 또는 `#43506E`를 사용한다.
- 데이터 테이블 또는 상세 영역은 흰색 배경을 기본으로 하되, 다크 패널 안에서는 `#FFFFFF` 또는 `#F5F5F5`로 구분한다.
- 패널 내부 기본 padding은 `20px`를 우선 사용한다.
- 컴포넌트 간 gap은 `16px` 또는 `20px`를 우선 사용한다.
- 화면은 설명형 랜딩 페이지가 아니라 운영자가 반복 사용하는 관리 화면으로 구성한다.

## Radius 정책

JADX_STATS에는 `rounded-lg`, `rounded-xl`, `border-radius: 6px`, `8px`, `10px`가 혼재하지만, APC 모니터링 서비스의 카드형 레이아웃은 일관성을 위해 아래 기준을 우선한다.

| 대상 | border-radius |
| --- | --- |
| 카드, 패널, 상태 요약 박스 | `5px` 고정 |
| 테이블 wrapper | `5px` 고정 |
| 모달/드로어 내부 카드 | `5px` 고정 |
| 버튼 | 기존 JADX_STATS Button 스타일 유지 |
| segmented thumb | 기존 `6px` 유지 |
| 스크롤바 thumb | 기존 `10px` 유지 |
| 원형 아이콘/상태 dot | `50%` 유지 |

카드류에 Tailwind `rounded-lg`, `rounded-xl`을 그대로 사용하지 않는다. 구현 시 `style={{ borderRadius: 5 }}` 또는 전용 class로 `border-radius: 5px`를 명시한다.

## 컴포넌트 스타일

기존 JADX_STATS 컴포넌트 스타일을 우선 재사용한다.

### Button

- 기본 배경: `#37445E`
- 기본 텍스트: `#FFFFFF`
- 기본 border: `#37445E`
- 선택 상태: border `#FFC132`, text `#FFC132`
- 기본 font-size: `15px`
- Astryx Button을 우선 사용하되 위 토큰으로 시각 스타일을 맞춘다.

### Segmented

Astryx Segmented Control을 사용하고, `src/index.css`의 `.main-segmented`, `.trade-segmented`, `.statistics-segmented` 스타일 값을 테마 기준으로 재사용한다.

- 일반 segmented: `border: 1.5px solid #1D3A8A`, selected `#1D3A8A`
- 다크 segmented: `border: 1.5px solid #37445E`, background `#37445E`, selected `#43516D`
- font-size: `16px`

### Select/Input/Search

- Astryx 컴포넌트를 우선 사용한다.
- disabled 배경은 `#E9E9E9`를 따른다.
- 선택된 option 배경은 `#EEEEEE`를 따른다.
- 필터 label은 `14px`, `font-bold` 또는 `font-medium`을 사용한다.

### Switch/Slider

- Switch checked 색상은 `#FFC132`를 사용한다.
- Slider rail은 `#677798`, track은 `#FFC132`를 사용한다.

### Pagination

`custom-pagination` 스타일을 따른다.

- item background: `#43506E`
- active background: `#4A6993`
- text: `#FFFFFF`

### Tooltip

- 기본 배경: `#37445E`
- 강조 텍스트: `#FFC132`
- 텍스트: `#FFFFFF`
- shadow: `1px 1px 4px 0px rgba(0, 0, 0, 0.59)`
- 카드형 tooltip radius는 `5px`를 우선한다.

### Table

- 다크 패널 내부 테이블은 기존 JSX/CSS 패턴처럼 header 배경 `#43516D`, border `#A1A5AA` 또는 `#7387A6`, text `#FFFFFF`를 사용한다.
- 리포트/흰 배경 테이블은 header/body text `#000000`, border `#CCCCCC`를 사용한다.
- APC 모니터링의 운영 테이블은 가독성을 위해 흰 배경 테이블을 기본으로 하고, 상태 요약/필터 영역만 다크 패널로 둔다.

## APC 모니터링 화면 적용

화면 구성:

1. 상단 필터 패널
2. APC별 상태 요약 카드
3. 오류/지연 상세 테이블
4. 선택 항목 상세 추적 영역

상단 필터 패널:

- 배경: `#43516D`
- radius: `5px`
- padding: `20px`
- label: `14px`, `font-bold`, `#FFFFFF`
- Select/Date Range Input은 Astryx 기본 컴포넌트를 사용한다.

상태 요약 카드:

- radius: `5px` 고정
- 정상/지연/오류/미수신 상태를 색상과 텍스트로 함께 표시한다.
- 상태명은 `18px`, `font-semibold`
- 수치/건수는 `24px`, `font-bold`
- 보조 설명은 `14px`, `#606060` 또는 다크 배경에서는 `#FFFFFFA6`

상세 테이블:

- wrapper radius: `5px`
- header font-size: `15px`
- body font-size: `15px`
- 상태 컬럼은 색상 배지 + 텍스트를 함께 표시한다.

## 반응형

JADX_STATS의 Tailwind breakpoint를 따른다.

| breakpoint | 값 |
| --- | --- |
| `2xl` | `1596px` |
| `3xl` | `1920px` |
| `4xl` | `2460px` |

- 데스크톱: 필터, 상태 요약, 테이블을 한 화면에서 확인할 수 있게 구성한다.
- 태블릿 이하: 상태 요약 카드는 가로 스크롤 또는 2열 grid로 전환한다.
- 모바일: 테이블 주요 컬럼만 노출하고 상세는 드로어 또는 모달로 분리한다.

## 금지 사항

- JADX_STATS에 없는 신규 컬러 팔레트를 임의로 추가하지 않는다.
- 카드형 레이아웃에 `rounded-lg`, `rounded-xl`을 그대로 쓰지 않는다.
- 상태를 색상만으로 표현하지 않는다.
- 마케팅형 hero, 설명형 landing section을 만들지 않는다.
- SVG 장식, gradient orb, 과한 decorative background를 추가하지 않는다.
