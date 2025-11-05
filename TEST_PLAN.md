# Test Plan for Merged CV Analyzer

## Prerequisites
1. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements_merged.txt
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Set up Gemini API key:
   ```bash
   cd backend
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   ```

## Test Scenarios

### 1. Backend Unit Tests

#### Test 1.1: Parser Functions
```bash
cd backend
python3 -c "from parser import parse_document_with_images; print('✅ Import successful')"
```

Expected: No errors

#### Test 1.2: Gemini API Integration
```bash
cd backend
python3 -c "from gemini_api import analyze_cv_with_gemini; print('✅ Import successful')"
```

Expected: No errors

#### Test 1.3: Main API Import
```bash
cd backend
python3 -c "from main import app; print('✅ FastAPI app imported successfully')"
```

Expected: No errors

### 2. Backend Integration Tests

#### Test 2.1: Start Backend Server
```bash
cd backend
uvicorn main:app --reload --port 8000
```

Expected: Server starts without errors on http://127.0.0.1:8000

#### Test 2.2: Health Check
```bash
curl http://127.0.0.1:8000/
```

Expected response:
```json
{
  "status": "API is running!",
  "message": "Use POST /analyze to process CVs",
  "gemini_configured": true
}
```

### 3. Frontend Tests

#### Test 3.1: Start Frontend
```bash
cd frontend
npm start
```

Expected: 
- Compiles successfully
- Opens browser at http://localhost:3000
- No console errors

#### Test 3.2: UI Components Render
- [ ] File upload area visible
- [ ] Job description textarea visible
- [ ] "Analyze CV with AI" button visible
- [ ] Optional label on job description
- [ ] Supported formats listed

### 4. End-to-End Tests

#### Test 4.1: Upload PDF (with job description)
1. Upload a PDF CV
2. Enter job description
3. Click "Analyze CV with AI"
4. Wait for analysis

Expected:
- Loading spinner appears
- Analysis completes without errors
- Dashboard shows:
  - Overall score
  - ATS score
  - Navigation tabs (6 tabs)
  - Overview with summary
  - Top priorities sidebar

#### Test 4.2: Upload PDF (without job description)
1. Upload a PDF CV
2. Leave job description empty
3. Click "Analyze CV with AI"

Expected:
- Analysis works without job description
- General best practices analysis shown
- No job-specific keywords shown (or minimal)

#### Test 4.3: Upload DOCX
1. Upload a DOCX CV
2. Enter job description
3. Click "Analyze CV with AI"

Expected:
- Text extracted successfully
- Analysis completes
- All features work

#### Test 4.4: Test Each Tab
1. Complete Test 4.1
2. Click through each tab:
   - Overview: Summary, critical issues, score breakdown
   - Editor: Editable text, can modify
   - Suggestions: List of inline suggestions
   - Sections: Per-section analysis
   - ATS: Keyword matches, missing keywords
   - Quick Wins: Quick improvement items

Expected: All tabs render without errors

#### Test 4.5: Apply Suggestion
1. Complete Test 4.1
2. Go to "Suggestions" tab
3. Click "Apply This Suggestion" on any suggestion

Expected:
- Switch to Editor tab
- Text updated with suggestion
- No errors

#### Test 4.6: Edit and Export
1. Complete Test 4.1
2. Go to "Editor" tab
3. Make some edits to the text
4. Click "Export PDF"

Expected:
- Print dialog opens
- PDF can be saved/printed
- Formatting preserved

#### Test 4.7: Invalid File Type
1. Try to upload a .jpg or .png file

Expected:
- Alert message: "Unsupported file type..."
- List of valid types shown

#### Test 4.8: Large File
1. Upload a CV > 5MB

Expected:
- Should work (check backend logs)
- May take longer to process

### 5. Visual Analysis Tests (PDF Only)

#### Test 5.1: PDF with Images
1. Upload a PDF with good visual formatting
2. Enter job description
3. Analyze

Expected:
- Backend logs show "Converting PDF to images"
- Backend logs show "Sending X images to Gemini"
- Analysis includes layout feedback

#### Test 5.2: Complex PDF Layout
1. Upload a multi-column PDF CV
2. Analyze

Expected:
- Text extracted correctly
- Visual analysis considers layout
- Formatting issues detected if any

### 6. Error Handling Tests

#### Test 6.1: No File Uploaded
1. Leave file upload empty
2. Click "Analyze CV with AI"

Expected: Button is disabled

#### Test 6.2: Backend Down
1. Stop backend server
2. Try to analyze a CV

Expected:
- Alert: "Failed to analyze CV. Make sure backend is running on port 8000."

#### Test 6.3: Invalid Gemini API Key
1. Set invalid API key in .env
2. Analyze a CV

Expected:
- Alert: "Analysis Error: Gemini API error..."

#### Test 6.4: Corrupted File
1. Upload a corrupted/empty file
2. Analyze

Expected:
- Alert: "Failed to extract text from file. Please ensure the file is valid..."

### 7. Performance Tests

#### Test 7.1: Large CV (10+ pages)
1. Upload a 10+ page PDF
2. Time the analysis

Expected:
- Completes within 30-60 seconds
- All data loads correctly
- No memory issues

#### Test 7.2: Multiple Analyses
1. Analyze 3-5 CVs in sequence
2. Click "New Analysis" between each

Expected:
- All analyses complete successfully
- No performance degradation
- State resets properly

### 8. Browser Compatibility

Test in:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

Expected: All features work in all browsers

## Success Criteria

### Critical (Must Pass)
- [ ] Backend starts without errors
- [ ] Frontend compiles and runs
- [ ] File upload works for PDF and DOCX
- [ ] Analysis completes without errors (with and without job description)
- [ ] All 6 tabs render and display data
- [ ] No console errors in browser
- [ ] Text editing works
- [ ] PDF export works

### Important (Should Pass)
- [ ] PDF image extraction works
- [ ] Suggestion application works
- [ ] All scores display correctly
- [ ] Keyword matching works (when job description provided)
- [ ] Error messages are user-friendly
- [ ] UI is responsive

### Nice to Have (May Pass)
- [ ] Performance is good for large files
- [ ] All browsers work perfectly
- [ ] Complex layouts handled well

## Bug Reporting

If tests fail, report:
1. Test number (e.g., Test 4.1)
2. Steps to reproduce
3. Expected vs actual behavior
4. Browser console errors (if frontend)
5. Backend terminal logs (if backend)
6. Screenshot (if UI issue)

## Notes
- Some tests require a valid Gemini API key
- PDF image extraction requires PyMuPDF (fitz) installed
- Testing with real CVs recommended for best results
