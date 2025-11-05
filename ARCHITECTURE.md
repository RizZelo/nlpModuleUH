# Architecture: CV Visual Analysis Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                                                                   │
│  ┌───────────────┐                    ┌──────────────────────┐  │
│  │  File Upload  │                    │   Loading Overlay     │  │
│  │  - PDF/DOCX   │                    │  - Animated Spinner   │  │
│  │  - Text Input │  ─────────────────▶│  - Progress Bar       │  │
│  └───────────────┘                    │  - Stage Messages     │  │
│         │                              └──────────────────────┘  │
│         │ Click "Analyze"                       │                │
│         ▼                                       ▼                │
│  ┌─────────────────────────────────────────────────────┐        │
│  │         POST /analyze with FormData                  │        │
│  │  - cv_file (binary) OR cv_text (string)              │        │
│  │  - job_description (string)                          │        │
│  └─────────────────────────────────────────────────────┘        │
└────────────────────────────│──────────────────────────────────┘
                             │
                             │ HTTP Request
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                           │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   main.py - /analyze                        │ │
│  │                                                              │ │
│  │  1. Receive file upload                                     │ │
│  │     ├─ Save to temp file                                    │ │
│  │     └─ Call parse_document_with_images(tmp_path)           │ │
│  └──────────────────────────────┬───────────────────────────────┘ │
│                                 │                                 │
│                                 ▼                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              parser.py - Document Processing                │ │
│  │                                                              │ │
│  │  parse_document_with_images(file_path)                      │ │
│  │    ├─ parse_document(file_path) ───▶ Extract Text          │ │
│  │    │    └─ extract_text_from_pdf() / docx / txt            │ │
│  │    └─ pdf_to_images(file_path) ───▶ Generate Images        │ │
│  │         └─ PyMuPDF renders PDF pages to PNG                │ │
│  │                                                              │ │
│  │  Returns: {                                                 │ │
│  │    'text': "CV text content...",                            │ │
│  │    'images': [<PIL.Image>, <PIL.Image>, ...]               │ │
│  │  }                                                           │ │
│  └──────────────────────────────┬───────────────────────────────┘ │
│                                 │                                 │
│                                 ▼                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │       gemini_api.py - AI Analysis                           │ │
│  │                                                              │ │
│  │  analyze_cv_with_gemini(text, job_desc, key, images)       │ │
│  │                                                              │ │
│  │  IF images present:                                         │ │
│  │    ├─ Build multimodal prompt                               │ │
│  │    ├─ Add text + up to 3 images                             │ │
│  │    └─ Send to Gemini Vision API                             │ │
│  │                                                              │ │
│  │  ELSE:                                                       │ │
│  │    └─ Send text-only prompt                                 │ │
│  │                                                              │ │
│  │  Gemini analyzes:                                           │ │
│  │    ├─ Visual layout & formatting                            │ │
│  │    ├─ Content quality                                       │ │
│  │    ├─ Job description match                                 │ │
│  │    └─ Inline suggestions                                    │ │
│  │                                                              │ │
│  │  Returns: {                                                 │ │
│  │    "formatting": { score, issues, suggestions },            │ │
│  │    "content": { score, strengths, weaknesses },             │ │
│  │    "general": { overall_score, summary, priorities },       │ │
│  │    "inline_suggestions": [ {...}, {...} ]                   │ │
│  │  }                                                           │ │
│  └──────────────────────────────┬───────────────────────────────┘ │
│                                 │                                 │
│                                 ▼                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            main.py - Response Formatting                    │ │
│  │                                                              │ │
│  │  - Save CV data to cv_data_TIMESTAMP.json                   │ │
│  │  - Save analysis to analysis_TIMESTAMP.json                 │ │
│  │  - Build response with:                                     │ │
│  │    ├─ cv_stats (text, word count, etc.)                     │ │
│  │    ├─ gemini_analysis (scores, suggestions)                 │ │
│  │    └─ file_info (metadata)                                  │ │
│  │                                                              │ │
│  └──────────────────────────────┬───────────────────────────────┘ │
└─────────────────────────────────│─────────────────────────────────┘
                                  │
                                  │ JSON Response
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Process Analysis Results                          │ │
│  │                                                              │ │
│  │  1. Parse gemini_analysis                                   │ │
│  │  2. Extract scores (overall, formatting, content)          │ │
│  │  3. Extract inline_suggestions                              │ │
│  │  4. Set editedCvText = extracted text                       │ │
│  │  5. Hide loading overlay                                    │ │
│  │  6. Display results                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  CV Editor   │  │ Suggestions  │  │   Scores & Summary   │  │
│  │  (Textarea)  │  │   Sidebar    │  │                      │  │
│  │              │  │              │  │  Overall: 7/10       │  │
│  │  [Editable]  │  │  - 8 inline  │  │  Format:  8/10       │  │
│  │  [Download]  │  │    issues    │  │  Content: 6/10       │  │
│  │              │  │  - Click to  │  │                      │  │
│  │              │  │    apply     │  │  Top Priorities:     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Loading States

```
User Action              Frontend State              Display
────────────────────────────────────────────────────────────────
Click "Analyze"    ─────▶ loading = true         ─────▶ Show overlay
                          stage = UPLOADING              "Uploading CV..."
                                                        Progress: 25%

FormData sent      ─────▶ stage = EXTRACTING    ─────▶ "Extracting text..."
to backend                                              Progress: 50%

Response received  ─────▶ stage = ANALYZING     ─────▶ "Analyzing with AI..."
                                                        Progress: 75%

Parsing results    ─────▶ stage = PREPARING     ─────▶ "Preparing suggestions..."
                                                        Progress: 90%

Display results    ─────▶ loading = false       ─────▶ Hide overlay
                          analysis = data               Show results
```

## Component Architecture

```
App.js (Root Component)
│
├─ State Management
│  ├─ cvText, cvFile (input)
│  ├─ jobDesc (input)
│  ├─ loading, loadingStage (progress)
│  ├─ analysis (results)
│  ├─ editedCvText (editor)
│  └─ inlineSuggestions, activeSuggestion
│
├─ Loading Overlay (Conditional)
│  ├─ Animated Spinner (Loader icon)
│  ├─ Stage Message (text)
│  └─ Progress Bar (animated width)
│
├─ Input Section (Conditional: !analysis)
│  ├─ CV Upload/Input
│  │  ├─ File Upload Button
│  │  └─ Text Textarea
│  └─ Job Description Textarea
│
└─ Results Section (Conditional: analysis)
   ├─ CV Editor (Middle)
   │  ├─ Editable Textarea
   │  ├─ Download Button
   │  └─ Character/Word Count
   │
   ├─ Suggestions Sidebar (Right)
   │  ├─ Overall Scores Card
   │  ├─ Top Priorities
   │  ├─ Inline Suggestions List
   │  ├─ All Issues List
   │  └─ Category Details
   │
   └─ Inline Suggestion Popup (Modal)
      ├─ Issue Description
      ├─ Current Text
      ├─ Suggested Replacement
      └─ Apply Button
```

## File Structure

```
nlpModuleUH/
│
├─ backend/
│  ├─ .env                     # API keys
│  ├─ .gitignore               # Exclude analysis files
│  ├─ main.py                  # FastAPI server
│  ├─ parser.py                # Text + image extraction
│  ├─ gemini_api.py            # Multimodal AI analysis
│  ├─ requirements.txt         # Python dependencies
│  ├─ analysis_*.json          # Generated analysis files (gitignored)
│  └─ cv_data_*.json           # Generated CV data (gitignored)
│
├─ frontend/
│  ├─ src/
│  │  ├─ App.js                # Main React component
│  │  ├─ App.css               # Styles
│  │  └─ index.js              # Entry point
│  ├─ package.json             # Node dependencies
│  └─ tailwind.config.js       # Tailwind CSS config
│
└─ Documentation/
   ├─ IMPLEMENTATION_SUMMARY.md  # Technical details
   ├─ TESTING_GUIDE.md           # Testing procedures
   ├─ CHANGES_SUMMARY.md         # High-level overview
   └─ ARCHITECTURE.md            # This file
```

## Key Technologies

### Backend Stack
- **FastAPI** - Modern Python web framework
- **PyMuPDF (fitz)** - PDF to image conversion
- **Pillow** - Image processing
- **python-docx** - DOCX parsing
- **Google Gemini API** - Multimodal AI analysis

### Frontend Stack
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library
- **Fetch API** - HTTP requests

## API Endpoints

### POST /analyze
**Request:**
```javascript
FormData {
  cv_file: File | null,          // PDF, DOCX, or TXT
  cv_text: string | null,        // Alternative to file
  job_description: string,       // Required
  use_gemini: boolean            // Default: true
}
```

**Response:**
```json
{
  "summary": "CV successfully processed!",
  "status": "success",
  "saved_to_file": "cv_data_20251105_123456.json",
  "cv_stats": {
    "total_characters": 5432,
    "word_count": 876,
    "line_count": 98,
    "preview": "First 500 chars...",
    "full_text": "Complete CV text..."
  },
  "gemini_analysis": {
    "status": "success",
    "analysis": {
      "formatting": { "score": 8, "issues": [...], "suggestions": [...] },
      "content": { "score": 6, "strengths": [...], "weaknesses": [...] },
      "general": { "overall_score": 7, "summary": "...", "top_priorities": [...] },
      "inline_suggestions": [...]
    }
  }
}
```

### GET /
Health check endpoint

### GET /latest-cv
Get most recent CV data

### GET /latest-analysis
Get most recent analysis

## Image Processing Pipeline

```
PDF File
   │
   ├─ PyMuPDF (fitz)
   │  ├─ Open document
   │  ├─ Iterate pages
   │  └─ For each page:
   │     ├─ Get page object
   │     ├─ Render to pixmap (2x resolution)
   │     ├─ Convert to PNG bytes
   │     └─ Load as PIL Image
   │
   └─ Result: List[PIL.Image]
      ├─ Page 1: <PIL.Image 1700x2200>
      ├─ Page 2: <PIL.Image 1700x2200>
      └─ Page 3: <PIL.Image 1700x2200>
         │
         └─ Send to Gemini Vision API
            (up to 3 images to avoid token limits)
```

## Error Handling

```
┌──────────────────────────────────────────────────────────────┐
│                   Error Handling Flow                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  File Upload Error                                            │
│    ├─ Unsupported format ─────▶ Return 400 error             │
│    ├─ File too large ──────────▶ Return 413 error            │
│    └─ Corrupted file ──────────▶ Return 422 error            │
│                                                               │
│  Parsing Error                                                │
│    ├─ Text extraction fails ──▶ Return null, log error       │
│    ├─ Image generation fails ─▶ Continue with text-only      │
│    └─ Empty document ──────────▶ Return 422 error            │
│                                                               │
│  Gemini API Error                                             │
│    ├─ Invalid API key ─────────▶ Return error in response    │
│    ├─ Rate limit ──────────────▶ Retry with backoff          │
│    ├─ Token limit exceeded ────▶ Reduce image count          │
│    └─ JSON parse error ────────▶ Return raw response         │
│                                                               │
│  Frontend Error                                               │
│    ├─ Network error ───────────▶ Show alert, clear loading   │
│    ├─ Invalid response ────────▶ Show alert, clear loading   │
│    └─ Timeout ─────────────────▶ Show alert, clear loading   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Backend
- **PDF Parsing:** 1-2s per page
- **Image Generation:** 1-2s per page (PyMuPDF is fast)
- **Gemini API Call:** 5-15s depending on content
- **Total:** 10-30s for typical CV (2-3 pages)

### Frontend
- **Loading Overlay:** <100ms to appear
- **Progress Bar:** Smooth 60fps animation
- **Results Rendering:** <200ms
- **Memory:** Minimal (React optimized)

### Optimizations
- Only send first 3 PDF pages as images
- Images compressed to PNG (smaller than JPEG for text)
- React state updates batched
- CSS transitions hardware-accelerated
- No unnecessary re-renders

## Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Security Measures                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  API Key Protection                                           │
│    ├─ Stored in .env file (gitignored)                       │
│    ├─ Never sent to frontend                                 │
│    ├─ Never logged or printed                                │
│    └─ Loaded with python-dotenv                              │
│                                                               │
│  File Upload Validation                                       │
│    ├─ File type checked (.pdf, .docx, .txt only)            │
│    ├─ File size limited (by FastAPI)                         │
│    ├─ Saved to temp directory                                │
│    └─ Cleaned up after processing                            │
│                                                               │
│  Input Sanitization                                           │
│    ├─ Text inputs validated                                  │
│    ├─ No SQL queries (no database)                           │
│    ├─ No shell commands from user input                      │
│    └─ JSON serialization safe                                │
│                                                               │
│  CORS Configuration                                           │
│    ├─ Allows specific origins (dev: *)                       │
│    ├─ Production should restrict to frontend domain          │
│    └─ Credentials allowed for authentication                 │
│                                                               │
│  Data Privacy                                                 │
│    ├─ CV data saved locally only                             │
│    ├─ No data sent to third parties (except Gemini)          │
│    ├─ Analysis results stored locally                        │
│    └─ User can delete files manually                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
Development:
  Frontend (localhost:3000) ←─────→ Backend (localhost:8000)
                                          │
                                          ▼
                                   Gemini API (cloud)

Production:
  Frontend (CDN/S3/Netlify)
       │
       ├─ Static files served
       └─ API calls to ──────────▶ Backend (VPS/Cloud Run/EC2)
                                        │
                                        └─ Gemini API (cloud)

Recommended:
  - Frontend: Vercel/Netlify (auto deploy from git)
  - Backend: Google Cloud Run (containerized)
  - Secrets: Environment variables in hosting platform
  - Files: Temporary storage, cleaned periodically
```

## Future Enhancements

### Phase 2
- Real-time progress updates via WebSocket
- Export edited CV as formatted PDF
- Multi-language support

### Phase 3
- OCR for scanned PDFs
- Template suggestions
- Batch processing

### Phase 4
- User accounts & saved CVs
- CV version history
- Collaborative editing
