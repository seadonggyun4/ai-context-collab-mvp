"""Application guards must run before any Git side effect."""

import pytest
from app.application.review_commands import PublishGitCommand, ReviewWorkflowCommands
from app.domain import DomainError, demo_workflow
from tests.fakes import FakeChangeWorkflowRepository, FakeGitPublisher


async def test_unapproved_change_never_reaches_git_publisher() -> None:
    repository = FakeChangeWorkflowRepository(demo_workflow())
    publisher = FakeGitPublisher()
    commands = ReviewWorkflowCommands(repository, git_publisher=publisher)

    with pytest.raises(DomainError) as raised:
        await commands.publish_git(
            "CR-DEMO-001",
            "user-review-01",
            PublishGitCommand(
                expected_base_commit_sha="a" * 40,
                proposal_revision=1,
                scope_fingerprint="revision=1|scope=apc-monitoring-last-received-at-v1",
                implementation_revision=0,
            ),
            "publish-before-approval",
        )

    assert raised.value.code == "GIT_PUBLICATION_STATE_INVALID"
    assert publisher.calls == []
