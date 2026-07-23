# Render·Backend·문서 Editor 영향 분석

- Change ID: `CR-2026-003`
- 상태: 개발 준비 완료

| 영역 | 영향 |
| --- | --- |
| Repository | `projects/context-collaboration-console-api/`, root `render.yaml` 추가 예정 |
| Frontend | fixture repository를 HTTP adapter로 교체, CodeMirror document route 추가 |
| Backend | project/document/change/review/evidence/context/audit API 신규 |
| Data | Render Postgres schema와 Alembic migration 신규 |
| Git | 승인된 document proposal의 branch/commit/PR adapter 신규 |
| Operations | Render web/static/db, health, secrets, backup, deploy gate 신규 |
| QA | API/RBAC/concurrency/editor/theme/deploy P0 coverage 추가 |

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| ephemeral filesystem 문서 유실 | 문서 원본은 Git, draft/audit/workflow는 Postgres가 소유 |
| browser의 Git token 노출 | Git adapter와 secret을 backend에만 배치 |
| autosave와 Git revision 경쟁 | optimistic revision, 409 conflict, immutable proposal 사용 |
| dark mode의 비색상 의미 손실 | diagnostic marker와 접근 가능한 목록을 함께 제공 |
| deploy와 migration 불일치 | Blueprint, migration, health, CORS를 CI 이후 gate로 운영 |
