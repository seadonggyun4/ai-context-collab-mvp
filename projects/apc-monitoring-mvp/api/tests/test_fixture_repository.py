from app.monitoring.repositories import FixtureNotFoundError, MonitoringFixtureRepository
from app.monitoring.schemas.enums import (
    ApcName,
    CropType,
    IssueSeverity,
    MonitoringStatus,
    SnpSe,
    UserRole,
)


def test_fixture_repository_validates_all_contracts() -> None:
    repository = MonitoringFixtureRepository()

    repository.validate_all()


def test_fixture_repository_covers_all_monitoring_statuses() -> None:
    repository = MonitoringFixtureRepository()

    summary = repository.get_summary()
    statuses = {item.status for item in summary.status_distribution}

    assert statuses == {
        MonitoringStatus.NORMAL,
        MonitoringStatus.DELAYED,
        MonitoringStatus.ERROR,
        MonitoringStatus.MISSING,
        MonitoringStatus.UNDEFINED_RULE,
    }


def test_ingestions_are_sorted_by_operational_priority() -> None:
    repository = MonitoringFixtureRepository()

    response = repository.get_ingestions()

    assert response.items[0].status == MonitoringStatus.ERROR
    assert response.items[1].status == MonitoringStatus.MISSING
    assert response.items[2].status == MonitoringStatus.DELAYED


def test_viewer_ingestion_paths_are_masked() -> None:
    repository = MonitoringFixtureRepository()

    response = repository.get_ingestions(apc=ApcName.NAMWON, user_role=UserRole.VIEWER)

    assert response.items[0].origin_path == "••••/restricted"
    assert response.items[0].refined_path == "••••/restricted"


def test_fixture_repository_filters_issues() -> None:
    repository = MonitoringFixtureRepository()

    response = repository.get_issues(
        apc=ApcName.JUNGMUN,
        crop=CropType.CITRUS,
        snp_se=SnpSe.CLSFY,
        severity=IssueSeverity.HIGH,
    )

    assert len(response.items) == 1
    assert response.items[0].issue_id == "issue-jungmun-refined-failed"


def test_fixture_repository_raises_for_missing_trace() -> None:
    repository = MonitoringFixtureRepository()

    try:
        repository.get_pipeline_trace("missing-trace")
    except FixtureNotFoundError as error:
        assert error.args[0] == "missing-trace"
    else:
        raise AssertionError("FixtureNotFoundError was not raised")
