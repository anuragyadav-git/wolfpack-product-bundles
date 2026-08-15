from __future__ import annotations

import subprocess
import sys
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]


class CliContractTests(unittest.TestCase):
    def test_every_script_exposes_help(self) -> None:
        scripts = sorted((SKILL_ROOT / "scripts").glob("*.py"))
        self.assertTrue(scripts)
        for script in scripts:
            if script.name == "common.py":
                continue
            completed = subprocess.run(
                [sys.executable, str(script), "--help"],
                check=False,
                capture_output=True,
                text=True,
                timeout=10,
            )
            self.assertEqual(0, completed.returncode, script.name)
            self.assertIn("usage:", completed.stdout.lower(), script.name)


if __name__ == "__main__":
    unittest.main()
