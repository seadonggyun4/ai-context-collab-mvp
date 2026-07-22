from typing import Annotated

from fastapi import Header

from app.monitoring.schemas.enums import UserRole


def get_current_user_role(
    x_user_role: Annotated[UserRole | None, Header(alias="X-User-Role")] = None,
) -> UserRole:
    return x_user_role or UserRole.ADMIN
