# Active Context Registry

## 문서 메타데이터

| 항목 | 값 |
| --- | --- |
| status | `ACTIVE` |
| scope | Context Collaboration Console 구현의 활성 기준 |
| approved_by | 사용자 요청 |
| effective_at | `2026-07-23` |
| supersedes | 없음 |

## 권위 순서

1. 현재 사용자 요청
2. `../organization-standards/`의 회사 공용 규칙
3. `Project_Context.md`
4. `governance/*.yaml`의 구조화 계약
5. 역할 상위 문서와 초기 Feature
6. 제품·디자인·개발·QA 상세 문서
7. 실제 코드와 테스트 증거

## 활성 문서

| 문서 | status | 적용 범위 |
| --- | --- | --- |
| `../organization-standards/digital-product-ui-standards.md` | `ACTIVE` | 공용 UI·UX·카피 금지 및 품질 기준 |
| `../organization-standards/planning-standards.md` | `ACTIVE` | 기획 산출물 기준 |
| `../organization-standards/publishing-standards.md` | `ACTIVE` | 퍼블리싱 산출물 기준 |
| `../organization-standards/development-standards.md` | `ACTIVE` | 개발 산출물 기준 |
| `../organization-standards/qa-standards.md` | `ACTIVE` | QA와 증거 기준 |
| `Project_Context.md` | `ACTIVE` | 제품 목적과 불변 조건 |
| `roles/planning/Planning.md` | `ACTIVE` | 사용자·업무 흐름 기준 |
| `roles/publishing/Publishing.md` | `ACTIVE` | 시각·상호작용 기준 |
| `roles/development/Development.md` | `ACTIVE` | 구현·계약 기준 |
| `roles/qa/QA.md` | `ACTIVE` | 검증·완료 기준 |
| `governance/document-schema.yaml` | `ACTIVE` | 문서 메타데이터와 관계 계약 |
| `governance/workflow-policy.yaml` | `ACTIVE` | 변경 상태 전이 계약 |
| `governance/permissions.yaml` | `ACTIVE` | 역할·행동 권한 계약 |
| `engineering/frontend-decisions.md` | `ACTIVE` | FSD·스타일링·theme mode 기술 결정 |
| `product/backend-requirements.md` | `ACTIVE` | backend 사용자 기능·운영 요구사항 |
| `engineering/backend-development-plan.md` | `ACTIVE` | backend 기술 스택·모듈·단계 계획 |
| `engineering/render-deployment.md` | `ACTIVE` | Render 통합 배포·환경·운영 계약 |
| `AUTHORSHIP_AND_OWNERSHIP.md` | `ACTIVE` | 문서엔진 콘솔 저작자·권리자 및 적용/제외 범위 |
| `governance/intellectual-property.yaml` | `ACTIVE` | 소유권·허가·제3자 제외의 기계 판독 계약 |
| `design/document-editor.md` | `ACTIVE` | Markdown/YAML 편집기 UX·테마 계약 |
| `roles/development/feature/03_phase-3/01_main_project_dashboard.md` | `ACTIVE` | Dashboard read model·adapter·FSD 구현 계약 |
| `roles/qa/feature/03_phase-3/01_main_project_dashboard_qa.md` | `ACTIVE` | SCR-01~02·REQ-DASH·responsive 검증 증거 |
| `roles/development/feature/04_phase-4/01_natural_language_analysis.md` | `ACTIVE` | AnalysisJob·idempotency·adapter·FSD 구현 계약 |
| `roles/qa/feature/04_phase-4/01_natural_language_analysis_qa.md` | `ACTIVE` | SCR-03~04·REQ-CHANGE·실패/retry 검증 증거 |
| `roles/development/feature/07_phase-7/01_review_verification.md` | `ACTIVE` | ReviewWorkspace·RBAC·evidence·audit·gate 구현 계약 |
| `roles/qa/feature/07_phase-7/01_review_verification_qa.md` | `ACTIVE` | SCR-08·REQ-REVIEW·REQ-VERIFY·서버 권한 검증 증거 |
| `roles/development/feature/08_phase-8/01_git_context_activation.md` | `ACTIVE` | Git publication port·revision lock·ContextVersion·SCR-09 구현 계약 |
| `roles/qa/feature/08_phase-8/01_git_context_activation_qa.md` | `ACTIVE` | SCR-09·REQ-VERIFY-003·sandbox Git·활성화 검증 증거 |
| `roles/development/feature/09_phase-9/01_production_operations.md` | `ACTIVE` | OIDC·session·rate limit·observability·production 배포 구현 계약 |
| `roles/qa/feature/09_phase-9/01_production_operations_qa.md` | `ACTIVE` | 인증·운영·Blueprint·smoke·복구 검증 계약 |
| `engineering/production-runbook.md` | `ACTIVE` | release·관찰·rollback·PITR·secret rotation 운영 절차 |
| `change-management/active/CR-2026-014_phase-10-release-quality.md` | `ACTIVE` | Phase 10 품질·Release Gate 변경 기준 |
| `engineering/release-quality-gate.md` | `ACTIVE` | 접근성·반응형·시각·정책·성능 Gate 계약 |
| `roles/development/feature/10_phase-10/01_release_quality_gate.md` | `ACTIVE` | 공통 상태와 자동 품질 도구 구현 계약 |
| `roles/qa/feature/10_phase-10/01_release_quality_gate_qa.md` | `ACTIVE` | Phase 10 P0 Matrix와 증거 계약 |
| `change-management/active/CR-2026-015_free-render-and-ownership.md` | `ACTIVE` | zero-cost 초기 배포와 console-only 권리 경계 변경 |
| `roles/development/feature/11_free-render-ownership/01_free_render_ownership.md` | `ACTIVE` | free Blueprint·라이선스 다층 구현 계약 |
| `roles/qa/feature/11_free-render-ownership/01_free_render_ownership_qa.md` | `ACTIVE` | 비용·runtime·소유권 scope 회귀 검증 |

## 불변 규칙

- AI 분석 결과만으로 문서·코드·상태를 자동 적용하지 않는다.
- 승인 전에는 제안과 diff까지만 생성한다.
- 제품 표면에 `MVP` 또는 AI 과장 문구를 노출하지 않는다.
- 첫 관리 대상은 `apc-monitoring-mvp` 하나로 고정하되 데이터 구조는 프로젝트 확장을 막지 않는다.
- 원본 Markdown/YAML/Git 이력은 시스템의 감사 가능한 source of truth로 유지한다.
- 승인·검증·revision lock을 통과하기 전 Git write를 시작하지 않으며 Context 활성화는 current publication commit과 연결된 evidence를 요구한다.
- 프론트엔드 구조는 Feature-Sliced Design(FSD)의 `app/pages/widgets/features/entities/shared` 계층을 따른다.
- 스타일링은 Astryx의 제공 API와 제품 semantic CSS token을 우선하며 Tailwind CSS는 기본 의존성에 추가하지 않는다.
- 화면은 `system / light / dark` 테마를 제공하며 사용자 선택과 접근성 대비를 보존한다.
- 배포는 repository root의 Render Blueprint를 단일 배포 기준으로 사용한다.
- 초기 시연 배포는 결제 수단 없는 Render free profile과 preview off를 사용하며 유료 자원 생성은 별도 승인 없이는 금지한다.
- 문서엔진 콘솔의 독창적 소스와 전용 문서는 서동균의 독점 권리 주장 범위이며, APC·회사 공용 규칙·제3자 자산에는 이를 확장하지 않는다.
- Production 사용자 역할은 검증된 OIDC claim만 신뢰하고 provider token은 브라우저 저장소에 보관하지 않는다.
- Application rollback과 database recovery는 분리하며 어느 절차도 자동 destructive migration을 수행하지 않는다.
- 운영 문서 편집은 textarea가 아니라 CodeMirror 6 기반 Markdown/YAML editor를 사용하며 저장 전 schema·revision 검증을 거친다.
- data-bound 화면은 일곱 공통 상태를 사용하고 접근성·4개 viewport·시각·정책·성능 Gate를 통과하기 전 release하지 않는다.
