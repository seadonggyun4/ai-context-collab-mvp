# Frontend

## 책임

React.js + TypeScript + Vite 기반 APC 모니터링 화면을 구현한다.

## 기준 문서

- `../../roles/publishing/Publishing.md`
- `../../roles/development/Development.md`
- `../../roles/planning/Planning.md`

## 디렉토리 경계

| 경로 | 책임 |
| --- | --- |
| `src/app` | 앱 진입, 라우팅, 전역 상태 |
| `src/features/monitoring` | 모니터링 탭 핵심 화면 |
| `src/features/data-lookup-integration` | 데이터 조회 연계 |
| `src/features/visualization-integration` | 시각화 연계 |
| `src/shared/api` | API client |
| `src/shared/components` | 공통 UI wrapper |
| `src/shared/constants` | enum label, 상태 우선순위 |
| `src/shared/styles` | Publishing 기준 token 적용 |
| `src/shared/utils` | 공통 formatter, mapper |

## 구현 상태

| Phase | 상태 | 내용 |
| --- | --- | --- |
| Phase 1 | 완료 | Vite React scaffold |
| Phase 2 | 완료 | 공통 TypeScript contract |
| Phase 5 | 완료 | Astryx + JADX_STATS 기준 APC 데이터 관리 UI shell |
| Phase 6 | 완료 | 모니터링 핵심 화면 API 연동 |
| Phase 7 | 완료 | 데이터 조회/시각화 품질 경고 연계 |

## 실행

```bash
npm install
npm run dev
```

기본 개발 서버:

- `http://127.0.0.1:5173/`
