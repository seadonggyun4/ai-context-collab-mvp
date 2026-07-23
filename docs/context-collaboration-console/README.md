# Context Collaboration Console 문서 엔진

이 디렉토리는 조직의 기준 안에서 AI 변경 요청을 분석·검토·승인·검증하는 협업 콘솔의 단일 문서 엔진이다. 첫 관리 대상은 `apc-monitoring-mvp`이며, 제품 화면에는 제작 단계나 데모라는 표현을 노출하지 않는다.

## 문서 지도

| 경로 | 책임 |
| --- | --- |
| `Project_Context.md` | 제품 목적, 사용자, 범위, 불변 조건 |
| `Active_Context.md` | 현재 구현에 적용할 규범 문서 |
| `roles/` | 기획·퍼블리싱·개발·QA 상위 기준과 초기 Feature |
| `product/` | IA, 사용자 흐름, 도메인 모델, 요구사항 추적표 |
| `design/` | 레퍼런스, 토큰, 화면·반응형·카피 기준 |
| `engineering/` | 아키텍처, 계약, 구현 단계와 기술 경계 |
| `governance/` | YAML 기반 상태·권한·문서 스키마 |
| `AUTHORSHIP_AND_OWNERSHIP.md` | 문서엔진 콘솔의 저작자·권리자, 허가와 제외 범위 |
| `qa/` | 테스트 전략과 수용 기준 매트릭스 |
| `change-management/` | 이 프로젝트의 향후 변경 요청 진입점 |
| `evaluations/` | 대표 사용자 흐름의 반복 평가 기준 |

Phase 10 Release 기준은 `engineering/release-quality-gate.md`가 소유하며, 실행 명령과 수동/운영 evidence의 경계를 함께 정의한다.

저작권과 재사용 허가 경계는 `AUTHORSHIP_AND_OWNERSHIP.md`와 `governance/intellectual-property.yaml`이 소유한다. 이 고지는 문서엔진 콘솔 범위에만 적용되며 저장소의 다른 프로젝트나 제3자 구성요소로 확장하지 않는다.

## 구현 진입 순서

1. `Active_Context.md`와 `Project_Context.md`를 읽는다.
2. `product/requirements-traceability.md`에서 구현할 요구사항 ID를 선택한다.
3. 해당 역할 Feature와 `design/screen-specifications.md`를 확인한다.
4. `governance/*.yaml`을 타입·상태·권한의 기계 기준으로 사용한다.
5. `engineering/implementation-plan.md`의 Phase와 `qa/test-matrix.md`를 함께 수행한다.
6. release 전 `engineering/release-quality-gate.md`의 정적→unit→build→browser 순서를 통과한다.

실행 코드 위치는 `../../projects/context-collaboration-console/`, API 위치는 `../../projects/context-collaboration-console-api/`다.
