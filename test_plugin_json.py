import json
import os
import unittest

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


class PluginJsonTests(unittest.TestCase):
    def test_root_flag(self):
        with open(os.path.join(ROOT, "plugin.json"), "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertIn("_root", data.get("flags", []))
        self.assertEqual(data.get("name"), "NoLag")


if __name__ == "__main__":
    unittest.main()
