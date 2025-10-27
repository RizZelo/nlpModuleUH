from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from parser import parse_document  # your parser.py file
import tempfile
import os
import json
from datetime import datetime

app = FastAPI()

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
    job_description: str = Form(...)
):
    """
    Handle CV file upload or raw text and save to JSON for Gemini API
    """
    
    print("\n" + "="*50)
    print("NEW REQUEST RECEIVED")
    print("="*50)

    # If a file was uploaded, save it temporarily and parse it
    text = cv_text
    file_info = {}
    
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
            
            # Parse the document
            print("🔄 Parsing document...")
            text = parse_document(tmp_path)
            
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
                return {"error": "Failed to extract text from file"}
                
        except Exception as e:
            print(f"❌ Error processing file: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"error": f"Failed to process file: {str(e)}"}
    
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
    
    # Create JSON data structure for Gemini API
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
        print(f"✅ Ready for Gemini API!")
        print("="*50 + "\n")
        
        # Return response to frontend
        return {
            "summary": f"CV successfully processed! Extracted {len(text)} characters from your CV.",
            "status": "success",
            "saved_to_file": output_filename,
            "cv_stats": {
                "total_characters": len(text),
                "word_count": word_count,
                "line_count": line_count,
                "preview": text[:200] + "..." if len(text) > 200 else text
            },
            "job_description_length": len(job_description),
            "file_info": file_info if cv_file else {"source": "raw_text"},
            "message": "Data saved to JSON file for Gemini API processing"
        }
    
    except Exception as e:
        print(f"❌ Error saving JSON: {str(e)}")
        return {"error": f"Failed to save JSON: {str(e)}"}


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "API is running!", "message": "Use POST /analyze to process CVs"}


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