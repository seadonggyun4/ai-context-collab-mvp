# DF-002 Domain and Fixture

## 구현 계약

- FSD `entities`의 각 slice는 `index.ts` Public API만 외부에 제공한다.
- aggregate 변경은 `addProposalRevision`, `recordReview`, `recordEvidence`, `transitionChange` 순수 command로만 수행한다.
- command는 예외를 던지는 대신 `DomainResult<T>`와 안정적인 error code를 반환한다.
- workflow state, guard requirement, forbidden rule, role inheritance, permission, document enum은 governance YAML과 계약 테스트로 동기화한다.
- 승인 범위는 proposal revision과 수용 기준·영향·파일·위험·QA 전체 fingerprint로 고정한다.
- 구현 revision 증가 후 이전 evidence는 이력으로 보존하되 완료 판정에는 사용할 수 없다.
- 활성화는 관리자, 새 ContextVersion, 문서 목록, actor audit가 모두 있을 때만 성공한다.

## Entity 소유 경계

| Slice | 소유 범위 |
| --- | --- |
| `project` | Project core와 dashboard read model |
| `change-request` | aggregate, 상태 정책, command, guard, selector, APC fixture |
| `proposal` | acceptance criteria, affected file, QA scenario, scope fingerprint |
| `document` | metadata/status/type/relation 계약 |
| `impact` | 영향 node/edge와 검토 가능 상태 |
| `review` | actor/role/permission과 review decision |
| `evidence` | automated/manual evidence와 result |
| `context-version`, `audit` | 활성 Context와 mutation 증거 |

## Backend 이식 경계

- frontend 구현은 데모의 결정론적 정책 엔진이며 운영 권한의 source of truth가 아니다.
- Phase 2 이후 FastAPI는 같은 상태·permission·error code를 서버에서 다시 강제한다.
- HTTP adapter는 entity command 계약을 유지하고 저장·인증·idempotency만 서버 책임으로 대체한다.

## 완료 증거

- Change: `CR-2026-004`
- Impact: `impact-analysis/2026-07-22_phase-1-domain-fixture.md`
- QA: `roles/qa/feature/01_phase-1/01_domain_fixture_qa.md`
