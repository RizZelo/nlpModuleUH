"""
Ollama API Module for Structured CV Analysis
Generates suggestions that target specific fields in the structured CV data using local LLM
"""

import json
import re
import requests
from typing import Dict, List, Optional
from PIL import Image
import base64
import io


class OllamaClient:
    """Client for interacting with Ollama API"""
    
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.1:8b"):
        self.base_url = base_url.rstrip('/')
        self.model = model
        
    def _encode_image_to_base64(self, image: Image.Image) -> str:
        """Convert PIL Image to base64 string"""
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        img_data = buffer.getvalue()
        return base64.b64encode(img_data).decode('utf-8')
    
    def generate_chat(self, messages: List[Dict], images: Optional[List[Image.Image]] = None) -> str:
        """Generate response using Ollama chat API"""
        
        # Prepare the messages
        formatted_messages = []
        
        # If images are provided, add them to the first message
        if images and len(images) > 0:
            image_data = []
            for img in images[:3]:  # Limit to 3 images like Gemini
                if isinstance(img, str):
                    img = Image.open(img)
                image_data.append(self._encode_image_to_base64(img))
            
            # For vision models, we need to include images
            formatted_messages = [
                {
                    "role": "user",
                    "content": messages[0]["content"],
                    "images": image_data
                }
            ]
        else:
            formatted_messages = messages
        
        try:
            response = requests.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": formatted_messages,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,  # Lower temperature for more consistent JSON output
                        "top_k": 10,
                        "top_p": 0.9
                    }
                },
                timeout=120  # 2 minutes timeout for complex analysis
            )
            
            response.raise_for_status()
            result = response.json()
            
            return result["message"]["content"]
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Ollama API request failed: {str(e)}")
        except KeyError as e:
            raise Exception(f"Unexpected Ollama API response format: {str(e)}")


def check_ollama_connection(base_url: str = "http://localhost:11434", model: str = "llama3.1:8b") -> Dict:
    """Check if Ollama is running and model is available"""
    try:
        # Check if Ollama is running
        response = requests.get(f"{base_url.rstrip('/')}/api/tags", timeout=10)
        response.raise_for_status()
        
        available_models = response.json()
        model_names = [m["name"] for m in available_models.get("models", [])]
        
        model_available = any(model in name for name in model_names)
        
        return {
            "ollama_running": True,
            "model_available": model_available,
            "available_models": model_names,
            "recommended_models": [
                "llama3.1:8b",
                "llama3.1:70b", 
                "mistral:7b",
                "codellama:7b",
                "qwen2.5:7b"
            ]
        }
        
    except requests.exceptions.RequestException:
        return {
            "ollama_running": False,
            "model_available": False,
            "available_models": [],
            "error": "Ollama is not running or not accessible"
        }


def analyze_structured_cv_with_ollama(
    structured_cv: dict, 
    job_description: str, 
    ollama_url: str = "http://localhost:11434",
    model: str = "llama3.1:8b",
    cv_images: list = None
) -> dict:
    """
    Analyze structured CV data with Ollama and return field-targeted suggestions.
    
    Args:
        structured_cv: The structured CV data (from cv_structure_parser)
        job_description: The job description to match against (optional)
        ollama_url: Ollama server URL (default: http://localhost:11434)
        model: Ollama model name (default: llama3.1:8b)
        cv_images: Optional list of PIL Image objects showing CV layout
    
    Returns:
        dict: Analysis with field-targeted suggestions
    """
    
    # Initialize Ollama client
    client = OllamaClient(base_url=ollama_url, model=model)
    
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
You are an expert CV/resume reviewer. Analyze this structured CV and provide detailed, field-targeted feedback with STRICT, REALISTIC scoring.

Structured CV Data:
{cv_json}

{job_context}

CRITICAL LANGUAGE REQUIREMENT – READ THIS FIRST:

STEP 1: Detect the CV's language by examining the actual text content:
-Look at job titles, education, descriptions, skills in the CV data above
-Identify if it's English, French, Arabic, Spanish, or another language
STEP 2: Use ONLY that detected language for ALL your responses:
-ALL recommendations → in CV's language
-ALL suggestions → in CV's language
-ALL improvedValue fields → in CV's language
-ALL explanations → in CV's language
-ALL problem descriptions → in CV's language
-ALL feedback → in CV's language

SCORING RUBRIC (Be strict and honest):

**Overall Score (0-10):**
- 9-10: Exceptional - Ready to compete for top positions, zero improvements needed, perfect quantification
- 7-8: Strong - Minor tweaks needed, well-structured with good metrics and compelling content
- 5-6: Good foundation - Several improvements needed, lacks quantification or has generic content
- 3-4: Needs work - Major gaps in content, weak descriptions, poor structure, or missing key information
- 0-2: Poor - Requires complete overhaul, unprofessional, or incomprehensible

**Formatting Score (0-10):**
- 9-10: Perfect visual hierarchy, consistent spacing, ATS-friendly, professional structure
- 7-8: Clean layout with 1-2 minor inconsistencies
- 5-6: Readable but has formatting issues, inconsistent spacing, or cluttered sections
- 3-4: Poor structure, hard to scan, inconsistent formatting throughout
- 0-2: Chaotic layout, unprofessional, multiple major formatting issues

**Content Score (0-10):**
- 9-10: All bullets quantified, strong action verbs, highly relevant, zero fluff, impactful achievements
- 7-8: Good content with some quantification, mostly strong verbs, 1-2 weak bullets
- 5-6: Adequate but generic, minimal metrics, lacks specific achievements
- 3-4: Vague descriptions, no quantification, weak verbs, significant gaps
- 0-2: Minimal detail, no achievements, passive voice throughout

**Section Quality Score (0-10):**
- 9-10: Perfectly tailored, compelling, comprehensive, every bullet is strong
- 7-8: Strong with 1-2 bullets needing improvement
- 5-6: Functional but has generic content or missing key elements
- 3-4: Weak, unclear, poorly organized, or mostly generic
- 0-2: Missing critical information, confusing, or very poor quality

**ATS Relevance Score (0-100):**
- 90-100: Matches 90%+ of job requirements, optimal keyword density, perfect alignment
- 70-89: Matches 70-89% of requirements, good keyword usage with minor gaps
- 50-69: Matches 50-69% of requirements, some important keywords missing
- 30-49: Matches 30-49% of requirements, significant gaps in keywords
- 0-29: Poor match, most critical keywords missing

CRITICAL SCORING GUIDELINES:
- **Default to 5-6/10 for average CVs** - Most CVs are not excellent, be realistic
- **Only award 9-10/10 if truly exceptional** - No room for improvement
- **Be harsh but fair** - Identify real problems that hurt job prospects

**Automatic Penalties (deduct from scores):**
- Each generic statement without metrics ("responsible for", "worked on", "helped with"): -0.5 points
- Each bullet missing quantification (no numbers, %, scale, or timeframe): -0.5 points
- Grammatical errors or typos: -0.5 points each
- Passive voice or weak verbs ("was", "did", "made"): -0.3 points each
- Vague descriptions without specifics: -0.5 points each
- Irrelevant content for target job: -1 point per section
- Clichés without substance ("team player", "hard worker", "detail-oriented"): -0.3 each
- Missing critical information (dates, company names, achievements): -1 point per instance
- Poor formatting or inconsistent structure: -1 to -2 points total
- No summary or weak summary: -1 point

**Award Points For:**
- Specific, quantified achievements with clear impact: +1 per strong bullet
- Action verbs with measurable outcomes: +0.5
- Relevant keywords naturally integrated: +0.5
- Clear progression and growth shown: +1
- Tailored content matching job description: +1-2

**Severity Classifications:**
- **Critical**: Blocks job application or severely damages credibility
- **High**: Significantly weakens CV impact
- **Medium**: Noticeable but not deal-breaking
- **Low**: Polish and optimization

FIELD-TARGETED SUGGESTIONS REQUIREMENTS:
- Must identify EXACT field location using fieldPath
- Every suggestion needs concrete "improvedValue" with complete replacement text **IN THE SAME LANGUAGE AS THE CV**
- Focus on highest-impact changes first (prioritize High severity)
- Identify at least 3-5 critical/high severity issues if they exist
- Don't suggest changes to text that's already strong (9-10/10 quality)
- Be specific about WHY each change matters (recruiter impact, ATS compatibility, clarity)
- **All explanations, problems, and suggestions must be in the CV's language**

You MUST return your response as a valid JSON object with this EXACT structure (no markdown, no code blocks):

{{
    "formatting": {{
        "score": <number 0-10>,
        "issues": ["Specific issue with exact location (IN CV LANGUAGE)"],
        "suggestions": ["Actionable fix with example (IN CV LANGUAGE)"]
    }},
    "content": {{
        "score": <number 0-10>,
        "strengths": ["Specific strength with concrete example from CV (IN CV LANGUAGE)"],
        "weaknesses": ["Specific weakness with location (IN CV LANGUAGE)"],
        "suggestions": ["Concrete improvement with before/after example (IN CV LANGUAGE)"]
    }},
    "general": {{
        "overall_score": <number 0-10>,
        "summary": "Honest 2-3 sentence assessment explaining the score (IN CV LANGUAGE)",
        "top_priorities": [
            {{
                "priority": 1,
                "action": "Specific, actionable task with exact location (IN CV LANGUAGE)",
                "impact": "High|Medium|Low",
                "time_estimate": "5 mins|15 mins|30 mins|1 hour",
                "category": "Formatting|Content|Keywords|ATS"
            }}
        ]
    }},
    "sections": [
        {{
            "name": "Experience|Education|Skills|Summary|etc",
            "quality_score": <number 0-10>,
            "feedback": "Specific, honest feedback with examples from section (IN CV LANGUAGE)",
            "suggestions": ["Concrete suggestion with example (IN CV LANGUAGE)"]
        }}
    ],
    "field_suggestions": [
        {{
            "suggestionId": <unique number>,
            "targetField": "summary|experience|education|skills|etc",
            "fieldPath": ["experience", 0, "description"],
            "fieldId": "exp_1|edu_1|skill_1",
            "originalValue": "EXACT current value of the field from CV (IN ORIGINAL CV LANGUAGE)",
            "improvedValue": "Complete suggested replacement text (IN CV LANGUAGE)",
            "issue_type": "grammar|clarity|impact|keyword|formatting",
            "severity": "critical|high|medium|low",
            "problem": "Clear explanation of what's wrong (IN CV LANGUAGE)",
            "explanation": "Why this change matters for recruiters/ATS (IN CV LANGUAGE)",
            "impact": "High|Medium|Low"
        }}
    ],
    "quick_wins": [
        {{
            "change": "Specific change with exact location (IN CV LANGUAGE)",
            "where": "Exact section and position (IN CV LANGUAGE)",
            "targetField": "field name if applicable",
            "fieldPath": ["path", "to", "field"],
            "effort": "5 mins|15 mins",
            "impact": "High|Medium"
        }}
    ],
    "ats_analysis": {{
        "relevance_score": <number 0-100>,
        "keyword_matches": ["Specific keywords found (IN CV LANGUAGE)"],
        "missing_keywords": ["Critical keywords missing (IN CV LANGUAGE)"],
        "recommendations": ["Specific placement suggestions (IN CV LANGUAGE)"]
    }}
}}

IMPORTANT: 
- Response must be ONLY valid JSON, no markdown code blocks, no extra text
- All text fields must be in the same language as the CV
- Average CVs score 5-6/10, not 8/10
- Only exceptional CVs deserve 9-10/10
- Focus on high-impact, actionable suggestions
"""

    try:
        messages = [{"role": "user", "content": prompt}]
        
        # Generate content with or without images
        if cv_images and len(cv_images) > 0:
            print(f"   🖼️  Sending {len(cv_images)} images to Ollama for visual analysis...")
            response_text = client.generate_chat(messages, images=cv_images)
        else:
            response_text = client.generate_chat(messages)
        
        response_text = response_text.strip()
        
        # Clean up response - remove any markdown code blocks that might have been added
        json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1).strip()
        
        # Remove any leading/trailing text that isn't JSON
        start_brace = response_text.find('{')
        end_brace = response_text.rfind('}')
        
        if start_brace != -1 and end_brace != -1:
            response_text = response_text[start_brace:end_brace+1]
        
        try:
            parsed = json.loads(response_text)
        except json.JSONDecodeError:
            # Try to fix common JSON issues
            response_text = response_text.replace('\n', ' ').replace('\r', '')
            response_text = re.sub(r',\s*}', '}', response_text)
            response_text = re.sub(r',\s*]', ']', response_text)
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
            keyword_clean = keyword.split('(')[0].strip()  # Remove count info if present
            if is_keyword_in_text(keyword_clean, cv_text):
                validated_keyword_matches.append(keyword)
            else:
                validated_missing_keywords.append(keyword)
        
        for keyword in ats_analysis.get("missing_keywords", []):
            keyword_clean = keyword.split('(')[0].strip()
            if not is_keyword_in_text(keyword_clean, cv_text):
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
                'field_suggestions': parsed.get("field_suggestions", []),  # Field-targeted suggestions
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
        
        print(f"✅ Generated {len(parsed.get('field_suggestions', []))} field-targeted suggestions using Ollama")
        return analysis_result
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {str(e)}")
        print(f"Raw response: {response_text[:300]}...")
        return {
            "status": "error",
            "message": "Failed to parse Ollama response as JSON",
            "raw_output": response_text[:500]
        }
    
    except Exception as e:
        print(f"❌ Ollama API error: {str(e)}")
        return {
            "status": "error",
            "message": f"Ollama API error: {str(e)}"
        }