from datetime import datetime, timezone

from app.monitoring.schemas.enums import (
    ApcName,
    CropType,
    MonitoringStatus,
    SnpSe,
)
from app.monitoring.schemas.summary import MatrixCell, MonitoringKpis, MonitoringSummaryResponse


def test_monitoring_summary_response_aliases() -> None:
    response = MonitoringSummaryResponse(
        generatedAt=datetime(2026, 7, 9, 9, 30, tzinfo=timezone.utc),
        kpis=MonitoringKpis(
            totalApcCount=5,
            normalApcCount=2,
            delayedApcCount=1,
            errorApcCount=1,
            missingApcCount=1,
        ),
        matrix=[
            MatrixCell(
                apc=ApcName.JUNGMUN,
                crop=CropType.CITRUS,
                snpSe=SnpSe.CLSFY,
                status=MonitoringStatus.ERROR,
                label="중문 감귤 선별",
                traceId="trace-jungmun-citrus-clsfy",
                issueCount=3,
            )
        ],
        recentIssues=[],
        statusDistribution=[],
    )

    dumped = response.model_dump(by_alias=True)

    assert dumped["generatedAt"] is not None
    assert dumped["kpis"]["totalApcCount"] == 5
    assert dumped["matrix"][0]["snpSe"] == "CLSFY"
    assert dumped["matrix"][0]["issueCount"] == 3
