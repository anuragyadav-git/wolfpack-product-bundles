from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from common import DesignJobError, load_data  # noqa: E402
from init_design_job import create_design_job  # noqa: E402


class InitDesignJobTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp.name) / "repo"
        self.repo.mkdir()

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_creates_job_with_templates_and_metadata(self) -> None:
        job = create_design_job(
            title="Product Card Refresh",
            repository=self.repo,
            job_id="product-card-refresh",
            owner="Design",
            product="Wolfpack",
        )
        manifest = load_data(job / "design-job.yaml")
        self.assertEqual("product-card-refresh", manifest["job"]["id"])
        self.assertEqual("DISCOVERY", manifest["job"]["stage"])
        self.assertEqual(str(self.repo.resolve()), manifest["job"]["repository"])
        self.assertTrue((job / "browser-test-plan.yaml").is_file())
        self.assertTrue((job / "chrome-preflight-result.yaml").is_file())
        self.assertTrue((job / "browser-case-result.json").is_file())
        self.assertTrue((job / "qa" / "screenshots").is_dir())
        self.assertTrue((job / "qa" / "snapshots").is_dir())
        self.assertTrue((job / "qa" / "baselines").is_dir())
        self.assertTrue((job / "qa" / "lighthouse").is_dir())

    def test_collision_rejected_and_resume_allowed(self) -> None:
        first = create_design_job(
            title="Sidebar",
            repository=self.repo,
            job_id="sidebar",
        )
        with self.assertRaises(DesignJobError):
            create_design_job(
                title="Sidebar",
                repository=self.repo,
                job_id="sidebar",
            )
        resumed = create_design_job(
            title="Sidebar",
            repository=self.repo,
            job_id="sidebar",
            resume=True,
        )
        self.assertEqual(first, resumed)

    def test_rejects_production_artifact_root(self) -> None:
        with self.assertRaises(DesignJobError):
            create_design_job(
                title="Unsafe",
                repository=self.repo,
                root=self.repo / "public" / "design-jobs",
                job_id="unsafe",
            )

    def test_rejects_artifact_root_outside_repository(self) -> None:
        with self.assertRaises(DesignJobError):
            create_design_job(
                title="External",
                repository=self.repo,
                root=Path(self.temp.name) / "external",
                job_id="external",
            )

    def test_resume_rejects_mismatched_identity(self) -> None:
        create_design_job(title="Original", repository=self.repo, job_id="original")
        with self.assertRaises(DesignJobError):
            create_design_job(
                title="Different",
                repository=self.repo,
                job_id="original",
                resume=True,
            )

    def test_fixture_catalog_contains_required_job_shapes(self) -> None:
        fixtures = json.loads(
            (Path(__file__).parent / "fixtures/design_job_cases.json").read_text()
        )
        self.assertEqual(
            {"product_card", "summary_sidebar", "mobile_tray"},
            set(fixtures),
        )


if __name__ == "__main__":
    unittest.main()
