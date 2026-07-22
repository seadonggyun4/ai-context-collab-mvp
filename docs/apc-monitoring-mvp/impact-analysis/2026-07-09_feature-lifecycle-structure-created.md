# 2026-07-09 Feature Lifecycle 구조 개편 영향 분석

## 변경 요약

역할별 feature 문서를 QA cycle 기준으로 재구성했다.

기존에는 `roles/{part}/feature/*.md`에 초기 feature와 QA 이후 보완 feature가 함께 누적되었다. 이 구조는 시간이 지나면 “최초 범위”와 “QA 이후 추가 범위”가 섞여 히스토리 추적이 어려워진다.

변경 후 구조:

```text
roles/
├── planning/feature/
│   ├── 00_initial/
│   ├── 01_after_first_qa/
│   └── 02_after_second_qa/
├── publishing/feature/
│   ├── 00_initial/
│   ├── 01_after_first_qa/
│   └── 02_after_second_qa/
└── development/feature/
    ├── 00_initial/
    ├── 01_after_first_qa/
    └── 02_after_second_qa/
```

## 변경 원인

이 MVP의 핵심은 AI가 문서를 한 번 작성하는 것이 아니라, QA 결과와 변경 사항을 읽고 각 역할 문서를 계속 갱신하는 협업 구조를 보여주는 것이다.

따라서 feature 문서는 단순 번호 순서가 아니라 “어느 QA cycle에서 생긴 작업인가”를 보여야 한다.

## 이동된 문서

| 기존 성격 | 새 위치 |
| --- | --- |
| QA 이전 planning feature 01-06 | `roles/planning/feature/00_initial/` |
| 첫 QA 이후 planning 보완 feature 07-08 | `roles/planning/feature/01_after_first_qa/` |
| QA 이전 development feature 01-08 | `roles/development/feature/00_initial/` |
| 첫 QA 이후 development 보완 feature 09-12 | `roles/development/feature/01_after_first_qa/` |
| 첫 QA 이후 publishing 보완 feature 01 | `roles/publishing/feature/01_after_first_qa/` |

## 공통 메타데이터 추가

Planning, Publishing, Development feature 문서에 다음 공통 메타데이터를 추가했다.

| 항목 | 목적 |
| --- | --- |
| 소유 역할 | 어떤 파트가 책임지는 문서인지 명시 |
| 생성 시점 | 초기 feature인지 QA 이후 feature인지 명시 |
| QA Cycle | 어느 QA cycle과 연결되는지 명시 |
| 참조 QA 결과 | QA 이후 feature의 원천 결과 문서 연결 |
| 생성 근거 | Project Context 또는 QA open issue 연결 |
| 문서 상태 | baseline, follow-up, reserved 상태 구분 |

## 기획 영향

- 초기 기획 feature와 QA 이후 흐름 보완 feature가 분리된다.
- `Planning.md`에서 첫 QA 이후 생성된 drill-down/CTA 보완 문서를 바로 찾을 수 있다.

## 퍼블리싱 영향

- 시각 QA, 반응형, 스타일 보완 문서가 `01_after_first_qa/`에 분리된다.
- 최초 디자인 기준과 QA 이후 보완 기준이 섞이지 않는다.

## 개발 영향

- 초기 API/화면 구현 문서와 권한/diff/JADX 메뉴 연계 시나리오 같은 QA 이후 보완 문서가 분리된다.
- 다음 구현 phase는 `01_after_first_qa/` 문서를 우선순위로 삼을 수 있다.

## QA 영향

- `first_qa_check.md`는 `01_after_first_qa/` feature 생성의 근거가 된다.
- `second_qa_check.md` 이후에는 `02_after_second_qa/`로 신규 보완 feature를 생성한다.

## 후속 조치

- 두 번째 QA 실행 시 `roles/qa/qa-results/second_qa_check.md`를 실제 결과로 갱신한다.
- 두 번째 QA 실패/부분 통과 항목은 각 역할의 `feature/02_after_second_qa/`에 생성한다.
- 이후 QA cycle이 늘어나면 `03_after_third_qa/` 규칙을 동일하게 적용한다.
