from collections import defaultdict
from typing import Any


FUNDED_STATUSES = {"FUNDED", "ACTIVE", "CLOSED"}
COMPLETED_JOB_STATUSES = {"COMPLETED", "PAID"}


def build_summary(payload: dict[str, Any]) -> dict[str, Any]:
    projects = payload["projects"]
    jobs = payload["jobs"]

    project_count = sum(project["count"] for project in projects)
    funded_project_count = sum(
        project["count"]
        for project in projects
        if project["status"] in FUNDED_STATUSES
    )
    total_raised = sum(project["raised_pesewas"] for project in projects)
    total_target = sum(project["target_pesewas"] for project in projects)

    jobs_by_status = {job["status"]: job["count"] for job in jobs}
    job_count = sum(jobs_by_status.values())
    completed_job_count = sum(
        count
        for status, count in jobs_by_status.items()
        if status in COMPLETED_JOB_STATUSES
    )

    regional_funding: dict[str, int] = defaultdict(int)
    for project in projects:
        regional_funding[project["region"]] += project["raised_pesewas"]

    successful_payments = payload["successful_payments_pesewas"]
    expenses = payload["expenses_pesewas"]

    return {
        "project_count": project_count,
        "funded_project_count": funded_project_count,
        "total_raised_pesewas": total_raised,
        "total_target_pesewas": total_target,
        "funding_progress_percent": (
            round(total_raised / total_target * 100, 2) if total_target else 0
        ),
        "jobs_by_status": dict(sorted(jobs_by_status.items())),
        "job_count": job_count,
        "completed_job_count": completed_job_count,
        "job_completion_percent": (
            round(completed_job_count / job_count * 100, 2) if job_count else 0
        ),
        "successful_payments_pesewas": successful_payments,
        "expenses_pesewas": expenses,
        "net_revenue_pesewas": successful_payments - expenses,
        "regional_funding": [
            {"region": region, "raised_pesewas": amount}
            for region, amount in sorted(regional_funding.items())
        ],
    }
