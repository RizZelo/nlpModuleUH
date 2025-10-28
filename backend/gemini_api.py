from google import generativeai as genai
import json
import re

def analyze_cv_with_gemini(cv_text: str, job_description: str, api_key: str):
    """
    Analyze CV with Gemini and return structured feedback in 3 categories
    """
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash-exp")
        
        prompt = f"""
Analyze this CV against the job description and provide feedback in THREE separate categories.

CV:
{cv_text}

Job Description:
{job_description}

Return your response as valid JSON with this EXACT structure (no markdown, just pure JSON):
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
        "top_priorities": ["priority1", "priority2", "priority3"]
    }}
}}

Focus on:
- Formatting: layout, structure, consistency, white space, font usage
- Content: relevance to job, achievements, keywords, impact, clarity
- General: overall impression and most critical improvements needed

Be specific, actionable, and honest in your assessment.
"""
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1).strip()
        
        # Parse JSON
        result = json.loads(response_text)
        
        return {
            "status": "success",
            "analysis": result
        }
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {str(e)}")
        print(f"Raw response: {response_text[:500]}")
        return {
            "error": "Failed to parse Gemini response as JSON",
            "raw_response": response_text[:500]
        }
    
    except Exception as e:
        print(f"❌ Gemini API error: {str(e)}")
        return {
            "error": f"Gemini API error: {str(e)}"
        }