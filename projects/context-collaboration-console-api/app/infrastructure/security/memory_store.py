"""Deterministic non-production security store."""

from datetime import UTC, datetime, timedelta

from app.domain.security import AuthSession, OidcFlow


class InMemorySecurityStore:
    def __init__(self) -> None:
        self.flows: dict[str, OidcFlow] = {}
        self.sessions: dict[str, AuthSession] = {}
        self.rate_limits: dict[str, tuple[int, datetime]] = {}

    async def save_flow(self, flow: OidcFlow, ttl_seconds: int) -> None:
        self.flows[flow.state] = flow

    async def consume_flow(self, state: str) -> OidcFlow | None:
        return self.flows.pop(state, None)

    async def save_session(self, session: AuthSession, ttl_seconds: int) -> None:
        self.sessions[session.id] = session

    async def get_session(self, session_id: str) -> AuthSession | None:
        return self.sessions.get(session_id)

    async def delete_session(self, session_id: str) -> None:
        self.sessions.pop(session_id, None)

    async def hit_rate_limit(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        now = datetime.now(UTC)
        count, expires_at = self.rate_limits.get(key, (0, now + timedelta(seconds=window_seconds)))
        if expires_at <= now:
            count, expires_at = 0, now + timedelta(seconds=window_seconds)
        count += 1
        self.rate_limits[key] = (count, expires_at)
        retry_after = max(1, int((expires_at - now).total_seconds()))
        return count <= limit, retry_after

    async def ping(self) -> bool:
        return True

    async def close(self) -> None:
        return None
