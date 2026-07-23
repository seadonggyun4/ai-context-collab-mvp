# Change Management

이 프로젝트의 모든 후속 요청은 `active/CR-YYYY-NNN_short-title.md`에서 시작한다.

## 상태

문서 작업 상태는 `REQUESTED → CONTEXT_CONFIRMED → PLANNED → DEVELOPMENT_READY → IMPLEMENTED → QA_COMPLETED → SELF_REVIEWED → COMPLETED`를 사용한다.

제품이 관리하는 사용자 변경 상태는 별개이며 `../governance/workflow-policy.yaml`을 따른다. 두 상태 모델을 합치지 않는다.

## 필수 기록

- 원 요청과 합의된 해석
- Active Context snapshot
- 수용 기준과 requirement ID
- 역할·문서·화면·API·데이터·코드·QA 영향
- 위험과 승인 요구
- 계획과 실제 변경 차이
- 실행 증거와 미검증 범위
- Self-Review와 완료 판정

공통 템플릿 원본은 `../../apc-monitoring-mvp/change-management/templates/`를 재사용한다. 프로젝트별 복사본을 만들지 않는다.
