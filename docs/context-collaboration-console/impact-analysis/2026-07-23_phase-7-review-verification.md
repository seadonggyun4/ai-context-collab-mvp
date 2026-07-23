# Phase 7 승인·검증 영향 분석

- Change ID: `CR-2026-011`
- 상태: 완료

| 노드 | 반영 결과 |
| --- | --- |
| Backend domain | Change workflow/RBAC policy port, actor registry, review/evidence/gate result |
| Backend persistence | versioned aggregate, idempotent command, append-only audit migration/repository |
| Backend API | review workspace 조회, review/evidence/transition mutation와 actor dependency |
| Frontend domain | ReviewWorkspace, semantic/raw diff, gate blocker와 capability |
| Frontend adapter | deterministic stateful fixture와 HTTP parser/repository |
| Feature/Widget | decision form, evidence action, completion gate, audit timeline |
| Route | `/projects/:projectId/changes/:changeId/review`와 proposal action |
| QA | 권한·self approval·stale revision·idempotency·audit·evidence/gate 반례 |

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| frontend disabled 상태만으로 권한 통제 | backend command service에서 actor registry·RBAC·guard 재검증 |
| 승인 뒤 proposal 범위 변경 | revision+scope fingerprint optimistic contract와 stale 오류 |
| mutation 재시도로 중복 review/audit | Idempotency-Key command receipt와 동일 결과 replay |
| 과거 구현 evidence 재사용 | implementationRevision filter와 gate blocker |
| semantic/raw diff 불일치 | versioned workspace projection 하나에서 두 표현 파생 |
| mobile 두 column 정보 손실 | 760px 이하 diff/decision pane switch, mode는 native button group |

## 검증 결과

- Backend domain/application/infrastructure/API를 inward dependency 방향으로 분리했다.
- workflow aggregate와 audit/idempotency receipt를 같은 DB transaction 경계에서 갱신한다.
- frontend와 backend projection은 semantic 8건, QA scenario 2건, gate blocker enum을 공유한다.
- 브라우저 정상 흐름과 390px dark responsive 검증을 완료했고 console 오류는 없었다.
