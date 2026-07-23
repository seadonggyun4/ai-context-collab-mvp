# Requirements Traceability

| Requirement | 수용 기준 | Screen | Domain/Policy | QA |
| --- | --- | --- | --- | --- |
| REQ-DASH-001 | 활성 Context version과 시행일 표시 | SCR-02 | Project | QA-DASH-01 |
| REQ-DASH-002 | 진행 요청을 상태·위험·담당 기준으로 표시 | SCR-02 | ChangeRequest | QA-DASH-02 |
| REQ-DASH-003 | 미승인·미검증 수와 원인 drill-down | SCR-02 | Review, Evidence | QA-DASH-03 |
| REQ-DASH-004 | 최신 역할 산출물과 최근 QA 표시 | SCR-02 | Document, Evidence | QA-DASH-04 |
| REQ-DASH-005 | 문서·구현 정합성 상태와 검사 시각 표시 | SCR-02 | ContextVersion | QA-DASH-05 |
| REQ-CHANGE-001 | 자연어 원문을 손실 없이 보존 | SCR-03 | ChangeRequest.rawRequest | QA-CHANGE-01 |
| REQ-CHANGE-002 | 요약·수용 기준·역할·화면/API/데이터·파일·위험·QA 제안 | SCR-04 | Proposal | QA-CHANGE-02 |
| REQ-CHANGE-003 | confidence, unknowns, clarification 표시 | SCR-04 | Proposal | QA-CHANGE-03 |
| REQ-CHANGE-004 | 분석 중·실패·재시도 상태 제공 | SCR-03 | workflow-policy | QA-CHANGE-04 |
| REQ-CONTEXT-001 | 역할·상태·문서 유형 필터 | SCR-05 | Document | QA-CONTEXT-01 |
| REQ-CONTEXT-002 | 읽기 화면과 원본 Markdown/YAML 전환 | SCR-06 | Document.source | QA-CONTEXT-02 |
| REQ-CONTEXT-003 | 상위 기준·파생 문서·변경 이력 표시 | SCR-06 | document-schema | QA-CONTEXT-03 |
| REQ-IMPACT-001 | 역할·문서·계약·코드·QA 노드를 시각화 | SCR-07 | ImpactNode | QA-IMPACT-01 |
| REQ-IMPACT-002 | 그래프와 접근 가능한 목록 view 동시 제공 | SCR-07 | ImpactNode | QA-IMPACT-02 |
| REQ-IMPACT-003 | 노드 선택 시 근거·경로·변경 상태 표시 | SCR-07 | ImpactEdge | QA-IMPACT-03 |
| REQ-REVIEW-001 | semantic before/after diff | SCR-08 | Document diff | QA-REVIEW-01 |
| REQ-REVIEW-002 | 승인·반려·수정 요청의 권한과 필수 입력 강제 | SCR-08 | permissions | QA-REVIEW-02 |
| REQ-REVIEW-003 | 승인 범위와 proposal revision 고정 | SCR-08 | Review | QA-REVIEW-03 |
| REQ-VERIFY-001 | 자동 테스트와 수동 확인 분리 | SCR-08 | Evidence | QA-VERIFY-01 |
| REQ-VERIFY-002 | 실패·미실행·한계가 있으면 완료 차단 | SCR-08 | workflow-policy | QA-VERIFY-02 |
| REQ-VERIFY-003 | 완료 후 Context version과 감사 이력 생성 | SCR-09 | ContextVersion | QA-VERIFY-03 |
| REQ-THEME-001 | system/light/dark 선택과 새로고침 후 preference 유지 | 공통 shell | ThemePreference | QA-THEME-01 |
| REQ-THEME-002 | OS theme 변경과 resolved mode 동기화 | 공통 shell | ThemeProvider | QA-THEME-02 |
| REQ-THEME-003 | 모든 상태·diff·graph가 양 theme에서 의미와 대비 유지 | 전 화면 | ui-policy | QA-THEME-03 |
| REQ-EDIT-001 | Markdown/YAML을 CodeMirror editor에서 편집 | SCR-06 | DocumentDraft | QA-EDIT-01 |
| REQ-EDIT-002 | Dracula/Porcelain theme가 application mode와 동기화 | SCR-06 | ThemeProvider | QA-EDIT-02 |
| REQ-EDIT-003 | schema diagnostic이 marker와 접근 가능한 목록으로 일치 | SCR-06 | DocumentDiagnostic | QA-EDIT-03 |
| REQ-EDIT-004 | base revision 충돌 시 원문 손실 없이 비교·복구 | SCR-06 | DocumentDraft | QA-EDIT-04 |
| REQ-BE-001 | mutation마다 서버 권한·정책·감사 강제 | 공통 | permissions, AuditEvent | QA-BE-01 |
| REQ-DEPLOY-001 | Render Blueprint로 web/api/db 재현 배포 | 운영 | render.yaml | QA-DEPLOY-01 |
| REQ-AUTH-001 | OIDC PKCE·state·nonce·exact return URL로 조직 인증 | 공통 shell | AuthSession, OidcFlow | QA-AUTH-01 |
| REQ-AUTH-002 | production API가 server session·CSRF·trusted role을 강제 | 전 API | permissions, AuthenticatedPrincipal | QA-AUTH-02 |
| REQ-OPS-001 | shared rate limit·request ID·민감정보 없는 access log | 운영 | SecurityStore | QA-OPS-01 |
| REQ-OPS-002 | DB migration·Key Value를 포함한 dependency readiness와 read-only smoke | 운영 | ReadinessReport | QA-OPS-02 |
| REQ-RECOVERY-001 | artifact rollback과 PostgreSQL PITR를 분리한 승인·검증 절차 | 운영 | production runbook | QA-RECOVERY-01 |
| REQ-QUALITY-001 | 모든 data-bound 화면의 7개 상태와 일관된 recovery | 전 화면 | DataStateKind | QA-QUALITY-01~02 |
| REQ-QUALITY-002 | 1280/1024/768/390px reflow와 horizontal overflow 방지 | 전 화면 | viewport contract | QA-QUALITY-03 |
| REQ-A11Y-001 | WCAG 2.2 AA·keyboard·focus·status message 기준 | 전 화면 | ui-policy | QA-QUALITY-04~05 |
| REQ-VISUAL-001 | light/dark/dashboard/editor의 승인된 visual baseline | SCR-02, SCR-06 | visual contract | QA-QUALITY-06~07 |
| REQ-POLICY-001 | 제품 금지 카피·시각 pattern 0건 | 전 화면 | ui-policy | QA-QUALITY-08 |
| REQ-PERF-001 | production gzip asset이 versioned budget 이내 | 전 화면 | performance budget | QA-QUALITY-09 |

## 공통 상태 수용 기준

모든 data-bound screen은 loading, empty, error, permission denied, stale, offline, conflict를 갖는다. 모든 destructive/irreversible action은 대상과 결과를 확인한다.
