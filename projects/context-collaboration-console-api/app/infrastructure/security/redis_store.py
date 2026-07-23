"""Redis/Valkey-backed sessions, OIDC flows, and atomic rate limits."""

import json
from datetime import datetime
from typing import Any

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.domain import ActorRole
from app.domain.security import AuthenticatedPrincipal, AuthSession, OidcFlow

_RATE_SCRIPT = """
local current = redis.call('INCR', KEYS[1])
if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('TTL', KEYS[1])
return {current, ttl}
"""


class RedisSecurityStore:
    def __init__(self, url: str, *, namespace: str = "context-console") -> None:
        self._redis = Redis.from_url(url, decode_responses=True)
        self._namespace = namespace

    async def save_flow(self, flow: OidcFlow, ttl_seconds: int) -> None:
        await self._redis.setex(self._key("flow", flow.state), ttl_seconds, json.dumps(_flow_data(flow)))

    async def consume_flow(self, state: str) -> OidcFlow | None:
        value = await self._redis.getdel(self._key("flow", state))
        return _flow(value)

    async def save_session(self, session: AuthSession, ttl_seconds: int) -> None:
        await self._redis.setex(self._key("session", session.id), ttl_seconds, json.dumps(_session_data(session)))

    async def get_session(self, session_id: str) -> AuthSession | None:
        return _session(await self._redis.get(self._key("session", session_id)))

    async def delete_session(self, session_id: str) -> None:
        await self._redis.delete(self._key("session", session_id))

    async def hit_rate_limit(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        result: list[int] = await self._redis.eval(
            _RATE_SCRIPT,
            1,
            self._key("rate", key),
            window_seconds,
        )
        count, ttl = int(result[0]), max(1, int(result[1]))
        return count <= limit, ttl

    async def ping(self) -> bool:
        try:
            return bool(await self._redis.ping())
        except RedisError:
            return False

    async def close(self) -> None:
        await self._redis.aclose()

    def _key(self, kind: str, identifier: str) -> str:
        return f"{self._namespace}:{kind}:{identifier}"


def _flow_data(flow: OidcFlow) -> dict[str, str]:
    return {
        "state": flow.state,
        "nonce": flow.nonce,
        "codeVerifier": flow.code_verifier,
        "returnTo": flow.return_to,
        "expiresAt": flow.expires_at.isoformat(),
    }


def _flow(value: str | None) -> OidcFlow | None:
    if value is None:
        return None
    data: dict[str, Any] = json.loads(value)
    return OidcFlow(
        data["state"],
        data["nonce"],
        data["codeVerifier"],
        data["returnTo"],
        datetime.fromisoformat(data["expiresAt"]),
    )


def _session_data(session: AuthSession) -> dict[str, Any]:
    return {
        "id": session.id,
        "principal": {
            "actorId": session.principal.actor_id,
            "subject": session.principal.subject,
            "displayName": session.principal.display_name,
            "role": session.principal.role.value,
        },
        "csrfToken": session.csrf_token,
        "expiresAt": session.expires_at.isoformat(),
    }


def _session(value: str | None) -> AuthSession | None:
    if value is None:
        return None
    data: dict[str, Any] = json.loads(value)
    principal = data["principal"]
    return AuthSession(
        data["id"],
        AuthenticatedPrincipal(
            principal["actorId"],
            principal["subject"],
            principal["displayName"],
            ActorRole(principal["role"]),
        ),
        data["csrfToken"],
        datetime.fromisoformat(data["expiresAt"]),
    )
