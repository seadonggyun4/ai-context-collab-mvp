# 2026-07-09 Astryx Design System 정렬 영향 분석

## 변경 요약

Publishing 문서가 Ant Design 기준을 유지하고 Development 문서가 Astryx 기준을 사용하던 충돌을 정리한다.

최종 기준:

- Publishing: Astryx Design System 컴포넌트 + JADX_STATS 색상/폰트/radius 토큰
- Development: UI 스타일 판단을 제거하고 API, 데이터, 상태, 테스트 기준에 집중
- QA: Publishing과 Development 기준이 실제 구현에 모두 반영되었는지 체크

## 변경 원인

직군별 문서가 서로 다른 UI 프레임워크를 기준으로 삼으면 제안서의 핵심인 “같은 정보를 보고 같은 방향으로 움직이는 협업 체계”가 깨진다.

## 영향 문서

| 문서 | 영향 |
| --- | --- |
| `roles/publishing/Publishing.md` | Ant Design 기준을 Astryx Design System 기준으로 변경 |
| `roles/development/Development.md` | 스타일/컴포넌트 세부 기준 제거 |
| `roles/development/feature/*.md` | Astryx 컴포넌트명 중심 설명 제거, Project Context 직접 참조 추가 |
| `roles/qa/QA.md` | 직군 간 기준 반영 여부 체크 |
| `roles/qa/feature/*.md` | 기능별 QA 체크표 추가 |

## 기획 영향

- 메뉴 구조와 사용자 흐름은 변경 없음
- 상태 정의와 예외 정책 변경 없음

## 퍼블리싱 영향

- UI 컴포넌트 기준이 Astryx로 변경됨
- 색상, 폰트, radius, 상태 표시 기준은 JADX_STATS 토큰을 유지함

## 개발 영향

- 개발 문서는 퍼블리싱 기준을 직접 중복 정의하지 않음
- API, 타입, fixture, adapter, 배포 기준 중심으로 유지함
- 개발 feature 문서는 Project Context를 직접 참조함

## QA 영향

- QA 계층이 추가됨
- 각 feature별로 기획/퍼블리싱/개발 반영 여부를 체크하는 표가 추가됨

## 리스크

- Astryx 컴포넌트와 JADX_STATS 토큰의 실제 테마 매핑이 구현 단계에서 누락될 수 있음
- 개발자가 QA 체크표를 보지 않으면 퍼블리싱 기준 반영 여부를 놓칠 수 있음

## 후속 조치

- 실제 화면 구현 시 Astryx 컴포넌트 테마 매핑 결과를 QA 체크표에 기록한다.
- UI 컴포넌트 제약이 발견되면 Publishing 문서를 먼저 갱신하고 impact-analysis 문서를 추가한다.
