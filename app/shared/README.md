# Shared

## 책임

프론트엔드와 백엔드가 함께 따라야 하는 계약과 시연 fixture를 관리한다.

## 디렉토리 경계

| 경로 | 책임 |
| --- | --- |
| `contracts` | API response shape, enum, label 정책 문서 |
| `fixtures` | deterministic mock data 원본 |

## 원칙

- API 계약 변경 시 `contracts/`를 먼저 갱신한다.
- fixture는 운영 데이터가 아니라 시연용 데이터를 사용한다.
- 개인정보나 농업경영체 등록번호 원문을 두지 않는다.
