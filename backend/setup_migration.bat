@echo off
echo ========================================
echo CV Analysis - Ollama Migration Setup
echo ========================================
echo.

echo Step 1: Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Step 2: Checking Ollama setup...
python setup_ollama.py

echo.
echo Step 3: Setup complete!
echo.
echo To start the application:
echo   uvicorn main:app --reload
echo.
echo The API will use:
echo   - Primary: Ollama (local LLM)
echo   - Fallback: Gemini (if configured)
echo.
echo Check http://localhost:8000 for status
echo.
pause