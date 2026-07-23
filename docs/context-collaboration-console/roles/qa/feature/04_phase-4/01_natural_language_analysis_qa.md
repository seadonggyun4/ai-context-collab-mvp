# QF-005 Natural Language Analysis QA

## P0 시나리오

| Test | 검증 |
| --- | --- |
| QA-CHANGE-01 | 입력 원문, 뒤로가기/session draft, 완료 outcome 원문이 byte-equivalent |
| QA-CHANGE-02 | 요약·수용 기준·역할·화면·API·데이터·파일·QA 표시 |
| QA-CHANGE-03 | confidence, unknowns, clarification 표시 |
| QA-CHANGE-04 | 진행 단계, 실패, 원문 유지, retry 성공 |
| QA-CHANGE-IDEMPOTENCY | 같은 key의 start/retry가 같은 job/attempt를 반환 |
| QA-CHANGE-HTTP | URL, header, payload, status/schema/network 오류 계약 |

## 공통 Gate

- FSD dependency/Public API
- loading/empty/error/not-found
- keyboard focus와 `aria-live` 분석 상태
- 1280/768/390px 및 light/dark
- 제품 표면 금지 카피·시각 패턴 0건

## 실행 결과

| 검사 | 결과 |
| --- | --- |
| QA-CHANGE-01 | raw 원문, remount draft, outcome 원문 일치 |
| QA-CHANGE-02 | 요약·수용 기준·역할·화면·API·데이터·파일·QA 표시 |
| QA-CHANGE-03 | confidence·unknown·clarification 표시 |
| QA-CHANGE-04 | 4단계 진행, fixture 실패, 원문 유지, attempt 2 retry 성공 |
| Idempotency | duplicate start/retry 동일 job·attempt 반환 |
| HTTP contract | start/poll/retry/detail URL·header·payload와 오류 반례 통과 |
| TypeScript/ESLint | 오류·경고 0 |
| Vitest | 13 files, 45 tests 통과 |
| FSD architecture | 역방향·private import 0건 |
| Production build | 성공, 1960 modules transformed |
| Browser | 1280/768/390px, light/dark, success/failure/retry/reload 통과 |
| Browser console | error/warning 0건 |

## 브라우저 조정 이력

- 모바일 긴 제목의 글자 단위 줄바꿈을 `keep-all` 기반으로 수정했다.
- 모바일 impact source path가 잘리지 않도록 전체 경로 wrap을 허용했다.
- `요청 수정`은 draft가 복원되는 new-change route, `검토 시작`은 수용 기준 anchor로 연결해 dead control을 제거했다.

## 미검증 범위

- 실제 backend queue, LLM 호출, prompt version, multi-user persistence는 구현하지 않았다.
- Render HTTP smoke와 server idempotency transaction은 analysis endpoint 구현 후 검증한다.
