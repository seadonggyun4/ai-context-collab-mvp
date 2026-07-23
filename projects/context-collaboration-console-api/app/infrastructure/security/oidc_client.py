"""OIDC Authorization Code + PKCE client with strict ID-token validation."""

import base64
import hashlib
from typing import Any
from urllib.parse import urlencode, urlsplit

import httpx
import jwt
from jwt import PyJWK
from jwt.exceptions import PyJWTError

from app.domain import DomainError
from app.domain.security import OidcFlow


class HttpOidcClient:
    def __init__(
        self,
        *,
        issuer: str,
        client_id: str,
        client_secret: str,
        callback_url: str,
        timeout_seconds: float = 5,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._issuer = issuer.rstrip("/")
        self._client_id = client_id
        self._client_secret = client_secret
        self._callback_url = callback_url
        self._timeout = timeout_seconds
        self._transport = transport
        self._metadata: dict[str, Any] | None = None

    async def authorization_url(self, flow: OidcFlow) -> str:
        metadata = await self._get_metadata()
        supported = metadata.get("code_challenge_methods_supported", [])
        if "S256" not in supported:
            raise _provider_error("OIDC_PKCE_UNSUPPORTED", "OIDC 공급자가 PKCE S256을 지원하지 않습니다")
        challenge = base64.urlsafe_b64encode(hashlib.sha256(flow.code_verifier.encode()).digest()).rstrip(b"=").decode()
        query = urlencode(
            {
                "client_id": self._client_id,
                "response_type": "code",
                "scope": "openid profile email",
                "redirect_uri": self._callback_url,
                "state": flow.state,
                "nonce": flow.nonce,
                "code_challenge": challenge,
                "code_challenge_method": "S256",
            }
        )
        return f"{metadata['authorization_endpoint']}?{query}"

    async def authenticate(self, code: str, flow: OidcFlow) -> dict[str, Any]:
        metadata = await self._get_metadata()
        form = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": self._callback_url,
            "code_verifier": flow.code_verifier,
        }
        methods = metadata.get("token_endpoint_auth_methods_supported", ["client_secret_basic"])
        auth: httpx.BasicAuth | None = None
        if "client_secret_basic" in methods:
            auth = httpx.BasicAuth(self._client_id, self._client_secret)
        elif "client_secret_post" in methods:
            form.update({"client_id": self._client_id, "client_secret": self._client_secret})
        else:
            raise _provider_error("OIDC_CLIENT_AUTH_UNSUPPORTED", "지원 가능한 OIDC client 인증 방식이 없습니다")
        try:
            async with httpx.AsyncClient(
                timeout=self._timeout, follow_redirects=False, transport=self._transport
            ) as client:
                token_response = (
                    await client.post(metadata["token_endpoint"], data=form, auth=auth)
                    if auth is not None
                    else await client.post(metadata["token_endpoint"], data=form)
                )
                token_response.raise_for_status()
                token = token_response.json()
                jwks_response = await client.get(metadata["jwks_uri"])
                jwks_response.raise_for_status()
                jwks = jwks_response.json()
        except (httpx.HTTPError, ValueError) as error:
            raise _provider_error("OIDC_PROVIDER_UNAVAILABLE", "OIDC 공급자와 통신할 수 없습니다", 503) from error
        id_token = token.get("id_token")
        if not isinstance(id_token, str):
            raise _provider_error("OIDC_ID_TOKEN_MISSING", "OIDC ID token이 없습니다")
        try:
            header = jwt.get_unverified_header(id_token)
            key_data = next(item for item in jwks["keys"] if item.get("kid") == header.get("kid"))
            algorithms = [
                item for item in metadata.get("id_token_signing_alg_values_supported", []) if item in {"RS256", "ES256"}
            ]
            claims: dict[str, Any] = jwt.decode(
                id_token,
                key=PyJWK.from_dict(key_data).key,
                algorithms=algorithms,
                audience=self._client_id,
                issuer=self._issuer,
                options={"require": ["exp", "iat", "iss", "aud", "sub", "nonce"]},
            )
        except (KeyError, StopIteration, PyJWTError, ValueError) as error:
            raise _provider_error("OIDC_ID_TOKEN_INVALID", "OIDC ID token 검증에 실패했습니다") from error
        if claims.get("nonce") != flow.nonce:
            raise _provider_error("OIDC_NONCE_MISMATCH", "OIDC nonce가 일치하지 않습니다")
        return claims

    async def _get_metadata(self) -> dict[str, Any]:
        if self._metadata is not None:
            return self._metadata
        try:
            async with httpx.AsyncClient(
                timeout=self._timeout, follow_redirects=False, transport=self._transport
            ) as client:
                response = await client.get(f"{self._issuer}/.well-known/openid-configuration")
                response.raise_for_status()
                metadata: dict[str, Any] = response.json()
        except (httpx.HTTPError, ValueError) as error:
            raise _provider_error("OIDC_DISCOVERY_UNAVAILABLE", "OIDC discovery를 조회할 수 없습니다", 503) from error
        if metadata.get("issuer") != self._issuer:
            raise _provider_error("OIDC_ISSUER_MISMATCH", "OIDC issuer가 설정과 일치하지 않습니다")
        for name in ("authorization_endpoint", "token_endpoint", "jwks_uri"):
            value = metadata.get(name)
            if not isinstance(value, str) or urlsplit(value).scheme != "https":
                raise _provider_error("OIDC_METADATA_INVALID", "OIDC endpoint metadata가 안전하지 않습니다")
        self._metadata = metadata
        return metadata


def _provider_error(code: str, title: str, status_code: int = 401) -> DomainError:
    return DomainError(code=code, title=title, detail="OIDC 설정과 공급자 상태를 확인하세요.", status_code=status_code)
