# QA Context

## 검증 원칙

- 요구사항 ID, 상태 전이, 화면 관찰 결과, 증거를 연결한다.
- 성공 경로만이 아니라 승인 전 우회, 검증 실패, stale Context, 권한 없음 반례를 우선 확인한다.
- 디자인 금지 패턴은 취향이 아니라 명시적 실패 기준이다.
- 자동 테스트와 브라우저 수동 확인을 별도 결과로 기록한다.

## 기준 문서

- `../../Project_Context.md`
- `../../../organization-standards/qa-standards.md`
- `../../qa/test-strategy.md`
- `../../qa/test-matrix.md`
- `../../engineering/release-quality-gate.md`

## 완료 판정

- P0 테스트 실패 0건
- 승인·권한·완료 게이트 우회 0건
- 주요 breakpoint와 키보드 흐름 검증
- 금지 카피와 금지 시각 패턴 0건
- 미검증 항목과 fixture 한계를 공개
- 자동 accessibility 결과와 screen reader/field performance 미실행을 구분
