# 2026-07-23 Render fixture data source hotfix 영향 분석

| 영역 | 영향 |
| --- | --- |
| Frontend build | composition root가 HTTP adapter 대신 deterministic fixture adapter를 선택 |
| Backend | 코드·DB schema 변경 없음; API/DB 독립 smoke 유지 |
| Render | Static Site 재build만 필요; 자원 plan·region·URL 변경 없음 |
| QA | 메인·project·change·context route 렌더링과 API health를 분리 검증 |

## 제약

- 이 변경은 완전한 web→API 업무 통합을 의미하지 않는다.
- 사용자 행동은 시연 fixture 상태를 변경하며 새 build/브라우저 세션 경계를 넘어 운영 DB에 영구 보존된다고 주장하지 않는다.
- HTTP mode 전환은 미구현 endpoint, CORS credentials, authentication, schema contract의 동시 Release Gate를 필요로 한다.
