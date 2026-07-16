# Verification Evidence Template

각 테스트 또는 검증 단위마다 아래 block을 기록한다. 필드를 생략하지 않으며 증거가 없으면 `없음`이라고 명시한다.

## Verification Evidence: EVID-NNN

- Target:
- Changed files:
- Test command:
- Exit code:
- Result: `PASSED | FAILED | PARTIALLY_VERIFIED | STATIC_REVIEW_ONLY | NOT_EXECUTED | NOT_APPLICABLE`
- Screenshot/log path:
- Not executed:
- Known limitations:
- Self-review verdict:

## 기록 규칙

1. 테스트 명령을 실제로 실행하고 성공한 경우에만 `PASSED`를 사용한다.
2. 실행하지 않은 항목은 `NOT_EXECUTED`다.
3. 문서나 코드를 눈으로만 검토했다면 `STATIC_REVIEW_ONLY`다.
4. 계획한 검증 중 일부만 확인했다면 `PARTIALLY_VERIFIED`다.
5. 변경 후 다시 테스트하지 않았다면 이전 결과를 현재 변경의 증거로 재사용하지 않는다.
6. 스크린샷, 로그, trace 파일이 실제로 없으면 경로가 있다고 주장하지 않는다.
7. `Exit code`가 없는 수동 검토는 `없음 — 수동 검토`로 기록한다.
8. `Changed files`는 검증 당시 실제 변경 목록을 기준으로 한다.
9. Self-review verdict는 Evidence의 사실성을 재확인한 결과이지 테스트 결과를 바꾸는 필드가 아니다.

