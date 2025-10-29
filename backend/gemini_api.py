from google import generativeai as genai
import json
import re

def analyze_cv_with_gemini(cv_text: str, job_description: str, api_key: str):
    """
    Analyze CV with Gemini and return structured feedback with inline suggestions
    """
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash-exp")
        
        prompt = f"""
Analyze this CV against the job description and provide detailed feedback.

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
    }},
    "inline_suggestions": [
        {{
            "text_snippet": "exact text from CV that needs improvement",
            "issue_type": "grammar|clarity|impact|keyword|formatting",
            "problem": "what's wrong with this text",
            "suggestion": "specific improvement suggestion",
            "replacement": "suggested replacement text (if applicable)"
        }}
    ]
}}

For inline_suggestions:
- Identify 5-10 specific phrases or sentences from the CV that need improvement
- Use exact text snippets (10-50 words) that appear in the CV
- Provide actionable replacements when possible
- Focus on high-impact improvements

Focus on:
- Formatting: layout, structure, consistency, white space
- Content: relevance to job, achievements, keywords, impact, clarity
- Grammar and clarity issues
- Missing or weak action verbs
- Lack of quantifiable achievements

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
        
        # Validate inline_suggestions structure
        if "inline_suggestions" not in result:
            result["inline_suggestions"] = []
        
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