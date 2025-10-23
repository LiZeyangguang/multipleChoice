import shutil
import tempfile
from pathlib import Path
import importlib
import sys
import unittest
import server.db

# Ensure repo root on path so `import server...` works when running from root
REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))


class ServerTestCase(unittest.TestCase):

    client = None
    _tmpdir = None

    @classmethod
    def setUpClass(cls):
        cls._tmpdir = Path(tempfile.mkdtemp(prefix="mc_test_db_"))
        server.db.init_db(cls._tmpdir / "test.sqlite")

        app_mod = importlib.import_module("server.app")
        app = app_mod.app
        app.config.update(TESTING=True)
        cls.client = app.test_client()

    @classmethod
    def tearDownClass(cls):
        if cls._tmpdir:
            shutil.rmtree(cls._tmpdir, ignore_errors=True)
            cls._tmpdir = None

