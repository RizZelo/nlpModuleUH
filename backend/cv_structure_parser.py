"""
CV Structure Parser Module
Parses CV text into structured fields using AI (Gemini)
"""

from google import generativeai as genai
import json
import re


def parse_cv_to_structured_data(cv_text: str, api_key: str) -> dict:
    """
    Parse CV text into structured data format using Gemini AI.
    
    Args:
        cv_text: The raw CV text
        api_key: Gemini API key
    
    Returns:
        dict: Structured CV data with fields like summary, experience, skills, etc.
    """
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash-exp")
    
    prompt = f"""
Parse this CV/resume into a structured JSON format. Extract and organize all information.

CV Text:
{cv_text}

Return ONLY valid JSON (no markdown) with this structure:

{{
    "summary": "Professional summary or objective statement (if present)",
    "contact": {{
        "name": "Full name",
        "email": "email@example.com",
        "phone": "phone number",
        "location": "city, country",
        "linkedin": "LinkedIn URL",
        "github": "GitHub URL",
        "portfolio": "Portfolio URL"
    }},
    "experience": [
        {{
            "id": "exp_1",
            "title": "Job title",
            "company": "Company name",
            "location": "Location",
            "startDate": "Start date",
            "endDate": "End date or Present",
            "description": "Full description of responsibilities and achievements",
            "bullets": ["Bullet point 1", "Bullet point 2"]
        }}
    ],
    "education": [
        {{
            "id": "edu_1",
            "degree": "Degree name",
            "institution": "School/University name",
            "location": "Location",
            "startDate": "Start date",
            "endDate": "End date or Expected",
            "gpa": "GPA if mentioned",
            "description": "Additional details",
            "achievements": ["Achievement 1", "Achievement 2"]
        }}
    ],
    "skills": {{
        "technical": ["skill1", "skill2"],
        "languages": ["language1", "language2"],
        "tools": ["tool1", "tool2"],
        "soft_skills": ["skill1", "skill2"],
        "other": ["other skill 1", "other skill 2"]
    }},
    "projects": [
        {{
            "id": "proj_1",
            "name": "Project name",
            "description": "Project description",
            "technologies": ["tech1", "tech2"],
            "link": "Project URL if available"
        }}
    ],
    "certifications": [
        {{
            "id": "cert_1",
            "name": "Certification name",
            "issuer": "Issuing organization",
            "date": "Date obtained",
            "credential": "Credential ID or URL"
        }}
    ],
    "awards": [
        {{
            "id": "award_1",
            "name": "Award name",
            "issuer": "Issuing organization",
            "date": "Date",
            "description": "Description"
        }}
    ],
    "publications": [
        {{
            "id": "pub_1",
            "title": "Publication title",
            "authors": "Authors",
            "venue": "Conference/Journal name",
            "date": "Date",
            "link": "URL if available"
        }}
    ],
    "activities": [
        {{
            "id": "act_1",
            "organization": "Organization name (e.g., IEEE, club, association)",
            "title": "Role/Position",
            "startDate": "Start date",
            "endDate": "End date or Present",
            "description": "Description of involvement and achievements"
        }}
    ],
    "volunteer": [
        {{
            "id": "vol_1",
            "organization": "Organization name",
            "role": "Role/Position",
            "startDate": "Start date",
            "endDate": "End date or Present",
            "description": "Description"
        }}
    ],
    "other_sections": {{
        "section_name_1": [
            {{
                "id": "other_1",
                "content": "Any content that doesn't fit standard categories"
            }}
        ]
    }}
}}

Guidelines:
- Extract ALL information from the CV accurately, including unusual or non-standard sections
- Use "Not provided" for missing fields
- Generate unique IDs for each entry (exp_1, exp_2, edu_1, etc.)
- Preserve the original wording and details
- If a section is completely absent, use an empty array or object
- For experience/education bullets, try to extract individual points
- Skills should be categorized appropriately
- Activities should include: clubs, associations, memberships, extracurricular activities, leadership roles
- Common activity section names: "Vie Associative", "Extracurricular Activities", "Leadership", "Memberships", "Student Organizations"
- If you find sections that don't match the standard fields above, add them to "other_sections" with the section name as the key
- Capture EVERY section header you see in the CV, even if it's unique or uncommon
"""
    
    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Remove any markdown code blocks
        json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1).strip()
        
        parsed = json.loads(response_text)
        
        # Add metadata
        result = {
            "status": "success",
            "structured_data": parsed,
            "original_text": cv_text
        }
        
        print(f"✅ Successfully parsed CV into structured data")
        print(f"   - Experience entries: {len(parsed.get('experience', []))}")
        print(f"   - Education entries: {len(parsed.get('education', []))}")
        print(f"   - Skills categories: {len(parsed.get('skills', {}).keys())}")
        print(f"   - Projects: {len(parsed.get('projects', []))}")
        
        return result
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {str(e)}")
        print(f"Raw response: {response_text[:300]}")
        return {
            "status": "error",
            "message": "Failed to parse CV structure",
            "original_text": cv_text
        }
    
    except Exception as e:
        print(f"❌ Error parsing CV structure: {str(e)}")
        return {
            "status": "error",
            "message": f"Error: {str(e)}",
            "original_text": cv_text
        }


def apply_suggestion_to_structured_cv(structured_cv: dict, suggestion: dict) -> dict:
    """
    Apply a suggestion to the structured CV data.
    
    Args:
        structured_cv: The structured CV data
        suggestion: Suggestion with targetField and improvedValue
    
    Returns:
        dict: Updated structured CV data
    """
    target_field = suggestion.get('targetField')
    improved_value = suggestion.get('improvedValue')
    field_path = suggestion.get('fieldPath', [])
    
    if not target_field or not improved_value:
        return structured_cv
    
    # Create a copy to avoid mutating the original
    updated_cv = json.loads(json.dumps(structured_cv))
    
    # Navigate to the target field using the field_path
    current = updated_cv
    
    try:
        # If field_path is provided, navigate through nested structure
        if field_path:
            for i, key in enumerate(field_path[:-1]):
                if isinstance(current, list):
                    current = current[int(key)]
                else:
                    current = current[key]
            
            # Update the final field
            final_key = field_path[-1]
            if isinstance(current, list):
                current[int(final_key)] = improved_value
            else:
                current[final_key] = improved_value
        else:
            # Simple field update
            updated_cv[target_field] = improved_value
        
        print(f"✅ Applied suggestion to field: {target_field}")
        return updated_cv
        
    except (KeyError, IndexError, TypeError) as e:
        print(f"❌ Error applying suggestion: {str(e)}")
        return structured_cv
