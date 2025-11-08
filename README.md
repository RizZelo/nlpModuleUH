# CV NLP Analyzer

An intelligent CV analysis tool that uses AI (Google Gemini) to provide detailed feedback on CVs against job descriptions. The application helps job seekers optimize their CVs with actionable suggestions for formatting, content, and keyword optimization.

## Features

- 📄 **Multi-format Support**: Upload CVs in PDF, DOCX, LaTeX
- 🤖 **AI-Powered Analysis**: Leverages Google Gemini for comprehensive CV evaluation
- 📊 **Detailed Scoring**: Overall, formatting, and content scores with explanations
- 💡 **Inline Suggestions**: Specific, actionable recommendations with text replacement
- 🎯 **Structured CV Data**: Parse CV into structured fields (summary, experience, skills, etc.)
- ✨ **Field-Targeted Improvements**: Apply suggestions directly to specific CV fields with one click
- 👁️ **Professional Display**: Beautifully formatted read-only CV display with Georgia serif font
- 📥 **Export**: Download your CV as PDF with professional formatting
- 🎯 **Job-Specific**: Tailored analysis based on target job description
- 🏗️ **Modular Architecture**: Clean component structure with separation of concerns

## Project Structure

```
nlpModuleUH/
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
    │   │   ├── upload/                    # File upload components
    │   │   ├── analysis/                  # Analysis view components
    │   │   │   ├── CVDisplay.jsx         # Read-only CV display
    │   │   │   ├── FieldSuggestions.jsx  # Field-targeted suggestions
    │   │   │   ├── StructuredCVDisplay.jsx # Structured CV viewer
    │   │   │   └── tabs/                 # Analysis tabs
    │   │   └── common/                   # Reusable UI components
    │   ├── services/
    │   │   └── api.js                    # API service layer
    │   ├── utils/
    │   │   ├── formatCV.js               # CV formatting utility
    │   │   └── validation.js             # Input validation
    │   └── App.js                        # Main app
    └── package.json                      # Node dependencies
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
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

1. **Upload or Paste CV**: Choose to upload a PDF/DOCX file or paste CV text directly
2. **Enter Job Description**: Paste the target job description
3. **Analyze**: Click "Analyze CV" to get AI-powered feedback
4. **Review Results**: View scores, issues, and recommendations
5. **Edit**: Make changes directly in the editor
6. **Apply Suggestions**: Click highlighted text to see and apply specific suggestions
7. **Download**: Export your improved CV

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
    languages: ["English", "Spanish"]
  },
  projects: [...],
  certifications: [...]
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
- `POST /analyze` - Analyze CV against job description (original)
- `POST /analyze-structured` - Analyze CV with structured data (new!)
- `POST /apply-suggestion` - Apply a field-targeted suggestion (new!)
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

See [PRODUCTION_IMPROVEMENTS.md](./PRODUCTION_IMPROVEMENTS.md) for detailed production deployment guidelines.

### Quick Production Checklist

- [ ] Set proper `CORS_ORIGINS` environment variable
- [ ] Use production-grade database (PostgreSQL) instead of temp files
- [ ] Implement user authentication
- [ ] Set up HTTPS
- [ ] Configure logging aggregation
- [ ] Set up monitoring and error tracking
- [ ] Implement rate limiting
- [ ] Add caching layer

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

## Architecture Improvements

This project has undergone significant refactoring for production readiness:

- ✅ Replaced `print()` with proper logging
- ✅ Extracted monolithic 548-line component into modular structure
- ✅ Separated API logic from UI components
- ✅ Centralized configuration management
- ✅ Fixed CORS security issues
- ✅ Improved file storage (temp directory instead of working directory)
- ✅ Added proper file type validation
- ✅ Eliminated code duplication

See [PRODUCTION_IMPROVEMENTS.md](./PRODUCTION_IMPROVEMENTS.md) for complete details.

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

For issues and questions, please [open an issue](https://github.com/RizZelo/nlpModuleUH/issues).

---

## Original Create React App Documentation

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
