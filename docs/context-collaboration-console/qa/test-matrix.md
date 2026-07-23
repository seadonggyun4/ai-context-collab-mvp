# Acceptance Test Matrix

| Test ID | Requirement | Scenario | Expected | Priority |
| --- | --- | --- | --- | --- |
| QA-DASH-01 | REQ-DASH-001 | Overview 진입 | active Context version/effective date 표시 | P0 |
| QA-DASH-02 | REQ-DASH-002 | 진행 요청 정렬 | attention priority와 상태 일치 | P0 |
| QA-DASH-03 | REQ-DASH-003 | 미승인 선택 | 해당 요청 목록으로 drill-down | P0 |
| QA-DASH-04 | REQ-DASH-004 | 역할 산출물 확인 | role, version, status, updated 표시 | P1 |
| QA-DASH-05 | REQ-DASH-005 | 정합성 상태 | 검사 시각과 불일치 근거 표시 | P0 |
| QA-CHANGE-01 | REQ-CHANGE-001 | 요청 제출·뒤로가기 | raw request 손실 없음 | P0 |
| QA-CHANGE-02 | REQ-CHANGE-002 | 분석 완료 | 8개 분석 영역 모두 표시 | P0 |
| QA-CHANGE-03 | REQ-CHANGE-003 | 모호한 요청 | unknowns/clarification 표시 | P0 |
| QA-CHANGE-04 | REQ-CHANGE-004 | 분석 실패 | 입력 유지, retry 제공 | P1 |
| QA-CONTEXT-01 | REQ-CONTEXT-001 | role/status 필터 | URL과 목록 동기화 | P1 |
| QA-CONTEXT-02 | REQ-CONTEXT-002 | structured/raw 전환 | 동일 document/version 유지 | P0 |
| QA-CONTEXT-03 | REQ-CONTEXT-003 | relation 선택 | 상위·파생 경로 탐색 가능 | P0 |
| QA-IMPACT-01 | REQ-IMPACT-001 | impact 진입 | 모든 node kind 표시 | P0 |
| QA-IMPACT-02 | REQ-IMPACT-002 | keyboard/list 전환 | graph 없이도 같은 관계 탐색 | P0 |
| QA-IMPACT-03 | REQ-IMPACT-003 | node 선택 | 근거·경로·status 표시 | P1 |
| QA-REVIEW-01 | REQ-REVIEW-001 | diff 전환 | semantic/raw 일관성 | P0 |
| QA-REVIEW-02 | REQ-REVIEW-002 | 권한별 결정 | 허용 행동과 helper 일치 | P0 |
| QA-REVIEW-03 | REQ-REVIEW-003 | 승인 후 revision 변경 | 기존 승인 무효화 | P0 |
| QA-VERIFY-01 | REQ-VERIFY-001 | evidence 확인 | automated/manual 분리 | P0 |
| QA-VERIFY-02 | REQ-VERIFY-002 | P0 실패 존재 | complete/activate 차단 | P0 |
| QA-VERIFY-03 | REQ-VERIFY-003 | 활성화 | 새 version/audit 생성 | P0 |
| QA-VISUAL-01 | 공용 UI 표준 | 전 화면 audit | 금지 시각 패턴 0건 | P0 |
| QA-COPY-01 | content policy | production copy scan | 금지 표면 문구 0건 | P0 |
| QA-A11Y-01 | 접근성 | keyboard 주요 흐름 | trap 없음, focus visible | P0 |
| QA-RESP-01 | 반응형 | 4 breakpoint | 핵심 행동·정보 손실 없음 | P0 |
| QA-ARCH-01 | frontend architecture | FSD dependency scan | 역방향·slice-private import 0건 | P0 |
| QA-STYLE-01 | styling policy | Astryx/제품 CSS audit | 소유권 중복·임의 token·강제 override 0건 | P0 |
| QA-THEME-01 | REQ-THEME-001 | system/light/dark 선택 후 reload | 선택 유지와 정확한 resolved mode | P0 |
| QA-THEME-02 | REQ-THEME-002 | system mode에서 OS theme 변경 | reload 없이 theme 반영, 업무 state 유지 | P0 |
| QA-THEME-03 | REQ-THEME-003 | 전 화면 양 theme visual/a11y | WCAG AA, 상태·diff·graph 의미 손실 없음 | P0 |
| QA-EDIT-01 | REQ-EDIT-001 | Markdown/YAML 편집 | highlight, history, search, draft 보존 | P0 |
| QA-EDIT-02 | REQ-EDIT-002 | app theme 전환 | Dracula/Porcelain 전환, cursor/history 유지 | P0 |
| QA-EDIT-03 | REQ-EDIT-003 | invalid YAML/metadata | marker와 diagnostic line/message 일치 | P0 |
| QA-EDIT-04 | REQ-EDIT-004 | server revision 변경 후 저장 | 409, 원문·draft·최신본 비교 및 복구 | P0 |
| QA-BE-01 | REQ-BE-001 | 미권한·self approval mutation | 서버 거부와 audit 기록 | P0 |
| QA-BE-02 | backend reliability | 동일 idempotency key 재요청 | 중복 change/evidence 생성 없음 | P0 |
| QA-DEPLOY-01 | REQ-DEPLOY-001 | Render preview deploy | SPA route, API health, DB migration, CORS 통과 | P0 |
| QA-AUTH-01 | CR-2026-017 | 현재 인증 표면 검사 | login/logout/avatar UI와 `/api/v1/auth/*` OpenAPI path 0건 | P0 |
| QA-AUTH-02 | REQ-AUTH-001~002 | OIDC·session·identity RBAC | 후속 Change Manifest 전까지 실행하지 않음 | DEFERRED |
| QA-OPS-01 | REQ-OPS-001 | instance 공유 limit와 access log | 429·Retry-After, 동일 request ID, token/cookie/body 미기록 | P0 |
| QA-OPS-02 | REQ-OPS-002 | production read-only smoke | web, SPA, live, DB·migration·Key Value ready, auth fail-closed | P0 |
| QA-RECOVERY-01 | REQ-RECOVERY-001 | rollback/PITR drill | 격리 복구·검증·전환과 artifact-only rollback 증거 | P0 |
| QA-QUALITY-01 | REQ-QUALITY-001 | 7개 data state | taxonomy, live region, recovery와 classifier 일치 | P0 |
| QA-QUALITY-02 | REQ-QUALITY-002 | 1280/1024/768/390px route | 가로 overflow 0, 핵심 content 접근 | P0 |
| QA-QUALITY-03 | REQ-A11Y-001 | light/dark dashboard/editor axe·keyboard | WCAG A/AA violation 0, skip/editor focus 유지 | P0 |
| QA-QUALITY-04 | REQ-VISUAL-001 | 6개 승인 snapshot 비교 | landing/dashboard/editor 양 theme 의도하지 않은 diff 0 | P0 |
| QA-QUALITY-05 | REQ-POLICY-001 | production source scan | 금지 카피·gradient/glass/glow/radius 0 | P0 |
| QA-QUALITY-06 | REQ-PERF-001 | production gzip asset 검사 | versioned budget 이내 | P0 |
