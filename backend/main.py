from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from parser import parse_document, parse_document_with_images  # your parser.py file
from gemini_api import analyze_cv_with_gemini  # Gemini integration
from google import generativeai as genai
import tempfile
import os
import json
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()
# Suppress gRPC warnings
os.environ['GRPC_VERBOSITY'] = 'ERROR'
os.environ['GLOG_minloglevel'] = '2'

app = FastAPI()

# ⚠️ IMPORTANT: Set your Gemini API key here or use environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY_HERE")

# Choose your Gemini model:
# - "gemini-2.0-flash-exp" (latest, fastest, recommended)
# - "gemini-1.5-pro" (best quality, slower)
# - "gemini-1.5-flash" (good balance)
GEMINI_MODEL = genai.GenerativeModel(model_name="gemini-2.5-flash")


# Allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; use your React URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(
    cv_file: UploadFile = File(None),
    cv_text: str = Form(None),
    job_description: str = Form(""),
    use_gemini: bool = Form(True)  # Toggle Gemini analysis
):
    """
    Handle CV file upload or raw text, save to JSON, and analyze with Gemini.
    Job description is optional.
    """
    
    print("\n" + "="*50)
    print("NEW REQUEST RECEIVED")
    print("="*50)

    # If a file was uploaded, save it temporarily and parse it
    text = cv_text
    file_info = {}
    cv_images = []  # Store CV images for visual analysis
    
    if cv_file:
        print(f"📄 File uploaded: {cv_file.filename}")
        print(f"📄 Content type: {cv_file.content_type}")
        
        try:
            # Get file extension
            _, ext = os.path.splitext(cv_file.filename)
            
            # Save temporarily with proper extension
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                content = await cv_file.read()
                tmp.write(content)
                tmp_path = tmp.name
            
            print(f"💾 Saved to temp file: {tmp_path}")
            print(f"📏 File size: {len(content)} bytes")
            
            # Parse the document with images for visual analysis
            print("🔄 Parsing document...")
            parse_result = parse_document_with_images(tmp_path)
            text = parse_result['text']
            cv_images = parse_result['images']
            
            # Clean up temp file
            os.unlink(tmp_path)
            
            if text:
                print(f"✅ Successfully extracted text")
                print(f"📏 Extracted text length: {len(text)} characters")
                print(f"📝 First 200 chars: {text[:200]}...")
                
                file_info = {
                    "filename": cv_file.filename,
                    "file_size_bytes": len(content),
                    "extracted_text_length": len(text)
                }
            else:
                print("❌ Parser returned None")
                return {"error": "Failed to extract text from file. Please ensure the file is valid and try again."}
                
        except Exception as e:
            print(f"❌ Error processing file: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"error": "Failed to process file. Please ensure the file is valid and try again."}
    
    elif cv_text:
        print(f"📝 Raw text provided: {len(cv_text)} characters")
        print(f"📝 First 100 chars: {cv_text[:100]}...")
    
    if not text:
        print("❌ No CV text provided")
        return {"error": "No CV text provided"}

    print(f"\n📋 Job description length: {len(job_description)} characters")
    
    # Calculate some basic statistics
    word_count = len(text.split())
    line_count = len(text.split('\n'))
    
    print(f"\n📊 Statistics:")
    print(f"   - Total characters: {len(text)}")
    print(f"   - Word count: {word_count}")
    print(f"   - Line count: {line_count}")
    
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
    
    # Save to JSON file
    output_filename = f"cv_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    try:
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(cv_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Saved CV data to: {output_filename}")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"❌ Error saving JSON: {str(e)}")
        return {"error": "Failed to save analysis data. Please try again."}
    
    # Analyze with Gemini if requested
    gemini_analysis = None
    if use_gemini:
        print(f"✅ Gemini API key configured (ends with: ...{GEMINI_API_KEY[-4:]})")
        
        print("🤖 Analyzing CV with Gemini...")
        # Pass images if available for visual analysis
        gemini_analysis = analyze_cv_with_gemini(text, job_description, GEMINI_API_KEY, cv_images)
        
        # Save Gemini analysis to separate file
        if gemini_analysis and 'error' not in gemini_analysis:
            analysis_filename = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(analysis_filename, 'w', encoding='utf-8') as f:
                json.dump(gemini_analysis, f, indent=2, ensure_ascii=False)
            print(f"💾 Saved Gemini analysis to: {analysis_filename}")
        else:
            print("hello");    
    
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
            "full_text": text  # ✅ ADD THIS - full extracted text
        },
        "job_description_length": len(job_description),
        "file_info": file_info if cv_file else {"source": "raw_text"}
    }
    
    # Add Gemini analysis to response if available
    print(gemini_analysis)
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