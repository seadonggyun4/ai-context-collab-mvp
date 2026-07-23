# Phase 3 메인·프로젝트 대시보드 영향 분석

- Change ID: `CR-2026-007`
- 상태: 구현·검증 완료

## 영향 요약

| 노드 | 실제 영향 |
| --- | --- |
| Product | `REQ-DASH-001`~`005`의 화면 수용 기준을 실제 read model 필드로 고정 |
| Entity | Project core와 dashboard projection 분리, 비동기 repository 결과 계약 추가 |
| Adapter | deterministic fixture와 HTTP transport/runtime validation 구현 |
| Page | landing·project overview는 상태 처리와 widget 조합만 소유 |
| Widget | main product proof, metric strip, active changes, attention, artifacts, alignment, QA timeline |
| Styling | semantic token 기반 light/dark·1280/1024/768/390 responsive composition |
| QA | repository contract, adapter mapping/error, requirement, route, responsive browser 검증 |

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| backend 미구현 dashboard endpoint를 연결 완료로 오인 | HTTP adapter contract만 구현하고 기본 data source는 fixture로 유지, 미지원 API는 명시적 오류 표시 |
| route page에 UI 전용 mock 재발 | repository fixture로 단일화하고 architecture/route test에서 표면 요구사항 검증 |
| dashboard가 같은 형태의 카드 집합으로 변질 | metric strip·table·queue·timeline·관계 preview를 서로 다른 정보 구조로 구성 |
| 모바일 table 정보 손실 | 390px에서 request/status를 우선하고 위험·담당·시각을 행 metadata로 재배치 |
| dark mode 상태 의미 약화 | semantic status token과 텍스트 label을 함께 사용하고 실제 브라우저에서 양 theme 확인 |

## 비영향 영역

- Phase 1 workflow command·guard는 변경하지 않는다.
- Phase 2 backend Project/Document API와 Render Blueprint는 변경하지 않는다.
- APC monitoring application의 기능 코드는 변경하지 않는다.

## 실행 증거

- typecheck, ESLint 오류 0
- Vitest 10 files/38 tests와 production build 통과
- FSD architecture/Public API 위반 0건
- HTTP success/404/non-2xx/network/invalid schema 계약 통과
- 1280/1024/768/390px 페이지 overflow 0건
- light/dark 실제 화면에서 상태 label·focus·정보 구조 유지
- 브라우저 console error/warning 0건
