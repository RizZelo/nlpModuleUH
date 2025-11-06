from google import generativeai as genai
import json
import re
from PIL import Image

def analyze_cv_with_gemini(cv_text: str, job_description: str, api_key: str, cv_images: list = None):
    """
    Analyze CV with Gemini and return structured feedback in your existing structure
    while keeping Gemini's rich inline suggestions and detailed insights.
    Supports multimodal analysis if images are provided.
    
    Args:
        cv_text: The extracted text from the CV
        job_description: The job description to match against (optional)
        api_key: Gemini API key
        cv_images: Optional list of PIL Image objects showing CV layout
    """
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash-exp")

    # Build prompt based on whether job description is provided
    job_context = f"""
Job Description:
{job_description}

Analyze this CV against the job description and provide detailed feedback on job relevance and keyword matching.
""" if job_description and job_description.strip() else """
No specific job description provided. Analyze the CV for general quality, formatting, and best practices.
"""

    # Build prompt based on whether we have images
    if cv_images and len(cv_images) > 0:
        prompt = f"""
Analyze this CV and provide detailed feedback.
You are viewing both the visual layout (images) and the extracted text of the CV.

IMPORTANT: Consider the visual structure, formatting, spacing, and layout when analyzing.

CV Text:
{cv_text}

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
    "inline_suggestions": [
        {{
            "text_snippet": "exact text from CV that needs improvement",
            "issue_type": "grammar|clarity|impact|keyword|formatting",
            "severity": "critical|high|medium|low",
            "section": "which section this belongs to",
            "problem": "what's wrong with this text",
            "suggestion": "specific improvement suggestion",
            "replacement": "suggested replacement text (if applicable)",
            "explanation": "why this change matters"
        }}
    ],
    "quick_wins": [
        {{
            "change": "what to change",
            "where": "which section or part",
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

Guidelines:
- Identify 5–10 high-impact inline suggestions using exact text snippets from the CV.
- Evaluate formatting, content, clarity, job relevance, and visual layout.
- For top_priorities, provide 3-5 actionable items with all required fields.
- For sections, analyze major CV sections (Experience, Education, Skills, Summary, etc).
- For quick_wins, focus on easy, high-impact changes.
- Be concrete, helpful, and specific.
- If no job description provided, focus on general CV best practices and ATS compatibility.
"""
    else:
        prompt = f"""
Analyze this CV and provide detailed feedback.

CV:
{cv_text}

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
    "inline_suggestions": [
        {{
            "text_snippet": "exact text from CV that needs improvement",
            "issue_type": "grammar|clarity|impact|keyword|formatting",
            "severity": "critical|high|medium|low",
            "section": "which section this belongs to",
            "problem": "what's wrong with this text",
            "suggestion": "specific improvement suggestion",
            "replacement": "suggested replacement text (if applicable)",
            "explanation": "why this change matters"
        }}
    ],
    "quick_wins": [
        {{
            "change": "what to change",
            "where": "which section or part",
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

Guidelines:
- Identify 5–10 high-impact inline suggestions using exact text snippets from the CV.
- Evaluate formatting, content, clarity, and job relevance.
- For top_priorities, provide 3-5 actionable items with all required fields.
- For sections, analyze major CV sections (Experience, Education, Skills, Summary, etc).
- For quick_wins, focus on easy, high-impact changes.
- Be concrete, helpful, and specific.
- If no job description provided, focus on general CV best practices and ATS compatibility.
"""

    try:
        # Generate content with or without images
        if cv_images and len(cv_images) > 0:
            # Prepare multimodal content
            content_parts = [prompt]
            
            # Add up to 3 images (to avoid token limits)
            for i, img in enumerate(cv_images[:3]):
                if isinstance(img, str):
                    # If it's a path, load the image
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

        # Convert Gemini structure → frontend-compatible structure
        ats_analysis = parsed.get("ats_analysis", {})
        
        # Validate keyword matches - ensure keywords are actually present in CV text
        cv_text_lower = cv_text.lower()
        validated_keyword_matches = []
        validated_missing_keywords = []
        
        def is_keyword_in_text(keyword, text):
            """Check if keyword exists as a whole word in text using word boundaries"""
            # Escape special regex characters in keyword
            escaped_keyword = re.escape(keyword.lower())
            # Use word boundaries to match whole words only
            pattern = rf'\b{escaped_keyword}\b'
            return bool(re.search(pattern, text.lower()))
        
        # Check keyword_matches - only include if actually in CV
        for keyword in ats_analysis.get("keyword_matches", []):
            if is_keyword_in_text(keyword, cv_text):
                validated_keyword_matches.append(keyword)
            else:
                # If Gemini marked it as matching but it's not in CV, it's actually missing
                validated_missing_keywords.append(keyword)
        
        # Check missing_keywords - only include if NOT in CV
        for keyword in ats_analysis.get("missing_keywords", []):
            if not is_keyword_in_text(keyword, cv_text):
                validated_missing_keywords.append(keyword)
            else:
                # If it's actually in the CV, move it to matches
                validated_keyword_matches.append(keyword)
        
        # Remove duplicates
        validated_keyword_matches = list(set(validated_keyword_matches))
        validated_missing_keywords = list(set(validated_missing_keywords))
        
        analysis_result = {
            'status': 'success',
            'analysis': {
                'overall_score': int(parsed["general"]["overall_score"] * 10),  # scale 0–100
                'ats_score': ats_analysis.get("relevance_score", int((parsed["content"]["score"] + parsed["formatting"]["score"]) * 5)),
                'readability_score': 80 + (parsed["formatting"]["score"] - 5) * 4,
                'summary': parsed["general"]["summary"],
                'critical_issues': parsed["formatting"]["issues"] + parsed["content"]["weaknesses"],
                'inline_suggestions': parsed.get("inline_suggestions", []),
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