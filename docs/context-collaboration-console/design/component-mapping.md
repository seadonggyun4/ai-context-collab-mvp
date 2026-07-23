# Astryx Component Mapping

| Product pattern | Astryx 기반 | 제품 wrapper 책임 |
| --- | --- | --- |
| App navigation | navigation/menu primitives | project scope, active route, collapsed state |
| Data table | table, checkbox, menu | density, status column, row action, empty/error |
| Change request form | textarea/input, field, button | analysis state, preserved raw request, validation |
| Status | badge/status primitive | semantic tone, icon, label, no decorative pills |
| Filter | select, combobox, tabs | URL state, count, keyboard flow |
| Review dialog | dialog, alert dialog | approval scope, reason, irreversible warning |
| Diff | tabs, code/text primitives | semantic field diff, unified/raw switch |
| Evidence | table, disclosure | automated/manual separation, log detail |
| Toast | notification primitive | only transient result; critical failure stays inline |
| Impact graph | custom SVG/graph layer | keyboard list alternative, focus sync, node details |

## Wrapper 원칙

- `StatusBadge`는 domain status를 입력받고 색상 문자열을 직접 받지 않는다.
- `ActionButton`은 permission과 workflow guard 결과를 helper text와 함께 표시한다.
- `DataState`는 loading, empty, error, permission, stale을 공통 처리한다.
- `EvidenceResult`는 PASSED/FAILED/PARTIAL/NOT_EXECUTED/MANUAL_REQUIRED만 허용한다.
- Astryx가 제공하지 않는 그래프는 접근 가능한 table/list fallback을 필수 제공한다.
