# CV NLP Analyzer

An intelligent CV analysis tool that parses CVs into structured data, generates targeted improvements with AI (Google Gemini), and lets you apply or undo changes while preserving the CV’s original language.

## Features

- Multi-format support: PDF and DOCX
- AI-powered structured parsing (Google Gemini)
- Structured data: summary, contact, experience, education, skills, projects, certifications, activities, volunteer, other_sections
- Apply / Undo field-targeted suggestions (language preserved)
- Dynamic section detection (e.g., “Vie Associative”) with automatic UI rendering
- Professional read-only CV preview and PDF export
- Defensive rendering (no `.map` errors on unexpected data types)

## Project Structure

```
nlpreviewer/
├── backend/                      # FastAPI backend
│   ├── main.py                  # Main API endpoints
│   ├── parser.py                # CV parsing (PDF, DOCX, TXT)
│   ├── gemini_api.py            # Gemini AI integration (original)
│   ├── gemini_api_structured.py # Enhanced Gemini AI for structured CV
│   ├── cv_structure_parser.py   # CV structure parser
│   ├── test_cv_structure.py     # Tests for structured CV
│   └── requirements.txt         # Python dependencies
└── frontend/                    # React frontend
    ├── src/
   │   ├── components/
   │   │   ├── upload/
   │   │   ├── analysis/
   │   │   │   ├── AnalysisContainer.jsx  # CV Preview / Structured CV / Apply Changes
   │   │   │   ├── CVDisplay.jsx          # Read-only CV + export
   │   │   │   ├── StructuredCVDisplay.jsx# Defensive structured view
   │   │   │   └── FieldSuggestions.jsx   # Apply & Undo suggestions
   │   │   └── common/
    │   ├── services/
    │   │   └── api.js                    # API service layer
   │   ├── utils/
   │   │   ├── formatCV.js
   │   │   ├── exportPdf.js
   │   │   └── validation.js
    │   └── App.js                        # Main app
    └── package.json                      # Node dependencies
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Gemini API key:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   CORS_ORIGINS=http://localhost:3000
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`

## Usage

1. Upload a CV (PDF/DOCX) and optionally provide a job description
2. Run analysis → structured CV + targeted suggestions
3. Inspect the Structured CV tab
4. Apply or Undo improvements per field in Apply Changes tab (same language enforced)
5. Export PDF from CV Preview or Structured CV

## Structured CV Data (New Feature!)

The application now supports **structured CV data** parsing, which provides more powerful and precise improvements:

### What is Structured CV Data?

Instead of treating your CV as plain text, the system now parses it into structured fields:

```javascript
{
  summary: "Experienced developer with...",
  contact: {
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890"
  },
  experience: [
    {
      id: "exp_1",
      title: "Software Engineer",
      company: "Tech Corp",
      description: "Led development of...",
      bullets: ["Achievement 1", "Achievement 2"]
    }
  ],
  education: [...],
   skills: {
      technical: ["Python", "React", "AWS"],
      languages: ["English", "Spanish"],
      tools: ["Git", "Docker"],
      soft_skills: ["Communication"],
      other: ["Additional"]
   },
   projects: [...],
   certifications: [...],
   activities: [...],
   volunteer: [...],
   other_sections: { "hobbies": [ ... ] }
}
```

### Benefits

1. **Field-Targeted Suggestions**: Each suggestion targets a specific field in your CV
2. **One-Click Application**: Click "Apply" to automatically update that field
3. **Better Tracking**: See exactly which parts of your CV have been improved
4. **Precise Changes**: No manual copy-pasting or searching for text
5. **Structured View**: View your CV as organized, structured data

### How to Use

1. Upload your CV as usual
2. Navigate to the **"Structured CV"** tab to see your parsed CV structure
3. Go to **"Apply Changes"** tab to see field-targeted suggestions
4. Click **"Apply"** on any suggestion to automatically update that field
5. Changes are applied directly to the structured CV data

### Example Suggestion

```javascript
{
  suggestionId: 1,
  targetField: "experience",
  fieldPath: ["experience", 0, "description"],
  fieldId: "exp_1",
  originalValue: "Worked on projects",
  improvedValue: "Led development of scalable microservices architecture serving 1M+ users",
  problem: "Too vague and lacks quantifiable impact",
  explanation: "Specific achievements with metrics are more compelling"
}
```

When you click "Apply", the system updates `experience[0].description` with the improved value.

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

### Key Endpoints

- `GET /` - Health check
-- `POST /analyze-structured` - Analyze CV (structured)
-- `POST /apply-suggestion` - Apply a field-targeted suggestion
- `GET /latest-cv` - Get most recent CV data
- `GET /latest-structured-cv` - Get most recent structured CV (new!)
- `GET /latest-analysis` - Get most recent analysis

## Configuration

### Backend Configuration

Environment variables (`.env`):
- `GEMINI_API_KEY` - Your Google Gemini API key (required)
- `CORS_ORIGINS` - Comma-separated list of allowed origins (default: `http://localhost:3000`)
- `LOG_LEVEL` - Logging level (default: `INFO`)

### Frontend Configuration

Environment variables (`.env`):
- `REACT_APP_API_URL` - Backend API URL (default: `http://127.0.0.1:8000`)

Application config (`src/config.js`):
- `MAX_FILE_SIZE_MB` - Maximum upload size (default: 10MB)
- `ACCEPTED_FILE_TYPES` - Supported file extensions
- `EDITOR_HEIGHT` - CV editor height

## Production Deployment

See `PRODUCTION_IMPROVEMENTS.md` for a concise deployment checklist.

## Development

### Running Tests

Frontend:
```bash
cd frontend
npm test
```

Backend:
```bash
cd backend
python -m pytest
```

### Code Quality

The codebase follows these principles:
- **Single Responsibility**: Each component/module has one clear purpose
- **DRY**: No code duplication
- **Separation of Concerns**: UI, logic, and API are separate
- **Configuration Centralization**: All configurable values in dedicated files
- **Proper Logging**: Structured logging throughout

## Architecture Highlights

- Centralized API + config
- Logging instead of print
- Defensive rendering for all list sections
- Dynamic sections & skills categories (no hardcoded assumptions)

## Technologies

### Backend
- **FastAPI** - Modern Python web framework
- **Google Generative AI (Gemini)** - AI-powered CV analysis
- **PyPDF2 / PyMuPDF** - PDF parsing
- **python-docx** - DOCX parsing
- **Uvicorn** - ASGI server

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Contributing

1. Follow the existing code structure and patterns
2. Maintain single responsibility principle
3. Use proper logging (not `print()`)
4. Update documentation for new features
5. Test your changes

## License

[Add your license here]

## Support

Open an issue in this repository for questions or bugs.
