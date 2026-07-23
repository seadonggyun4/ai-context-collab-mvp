# QF-012 Free Render and Ownership Boundary QA

| ID | 검증 | 기대 결과 |
| --- | --- | --- |
| QA-FREE-01 | Render JSON Schema | `render.yaml` schema 통과 |
| QA-FREE-02 | Render `imugi` workspace validate | 결제 정보 없이 `valid: true` |
| QA-FREE-03 | paid token scan | paid plan·previewPlan·paid pre-deploy 0건 |
| QA-FREE-04 | runtime contract | web auth off, API preview, migration→idempotent seed→server, free DB/KV |
| QA-IP-01 | package notice | frontend/API LICENSE·NOTICE에 동일 권리자 |
| QA-IP-02 | metadata | npm `UNLICENSED`, Python LICENSE file reference |
| QA-IP-03 | path scope | console code/docs만 포함, APC·공용 규칙·제3자 제외 |
| QA-IP-04 | product surface | HTML metadata와 footer에 2026 서동균 저작권 표시 |
| QA-REG-01 | quality gate | frontend·browser·backend·blueprint 전체 통과 |

## 수동 확인

- Blueprint 생성 확인 화면에서 월 예상 비용과 유료 자원이 0인지 확인한다.
- 배포 후 API cold start와 `/health/ready` 회복 시간을 기록한다.
- GitHub repository visibility가 private인지 시연 전 재확인한다.

## 2026-07-23 사전 검증 증거

- Render CLI `imugi` workspace validation: `valid: true`, 생성 예정 free resource 4개
- Backend: Ruff·format·mypy 통과, 54 passed·1 local Postgres skip
- Frontend: 104 unit/integration tests, policy 191 files·0 violations, production build·performance budget 통과
- Browser: 11 Playwright accessibility·responsive·visual tests 통과
- Ownership/Blueprint focused contracts: 4 passed
- GitHub repository visibility: private

실제 resource 생성, 무료 Postgres integration migration, deployed URL smoke는 Blueprint 생성 후 evidence로 추가한다.
