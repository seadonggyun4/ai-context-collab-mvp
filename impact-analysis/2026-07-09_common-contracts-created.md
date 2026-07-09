# 2026-07-09 공통 타입/API 계약 구현 영향 분석

## 변경 요약

Development 문서의 공통 타입과 API 계약을 코드로 구현했다.

추가된 구현:

- Backend Pydantic enum/schema
- Frontend TypeScript type/interface
- Frontend label/status priority map
- Monitoring endpoint path constants
- Shared contract 문서
- Schema alias test

## 변경 원인

프론트와 백엔드가 서로 다른 필드명, enum, 상태 라벨을 사용하면 이후 화면/API 구현에서 문맥이 어긋난다. Phase 2에서는 기능 구현 전에 공통 언어를 먼저 고정한다.

## 영향 문서

| 문서 | 영향 |
| --- | --- |
| `Project_Context.md` | Phase 2 변경 이력 추가 |
| `app/docs/phase-plan.md` | 현재 상태를 Phase 2 완료로 갱신 |
| `app/shared/contracts/monitoring-contract.md` | 공통 계약 추가 |
| `roles/development/Development.md` | 코드가 문서의 enum/API 계약을 구현하기 시작함 |

## 기획 영향

- 메뉴 구조와 사용자 흐름 변경 없음
- Planning 문서의 상태 정의가 enum과 라벨로 코드화됨

## 퍼블리싱 영향

- 상태 라벨과 우선순위가 프론트 상수로 분리됨
- 실제 시각 스타일 적용은 Phase 5 이후 진행

## 개발 영향

- `/api/monitoring/*` endpoint 구현 전에 response schema가 준비됨
- fixture repository는 이 schema를 통과하는 데이터만 반환해야 함
- 프론트 API client는 `monitoringEndpoints.ts`를 통해 endpoint path를 참조함

## QA 영향

- QA는 TypeScript/Pydantic contract가 Development 문서의 enum과 일치하는지 확인할 수 있음
- feature QA는 Phase 3 이후 fixture data와 함께 더 구체화됨

## 리스크

- TypeScript type과 Pydantic schema는 수동으로 병렬 관리되므로, 추후 변경 시 drift가 생길 수 있음
- frontend 의존성은 아직 설치하지 않아 TypeScript typecheck는 실행하지 않음

## 후속 조치

- Phase 3에서 deterministic fixture를 추가하고 Pydantic schema 검증을 통과하게 한다.
- Phase 4에서 monitoring router가 schema response를 반환하게 한다.
- 계약 변경 시 impact-analysis 문서를 추가한다.
