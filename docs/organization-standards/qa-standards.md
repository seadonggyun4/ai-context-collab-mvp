# QA Standards

## 목적

QA 문서는 구현 결과가 Project Context, Planning, Publishing, Development 문서의 기준을 실제로 만족하는지 확인하는 검증 기준 문서다.

## 작성 원칙

- Project Context의 목적, 사용자, 핵심 요구사항을 우선 확인한다.
- Planning 문서의 화면 흐름, 예외 처리, 완료 기준을 테스트 케이스로 변환한다.
- Publishing 문서의 디자인 시스템, 상태 표시, 반응형, 접근성 기준을 확인한다.
- Development 문서의 API 계약, 데이터 타입, 오류 처리, 테스트 정책을 확인한다.
- 변경 사항이 있으면 impact-analysis 문서와 연결한다.
- 현재 변경 요청의 Change Manifest에 테스트 대상, 실행 방법, 결과, 증거 위치, 미실행 범위를 기록한다.
- 실행하지 않은 검증은 통과로 표시하지 않으며 `NOT_EXECUTED`, 정적 검토만 수행한 경우 `STATIC_REVIEW_ONLY`로 구분한다.
- 구현 후 파일이 다시 변경되면 이전 QA 판정을 현재 변경의 근거로 재사용하지 않는다.
- 검증 단위마다 `change-management/templates/verification-evidence-template.md`의 필수 필드를 사용한다.
- screenshot, log, trace가 실제로 없으면 경로가 있다고 기록하지 않는다.
- QA와 Impact Analysis는 프로젝트 기준을 결정하는 문서가 아니라 구현 결과를 설명하는 증거와 이력이다.

## 필수 항목

- QA 범위
- 참조 문서
- 기능 검증 체크표
- UI/퍼블리싱 검증 체크표
- API/데이터 검증 체크표
- 예외/권한 검증 체크표
- 회귀 테스트 체크표
- 미해결 이슈
- 실행 증거와 미실행 항목
- 검증 대상 변경 상태와 Self-Review 연결
- Target, Changed files, Test command, Exit code, Result
- Screenshot/log path, Not executed, Known limitations, Self-review verdict
