# 무료 Render 초기 배포·소유권 변경 영향 분석

| 영역 | 영향 |
| --- | --- |
| Render | 전 자원 free, preview off, migration start gate, OIDC 없는 preview runtime |
| Frontend | auth off HTTP adapter, package legal metadata, 웹 author/copyright, visible footer |
| Backend | free Postgres/Key Value, proprietary package metadata, source entrypoint notice |
| Documents | 무료 제약·운영 전환 경계와 지식재산 적용/제외 범위 활성화 |
| QA | Blueprint 비용 반례, preview 금지, license scope·metadata 계약 추가 |

## 회귀 위험

- production OIDC fail-closed 코드는 유지되지만 이번 Render profile에서는 실행되지 않는다.
- migration을 start command로 옮기므로 여러 인스턴스로 확장하기 전 paid pre-deploy로 복귀해야 한다.
- 무료 DB 만료 또는 KV 재시작 후 상태 복구가 불가능하므로 시연 데이터만 저장한다.
- 저작권 범위를 저장소 전체로 오인하지 않도록 APC·공용 규칙·제3자 자산 제외를 반복 검증한다.
