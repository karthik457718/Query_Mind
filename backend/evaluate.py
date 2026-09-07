import os
import json
import argparse
from dotenv import load_dotenv

# Load env before importing app modules that instantiate Groq
load_dotenv()

from sqlalchemy import create_engine
from app.schema.schema_embedder import get_relevant_tables
from app.llm.generate_sql import generate_sql
from app.safety.validator import validate_sql, UnsafeSQLError

# Example dataset structure (could be loaded from a JSON file):
# [
#   {"question": "How many users are there?", "db_url": "sqlite:///test.db", "expected_sql_contains": "COUNT(*)"},
#   ...
# ]

def load_eval_data(filepath: str) -> list[dict]:
    if not os.path.exists(filepath):
        print(f"Eval file {filepath} not found. Using dummy data.")
        return [
            {
                "question": "Show all users", 
                "db_url": "sqlite:///:memory:", 
                "expected_sql_contains": "SELECT"
            }
        ]
    with open(filepath, "r") as f:
        return json.load(f)

def run_evaluation(data_path: str):
    eval_data = load_eval_data(data_path)
    
    total = len(eval_data)
    passed = 0
    errors = 0
    
    print(f"--- Running QueryMind Evaluation Harness ---")
    print(f"Evaluating {total} questions...\n")
    
    for i, item in enumerate(eval_data, 1):
        question = item["question"]
        db_url = item.get("db_url", "sqlite:///:memory:")
        expected = item.get("expected_sql_contains", "")
        
        print(f"[{i}/{total}] Q: {question}")
        
        try:
            # 1. Schema Retrieval
            schema_text = get_relevant_tables(db_url, question)
            
            # 2. SQL Generation
            sql = generate_sql(schema_text, question)
            
            # 3. Validation
            try:
                validated_sql = validate_sql(sql)
                
                # Simple evaluation metric: check if the generated SQL contains expected keyword
                if expected and expected.lower() not in validated_sql.lower():
                    print(f"  ❌ FAILED: Expected '{expected}', got:\n{validated_sql}\n")
                else:
                    print(f"  ✅ PASSED: {validated_sql}")
                    passed += 1
            except UnsafeSQLError as e:
                print(f"  ❌ FAILED VALIDATION: {e}")
                
        except Exception as e:
            print(f"  ⚠️ ERROR: {e}")
            errors += 1
            
    print("\n--- Evaluation Summary ---")
    print(f"Total:  {total}")
    print(f"Passed: {passed} ({(passed/total)*100 if total else 0:.1f}%)")
    print(f"Errors: {errors}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="QueryMind Evaluation Harness")
    parser.add_argument("--data", type=str, default="eval_data.json", help="Path to evaluation JSON dataset")
    args = parser.parse_args()
    
    # We need to set up the environment similar to FastAPI
    from dotenv import load_dotenv
    load_dotenv()
    
    run_evaluation(args.data)
