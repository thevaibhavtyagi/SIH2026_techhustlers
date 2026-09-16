from fastapi import APIRouter, Query
from typing import Optional

from api.services.analytics_service import AnalyticsService
from api.schemas.risk import AnalyticsOverviewResponse, TimeseriesResponse


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


analytics_service = AnalyticsService()


@router.get(
    "/overview",
    response_model=AnalyticsOverviewResponse
)
def get_overview(
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None
):

    return analytics_service.get_overview(state, district, constituency)


@router.get("/states")
def get_states(
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None
):

    return analytics_service.get_states(state, district, constituency)


@router.get("/categories")
def get_categories(
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None
):

    return analytics_service.get_categories(state, district, constituency)


@router.get("/constituencies")
def get_constituencies(
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None
):

    return analytics_service.get_constituencies(state, district, constituency)


@router.get(
    "/timeseries",
    response_model=TimeseriesResponse
)
def get_timeseries(
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None
):
    data = analytics_service.get_timeseries(state, district, constituency)
    return TimeseriesResponse(data=data)