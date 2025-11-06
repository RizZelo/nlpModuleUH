from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from parser import parse_document  # your parser.py file
from gemini_api import analyze_cv_with_gemini  # Gemini integration
from google import generativeai as genai
import tempfile
import os
import json
import logging
import base64
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()
# Suppress gRPC warnings
os.environ['GRPC_VERBOSITY'] = 'ERROR'
os.environ['GLOG_minloglevel'] = '2'

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# ⚠️ IMPORTANT: Set your Gemini API key here or use environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY_HERE")

# Choose your Gemini model:
# - "gemini-2.0-flash-exp" (latest, fastest, recommended)
# - "gemini-1.5-pro" (best quality, slower)
# - "gemini-1.5-flash" (good balance)
GEMINI_MODEL = genai.GenerativeModel(model_name="gemini-2.5-flash")

# CORS Configuration - restrict in production
ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
logger.info(f"CORS allowed origins: {ALLOWED_ORIGINS}")

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Configurable via environment variable
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(
    cv_file: UploadFile = File(None),
    cv_text: str = Form(None),
    job_description: str = Form(...),
    use_gemini: bool = Form(True)  # Toggle Gemini analysis
):
    """
    Handle CV file upload or raw text, save to JSON, and analyze with Gemini
    """
    
    logger.info("="*50)
    logger.info("NEW REQUEST RECEIVED")
    logger.info("="*50)

    # If a file was uploaded, save it temporarily and parse it
    text = cv_text
    file_info = {}
    original_file_data = None
    
    if cv_file:
        logger.info(f"📄 File uploaded: {cv_file.filename}")
        logger.info(f"📄 Content type: {cv_file.content_type}")
        
        try:
            # Read file content once
            content = await cv_file.read()
            
            # Store original file as base64 for frontend display
            file_base64 = base64.b64encode(content).decode('utf-8')
            original_file_data = {
                "filename": cv_file.filename,
                "content_type": cv_file.content_type,
                "data": file_base64,
                "size_bytes": len(content)
            }
            logger.info(f"📦 Encoded original file to base64 ({len(file_base64)} chars)")
            
            # Get file extension
            _, ext = os.path.splitext(cv_file.filename)
            
            # Save temporarily with proper extension for parsing
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(content)
                tmp_path = tmp.name
            
            logger.info(f"💾 Saved to temp file: {tmp_path}")
            logger.info(f"📏 File size: {len(content)} bytes")
            
            # Parse the document
            logger.info("🔄 Parsing document...")
            text = parse_document(tmp_path)
            
            # Clean up temp file
            os.unlink(tmp_path)
            
            if text:
                logger.info(f"✅ Successfully extracted text")
                logger.info(f"📏 Extracted text length: {len(text)} characters")
                logger.info(f"📝 First 200 chars: {text[:200]}...")
                
                file_info = {
                    "filename": cv_file.filename,
                    "file_size_bytes": len(content),
                    "extracted_text_length": len(text)
                }
            else:
                logger.error("❌ Parser returned None")
                return {"error": "Failed to extract text from file"}
                
        except Exception as e:
            logger.error(f"❌ Error processing file: {str(e)}", exc_info=True)
            return {"error": f"Failed to process file: {str(e)}"}
    
    elif cv_text:
        logger.info(f"📝 Raw text provided: {len(cv_text)} characters")
        logger.info(f"📝 First 100 chars: {cv_text[:100]}...")
    
    if not text:
        logger.error("❌ No CV text provided")
        return {"error": "No CV text provided"}

    logger.info(f"\n📋 Job description length: {len(job_description)} characters")
    
    # Calculate some basic statistics
    word_count = len(text.split())
    line_count = len(text.split('\n'))
    
    logger.info(f"\n📊 Statistics:")
    logger.info(f"   - Total characters: {len(text)}")
    logger.info(f"   - Word count: {word_count}")
    logger.info(f"   - Line count: {line_count}")
    
    # Create JSON data structure
    cv_data = {
        "timestamp": datetime.now().isoformat(),
        "cv_text": text,
        "job_description": job_description,
        "statistics": {
            "total_characters": len(text),
            "word_count": word_count,
            "line_count": line_count
        },
        "file_info": file_info if cv_file else {"source": "raw_text"}
    }
    
    # TODO: Save to database instead of JSON files (Issue 1.2)
    # For now, save to temp directory to avoid polluting working directory
    temp_dir = tempfile.gettempdir()
    output_filename = os.path.join(temp_dir, f"cv_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    
    try:
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(cv_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"\n💾 Saved CV data to: {output_filename}")
        logger.info("="*50 + "\n")
        
    except Exception as e:
        logger.error(f"❌ Error saving JSON: {str(e)}")
        return {"error": f"Failed to save JSON: {str(e)}"}
    
    # Analyze with Gemini if requested
    gemini_analysis = None
    if use_gemini:
        logger.info("⚠️  Gemini API key configured: %s", "Yes" if GEMINI_API_KEY != "YOUR_API_KEY_HERE" else "No")
        
        logger.info("🤖 Analyzing CV with Gemini...")
        gemini_analysis = analyze_cv_with_gemini(text, job_description, GEMINI_API_KEY)
        
        # Save Gemini analysis to temp directory
        if gemini_analysis and 'error' not in gemini_analysis:
            analysis_filename = os.path.join(temp_dir, f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            with open(analysis_filename, 'w', encoding='utf-8') as f:
                json.dump(gemini_analysis, f, indent=2, ensure_ascii=False)
            logger.info(f"💾 Saved Gemini analysis to: {analysis_filename}")
        else:
            logger.warning("Gemini analysis returned error or no data")
    
    # Return response to frontend
    response = {
        "summary": f"CV successfully processed! Extracted {len(text)} characters.",
        "status": "success",
        "saved_to_file": output_filename,
        "cv_stats": {
            "total_characters": len(text),
            "word_count": word_count,
            "line_count": line_count,
            "preview": text[:500] + "..." if len(text) > 500 else text,
            "full_text": text  # Full extracted text for fallback
        },
        "job_description_length": len(job_description),
        "file_info": file_info if cv_file else {"source": "raw_text"}
    }
    
    # Add original file data if available (for frontend display)
    if original_file_data:
        response["original_file"] = original_file_data
        logger.info("✅ Added original file data to response")
    
    # Add Gemini analysis to response if available
    logger.debug(f"Gemini analysis: {gemini_analysis}")
    if gemini_analysis:
        response["gemini_analysis"] = gemini_analysis
    
    return response


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "API is running!",
        "message": "Use POST /analyze to process CVs",
        "gemini_configured": GEMINI_API_KEY != "YOUR_API_KEY_HERE"
    }


@app.get("/latest-cv")
async def get_latest_cv():
    """Get the most recently saved CV data"""
    try:
        # Find all JSON files
        json_files = [f for f in os.listdir('.') if f.startswith('cv_data_') and f.endswith('.json')]
        
        if not json_files:
            return {"error": "No CV data files found"}
        
        # Get the most recent file
        latest_file = sorted(json_files)[-1]
        
        with open(latest_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return {
            "filename": latest_file,
            "data": data
        }
    
    except Exception as e:
        return {"error": f"Failed to read CV data: {str(e)}"}


@app.get("/latest-analysis")
async def get_latest_analysis():
    """Get the most recent Gemini analysis"""
    try:
        # Find all analysis files
        analysis_files = [f for f in os.listdir('.') if f.startswith('analysis_') and f.endswith('.json')]
        
        if not analysis_files:
            return {"error": "No analysis files found"}
        
        # Get the most recent file
        latest_file = sorted(analysis_files)[-1]
        
        with open(latest_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return {
            "filename": latest_file,
            "analysis": data
        }
    
    except Exception as e:
        return {"error": f"Failed to read analysis: {str(e)}"}