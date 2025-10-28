from google import generativeai as genai

def analyze_cv_with_gemini(cv_text: str, job_description: str, api_key: str):
    try:
        genai.configure(api_key=api_key)

        # ✅ Use the correct model name for Google AI Studio API keys
        model = genai.GenerativeModel(model_name="gemini-2.5-flash")

        prompt = f"""
        You are a career coach AI. Given the following CV and job description,
        analyze the candidate’s suitability and recommend improvements.

        === CV ===
        {cv_text}

        === Job Description ===
        {job_description}

        Return your answer in plain text.
        """

        response = model.generate_content(prompt)
        return {"analysis": response.text}
    
    except Exception as e:
        return {"error": str(e)}
