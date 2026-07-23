"""OIDC orchestration and shared security-store ports."""

import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, Protocol
from urllib.parse import urlsplit

from app.domain import ActorRole, DomainError
from app.domain.security import AuthSession, OidcFlow, principal_from_claims


class SecurityStore(Protocol):
    async def save_flow(self, flow: OidcFlow, ttl_seconds: int) -> None: ...
    async def consume_flow(self, state: str) -> OidcFlow | None: ...
    async def save_session(self, session: AuthSession, ttl_seconds: int) -> None: ...
    async def get_session(self, session_id: str) -> AuthSession | None: ...
    async def delete_session(self, session_id: str) -> None: ...
    async def hit_rate_limit(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]: ...
    async def ping(self) -> bool: ...
    async def close(self) -> None: ...


class OidcClient(Protocol):
    async def authorization_url(self, flow: OidcFlow) -> str: ...
    async def authenticate(self, code: str, flow: OidcFlow) -> dict[str, Any]: ...


@dataclass(frozen=True, slots=True)
class CompletedLogin:
    session: AuthSession
    return_to: str


class AuthenticationService:
    def __init__(
        self,
        store: SecurityStore,
        oidc: OidcClient,
        *,
        issuer: str,
        allowed_return_origins: tuple[str, ...],
        role_claim: str,
        role_mapping: dict[str, ActorRole],
        flow_ttl_seconds: int = 600,
        session_ttl_seconds: int = 28_800,
    ) -> None:
        self._store = store
        self._oidc = oidc
        self._issuer = issuer
        self._allowed_return_origins = frozenset(allowed_return_origins)
        self._role_claim = role_claim
        self._role_mapping = role_mapping
        self._flow_ttl_seconds = flow_ttl_seconds
        self._session_ttl_seconds = session_ttl_seconds

    async def begin(self, return_to: str) -> tuple[OidcFlow, str]:
        validated_return = self._validate_return_to(return_to)
        now = datetime.now(UTC)
        flow = OidcFlow(
            state=secrets.token_urlsafe(32),
            nonce=secrets.token_urlsafe(32),
            code_verifier=secrets.token_urlsafe(64),
            return_to=validated_return,
            expires_at=now + timedelta(seconds=self._flow_ttl_seconds),
        )
        await self._store.save_flow(flow, self._flow_ttl_seconds)
        return flow, await self._oidc.authorization_url(flow)

    async def complete(self, code: str, state: str) -> CompletedLogin:
        flow = await self._store.consume_flow(state)
        if flow is None or flow.expires_at <= datetime.now(UTC):
            raise _auth_error("OIDC_FLOW_INVALID", "로그인 요청이 만료되었거나 이미 사용되었습니다")
        claims = await self._oidc.authenticate(code, flow)
        try:
            principal = principal_from_claims(
                claims,
                issuer=self._issuer,
                role_claim=self._role_claim,
                role_mapping=self._role_mapping,
            )
        except ValueError as error:
            raise _auth_error("OIDC_CLAIMS_INVALID", "사용자 식별 정보를 확인할 수 없습니다") from error
        session = AuthSession(
            id=secrets.token_urlsafe(32),
            principal=principal,
            csrf_token=secrets.token_urlsafe(32),
            expires_at=datetime.now(UTC) + timedelta(seconds=self._session_ttl_seconds),
        )
        await self._store.save_session(session, self._session_ttl_seconds)
        return CompletedLogin(session, flow.return_to)

    async def session(self, session_id: str | None) -> AuthSession | None:
        if not session_id:
            return None
        session = await self._store.get_session(session_id)
        if session is None or session.expires_at <= datetime.now(UTC):
            return None
        return session

    async def logout(self, session_id: str) -> None:
        await self._store.delete_session(session_id)

    def _validate_return_to(self, return_to: str) -> str:
        parsed = urlsplit(return_to)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        if (
            origin not in self._allowed_return_origins
            or parsed.scheme != "https"
            or parsed.username is not None
            or parsed.password is not None
            or parsed.fragment
        ):
            raise DomainError(
                code="OIDC_RETURN_URL_NOT_ALLOWED",
                title="로그인 후 이동 경로가 허용되지 않았습니다",
                detail="등록된 Console 주소에서 다시 로그인하세요.",
                status_code=400,
            )
        return return_to


def _auth_error(code: str, title: str) -> DomainError:
    return DomainError(code=code, title=title, detail="로그인을 다시 시작하세요.", status_code=401)
