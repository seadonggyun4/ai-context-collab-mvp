# CR-2026-015 무료 Render 초기 배포·소유권 경계

## 변경 요청

- Render `imugi` workspace에서 결제 수단 없이 초기 시연 환경을 배포한다.
- 문서엔진 콘솔의 원본 프론트엔드·백엔드·전용 문서에 서동균의 저작자·권리자 지위와 All Rights Reserved를 다층으로 표시한다.
- APC 프로젝트, 회사 공용 규칙, 제3자 자산에는 해당 소유권 주장을 확장하지 않는다.

## 결정

1. Render Static Site, Web Service, PostgreSQL, Key Value는 모두 무료 플랜만 사용한다.
2. 유료 Preview Environment와 Service Preview를 비활성화한다.
3. 무료 Web Service에서 지원하지 않는 `preDeployCommand` 대신 단일 인스턴스 start command에서 Alembic migration과 idempotent 시연 seed를 실행한다.
4. 초기 배포는 `APP_ENV=preview`, frontend auth off로 동작하며 OIDC secret을 요구하지 않는다.
5. 무료 PostgreSQL 30일 만료, Key Value 비영속, API idle spin-down을 명시적으로 수용한다.
6. 패키지별 `LICENSE`·`NOTICE`, package metadata, entrypoint SPDX, 웹 메타·푸터, 문서·YAML 정책을 함께 적용한다.

## 수용 기준

- `render.yaml`에 `starter`, `basic-256mb`, `previewPlan`, paid pre-deploy가 없다.
- 첫 API 기동 후 APC 프로젝트와 대표 변경 workflow가 중복 없이 조회된다.
- Render CLI의 `imugi` workspace validation이 결제 정보 없이 `valid: true`를 반환한다.
- 프론트엔드·백엔드의 라이선스 파일과 metadata가 서동균 및 독점 라이선스를 가리킨다.
- 적용·제외 경계를 자동 계약 테스트가 검증한다.
- 전체 quality gate가 통과하고 실제 Blueprint 생성 전 비용 발생 자원이 0개임을 재확인한다.

## 위험·제약

- 무료 데이터베이스는 30일 후 만료되고 백업/PITR이 없다.
- 무료 Key Value 재시작 시 session/rate state가 소실될 수 있다.
- 무료 API cold start는 회의 시연 흐름을 지연시킬 수 있다.
- 저작권 고지는 증거와 허가 경계를 강화하지만 근로계약·취업규칙·업무상저작물 판단을 자동 배제하지 않는다.
