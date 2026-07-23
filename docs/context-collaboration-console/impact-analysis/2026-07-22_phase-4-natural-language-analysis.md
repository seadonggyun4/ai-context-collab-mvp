# Phase 4 자연어 요청·분석 제안 영향 분석

- Change ID: `CR-2026-008`
- 상태: 구현·검증 완료

| 노드 | 실제 영향 |
| --- | --- |
| Domain | AnalysisJob, attempt, stage, outcome과 idempotency key 추가 |
| Adapter | deterministic in-memory/session fixture와 HTTP start/poll/retry/detail 계약 |
| Feature | draft 보존, submit, polling, failure, retry orchestration |
| Route | `/projects/:projectId/changes/new`, `/projects/:projectId/changes/:changeId` |
| Widget | proposal summary, criteria, confidence/unknown, 6개 영향 영역 |
| QA | raw 보존, duplicate suppression, stage, retry, 8개 결과 영역, responsive/theme |

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| 빠른 연속 클릭으로 job 중복 | stable idempotency key와 repository key index, submit disabled |
| polling response 역전 | attempt와 updatedAt을 비교하고 AbortSignal로 route 이탈 요청 중단 |
| fixture가 UI 전용 mock으로 고착 | wire parser와 HTTP adapter가 같은 domain outcome을 생성 |
| 실패 시 원문 손실 | textarea state와 versioned session draft를 job state와 분리 |
| 영향 누락 | proposal selector와 requirement test로 역할·화면·API·데이터·파일·QA 6영역 고정 |

## 비영향 영역

- Phase 1 승인·검증·활성화 guard는 변경하지 않는다.
- Phase 2 backend와 Render Blueprint는 변경하지 않는다.
- Phase 3 dashboard read contract는 변경하지 않는다.

## 실행 증거

- raw request byte-equivalent 보존과 session draft/outcome 복원 확인
- 동일 start/retry key의 job·attempt 중복 생성 0건
- fixture 정상/실패/retry와 HTTP URL/header/payload/404/network/schema 반례 통과
- Vitest 13 files/45 tests, FSD architecture, production build 통과
- 1280/768/390px light/dark 브라우저에서 가로 page overflow 0건
- browser console error/warning 0건
