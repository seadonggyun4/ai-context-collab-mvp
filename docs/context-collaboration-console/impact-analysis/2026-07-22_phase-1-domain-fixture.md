# Phase 1 도메인·Fixture 영향 분석

- Change ID: `CR-2026-004`
- 상태: 구현·검증 완료

## 영향 요약

| 노드 | 실제 영향 |
| --- | --- |
| Domain | 9개 entity slice와 불변 aggregate command/result 계약 추가 |
| Workflow | YAML 10개 상태·transition·4개 guard group·3개 forbidden rule 반영 |
| Permission | 4개 role inheritance, 15개 permission, self/high-risk/activation/rejected constraint 반영 |
| Approval | proposal revision과 내용 전체 scope fingerprint로 승인 범위 고정 |
| Verification | QA scenario별 current implementation revision evidence만 완료 판정에 사용 |
| Activation | admin command에서 ContextVersion·AuditEvent 동시 생성 |
| Fixture | `apc-monitoring-mvp`의 `CR-DEMO-001` 결정론적 aggregate 제공 |
| QA | YAML 계약과 정상·반례를 포함해 전체 31 tests로 확대 |

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| YAML과 TypeScript 정책 drift | YAML parser 기반 양방향 값 비교 test를 release gate에 포함 |
| 승인 후 문구만 바꿔 기존 승인 재사용 | ID뿐 아니라 수용 기준·영향·파일·위험·QA 내용을 canonical fingerprint에 포함 |
| 구현 변경 뒤 오래된 evidence 재사용 | implementation revision 증가와 selector 격리 |
| demo self approval이 일반 요청에 노출 | project/change ID를 함께 확인하는 명시적 fixture 예외 |
| UI에서 상태를 임의 변경 | aggregate를 readonly로 제공하고 순수 command에서만 새 aggregate 반환 |
| client 권한을 운영 보안으로 오인 | Phase 2 backend에서 동일 정책을 재강제하도록 이식 경계 문서화 |

## 비영향 영역

- route, 화면 구성, 스타일, theme 동작은 변경하지 않았다.
- APC 원 프로젝트의 코드와 문서는 변경하지 않았다.
- Git write, 실제 AI 실행, 인증, database persistence는 아직 구현하지 않았다.

## 실행 증거

- strict TypeScript와 ESLint 오류 0
- Vitest 8 files, 31 tests 통과
- FSD dependency/Public API 검사 통과
- production build 성공, 1930 modules transformed
