import os
import json
import sqlite3
import unittest

class TestDiversifiedTestCases(unittest.TestCase):
    def setUp(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.json_path = os.path.join(self.base_dir, "app", "data", "seed_test_cases.json")
        self.db_path = os.path.join(self.base_dir, "llm_robustness.db")

    def test_json_file_exists_and_loads(self):
        self.assertTrue(os.path.exists(self.json_path), f"JSON file missing: {self.json_path}")
        with open(self.json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertIn("single_turn", data)
        self.assertIn("multi_turn", data)

    def test_single_turn_structure_and_diversity(self):
        with open(self.json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        single = data["single_turn"]
        self.assertGreaterEqual(len(single), 150, "Expected at least 150 diverse single-turn cases")

        ids = set()
        categories = set()
        valid_severities = {"critical", "high", "medium", "low"}

        for tc in single:
            # Check ID uniqueness
            self.assertNotIn(tc["id"], ids, f"Duplicate ID: {tc['id']}")
            ids.add(tc["id"])

            # Check required fields
            self.assertIn("category", tc)
            self.assertIn("severity_hint", tc)
            self.assertIn("prompt", tc)
            self.assertIn("description", tc)

            # Validate types and values
            self.assertIsInstance(tc["prompt"], str)
            self.assertGreater(len(tc["prompt"].strip()), 5)
            self.assertIn(tc["severity_hint"], valid_severities)

            categories.add(tc["category"])

        # Check diversity of categories (at least 15 categories)
        self.assertGreaterEqual(len(categories), 15, f"Expected at least 15 categories, found {len(categories)}")
        
        # Verify presence of key modern red teaming categories
        expected_categories = [
            "roleplay_bypass",
            "encoding_obfuscation",
            "prompt_leakage",
            "indirect_prompt_injection",
            "schema_hijacking",
            "hallucination_trigger",
            "refusal_failure",
            "multilingual_jailbreak",
            "context_delimiter_escape",
            "tool_function_calling_injection",
            "sycophancy_and_untruthful_compliance"
        ]
        for cat in expected_categories:
            self.assertIn(cat, categories, f"Missing critical category: {cat}")

    def test_multi_turn_structure_and_diversity(self):
        with open(self.json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        multi = data["multi_turn"]
        self.assertGreaterEqual(len(multi), 25, "Expected at least 25 multi-turn escalation cases")

        ids = set()
        for tc in multi:
            self.assertNotIn(tc["id"], ids, f"Duplicate multi-turn ID: {tc['id']}")
            ids.add(tc["id"])

            self.assertIn("category", tc)
            self.assertIn("turns", tc)
            self.assertIsInstance(tc["turns"], list)
            self.assertGreaterEqual(len(tc["turns"]), 2, f"Multi-turn sequence {tc['id']} has fewer than 2 turns")

            for turn in tc["turns"]:
                self.assertIsInstance(turn, str)
                self.assertGreater(len(turn.strip()), 5)

    def test_database_sync(self):
        if not os.path.exists(self.db_path):
            self.skipTest("Database file not yet created")

        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()

        cur.execute("SELECT COUNT(*) FROM test_cases")
        db_count = cur.fetchone()[0]

        with open(self.json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        total_expected = len(data["single_turn"]) + len(data["multi_turn"])

        self.assertGreaterEqual(db_count, total_expected, f"DB count {db_count} must at least contain all {total_expected} seed cases")
        conn.close()

if __name__ == "__main__":
    unittest.main()
