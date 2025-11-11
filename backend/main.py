from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from parser import parse_document, parse_document_with_images
from cv_structure_parser import parse_cv_to_structured_data, apply_suggestion_to_structured_cv
from gemini_api_structured import analyze_structured_cv_with_gemini
from ollama_api_structured import analyze_structured_cv_with_ollama, check_ollama_connection
from google import generativeai as genai
import tempfile
import os
import json
import base64
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

# Suppress gRPC warnings
os.environ['GRPC_VERBOSITY'] = 'ERROR'
os.environ['GLOG_minloglevel'] = '2'

# File storage directories (store JSON files under backend/data/...)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
CV_DATA_DIR = os.path.join(DATA_DIR, 'cv_data')
ANALYSIS_DIR = os.path.join(DATA_DIR, 'analysis')

# Ensure directories exist
os.makedirs(CV_DATA_DIR, exist_ok=True)
os.makedirs(ANALYSIS_DIR, exist_ok=True)

app = FastAPI()

# ⚠️ IMPORTANT: Configure your LLM settings
# For Gemini (fallback)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY_HERE")

# For Ollama (primary)
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")

# Choose your Gemini model (fallback)
GEMINI_MODEL = genai.GenerativeModel(model_name="gemini-2.5-flash")


# Allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; use your React URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

"""
Removed legacy /analyze endpoint. Use POST /analyze-structured instead.
"""


@app.get("/")
async def root():
    """Health check endpoint"""
    ollama_status = check_ollama_connection(OLLAMA_URL, OLLAMA_MODEL)
    
    return {
        "status": "API is running!",
        "message": "Use POST /analyze-structured to process CVs",
        "version": "2.0.0 - Ollama Edition",
        "llm_status": {
            "primary": "Ollama",
            "ollama_running": ollama_status["ollama_running"],
            "ollama_model": OLLAMA_MODEL,
            "model_available": ollama_status["model_available"],
            "available_models": ollama_status.get("available_models", []),
            "gemini_fallback_configured": GEMINI_API_KEY != "YOUR_API_KEY_HERE"
        }
    }


@app.get("/latest-cv")
async def get_latest_cv():
    """Get the most recently saved CV data"""
    try:
        # Find all JSON files in the cv_data folder
        json_files = [f for f in os.listdir(CV_DATA_DIR) if f.startswith('cv_data_') and f.endswith('.json')]

        if not json_files:
            return {"error": "No CV data files found"}

            # Get the most recent file (sorted by filename timestamp)
            latest_basename = sorted(json_files)[-1]
            latest_path = os.path.join(CV_DATA_DIR, latest_basename)

            with open(latest_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            return {
                "filename": latest_basename,
                "data": data
                }
    
    except Exception as e:
        return {"error": f"Failed to read CV data: {str(e)}"}


@app.get("/latest-analysis")
async def get_latest_analysis():
    """Get the most recent Gemini analysis"""
    try:
        # Find all analysis files in the analysis folder
        analysis_files = [f for f in os.listdir(ANALYSIS_DIR) if f.startswith('analysis_') and f.endswith('.json')]

        if not analysis_files:
            return {"error": "No analysis files found"}

        # Get the most recent file
        latest_basename = sorted(analysis_files)[-1]
        latest_path = os.path.join(ANALYSIS_DIR, latest_basename)

        with open(latest_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return {
            "filename": latest_basename,
            "analysis": data
        }
    
    except Exception as e:
        print(f"❌ Error reading analysis: {str(e)}")
        return {"error": "Failed to read analysis. Please try again."}


@app.post("/analyze-structured")
async def analyze_structured(
    cv_file: UploadFile = File(None),
    cv_text: str = Form(None),
    job_description: str = Form(""),
    use_ollama: bool = Form(True),
    use_gemini_fallback: bool = Form(True)
):
    """
    Analyze CV and return structured data with field-targeted suggestions.
    This is the enhanced version that uses structured CV data.
    """
    
    print("\n" + "="*50)
    print("NEW STRUCTURED ANALYSIS REQUEST")
    print("="*50)
    
    # Extract text from file or use provided text
    text = cv_text
    file_info = {}
    cv_images = []
    original_file_data = None
    
    if cv_file:
        print(f"📄 File uploaded: {cv_file.filename}")
        try:
            _, ext = os.path.splitext(cv_file.filename)
            content = await cv_file.read()
            
            # Store original file
            file_base64 = base64.b64encode(content).decode('utf-8')
            original_file_data = {
                "filename": cv_file.filename,
                "content_type": cv_file.content_type,
                "data": file_base64,
                "size": len(content)
            }
            
            # Parse document
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(content)
                tmp_path = tmp.name
            
            parse_result = parse_document_with_images(tmp_path)
            text = parse_result['text']
            cv_images = parse_result['images']
            
            os.unlink(tmp_path)
            
            if not text:
                return {"error": "Failed to extract text from file"}
            
            file_info = {
                "filename": cv_file.filename,
                "file_size_bytes": len(content),
                "extracted_text_length": len(text)
            }
            
        except Exception as e:
            print(f"❌ Error processing file: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"error": "Failed to process file. Please ensure the file is valid and try again."}
    
    if not text:
        return {"error": "No CV text provided"}
    
    # Step 1: Parse CV into structured data
    print("🔄 Parsing CV into structured data...")
    structured_result = parse_cv_to_structured_data(text, GEMINI_API_KEY)
    
    if structured_result['status'] != 'success':
        print(f"❌ Failed to parse CV structure: {structured_result}")
        return {"error": "Failed to parse CV structure. Please try again or use a different format."}
    
    structured_cv = structured_result['structured_data']
    
    # Step 2: Analyze structured CV with LLM
    analysis = None
    analysis_method = "none"
    
    if use_ollama:
        print("🦙 Analyzing structured CV with Ollama...")
        try:
            analysis = analyze_structured_cv_with_ollama(
                structured_cv, 
                job_description, 
                OLLAMA_URL,
                OLLAMA_MODEL,
                cv_images
            )
            if analysis and analysis.get('status') == 'success':
                analysis_method = "ollama"
                print("✅ Ollama analysis successful!")
            else:
                raise Exception(f"Ollama analysis failed: {analysis.get('message', 'Unknown error')}")
        except Exception as e:
            print(f"⚠️ Ollama analysis failed: {str(e)}")
            if use_gemini_fallback and GEMINI_API_KEY != "YOUR_API_KEY_HERE":
                print("🔄 Falling back to Gemini...")
                try:
                    analysis = analyze_structured_cv_with_gemini(
                        structured_cv, 
                        job_description, 
                        GEMINI_API_KEY, 
                        cv_images
                    )
                    if analysis and analysis.get('status') == 'success':
                        analysis_method = "gemini_fallback"
                        print("✅ Gemini fallback analysis successful!")
                    else:
                        print("❌ Gemini fallback also failed")
                except Exception as gemini_error:
                    print(f"❌ Gemini fallback failed: {str(gemini_error)}")
            else:
                print("❌ No fallback available or configured")
    
    elif use_gemini_fallback and GEMINI_API_KEY != "YOUR_API_KEY_HERE":
        print("🤖 Analyzing structured CV with Gemini (direct)...")
        analysis = analyze_structured_cv_with_gemini(
            structured_cv, 
            job_description, 
            GEMINI_API_KEY, 
            cv_images
        )
        if analysis and analysis.get('status') == 'success':
            analysis_method = "gemini_direct"
    
    # Save structured CV data
    cv_data = {
        "timestamp": datetime.now().isoformat(),
        "structured_cv": structured_cv,
        "original_text": text,
        "job_description": job_description,
        "file_info": file_info if cv_file else {"source": "raw_text"}
    }
    
    output_basename = f"structured_cv_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    output_filename = os.path.join(CV_DATA_DIR, output_basename)
    
    try:
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(cv_data, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved structured CV to: {output_filename}")
    except Exception as e:
        print(f"❌ Error saving structured CV: {str(e)}")
    
    # Save analysis
    if analysis and analysis.get('status') == 'success':
        analysis_basename = f"structured_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        analysis_filename = os.path.join(ANALYSIS_DIR, analysis_basename)
        
        # Add metadata about analysis method
        analysis_with_metadata = {
            **analysis,
            "analysis_metadata": {
                "method": analysis_method,
                "timestamp": datetime.now().isoformat(),
                "ollama_model": OLLAMA_MODEL if analysis_method.startswith("ollama") else None,
                "gemini_used": analysis_method.startswith("gemini")
            }
        }
        
        with open(analysis_filename, 'w', encoding='utf-8') as f:
            json.dump(analysis_with_metadata, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved structured analysis to: {analysis_filename}")
    
    # Return response
    response = {
        "summary": f"CV successfully analyzed with structured data! (Analysis method: {analysis_method})",
        "status": "success",
        "structured_cv": structured_cv,
        "original_file": original_file_data,
        "file_info": file_info if cv_file else {"source": "raw_text"},
        "analysis_method": analysis_method
    }
    
    if analysis and analysis.get('status') == 'success':
        response["analysis"] = analysis
        # Keep backward compatibility
        response["gemini_analysis"] = analysis
    elif analysis:
        response["analysis_error"] = analysis.get('message', 'Unknown analysis error')
    
    return response


@app.post("/apply-suggestion")
async def apply_suggestion(
    structured_cv: dict,
    suggestion: dict
):
    """
    Apply a suggestion to the structured CV data.
    
    Expected request body:
    {
        "structured_cv": { ... },
        "suggestion": {
            "suggestionId": 1,
            "targetField": "summary",
            "fieldPath": ["summary"],
            "improvedValue": "New improved text"
        }
    }
    """
    try:
        updated_cv = apply_suggestion_to_structured_cv(structured_cv, suggestion)
        
        return {
            "status": "success",
            "updated_cv": updated_cv,
            "applied_suggestion": suggestion
        }
    
    except Exception as e:
        print(f"❌ Error applying suggestion: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": "Failed to apply suggestion. Please try again."
        }


@app.get("/latest-structured-cv")
async def get_latest_structured_cv():
    """Get the most recently saved structured CV data"""
    try:
        json_files = [f for f in os.listdir(CV_DATA_DIR) if f.startswith('structured_cv_') and f.endswith('.json')]
        
        if not json_files:
            return {"error": "No structured CV data files found"}
        
        latest_basename = sorted(json_files)[-1]
        latest_path = os.path.join(CV_DATA_DIR, latest_basename)
        
        with open(latest_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return {
            "filename": latest_basename,
            "data": data
        }
    
    except Exception as e:
        print(f"❌ Error reading structured CV: {str(e)}")
        return {"error": "Failed to read structured CV. Please try again."}