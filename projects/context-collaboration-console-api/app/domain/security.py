"""Provider-neutral production identity and session records."""

from dataclasses import dataclass
from datetime import datetime
from hashlib import sha256
from typing import Any

from app.domain.review_workflow import Actor, ActorRole


@dataclass(frozen=True, slots=True)
class AuthenticatedPrincipal:
    actor_id: str
    subject: str
    display_name: str
    role: ActorRole

    def actor(self) -> Actor:
        return Actor(self.actor_id, self.display_name, self.role)


@dataclass(frozen=True, slots=True)
class OidcFlow:
    state: str
    nonce: str
    code_verifier: str
    return_to: str
    expires_at: datetime


@dataclass(frozen=True, slots=True)
class AuthSession:
    id: str
    principal: AuthenticatedPrincipal
    csrf_token: str
    expires_at: datetime


def principal_from_claims(
    claims: dict[str, Any],
    *,
    issuer: str,
    role_claim: str,
    role_mapping: dict[str, ActorRole],
) -> AuthenticatedPrincipal:
    subject = str(claims.get("sub", "")).strip()
    if not subject:
        raise ValueError("OIDC subject is required")
    raw_groups = claims.get(role_claim, [])
    groups = [raw_groups] if isinstance(raw_groups, str) else raw_groups if isinstance(raw_groups, list) else []
    roles = [role_mapping[group] for group in groups if isinstance(group, str) and group in role_mapping]
    rank = {ActorRole.VIEWER: 0, ActorRole.CONTRIBUTOR: 1, ActorRole.REVIEWER: 2, ActorRole.ADMIN: 3}
    role = max(roles, key=rank.__getitem__, default=ActorRole.VIEWER)
    display_name = str(claims.get("name") or claims.get("preferred_username") or claims.get("email") or subject)
    actor_id = f"oidc-{sha256(f'{issuer}|{subject}'.encode()).hexdigest()[:24]}"
    return AuthenticatedPrincipal(actor_id, subject, display_name[:200], role)
