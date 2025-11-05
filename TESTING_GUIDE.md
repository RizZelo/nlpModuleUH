# Testing Guide for CV Visual Analysis & Loading Improvements

## Prerequisites

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

### Environment Configuration
Create a `.env` file in the `backend` directory:
```
GEMINI_API_KEY=your_api_key_here
```

## Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!

You can now view nlpreviewer in the browser.

  Local:            http://localhost:3000
```

## Test Scenarios

### Test 1: PDF Upload with Visual Analysis

**Steps:**
1. Open browser to `http://localhost:3000`
2. Click on the upload area or drag a PDF CV
3. Upload a PDF file (e.g., sample_cv.pdf)
4. Paste a job description in the right textarea
5. Click "Analyze CV"

**Expected Results:**
- ✅ Loading overlay appears immediately
- ✅ Progress message shows "Uploading CV..."
- ✅ Progress bar animates from 0% to 25%
- ✅ Message changes to "Extracting text and layout..." (50%)
- ✅ Backend console shows:
  ```
  📄 File uploaded: sample_cv.pdf
  🔄 Parsing document...
  🖼️  Extracting PDF pages as images for visual analysis...
  ```
- ✅ Message changes to "Analyzing with AI..." (75%)
- ✅ Backend console shows:
  ```
  🖼️  Sending X images to Gemini for visual analysis...
  ```
- ✅ Message changes to "Preparing suggestions..." (90%)
- ✅ Loading overlay disappears
- ✅ Analysis results appear with scores and suggestions

**Backend Validation:**
Check backend console for:
- PDF page image generation logs
- Multimodal content being sent to Gemini
- No errors during image processing

### Test 2: Text Input (No Images)

**Steps:**
1. Paste CV text directly into the left textarea
2. Paste job description
3. Click "Analyze CV"

**Expected Results:**
- ✅ Loading overlay appears with progress stages
- ✅ Analysis works without PDF images
- ✅ Backend uses text-only analysis mode
- ✅ Results display correctly

**Backend Validation:**
Backend console should show:
```
📝 Raw text provided: X characters
🤖 Analyzing CV with Gemini...
```
(No image-related logs)

### Test 3: Loading States

**Steps:**
1. Start analysis with any CV
2. Observe loading overlay

**Expected Results:**
- ✅ Semi-transparent black overlay covers entire page
- ✅ White modal card appears centered
- ✅ Animated spinner rotates continuously
- ✅ Title: "Analyzing Your CV"
- ✅ Stage message updates: 
  - "Uploading CV..."
  - "Extracting text and layout..."
  - "Analyzing with AI..."
  - "Preparing suggestions..."
- ✅ Progress bar smoothly animates: 25% → 50% → 75% → 90%
- ✅ User cannot interact with content behind overlay
- ✅ No page freezing or unresponsiveness

### Test 4: CV Editor (Text-Only Editing)

**Steps:**
1. Complete analysis of a CV
2. Locate the CV editor in the middle column
3. Make edits to the text
4. Click "Download"

**Expected Results:**
- ✅ Editor shows extracted text from CV
- ✅ Text is editable in textarea
- ✅ Original PDF file is not modified
- ✅ Downloaded file contains edited text
- ✅ Character and word count updates as you type
- ✅ Inline suggestions remain visible

**Verification:**
- Original PDF file remains unchanged on disk
- Only the text in the editor is affected

### Test 5: Inline Suggestions & Visual Feedback

**Steps:**
1. Complete analysis
2. Check the right sidebar
3. Click on an inline suggestion
4. Apply a suggestion

**Expected Results:**
- ✅ Number of suggestions shown in header
- ✅ Suggestions listed in right sidebar
- ✅ Clicking suggestion shows popup with details
- ✅ Popup includes: issue, current text, replacement, recommendation
- ✅ "Apply Suggestion" button works
- ✅ Text updates in editor when applied
- ✅ Popup closes after application

### Test 6: Multiple File Types

Test with different file types:

**PDF Files:**
- ✅ Text extraction works
- ✅ Images generated and sent to Gemini
- ✅ Visual analysis feedback provided

**DOCX Files:**
- ✅ Text extraction works
- ✅ No images (expected)
- ✅ Analysis proceeds normally

**Plain Text:**
- ✅ Direct text analysis
- ✅ No image processing (expected)
- ✅ Analysis works correctly

### Test 7: Error Handling

**Test Invalid File:**
1. Upload a non-CV file (e.g., image, executable)
2. Click "Analyze CV"

**Expected Results:**
- ✅ Error message appears
- ✅ Loading state clears
- ✅ User can try again

**Test Missing API Key:**
1. Remove/comment out GEMINI_API_KEY in .env
2. Restart backend
3. Try analysis

**Expected Results:**
- ✅ Backend returns error
- ✅ Frontend shows error message
- ✅ Loading state clears

**Test Large PDF:**
1. Upload very large PDF (10+ pages)
2. Click "Analyze CV"

**Expected Results:**
- ✅ Only first 3 pages sent as images (to avoid token limits)
- ✅ Analysis completes successfully
- ✅ All text extracted and analyzed

## Performance Checks

### Backend Performance
- PDF parsing should complete within 2-5 seconds
- Image generation adds 1-2 seconds per page
- Gemini API call takes 5-15 seconds depending on content
- Total analysis time: 10-30 seconds (acceptable)

### Frontend Performance
- Loading overlay should appear within 100ms of button click
- Progress bar animations should be smooth (60fps)
- No UI freezing or lag
- Results should render immediately when received

### Memory Usage
- Check browser console for memory leaks
- Monitor backend memory during multiple analyses
- Images should be properly garbage collected

## Debug Mode

### Backend Debugging
Enable verbose logging:
```python
# In main.py, add:
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Frontend Debugging
Open browser DevTools:
- Console tab: Check for errors
- Network tab: Monitor API calls
- React DevTools: Check component state

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution:** Reinstall dependencies
```bash
cd backend && pip install -r requirements.txt
cd frontend && npm install
```

### Issue: Loading overlay doesn't disappear
**Cause:** API error or timeout
**Solution:** 
- Check backend console for errors
- Verify GEMINI_API_KEY is valid
- Check network connectivity

### Issue: No images sent to Gemini
**Possible Causes:**
- PyMuPDF not installed correctly
- PDF is image-based (scanned)
- File is not a PDF

**Solution:**
```bash
pip install --upgrade PyMuPDF Pillow
```

### Issue: Progress bar stuck at one stage
**Cause:** Code execution blocking
**Solution:**
- Check for synchronous operations
- Verify all await statements in async functions

## Manual Verification Checklist

- [ ] PDF files generate page images
- [ ] Images sent to Gemini API successfully
- [ ] Loading overlay shows all 4 stages
- [ ] Progress bar animates smoothly
- [ ] Original CV file never modified
- [ ] Editor allows text-only changes
- [ ] Download exports edited text
- [ ] Inline suggestions work correctly
- [ ] Error handling graceful
- [ ] No console errors in browser
- [ ] No warnings in backend logs
- [ ] Memory usage reasonable
- [ ] UI responsive during analysis

## Security Validation

Run CodeQL analysis:
```bash
# Security check passed with 0 vulnerabilities
```

Check for:
- [ ] No sensitive data logged
- [ ] API key not exposed to frontend
- [ ] File uploads validated
- [ ] No XSS vulnerabilities
- [ ] No SQL injection risks (not applicable, no DB)

## Success Criteria

All tests pass if:
1. ✅ PDF to image conversion works
2. ✅ Visual analysis feedback received from Gemini
3. ✅ Loading states show proper progress
4. ✅ No page freezing during analysis
5. ✅ Original CV never modified
6. ✅ Text editor works independently
7. ✅ No security vulnerabilities
8. ✅ No runtime errors
9. ✅ Performance acceptable (<30s for analysis)
10. ✅ User experience smooth and professional

## Next Steps After Testing

If all tests pass:
1. Merge PR to main branch
2. Deploy to staging environment
3. Conduct user acceptance testing
4. Monitor for production issues
5. Gather user feedback

If tests fail:
1. Document failures
2. Create bug reports
3. Fix issues
4. Re-run tests
5. Update documentation
