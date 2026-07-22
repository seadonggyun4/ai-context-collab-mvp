# 2026-07-09 QA 체크표 기반 검증 영향 분석

## 변경 요약

`roles/qa/*` 체크표를 기준으로 Phase 0-7 구현 결과를 검증했다. 자동 검증 가능한 항목은 typecheck/build/backend test/API response로 확인했고, UI 상호작용/권한/시각 확인이 필요한 항목은 코드 근거와 수동 QA 필요 여부를 분리했다.

추가된 산출물:

- `roles/qa/qa-results/first_qa_check.md`
- `roles/*/feature/{cycle}/` 하위 QA 실패 항목별 후속 feature 문서
- Phase 8 완료 상태 갱신
- QA 검증에서 도출된 미해결 이슈 목록

## 검증 결과 요약

| 구분 | 결과 |
| --- | --- |
| 자동 검증 | 통과 |
| API 계약/fixture/backend regression | 통과 |
| Publishing token/radius 적용 | 부분 통과 |
| feature 01-08 기능 체크 | 부분 통과 |
| 권한/관리자 정책 | 미통과 |
| 브라우저 시각 QA | 미완료 |

## 기획 영향

- 신규 모니터링 흐름은 대부분 구현되었으나, matrix cell drill-down, 관련 이슈/조치 CTA, 기준 변경 전후 diff는 기획 의도보다 약하다.
- 기존 메뉴 연계는 독립 MVP 안에서 warning/confirm 중심의 시나리오로 구현되었고, 운영 JADX pagination/Excel 함수와의 직접 연결은 이번 MVP 범위가 아니다.

## 퍼블리싱 영향

- 색상 토큰, 기본 radius, 상태 label 표현은 코드상 반영되어 있다.
- 실제 브라우저 시각 QA가 완료되지 않아 반응형/겹침/차트 렌더링은 수동 확인이 필요하다.

## 개발 영향

- API와 타입 계약은 안정적이다.
- 권한 모델이 아직 fixture/API/UI에 충분히 반영되지 않아 Phase 9 또는 후속 개선에서 사용자 역할 정책을 구현해야 한다.
- 일부 QA 기준은 독립 MVP 시연 범위와 운영 JADX 반영 범위 사이에 차이가 있다.

## QA 영향

- 다음 QA 회차는 미해결 이슈를 중심으로 재검증하면 된다.
- 특히 권한, drill-down, diff, pagination, browser visual QA는 “완료”가 아니라 명시적 후속 항목이다.

## 미완료 원인 요약

| 이슈 | 원인 분류 | 핵심 원인 |
| --- | --- | --- |
| QA-001 권한 정책 | 범위/계약 미정 | role provider, 권한 fixture, API dependency가 아직 없다. |
| QA-002 matrix drill-down | 상태 설계 미흡 | 탭 간 공유 filter/selection state가 아직 없다. |
| QA-003 rule diff | UI 상세 범위 제외 | PUT 호출은 구현했지만 before/after draft 비교 UI는 후속으로 남았다. |
| QA-004 pipeline CTA | 라우팅/상태 공유 미흡 | timeline에서 issue/action 화면으로 넘길 selection state가 없다. |
| QA-005 sample row/type coverage | UI 밀도 조정 | fixture data는 있으나 상세 table/grouping UI를 아직 만들지 않았다. |
| QA-006 JADX 메뉴 연계 시나리오 | 의도적 MVP 경계 | 독립 시연 앱이며 운영 JADX 코드 수정/통합은 이번 MVP 범위가 아니다. |
| QA-007 브라우저 시각 QA | 환경 문제 | 브라우저 자동화 연결 timeout으로 screenshot 기반 검증을 끝내지 못했다. |

## 후속 조치

- Phase 9에서 영향 분석 문서와 미해결 이슈 목록을 정리한다.
- 후속 개발에서 권한/role fixture, matrix click filter, rule diff, 독립 MVP 기준의 데이터 조회/시각화 경고 시나리오를 보강한다.
- 브라우저 시각 QA를 재시도하고 desktop/mobile viewport 결과를 남긴다.
