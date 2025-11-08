"""
Enhanced Gemini API Module for Structured CV Analysis
Generates suggestions that target specific fields in the structured CV data
"""

from google import generativeai as genai
import json
import re
from PIL import Image


def analyze_structured_cv_with_gemini(structured_cv: dict, job_description: str, api_key: str, cv_images: list = None):
    """
    Analyze structured CV data with Gemini and return field-targeted suggestions.
    
    Args:
        structured_cv: The structured CV data (from cv_structure_parser)
        job_description: The job description to match against (optional)
        api_key: Gemini API key
        cv_images: Optional list of PIL Image objects showing CV layout
    
    Returns:
        dict: Analysis with field-targeted suggestions
    """
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash-exp")
    
    # Convert structured CV to readable format for AI
    cv_json = json.dumps(structured_cv, indent=2)
    
    # Build prompt based on whether job description is provided
    job_context = f"""
Job Description:
{job_description}

Analyze this structured CV against the job description and provide detailed feedback on job relevance and keyword matching.
""" if job_description and job_description.strip() else """
No specific job description provided. Analyze the CV for general quality, formatting, and best practices.
"""
    
    prompt = f"""
Analyze this structured CV and provide detailed, field-targeted feedback.

Structured CV Data:
{cv_json}

{job_context}

Return your response as **valid JSON** with this EXACT structure (no markdown):

{{
    "formatting": {{
        "score": <number 0-10>,
        "issues": ["issue1", "issue2"],
        "suggestions": ["suggestion1", "suggestion2"]
    }},
    "content": {{
        "score": <number 0-10>,
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "suggestions": ["suggestion1", "suggestion2"]
    }},
    "general": {{
        "overall_score": <number 0-10>,
        "summary": "brief overall assessment in 2-3 sentences",
        "top_priorities": [
            {{
                "priority": 1,
                "action": "specific action to take",
                "impact": "High|Medium|Low",
                "time_estimate": "5 mins|15 mins|30 mins|1 hour",
                "category": "Formatting|Content|Keywords|ATS"
            }}
        ]
    }},
    "sections": [
        {{
            "name": "Experience|Education|Skills|etc",
            "quality_score": <number 0-10>,
            "feedback": "specific feedback for this section",
            "suggestions": ["suggestion1", "suggestion2"]
        }}
    ],
    "field_suggestions": [
        {{
            "suggestionId": <unique number>,
            "targetField": "summary|experience|education|skills|etc",
            "fieldPath": ["experience", 0, "description"],
            "fieldId": "exp_1 (the ID from structured CV)",
            "originalValue": "Current value of the field",
            "improvedValue": "Suggested improved value",
            "issue_type": "grammar|clarity|impact|keyword|formatting",
            "severity": "critical|high|medium|low",
            "problem": "what's wrong with this field",
            "explanation": "why this change matters",
            "impact": "High|Medium|Low"
        }}
    ],
    "quick_wins": [
        {{
            "change": "what to change",
            "where": "which section or part",
            "targetField": "field name if applicable",
            "fieldPath": ["path", "to", "field"],
            "effort": "5 mins|15 mins",
            "impact": "High|Medium"
        }}
    ],
    "ats_analysis": {{
        "relevance_score": <number 0-100>,
        "keyword_matches": ["keyword1", "keyword2"],
        "missing_keywords": ["keyword1", "keyword2"],
        "recommendations": ["recommendation1", "recommendation2"]
    }}
}}

IMPORTANT Guidelines for field_suggestions:
- Each suggestion must target a SPECIFIC field in the structured CV
- Use fieldPath to indicate the exact location: ["experience", 0, "description"] means experience[0].description
- For simple fields: ["summary"] or ["contact", "email"]
- For array items: ["experience", 1, "title"] means experience[1].title
- Include the fieldId (like "exp_1") to help identify the entry
- originalValue must match the current value in the CV
- improvedValue should be the complete improved text for that field
- Provide 5-15 high-impact field-targeted suggestions
- Focus on fields that will have the most impact on CV effectiveness

For other fields:
- Evaluate formatting, content, clarity, job relevance, and visual layout
- For top_priorities, provide 3-5 actionable items with all required fields
- For sections, analyze major CV sections (Experience, Education, Skills, Summary, etc.)
- For quick_wins, focus on easy, high-impact changes with field references when applicable
- Be concrete, helpful, and specific
"""
    
    try:
        # Generate content with or without images
        if cv_images and len(cv_images) > 0:
            content_parts = [prompt]
            for i, img in enumerate(cv_images[:3]):
                if isinstance(img, str):
                    img = Image.open(img)
                content_parts.append(img)
            print(f"   🖼️  Sending {len(content_parts) - 1} images to Gemini for visual analysis...")
            response = model.generate_content(content_parts)
        else:
            response = model.generate_content(prompt)
        
        response_text = response.text.strip()
        
        # Remove any markdown code blocks
        json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1).strip()
        
        parsed = json.loads(response_text)
        
        # Convert to frontend-compatible structure
        ats_analysis = parsed.get("ats_analysis", {})
        
        # Validate keywords (similar to original implementation)
        cv_text = json.dumps(structured_cv).lower()
        validated_keyword_matches = []
        validated_missing_keywords = []
        
        def is_keyword_in_text(keyword, text):
            escaped_keyword = re.escape(keyword.lower())
            pattern = rf'\b{escaped_keyword}\b'
            return bool(re.search(pattern, text.lower()))
        
        for keyword in ats_analysis.get("keyword_matches", []):
            if is_keyword_in_text(keyword, cv_text):
                validated_keyword_matches.append(keyword)
            else:
                validated_missing_keywords.append(keyword)
        
        for keyword in ats_analysis.get("missing_keywords", []):
            if not is_keyword_in_text(keyword, cv_text):
                validated_missing_keywords.append(keyword)
            else:
                validated_keyword_matches.append(keyword)
        
        validated_keyword_matches = list(set(validated_keyword_matches))
        validated_missing_keywords = list(set(validated_missing_keywords))
        
        analysis_result = {
            'status': 'success',
            'analysis': {
                'overall_score': int(parsed["general"]["overall_score"] * 10),
                'ats_score': ats_analysis.get("relevance_score", int((parsed["content"]["score"] + parsed["formatting"]["score"]) * 5)),
                'readability_score': 80 + (parsed["formatting"]["score"] - 5) * 4,
                'summary': parsed["general"]["summary"],
                'critical_issues': parsed["formatting"]["issues"] + parsed["content"]["weaknesses"],
                'field_suggestions': parsed.get("field_suggestions", []),  # NEW: Field-targeted suggestions
                'section_analysis': parsed.get("sections", []),
                'quick_wins': parsed.get("quick_wins", []),
                'top_priorities': parsed["general"]["top_priorities"],
                'grammar_and_clarity': {"issues": parsed["formatting"]["issues"]},
                'job_match_analysis': {
                    "relevance_score": ats_analysis.get("relevance_score", parsed["content"]["score"] * 10),
                    "keyword_matches": validated_keyword_matches,
                    "missing_keywords": validated_missing_keywords,
                    "recommendations": ats_analysis.get("recommendations", [])
                },
                'global_analysis': {
                    "formatting_score": parsed["formatting"]["score"],
                    "content_score": parsed["content"]["score"]
                }
            }
        }
        
        print(f"✅ Generated {len(parsed.get('field_suggestions', []))} field-targeted suggestions")
        return analysis_result
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {str(e)}")
        print(f"Raw response: {response_text[:300]}")
        return {
            "status": "error",
            "message": "Failed to parse Gemini response",
            "raw_output": response_text[:300]
        }
    
    except Exception as e:
        print(f"❌ Gemini API error: {str(e)}")
        return {
            "status": "error",
            "message": f"Gemini API error: {str(e)}"
        }
