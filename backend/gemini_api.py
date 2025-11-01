from google import generativeai as genai
import json
import re

def analyze_cv_with_gemini(cv_text: str, job_description: str, api_key: str):
    """
    Analyze CV with Gemini and return structured feedback in your existing structure
    while keeping Gemini’s rich inline suggestions and detailed insights.
    """
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash-exp")

    prompt = f"""
Analyze this CV against the job description and provide detailed feedback.

CV:
{cv_text}

Job Description:
{job_description}

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

Guidelines:
- Identify 5–10 high-impact inline suggestions using exact text snippets.
- Evaluate formatting, content, clarity, and job relevance.
- Be concrete, helpful, and specific.
"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Remove any markdown code blocks
        json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1).strip()

        parsed = json.loads(response_text)

        # Convert Gemini structure → your original structure
        analysis_result = {
            'status': 'success',
            'analysis': {
                'overall_score': int(parsed["general"]["overall_score"] * 10),  # scale 0–100
                'ats_score': int((parsed["content"]["score"] + parsed["formatting"]["score"]) * 5),
                'readability_score': 80 + (parsed["formatting"]["score"] - 5) * 4,
                'summary': parsed["general"]["summary"],
                'critical_issues': parsed["formatting"]["issues"] + parsed["content"]["weaknesses"],
                'inline_suggestions': parsed.get("inline_suggestions", []),
                'section_analysis': parsed["content"]["strengths"],
                'quick_wins': parsed["content"]["suggestions"][:3],
                'top_priorities': parsed["general"]["top_priorities"],
                'grammar_and_clarity': {"issues": parsed["formatting"]["issues"]},
                'job_match_analysis': {"relevance_score": parsed["content"]["score"] * 10},
                'global_analysis': {
                    "formatting_score": parsed["formatting"]["score"],
                    "content_score": parsed["content"]["score"]
                }
            }
        }

        return analysis_result

    except json.JSONDecodeError as e:
        print("❌ JSON parsing error:", str(e))
        print("Raw response:", response_text[:300])
        return {
            "status": "error",
            "message": "Failed to parse Gemini response",
            "raw_output": response_text[:300]
        }

    except Exception as e:
        print("❌ Gemini API error:", str(e))
        return {
            "status": "error",
            "message": f"Gemini API error: {str(e)}"
        }