# Application Architecture

## Overview
This document illustrates the architecture transformation from a monolithic prototype to a modular, production-ready application.

## Frontend Architecture Evolution

### Before: Monolithic Component
```
┌─────────────────────────────────────────────────────────┐
│                      App.js (548 lines)                  │
│                                                          │
│  • State management (12+ variables)                     │
│  • File upload logic                                    │
│  • API calls                                            │
│  • Form rendering                                       │
│  • Analysis display                                     │
│  • CV editor                                            │
│  • Suggestions display                                  │
│  • Score calculation                                    │
│  • Color functions                                      │
│  • Download logic                                       │
│  • All UI components                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### After: Modular Architecture
```
┌──────────────────────────────────────────────────────────────┐
│                    App.js (120 lines)                         │
│                                                               │
│  • Main state management                                     │
│  • Route coordination                                        │
│  • Component composition                                     │
│                                                               │
├───────────────────────┬──────────────────────────────────────┤
│                       │                                      │
│   UploadView          │        AnalysisView                 │
│   ┌──────────────┐    │        ┌─────────────────────┐     │
│   │ File Upload  │    │        │   CVEditor          │     │
│   │ Text Input   │    │        │   ┌──────────────┐  │     │
│   │ Job Desc     │    │        │   │ Text Area    │  │     │
│   │ Validation   │    │        │   │ Suggestions  │  │     │
│   └──────────────┘    │        │   │ Popup        │  │     │
│                       │        │   └──────────────┘  │     │
│                       │        │                     │     │
│                       │        │   ScoresCard        │     │
│                       │        │   ┌──────────────┐  │     │
│                       │        │   │ Overall      │  │     │
│                       │        │   │ Formatting   │  │     │
│                       │        │   │ Content      │  │     │
│                       │        │   └──────────────┘  │     │
│                       │        │                     │     │
│                       │        │   SuggestionsPanel  │     │
│                       │        │   ┌──────────────┐  │     │
│                       │        │   │ Priorities   │  │     │
│                       │        │   │ Inline List  │  │     │
│                       │        │   │ All Issues   │  │     │
│                       │        │   │ Categories   │  │     │
│                       │        │   └──────────────┘  │     │
│                       │        └─────────────────────┘     │
└───────────────────────┴──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
    Common Components         Services & Utils
    ┌──────────────┐         ┌──────────────┐
    │   Button     │         │   API        │
    │   Card       │         │   Config     │
    └──────────────┘         │   ScoreUtils │
                             └──────────────┘
```

## Component Hierarchy

```
src/
├── App.js (Main coordinator)
│
├── components/
│   ├── upload/
│   │   └── UploadView.js
│   │       ├── Uses: Card, Button
│   │       ├── Handles: File upload, text input
│   │       └── Validates: File type, size
│   │
│   ├── analysis/
│   │   ├── AnalysisView.js (Main analysis container)
│   │   │   ├── Uses: CVEditor, ScoresCard, SuggestionsPanel
│   │   │   └── Coordinates: All analysis display
│   │   │
│   │   ├── CVEditor.js
│   │   │   ├── Uses: Card, Button
│   │   │   ├── Displays: Editable CV text
│   │   │   └── Features: Inline suggestions, download
│   │   │
│   │   └── tabs/
│   │       ├── ScoresCard.js
│   │       │   ├── Uses: scoreUtils
│   │       │   └── Displays: Overall, formatting, content scores
│   │       │
│   │       └── SuggestionsPanel.js
│   │           ├── Displays: All suggestions and issues
│   │           └── Features: Clickable suggestions
│   │
│   └── common/
│       ├── Button.js (Reusable button with variants)
│       └── Card.js (Reusable card container)
│
├── services/
│   └── api.js
│       ├── analyzeCV()
│       ├── getLatestCV()
│       ├── getLatestAnalysis()
│       └── healthCheck()
│
├── utils/
│   └── scoreUtils.js
│       ├── getGradeColor()
│       ├── getGradeBgColor()
│       └── getGradeLabel()
│
└── config.js
    ├── API_BASE_URL
    ├── MAX_FILE_SIZE_MB
    ├── ACCEPTED_FILE_TYPES
    └── UI configuration
```

## Backend Architecture

```
backend/
│
├── main.py (FastAPI application)
│   ├── CORS middleware (configurable)
│   ├── Logging setup
│   │
│   ├── Endpoints:
│   │   ├── GET  / (health check)
│   │   ├── POST /analyze (main analysis)
│   │   ├── GET  /latest-cv
│   │   └── GET  /latest-analysis
│   │
│   └── Uses:
│       ├── parser.parse_document()
│       └── gemini_api.analyze_cv_with_gemini()
│
├── parser.py (Document parsing)
│   ├── parse_document()
│   │   ├── extract_text_from_pdf()
│   │   ├── extract_text_from_docx()
│   │   ├── extract_text_from_txt()
│   │   └── clean_text()
│   │
│   └── Supports:
│       ├── PDF (PyPDF2, PyMuPDF)
│       ├── DOCX (python-docx)
│       └── TXT (native)
│
└── gemini_api.py (AI integration)
    └── analyze_cv_with_gemini()
        ├── Configures Gemini API
        ├── Sends structured prompt
        ├── Parses JSON response
        └── Returns structured analysis
```

## Data Flow

### Upload Flow
```
User Action → UploadView → File Validation
                              ↓
                         File/Text Set
                              ↓
                         Click Analyze
                              ↓
                         api.analyzeCV()
                              ↓
                         Backend /analyze
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
              parser.py            gemini_api.py
            (Extract text)        (AI analysis)
                    ↓                   ↓
                    └─────────┬─────────┘
                              ↓
                    Combined Response
                              ↓
                      AnalysisView
                    (Display results)
```

### Analysis Display Flow
```
Analysis Data
     ↓
AnalysisView (Coordinator)
     ↓
     ├─→ CVEditor
     │   ├─→ Display text
     │   ├─→ Handle click
     │   └─→ Show suggestion popup
     │
     ├─→ ScoresCard
     │   ├─→ Calculate colors (scoreUtils)
     │   └─→ Display scores
     │
     └─→ SuggestionsPanel
         ├─→ Top Priorities
         ├─→ Inline Suggestions
         ├─→ All Issues
         └─→ Category Details
```

## Configuration Flow

### Backend
```
Environment Variables (.env)
        ↓
GEMINI_API_KEY ──→ gemini_api.py
CORS_ORIGINS ───→ main.py (CORS middleware)
LOG_LEVEL ──────→ logging configuration
```

### Frontend
```
Environment Variables (.env)
        ↓
REACT_APP_API_URL ──→ config.js
        ↓
    API_BASE_URL ──→ services/api.js
        ↓
   All API calls
```

## Security Architecture

### Before
```
┌─────────────────────────────┐
│   CORS: allow_origins=["*"] │  ❌ Open to all
│   Files: ./cv_data_*.json   │  ❌ Working directory
│   Validation: None          │  ❌ No checks
└─────────────────────────────┘
```

### After
```
┌──────────────────────────────────┐
│   CORS: Environment variable     │  ✅ Configurable
│   Files: /tmp/cv_data_*.json     │  ✅ Temp directory
│   Validation: Type + Size        │  ✅ Proper checks
│   Logging: Structured            │  ✅ Audit trail
└──────────────────────────────────┘
```

## Logging Architecture

### Log Levels
```
DEBUG   → Detailed information (development)
INFO    → Normal operations (production)
WARNING → Non-critical issues
ERROR   → Errors requiring attention
```

### Log Flow
```
Application Code
      ↓
logger.info/error/warning/debug()
      ↓
Logging Configuration
      ↓
Formatted Output
      ↓
┌─────────────────────┐
│ Console (dev)       │
│ File (production)   │
│ Log aggregator (?)  │
└─────────────────────┘
```

## Deployment Architecture

### Development
```
┌──────────────┐         ┌──────────────┐
│   Frontend   │  :3000  │   Backend    │  :8000
│   (npm start)│ ◄─────► │  (uvicorn)   │
└──────────────┘         └──────────────┘
       ↓                        ↓
  localhost:3000          localhost:8000
```

### Production (Recommended)
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   CDN/S3     │         │  Load Balancer│         │   Database   │
│  (Frontend)  │         │               │         │ (PostgreSQL) │
└──────────────┘         └──────┬───────┘         └──────────────┘
       ↓                        ↓                         ↑
       │                  ┌──────────────┐               │
       │                  │   Backend    │               │
       │                  │   Instances  │───────────────┘
       │                  │   (FastAPI)  │
       │                  └──────────────┘
       │                        ↓
       │                  ┌──────────────┐
       │                  │   Gemini AI  │
       │                  └──────────────┘
       │
       └──────────────────────────────────────────┐
                                                   │
                                         HTTPS/CORS Protected
```

## State Management

### Before (in App.js)
```
12+ state variables all in one place
- Hard to track
- Hard to debug
- Hard to share
```

### After (distributed)
```
App.js (Main)
├── cvText, cvFile
├── jobDesc
├── analysis
├── loading
└── ...

UploadView (Local)
└── File validation state

CVEditor (Local)
├── editedCvText
├── activeSuggestion
└── suggestionPosition

ScoresCard (Props only)
└── No local state

SuggestionsPanel (Props only)
└── No local state
```

## Error Handling Flow

```
User Action
    ↓
Component
    ↓
Try/Catch
    ↓
┌───────┴───────┐
↓               ↓
Success     Error
↓               ↓
Display     Log Error
Results     ↓
            Alert User
            ↓
            Provide Context
```

## Performance Considerations

### Component Rendering
- Small, focused components re-render efficiently
- Props-based components avoid unnecessary re-renders
- Proper key usage in lists

### Code Splitting (Future)
```
import React, { lazy, Suspense } from 'react';

const AnalysisView = lazy(() => import('./components/analysis/AnalysisView'));

// Only loads when needed
```

### API Optimization (Future)
```
- Caching layer for repeated requests
- Background processing for large files
- Request debouncing
- Response compression
```

## Testing Strategy (Future)

```
Unit Tests
├── Utils (scoreUtils.js)
├── API Service (api.js)
└── Individual Components

Integration Tests
├── Upload → Analyze flow
├── Analysis → Edit flow
└── API connectivity

E2E Tests
├── Complete user journey
├── Error scenarios
└── Edge cases
```

## Summary

The architecture has evolved from:
- **Monolithic** → **Modular**
- **Tightly coupled** → **Loosely coupled**
- **Hard to test** → **Testable**
- **Hard to maintain** → **Maintainable**
- **Prototype** → **Production-ready**

All components follow SOLID principles and modern React best practices.
