# First QA Check

## Purpose

This document records the first integrated QA check for the JADX APC(농산물산지유통센터) Monitoring Service MVP.

QA results are managed under `roles/qa/qa-results/` because QA is not a developer-only artifact. It is a role-owned collaboration record that connects Project Context, Planning, Publishing, Development, and follow-up feature documents.

## Verification Date

2026-07-09

## Reference Documents

- `../../../Project_Context.md`
- `../QA.md`
- `../feature/01_monitoring_home_qa.md`
- `../feature/02_ingestion_status_qa.md`
- `../feature/03_quality_issues_qa.md`
- `../feature/04_pipeline_trace_qa.md`
- `../feature/05_operation_actions_qa.md`
- `../feature/06_monitoring_rules_qa.md`
- `../feature/07_data_lookup_integration_qa.md`
- `../feature/08_visualization_integration_qa.md`

## Automated Verification

```bash
cd app/frontend
npm run typecheck
npm run build

cd ../api
.venv/bin/python -m pytest
```

| Item | Result |
| --- | --- |
| Frontend typecheck | Pass |
| Frontend production build | Pass |
| Backend pytest | Pass, `13 passed` |
| Quality issue API response | Pass |
| Frontend dev server HTML response | Pass |

## Phase QA Summary

| Phase | Target | Result | Notes |
| --- | --- | --- | --- |
| Phase 2 | Common Type/API Contract | Pass | Pydantic schema, FastAPI health endpoint, TypeScript contract files were verified. |
| Phase 3 | Fixture Repository | Pass | Deterministic fixture, repository filtering, state coverage, and missing pipeline trace error were verified. |
| Phase 4 | FastAPI Monitoring API | Pass | `/api/monitoring/*` endpoints and mutation behavior passed backend tests. |
| Phase 5 | UI Shell | Partial Pass | Astryx/JADX_STATS shell, typecheck, and build passed; browser visual inspection was not completed. |
| Phase 6 | Monitoring Core Screens | Partial Pass | Core API-connected screens passed build/test; detailed drill-down and visual QA remained incomplete. |
| Phase 7 | Existing Menu Integration | Partial Pass | Data lookup warning and visualization warning were implemented; real JADX menu function integration remained out of MVP scope. |
| Phase 8 | Role QA Verification | Partial Pass | QA checklists exposed permission, drill-down, diff, CTA, sample row, real integration, and visual QA gaps. |

## Common Checklist Result

| Checklist Item | Result | Evidence / Notes |
| --- | --- | --- |
| Project Context purpose and core requirements are respected | Pass | APC monitoring subject, API, UI, and document structure were maintained. |
| Planning status definitions and UX flow are reflected | Partial Pass | Main menus are implemented, but drill-down and some CTA flows are incomplete. |
| Publishing Astryx/JADX_STATS rules are applied | Partial Pass | Token, radius, and code-level style rules are applied; browser visual QA is incomplete. |
| Development API contract and types match implementation | Pass | Pydantic, TypeScript, API, and backend tests passed. |
| Normal, delayed, error, missing, and undefined-rule states are visible | Pass | Covered by fixture and summary/status distribution. |
| Loading, empty, and error states exist in major areas | Partial Pass | API screens use `ResourceState`; not every detailed legacy flow is covered. |
| Unauthorized user restrictions are enforced | Fail | viewer/admin UI and API permission policies are not implemented. |
| Impact analysis is recorded | Pass | Phase impact-analysis documents exist. |

## Feature Checklist Result

| Feature | Result | Passed Items | Open / Partial Items |
| --- | --- | --- | --- |
| 01 Monitoring Home | Partial Pass | KPI, matrix, recent issues, status label, summary API, ECharts status chart | Matrix cell click does not trigger filter/detail drill-down; browser visual QA incomplete. |
| 02 Ingestion Status | Partial Pass | Priority sorting, recent/expected ingestion time, status label, ingestion API, trace row selection | Top filters are static; viewer origin/refined path restriction is not implemented. |
| 03 Quality Issues | Partial Pass | Issues API, issue summary/detail, impact range, action guidance, action POST, Excel warning | Full issue type coverage, sample row table, and stronger severity/status badges are incomplete. |
| 04 Pipeline Trace | Partial Pass | Pipeline API, step timeline, failure message, next action, log preview | Related issue/action CTA is not directly connected. |
| 05 Operation Actions | Partial Pass | Actions API, timeline, memo/status API, recurrence indicator | Action form is not fully available inside the operation actions screen. |
| 06 Monitoring Rules | Partial Pass | Rules API, rule list, undefined rule values, PUT reason validation | Before/after diff and admin-only disabled state are incomplete. |
| 07 Data Lookup Integration | Partial Pass | Quality warning, Excel confirmation, continue/detail/cancel branches, fallback table | Not directly connected to real JADX pagination/Excel functions. |
| 08 Visualization Integration | Partial Pass | Reliability warning, ECharts preview, monitoring status separation, fallback chart | Not directly connected to real JADX visualization data. |

## Open Issues

| ID | Severity | Area | Issue |
| --- | --- | --- | --- |
| QA-001 | High | Permission | viewer/admin role-based origin/refined path restrictions and rule edit restrictions are not implemented. |
| QA-002 | Medium | Monitoring Home | Matrix cell click is not connected to filter/detail navigation. |
| QA-003 | Medium | Monitoring Rules | Before/after diff UI and admin-only disabled state are missing. |
| QA-004 | Medium | Pipeline Trace | Related issue view and operation action CTA are not directly connected from the timeline. |
| QA-005 | Medium | Quality Issues | Sample row table and full issue type visibility are insufficient. |
| QA-006 | Medium | Existing Menus | Real JADX pagination, Excel, and visualization APIs are not directly connected. |
| QA-007 | Low | QA Environment | Browser plugin visual verification was not completed. |

## Root Cause Analysis

| ID | Root Cause | Why It Remained In This Check | Follow-up Action |
| --- | --- | --- | --- |
| QA-001 | User role and permission models are not yet included in the API contract or fixture. | Phases 2-7 prioritized monitoring data contracts and screen flows. Login, session, and role provider behavior were not part of the first MVP scope. | Add `UserRole` fixture, permission context, API dependency, origin/refined path masking, and role-based rule edit control. |
| QA-002 | Matrix cell selection is not connected to shared filter state or detail tab state. | The matrix was first built as a shell UI, then mapped to summary API data. Cross-tab filter handoff was not designed yet. | Add `MonitoringFilterState` at shell level and route matrix clicks to ingestion/issues/pipeline contexts. |
| QA-003 | Rule editing focuses on save request execution, not comparison UX. | `PUT /rules/{rule_id}` and change reason validation were implemented first. Local draft state and comparison UI were deferred. | Add rule edit dialog, before/current/draft diff component, and role-based disabled state. |
| QA-004 | Pipeline timeline is display-oriented and lacks routing to related work surfaces. | `PipelineTracePanel` shows steps, logs, and next action, but issue/action selection state is not shared across tabs. | Expose `relatedIssueIds` as CTA targets and navigate to quality issue detail or operation action form. |
| QA-005 | Fixture contains sample data, but the UI is summary-oriented. | The quality issues screen prioritized list/detail/status mutation. Sample row table and type grouping were left for follow-up density improvements. | Add sample row table, issue type filter, and issue type group summary. |
| QA-006 | The MVP was built as an independent demonstration app, not a direct JADX codebase modification. | Directly modifying real JADX pagination, Excel, and visualization functions would expand the scope from MVP demonstration to product integration. | Add a separate real JADX integration phase for `DataLookup.tsx`, `Visualization.tsx`, and `apcApi.ts`. |
| QA-007 | Browser plugin automation repeatedly timed out. | Typecheck, build, API, and HTML response checks were completed, but screenshot/canvas verification could not be completed reliably through the in-app browser session. | Retry browser plugin visual QA or add Playwright-based screenshot verification. |

## Follow-up Feature Documents

| ID | Follow-up Document | Owner |
| --- | --- | --- |
| QA-001 | `../../planning/feature/01_after_first_qa/09_role_permission_flow.md`, `../../publishing/feature/01_after_first_qa/02_permission_state_visual_policy.md`, `../../development/feature/01_after_first_qa/09_role_permission_policy.md` | Planning, Publishing, Development |
| QA-002 | `../../planning/feature/01_after_first_qa/07_matrix_drilldown_flow.md` | Planning |
| QA-003 | `../../planning/feature/01_after_first_qa/10_monitoring_rule_diff_policy.md`, `../../publishing/feature/01_after_first_qa/03_rule_diff_visual_policy.md`, `../../development/feature/01_after_first_qa/10_rule_diff_and_admin_state.md` | Planning, Publishing, Development |
| QA-004 | `../../planning/feature/01_after_first_qa/08_pipeline_related_cta_flow.md` | Planning |
| QA-005 | `../../planning/feature/01_after_first_qa/11_quality_issue_detail_policy.md`, `../../publishing/feature/01_after_first_qa/04_quality_issue_detail_visual_policy.md`, `../../development/feature/01_after_first_qa/11_quality_issue_detail_coverage.md` | Planning, Publishing, Development |
| QA-006 | `../../development/feature/01_after_first_qa/12_jadx_menu_integration_scenario.md` | Development |
| QA-007 | `../../publishing/feature/01_after_first_qa/01_browser_visual_qa_policy.md`, `../feature/09_browser_visual_qa.md` | Publishing, QA |

## Conclusion

The first QA check confirms that API contracts, fixture data, core monitoring screens, and existing menu warning integration are working at MVP level. The MVP is not yet fully complete because permission handling, matrix drill-down, rule diff UX, pipeline CTA routing, quality issue detail density, real JADX menu integration, and browser visual QA remain open.

The open items are not tracked in a separate follow-up directory. They are converted into role-owned feature documents under `roles/planning/feature/`, `roles/publishing/feature/`, `roles/development/feature/`, and `roles/qa/feature/` so each part can continue from its own management point.

Development follow-up items are not considered complete by themselves. A development follow-up must reference the relevant planning feature and publishing feature, then prove that implementation tasks satisfy both sets of conditions.

## Impact Analysis

- `../../../impact-analysis/2026-07-09_qa-verification-completed.md`
- `../../../impact-analysis/2026-07-09_qa-document-structure-realigned.md`
