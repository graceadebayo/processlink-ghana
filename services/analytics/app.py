import hmac
import os
from typing import Literal

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from analytics import build_summary

ProjectStatus = Literal[
    "DRAFT",
    "PENDING_APPROVAL",
    "FUNDING",
    "FUNDED",
    "ACTIVE",
    "CLOSED",
    "REJECTED",
]
JobStatus = Literal[
    "REQUESTED",
    "ACCEPTED",
    "IN_PROGRESS",
    "COMPLETED",
    "PAID",
    "CANCELLED",
    "DECLINED",
]

app = FastAPI(title="ProcessLink Analytics", version="1.0.0")


class ProjectGroup(BaseModel):
    model_config = ConfigDict(extra="forbid")

    region: str = Field(min_length=1, max_length=100)
    status: ProjectStatus
    count: int = Field(ge=0)
    raised_pesewas: int = Field(ge=0)
    target_pesewas: int = Field(ge=0)


class JobGroup(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: JobStatus
    count: int = Field(ge=0)


class SummaryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    projects: list[ProjectGroup] = Field(max_length=1000)
    jobs: list[JobGroup] = Field(max_length=7)
    successful_payments_pesewas: int = Field(ge=0)
    expenses_pesewas: int = Field(ge=0)


class RegionalFunding(BaseModel):
    region: str
    raised_pesewas: int


class SummaryResponse(BaseModel):
    project_count: int
    funded_project_count: int
    total_raised_pesewas: int
    total_target_pesewas: int
    funding_progress_percent: float
    jobs_by_status: dict[str, int]
    job_count: int
    completed_job_count: int
    job_completion_percent: float
    successful_payments_pesewas: int
    expenses_pesewas: int
    net_revenue_pesewas: int
    regional_funding: list[RegionalFunding]


def require_service_key(authorization: str | None = Header(default=None)) -> None:
    expected_key = os.getenv("ANALYTICS_API_KEY", "")
    if not expected_key:
        raise HTTPException(
            status_code=503, detail="Analytics service authentication is not configured."
        )
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized.")
    supplied_key = authorization.removeprefix("Bearer ")
    if not hmac.compare_digest(supplied_key, expected_key):
        raise HTTPException(status_code=401, detail="Unauthorized.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post(
    "/v1/reports/summary",
    response_model=SummaryResponse,
    dependencies=[Depends(require_service_key)],
)
def report_summary(request: SummaryRequest) -> dict:
    return build_summary(request.model_dump())
