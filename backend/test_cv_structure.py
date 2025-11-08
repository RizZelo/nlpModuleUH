"""
Tests for CV Structure Parser
"""

import json
from cv_structure_parser import parse_cv_to_structured_data, apply_suggestion_to_structured_cv


def test_apply_suggestion_simple_field():
    """Test applying suggestion to a simple field"""
    structured_cv = {
        "summary": "Old summary text",
        "experience": [],
        "skills": {}
    }
    
    suggestion = {
        "targetField": "summary",
        "fieldPath": ["summary"],
        "improvedValue": "New improved summary text"
    }
    
    updated_cv = apply_suggestion_to_structured_cv(structured_cv, suggestion)
    
    assert updated_cv["summary"] == "New improved summary text"
    assert structured_cv["summary"] == "Old summary text"  # Original unchanged


def test_apply_suggestion_nested_field():
    """Test applying suggestion to a nested field"""
    structured_cv = {
        "summary": "Summary",
        "experience": [
            {
                "id": "exp_1",
                "title": "Developer",
                "description": "Old description"
            },
            {
                "id": "exp_2",
                "title": "Engineer",
                "description": "Another description"
            }
        ]
    }
    
    suggestion = {
        "targetField": "experience",
        "fieldPath": ["experience", 0, "description"],
        "improvedValue": "New improved description with more details"
    }
    
    updated_cv = apply_suggestion_to_structured_cv(structured_cv, suggestion)
    
    assert updated_cv["experience"][0]["description"] == "New improved description with more details"
    assert updated_cv["experience"][1]["description"] == "Another description"  # Other unchanged
    assert structured_cv["experience"][0]["description"] == "Old description"  # Original unchanged


def test_apply_suggestion_contact_nested():
    """Test applying suggestion to nested contact field"""
    structured_cv = {
        "summary": "Summary",
        "contact": {
            "name": "John Doe",
            "email": "old@email.com",
            "phone": "123-456"
        }
    }
    
    suggestion = {
        "targetField": "contact",
        "fieldPath": ["contact", "email"],
        "improvedValue": "new@email.com"
    }
    
    updated_cv = apply_suggestion_to_structured_cv(structured_cv, suggestion)
    
    assert updated_cv["contact"]["email"] == "new@email.com"
    assert updated_cv["contact"]["name"] == "John Doe"  # Other fields unchanged


if __name__ == "__main__":
    print("Running CV Structure Parser tests...")
    
    try:
        test_apply_suggestion_simple_field()
        print("✅ test_apply_suggestion_simple_field passed")
    except AssertionError as e:
        print(f"❌ test_apply_suggestion_simple_field failed: {e}")
    
    try:
        test_apply_suggestion_nested_field()
        print("✅ test_apply_suggestion_nested_field passed")
    except AssertionError as e:
        print(f"❌ test_apply_suggestion_nested_field failed: {e}")
    
    try:
        test_apply_suggestion_contact_nested()
        print("✅ test_apply_suggestion_contact_nested passed")
    except AssertionError as e:
        print(f"❌ test_apply_suggestion_contact_nested failed: {e}")
    
    print("\nAll tests completed!")
