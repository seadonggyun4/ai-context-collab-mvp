# QF-002 Domain and Fixture QA

## P0 자동 시나리오

| 범위 | 판정 |
| --- | --- |
| YAML workflow state·transition·guard·forbidden 동기화 | 통과 |
| YAML role inheritance·permission·constraint 동기화 | 통과 |
| YAML document required field·enum·relation 동기화 | 통과 |
| 전체 승인·구현·검증·활성화 정상 흐름 | 통과 |
| ContextVersion과 activation actor audit 원자 생성 | 통과 |
| self approval 및 demo 예외 범위 위조 | 차단 확인 |
| viewer 승인·반려, reviewer high-risk 승인 | 차단 확인 |
| acceptance criteria/context lock/reviewable impact 누락 | 차단 확인 |
| stale proposal scope와 승인 후 scope 확장 | 차단 확인 |
| failed/not executed/partial/manual unresolved evidence | 차단 확인 |
| 구현 revision 변경 후 기존 evidence 재사용 | 차단 확인 |
| reviewer 활성화 및 version 없는 활성화 | 차단 확인 |
| terminal state 후속 mutation | 차단 확인 |

## 실행 결과

| 검사 | 결과 |
| --- | --- |
| TypeScript strict typecheck | 오류 0 |
| ESLint | 오류·경고 0 |
| Vitest | 8 files, 31 tests 통과 |
| FSD architecture | 역방향·private slice import 0건 |
| Production build | Vite build 성공, 1930 modules transformed |

## 미검증 범위

- 이번 Phase는 UI가 없으므로 browser·visual·keyboard 검증 대상이 아니다.
- 실제 다중 사용자 인증, PostgreSQL transaction, idempotency, 서버 audit는 Phase 2 이후 backend에서 재검증한다.
