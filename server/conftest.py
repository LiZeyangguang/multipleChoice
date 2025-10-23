"""Pytest configuration for running from the server/ directory.

Ensures the repository root (the parent of this server/ folder) is on
sys.path so absolute imports like `import server...` work during test
collection regardless of the current working directory.
"""

from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
	sys.path.insert(0, str(REPO_ROOT))

