import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from analytics import build_summary


class BuildSummaryTests(unittest.TestCase):
    def test_summarizes_funding_jobs_and_net_revenue(self):
        result = build_summary(
            {
                "projects": [
                    {
                        "region": "Eastern",
                        "status": "FUNDING",
                        "count": 2,
                        "raised_pesewas": 75000,
                        "target_pesewas": 100000,
                    },
                    {
                        "region": "Ashanti",
                        "status": "ACTIVE",
                        "count": 1,
                        "raised_pesewas": 50000,
                        "target_pesewas": 50000,
                    },
                ],
                "jobs": [
                    {"status": "REQUESTED", "count": 1},
                    {"status": "COMPLETED", "count": 2},
                    {"status": "PAID", "count": 1},
                ],
                "successful_payments_pesewas": 9000,
                "expenses_pesewas": 2500,
            }
        )

        self.assertEqual(result["project_count"], 3)
        self.assertEqual(result["funded_project_count"], 1)
        self.assertEqual(result["total_raised_pesewas"], 125000)
        self.assertEqual(result["funding_progress_percent"], 83.33)
        self.assertEqual(result["job_count"], 4)
        self.assertEqual(result["completed_job_count"], 3)
        self.assertEqual(result["job_completion_percent"], 75)
        self.assertEqual(result["net_revenue_pesewas"], 6500)
        self.assertEqual(
            result["regional_funding"],
            [
                {"region": "Ashanti", "raised_pesewas": 50000},
                {"region": "Eastern", "raised_pesewas": 75000},
            ],
        )

    def test_empty_data_has_zero_rates(self):
        result = build_summary(
            {
                "projects": [],
                "jobs": [],
                "successful_payments_pesewas": 0,
                "expenses_pesewas": 0,
            }
        )

        self.assertEqual(result["funding_progress_percent"], 0)
        self.assertEqual(result["job_completion_percent"], 0)
        self.assertEqual(result["regional_funding"], [])


if __name__ == "__main__":
    unittest.main()
