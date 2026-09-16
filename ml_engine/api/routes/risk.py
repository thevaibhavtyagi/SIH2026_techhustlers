from fastapi import APIRouter, Query
from typing import Optional

from api.services.risk_service import RiskService
from api.schemas.risk import (
    RiskSummaryResponse,
    RiskDistributionResponse
)


router = APIRouter(
    prefix="/risk",
    tags=["Risk Analysis"]
)


risk_service = RiskService()


@router.get(
    "/summary",
    response_model=RiskSummaryResponse
)
def get_risk_summary(
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None
):

    return risk_service.get_summary(state, district, constituency)


@router.get(
    "/distribution",
    response_model=RiskDistributionResponse
)
def get_risk_distribution(
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None
):

    return risk_service.get_distribution(state, district, constituency)