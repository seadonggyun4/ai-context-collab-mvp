# AI Context Collaboration MVP

## 1. APC(농산물산지유통센터) 모니터링 서비스란

APC(농산물산지유통센터) 모니터링 서비스는 각 산지유통센터에서 들어오는 농산물 데이터의 수신, 정제, 적재, 조회 가능 상태를 운영자가 한 흐름에서 확인하도록 만든 서비스입니다.

이 MVP에서는 남원, 위미, 서귀, 중문, 구좌 APC의 감귤/당근 입고 및 선별 데이터를 기준으로 다음 상태를 보여줍니다.

- 데이터가 정상적으로 들어왔는지
- 수신이 지연되었거나 누락되었는지
- 필수값 누락, 형식 오류, 중복 의심 같은 품질 이슈가 있는지
- API 수신부터 화면 표시까지 어느 단계에서 문제가 발생했는지
- 운영자가 어떤 조치를 남겼고 이후 상태가 어떻게 이어졌는지

즉, 단순한 차트 대시보드가 아니라 APC 데이터가 오늘 업무 판단에 믿고 쓸 수 있는 상태인지 확인하는 운영 모니터링 서비스입니다.

## 2. 이 MVP의 목적

이 프로젝트의 핵심 목적은 AI로 코드를 빠르게 만드는 것을 보여주는 데 있지 않습니다.

목적은 기획, 퍼블리싱, 개발, QA가 같은 프로젝트 문맥을 공유하고, 변경 사항이 생겼을 때 각 직군의 문서와 구현 기준이 함께 갱신되는 협업 구조를 시연하는 것입니다.

따라서 이 저장소는 두 가지 결과물을 함께 가집니다.

- 실행 가능한 APC 모니터링 MVP 앱
- 앱이 만들어지는 과정과 기준을 설명하는 역할별 Context 문서

실행 앱은 결과물이고, `Project_Context.md`, `roles/`, `organization-standards/`, `impact-analysis/`는 그 결과물이 어떤 기준과 흐름으로 만들어졌는지 보여주는 협업 엔진입니다.

## 3. Role 구조와 흐름

모든 역할 문서는 `Project_Context.md`를 기준으로 움직입니다. 각 역할은 독립 문서를 갖지만 따로 흩어져 판단하지 않고, 상위 문맥과 서로의 산출물을 참조합니다.

```text
Organization Standards
├── Planning Standards
├── Publishing Standards
├── Development Standards
└── QA Standards

        ↓

Project_Context.md
Single Source of Truth

        ↓

roles/
├── planning/
│   ├── Planning.md
│   └── feature/
│       ├── 00_initial/
│       ├── 01_after_first_qa/
│       ├── 02_after_second_qa/
│       └── 03_after_third_qa/
├── publishing/
│   ├── Publishing.md
│   └── feature/
│       ├── 00_initial/
│       ├── 01_after_first_qa/
│       ├── 02_after_second_qa/
│       └── 03_after_third_qa/
├── development/
│   ├── Development.md
│   └── feature/
│       ├── 00_initial/
│       ├── 01_after_first_qa/
│       ├── 02_after_second_qa/
│       └── 03_after_third_qa/
└── qa/
    ├── QA.md
    ├── feature/
    └── qa-results/

        ↓

app/
실행 가능한 MVP 구현물

        ↓

QA 결과 및 변경 영향 분석
├── roles/qa/qa-results/
├── roles/{planning,publishing,development}/feature/{qa-cycle}/
└── impact-analysis/
```

역할별 흐름은 다음과 같습니다.

1. 기획은 사용자의 업무 흐름, 메뉴, 예외 상황, 화면 행동을 정의합니다.
2. 퍼블리싱은 기획 feature가 화면에서 어떤 시각 기준과 컴포넌트 정책으로 표현되어야 하는지 정의합니다.
3. 개발은 Project Context, 기획 feature, 퍼블리싱 feature를 모두 참조해 구현 task와 API/상태/데이터 흐름을 확정합니다.
4. QA는 구현 결과가 각 역할 문서의 기준을 충족하는지 검증합니다.
5. QA에서 실패하거나 보완이 필요한 항목은 다시 역할별 feature 문서로 생성되고, 다음 구현 phase의 입력이 됩니다.

이 구조의 핵심은 QA 결과가 별도 보고서로 끝나지 않는다는 점입니다. QA가 늘어날수록 역할별 feature 문서와 변경 영향 분석이 함께 쌓이고, 프로젝트의 의사결정 히스토리가 한 문맥 안에서 이어집니다.

사용자가 화면을 보고 수정 요청을 하는 경우도 같은 흐름을 탑니다. AI는 바로 코드를 고치지 않고, 먼저 수정 요청이 기획, 퍼블리싱, 개발, QA 중 어느 역할에 영향을 주는지 분류합니다. 그 다음 최신 numbered cycle의 역할별 feature 문서를 생성하고, QA 체크표와 변경 영향 분석을 연결한 뒤 구현합니다. 그래서 작은 UI 수정도 “왜 바뀌었는지, 어느 역할 기준이 바뀌었는지, 어떻게 검증했는지”가 히스토리로 남습니다.

## 실행 앱

- Vercel: https://ai-context-collab-mvp.vercel.app/
- 앱 소스: `app/`
- 프론트엔드: React.js + TypeScript + Vite
- 백엔드: Python FastAPI
- 데이터: deterministic fixture 기반 MVP 데이터

## 주요 문서

- `Project_Context.md`: 프로젝트의 단일 기준 문서
- `roles/planning/Planning.md`: 기획 기준 문서
- `roles/publishing/Publishing.md`: 퍼블리싱 기준 문서
- `roles/development/Development.md`: 개발 기준 문서
- `roles/qa/QA.md`: QA 기준 문서
- `impact-analysis/`: 변경 영향 분석 이력
