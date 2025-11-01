# CV Recommendation Module - UtopiaHire

An AI-powered CV analysis and recommendation system that helps students improve their resumes for the hiring process.

## Features

### ✅ Multi-Format Support
- PDF, DOCX, DOC, TXT, ODT, LaTeX, HTML, RTF
- Automatic text extraction and HTML conversion
- DOCX files parsed with Mammoth for best quality

### ✅ AI-Powered Analysis (Gemini)
- **Overall Score**: General CV quality assessment
- **ATS Score**: Applicant Tracking System compatibility
- **Readability Score**: How clear and well-written the CV is
- **Job Match Score**: Relevance to target job (when job description provided)

### ✅ Comprehensive Feedback
1. **Overview**: Executive summary with critical issues and score breakdown
2. **Rich Editor**: Edit your CV with HTML formatting preserved
3. **Inline Suggestions**: Specific text improvements with before/after examples
4. **Section Analysis**: Quality scores and feedback for each CV section
5. **ATS Match**: Keyword matching, missing keywords, and recommendations
6. **Quick Wins**: Easy, high-impact improvements
7. **Top Priorities**: Prioritized action items with effort estimates

### ✅ Optional Job Description
- Analyze CVs without job description (general best practices)
- Provide job description for targeted keyword analysis
- Flexible workflow for different use cases

## Setup

### Backend (Python/FastAPI)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt
pip install PyPDF2 python-docx pymupdf mammoth beautifulsoup4 lxml

# Set up environment variables
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Run server
python -m uvicorn main:app --reload

# Server will be available at http://localhost:8000
```

### Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm start

# App will open at http://localhost:3000
```

## Usage

1. **Upload CV**: Click to upload or drag & drop your CV (any supported format)
2. **Job Description** (Optional): Paste the job description for targeted analysis
3. **Analyze**: Click "Analyze CV with AI" button
4. **Review Results**: 
   - View scores and summary in Overview tab
   - Edit CV in rich text editor
   - Review suggestions and apply them with one click
   - Check section-specific feedback
   - See ATS compatibility and keyword matching
   - Identify quick wins for easy improvements
5. **Export**: Download your edited CV as PDF

## Architecture

### Backend (`/backend`)
- **FastAPI**: REST API server
- **CVParser**: Multi-format document parser
- **Gemini API**: AI-powered CV analysis
- **File Structure**:
  - `main.py`: API endpoints
  - `parser.py`: Document parsing logic
  - `gemini_api.py`: AI analysis integration

### Frontend (`/frontend`)
- **React**: UI framework
- **Tailwind CSS**: Styling
- **Lucide Icons**: Icon library
- **Features**:
  - File upload with drag & drop
  - Rich text editor
  - Tabbed interface
  - Responsive design

## API Endpoints

### `POST /analyze`
Analyze a CV with optional job description.

**Request**:
- `cv_file` (file): CV file in any supported format
- `job_description` (string): Optional job description
- `use_gemini` (boolean): Enable/disable AI analysis

**Response**:
```json
{
  "status": "success",
  "cv_stats": {
    "full_text": "...",
    "html": "<div>...</div>",
    "structured": {
      "sections": [...],
      "contacts": {...},
      "dates": [...],
      "skills": [...]
    },
    "metadata": {...}
  },
  "gemini_analysis": {
    "status": "success",
    "analysis": {
      "overall_score": 85,
      "ats_score": 78,
      "readability_score": 82,
      "summary": "...",
      "top_priorities": [...],
      "sections": [...],
      "inline_suggestions": [...],
      "quick_wins": [...],
      "job_match_analysis": {...}
    }
  }
}
```

### `GET /`
Health check endpoint.

### `GET /latest-cv`
Get the most recently analyzed CV data.

### `GET /latest-analysis`
Get the most recent Gemini analysis.

## Data Structures

### Top Priorities
```json
{
  "priority": 1,
  "action": "Add quantifiable achievements",
  "impact": "High",
  "time_estimate": "30 mins",
  "category": "Content"
}
```

### Section Analysis
```json
{
  "name": "Experience",
  "quality_score": 8,
  "feedback": "Strong experience section",
  "suggestions": ["Add more metrics"]
}
```

### Inline Suggestions
```json
{
  "text_snippet": "Worked on projects",
  "issue_type": "impact",
  "severity": "medium",
  "section": "Experience",
  "problem": "Weak action verb",
  "suggestion": "Use stronger action verbs",
  "replacement": "Led development of 5+ projects",
  "explanation": "Quantifiable achievements are more impactful"
}
```

### Quick Wins
```json
{
  "change": "Add contact information",
  "where": "Header section",
  "effort": "5 mins",
  "impact": "High"
}
```

### ATS Analysis
```json
{
  "relevance_score": 75,
  "keyword_matches": ["Python", "JavaScript"],
  "missing_keywords": ["AWS", "Docker"],
  "recommendations": ["Add cloud computing skills"]
}
```

## Testing

### Backend Structure Tests
```bash
cd backend
python test_structure.py
```

### Manual Testing
1. Start backend: `uvicorn main:app --reload`
2. Start frontend: `npm start`
3. Upload test CV
4. Verify all tabs display correctly
5. Test with and without job description

## Documentation

- **CHANGES.md**: Detailed changelog of recent updates
- **IMPLEMENTATION_SUMMARY.md**: Technical implementation overview
- **PROJECT_README.md**: This file

## Security

- ✅ No stack trace exposure to users
- ✅ Generic error messages for users
- ✅ Detailed logging server-side for debugging
- ✅ File validation and sanitization
- ✅ Environment variables for sensitive data

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Limitations

1. **Gemini API**: Analysis takes 30-60 seconds
2. **File Size**: Maximum 10MB per upload
3. **Formats**: Best results with DOCX and PDF
4. **Internet Required**: For Gemini AI analysis

## Future Enhancements

- [ ] Batch CV analysis
- [ ] Export to DOCX with applied suggestions
- [ ] Template library
- [ ] Version history
- [ ] Collaborative editing
- [ ] Multiple language support
- [ ] CV comparison tool

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

## Contact

Part of the UtopiaHire project - helping students succeed in their hiring journey.

---

**Recent Updates** (See CHANGES.md for details):
- ✅ Job description now optional
- ✅ DOCX HTML editing support
- ✅ Complete UI with all tabs
- ✅ Enhanced data structures
- ✅ Security improvements
- ✅ Comprehensive testing
