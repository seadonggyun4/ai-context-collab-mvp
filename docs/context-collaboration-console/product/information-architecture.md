# Information Architecture

## 전역 구조

```text
Context Console
├── Overview                 # 프로젝트 대시보드
├── Changes
│   ├── All requests
│   ├── Request detail
│   ├── Impact
│   └── Review & verification
├── Context
│   ├── Active context
│   ├── Planning
│   ├── Publishing
│   ├── Development
│   ├── QA
│   └── Organization rules
├── Evidence
│   ├── QA runs
│   └── Evaluation history
└── Project settings
```

## Route 계약

| Route | 화면 | Primary object | Primary action |
| --- | --- | --- | --- |
| `/` | 메인 진입 | 제품 가치와 실제 workflow | 프로젝트 열기 |
| `/projects/apc-monitoring-mvp` | Overview | Project health | 변경 요청 등록 |
| `/changes` | 변경 요청 목록 | Change request | 필터·요청 열기 |
| `/changes/new` | 자연어 요청 | Request draft | 분석 요청 |
| `/changes/:id` | 요청 상세 | Change proposal | 검토 시작 |
| `/changes/:id/impact` | 영향 분석 | Impact graph | 노드 상세 확인 |
| `/changes/:id/review` | 승인·검증 | Review package | 승인·반려·수정 요청 |
| `/context` | Context 브라우저 | Document registry | 역할·상태 필터 |
| `/context/:documentId` | 문서 상세 | Document | 구조화 보기·원본 보기 |

## Navigation 원칙

- 마케팅형 메인은 별도 진입 화면으로 두되 로그인 후 운영 shell과 혼합하지 않는다.
- 운영 shell은 좌측 navigation, 상단 project/context scope, 중앙 workspace를 기본으로 한다.
- 요청 상세 내부는 Summary → Impact → Documents → Review → Evidence의 task-local navigation을 사용한다.
- breadcrumb는 hierarchy가 2단계를 넘을 때만 제공한다.
