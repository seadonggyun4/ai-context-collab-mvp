# Development Phase Plan

| Phase | 목표 | 산출물 | 완료 기준 |
| --- | --- | --- | --- |
| 0 | 개발 작업공간 생성 | `app/` 구조, 영역별 README, architecture 문서 | 구현물 위치와 경계가 명확하다 |
| 1 | 프로젝트 스캐폴딩 | Vite React, FastAPI, Vercel 기본 파일 | 로컬 실행 준비가 가능하다 |
| 2 | 공통 타입/API 계약 | TypeScript type, Pydantic schema | 문서의 enum/API 계약이 코드화된다 |
| 3 | Fixture Repository | deterministic fixture, mock repository | API가 일관된 시연 데이터를 반환한다 |
| 4 | FastAPI Monitoring API | `/api/monitoring/*` endpoint | 개발 feature 문서의 API가 동작한다 |
| 5 | UI Shell | APC 데이터 관리 탭 구조 | Publishing 기준의 기본 화면이 열린다 |
| 6 | Monitoring Core | 홈, 수신, 품질, 파이프라인, 조치, 기준 설정 | 신규 모니터링 흐름이 연결된다 |
| 7 | Existing Menu Integration | 데이터 조회/시각화 품질 경고 | 기존 기능을 막지 않고 경고가 붙는다 |
| 8 | QA Verification | QA 체크 결과 | feature별 체크표가 검증된다 |
| 9 | Impact Analysis Update | 변경 영향 문서 | 구현 중 변경 영향이 기록된다 |
| 10 | Vercel Deploy Prep | build/deploy config | 배포 가능한 MVP가 된다 |

## 현재 상태

- 완료: Phase 0, Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9
- 다음: Phase 10 Vercel Deploy Prep
