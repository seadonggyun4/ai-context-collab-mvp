# Screen Specifications

## SCR-01 Main entry

Truthound 한국어 메인의 구조적 publishing rhythm을 적용하는 제품 진입 화면이다.

1. Header: 제품명, `제품`, `운영 방식`, `문서 구조`, `프로젝트 열기`.
2. Hero: 실제 결과 중심 headline, 2~3줄 설명, primary `프로젝트 열기`, quiet `운영 방식 보기`.
3. Product proof: 장식 이미지가 아니라 실제 change review workspace preview.
4. Problem/shift: 흩어진 요청·문서·검증이 하나의 변경 흐름으로 연결되는 전후 관계.
5. Workflow: 요청→분석→검토→승인→검증→활성화. 동일 카드 6개 대신 연결된 horizontal/vertical sequence.
6. Role views: 역할별로 보이는 판단의 차이를 실제 화면 crop과 함께 제시.
7. Governance: 승인 전 차단, 근거와 diff, Git history의 세 가지 통제 원칙.
8. Closing: `APC 프로젝트 열기` 단일 CTA.

금지 headline: “AI로 혁신하는 차세대 협업”, “업무의 미래”, “AI-powered”.

권장 headline 방향: “변경의 이유부터 검증 결과까지, 한 흐름으로 관리합니다.”

## SCR-02 Project overview

- Header: project name, repository, active Context version, last verified.
- 첫 행: `진행 중 변경`, `승인 대기`, `검증 필요`, `정합성`을 compact metric strip으로 제공. 네 개의 큰 카드 금지.
- Main: 진행 변경 table 60%, attention queue 40%.
- Secondary: 역할별 최신 산출물 list, 최근 QA/evaluation timeline.
- Primary action: `변경 요청 등록`.

## SCR-03 New change request

- 넓은 textarea와 example prompt, scope project 표시.
- raw request가 그대로 보존된다는 설명.
- 분석 단계: Context 확인 → 요청 구조화 → 영향 탐색 → 검증안 생성.
- 분석 실패 시 입력을 잃지 않고 재시도·수정 가능.

## SCR-04 Change proposal

- 상단: change ID, status, risk, requester, Context snapshot.
- summary와 acceptance criteria가 먼저, AI confidence/unknowns는 인접 보조 영역.
- role impact는 동일 카드 4개가 아니라 비교 가능한 row/columns.
- affected screens/API/data/files와 QA scenarios를 sectioned list/table로 제공.
- 다음 행동은 `검토 시작`, secondary `요청 수정`.

## SCR-05 Context list

- 역할·status·type filter와 search.
- table columns: title, role, status, version, owner, updated, relations.
- latest만 기본 표시하되 superseded/history로 이동 가능.

## SCR-06 Context detail and document workspace

- structured view 기본, raw Markdown/YAML은 secondary tab.
- 상단에 source path, status, version, approved by, effective date.
- 본문 옆에는 parent standards와 derived outputs를 관계 목록으로 제공.
- edit는 CodeMirror 6 document workspace로 진입한다. Markdown/YAML mode, diagnostic, preview와 relation context를 제공한다.
- dark application mode에서는 Dracula, light에서는 제품 소유 Porcelain editor theme를 적용한다.
- 저장은 Git 원본 직접 overwrite가 아니라 backend draft→validation→변경 제안 흐름으로 연결한다.

## SCR-07 Impact analysis

- graph 65%, selected node detail 35% desktop.
- node type: request, planning, publishing, document, contract, component, code, QA.
- 색상보다 shape/icon/label로 type 구분.
- graph/list toggle과 keyboard navigation 제공.
- edge 선택 시 relation reason을 표시.

## SCR-08 Review and verification

- 좌측 diff, 우측 decision/evidence summary.
- field/semantic diff 기본, raw diff 보조.
- automated tests와 manual checks를 별도 group.
- approve, request changes, reject의 시각 계층을 구분.
- failure 또는 NOT_EXECUTED P0가 있으면 complete action 차단.

## SCR-09 Activation result

- 새 Context version, activated by/time, included documents, evidence summary.
- celebratory confetti/gradient 금지. 완료 결과와 후속 영향에 집중.
- `프로젝트로 돌아가기`, `변경 이력 보기` 제공.

## Responsive

- 1024px 이하: app navigation compact, two-column을 60/40 또는 stacked로 전환.
- 768px 이하: graph 기본 list view, review diff와 decision을 tabs로 분리.
- 390px: 읽기·상태 확인·승인 판단을 우선. dense table은 essential columns + detail drawer.
