# DF-012 Free Render and Ownership Boundary

## 구현 계약

- `render.yaml`은 Static Site·Web Service·Postgres·Key Value를 free 자원으로만 구성한다.
- Preview 생성, paid plan, persistent disk, paid-only pre-deploy command를 포함하지 않는다.
- 단일 free API start command가 migration 성공 후에만 Uvicorn을 실행한다.
- OIDC production 코드는 보존하되 활성 초기 배포 profile에서는 인증을 요구하지 않는다.
- 독점 라이선스 표시는 두 console package와 전용 docs에만 적용한다.
- package metadata, entrypoint notice, web metadata, UI footer, governance YAML과 contract test가 같은 권리자·scope를 사용한다.

## 변경 금지

- repository root 또는 APC·organization standards에 포괄 LICENSE를 추가하지 않는다.
- 제3자 dependency·상표·콘텐츠를 서동균의 소유물로 표시하지 않는다.
- 무료 초기 배포 결과를 Phase 9 production/PITR 완료로 승격하지 않는다.
