# CV Analysis API - Ollama Edition

This CV analysis application now uses **Ollama** for local LLM processing instead of requiring external API keys! 

## 🆕 What's Changed

- **Primary LLM**: Ollama (runs locally on your machine)
- **Fallback**: Gemini API (optional, for when Ollama isn't available)
- **Performance**: Better privacy, no API costs, faster responses (with good hardware)
- **Models**: Choose from various open-source models based on your system capabilities

## 🚀 Quick Start

### 1. Install Ollama
```bash
# Download from https://ollama.ai/download
# Or use the setup script (recommended):
```

### 2. Setup Everything Automatically
```bash
cd backend
python setup_ollama.py
# Or on Windows:
setup_migration.bat
```

### 3. Start the Application
```bash
uvicorn main:app --reload
```

The API will now use Ollama as the primary analysis engine!

## 🎛️ Configuration

Create a `.env` file in the backend directory:

```env
# Ollama Configuration (Primary)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Gemini Fallback (Optional)
GEMINI_API_KEY=your_gemini_key_here
```

## 🤖 Recommended Models

| Model | RAM Needed | Performance | Best For |
|-------|------------|-------------|----------|
| **llama3.1:8b** | 8GB | Excellent | **Recommended for most users** |
| llama3.1:70b | 40GB+ | Outstanding | High-end machines |
| mistral:7b | 7GB | Good | Budget systems |
| qwen2.5:7b | 7GB | Good | Structured analysis |

### Install a Model
```bash
ollama pull llama3.1:8b
```

## 📊 Performance Comparison

### Ollama vs Gemini

| Aspect | Ollama (Local) | Gemini (Cloud) |
|--------|----------------|----------------|
| **Privacy** | ✅ 100% Private | ❌ Data sent to Google |
| **Cost** | ✅ Free | ❌ Pay per request |
| **Speed** | ✅ Fast (good hardware) | ⚠️ Network dependent |
| **Quality** | ⚠️ Depends on model | ✅ Consistently high |
| **Setup** | ⚠️ Requires installation | ✅ Just API key |
| **Offline** | ✅ Works offline | ❌ Needs internet |

## 🔧 API Changes

### New Endpoint Parameters
```javascript
POST /analyze-structured
{
  "cv_file": "file",
  "job_description": "...",
  "use_ollama": true,           // NEW: Use Ollama (default: true)
  "use_gemini_fallback": true   // NEW: Fall back to Gemini if Ollama fails
}
```

### Response Changes
```javascript
{
  "status": "success",
  "analysis_method": "ollama",  // NEW: Shows which LLM was used
  "analysis": { /* ... */ },
  "analysis_metadata": {        // NEW: Analysis metadata
    "method": "ollama",
    "ollama_model": "llama3.1:8b",
    "timestamp": "2024-..."
  }
}
```

### Status Endpoint
Check `GET /` to see LLM status:
```javascript
{
  "status": "API is running!",
  "version": "2.0.0 - Ollama Edition",
  "llm_status": {
    "primary": "Ollama",
    "ollama_running": true,
    "ollama_model": "llama3.1:8b",
    "model_available": true,
    "available_models": ["llama3.1:8b", "mistral:7b"],
    "gemini_fallback_configured": false
  }
}
```

## 🛠️ Troubleshooting

### Ollama Not Running
```bash
ollama serve
```

### Model Not Found
```bash
ollama list
ollama pull llama3.1:8b
```

### Out of Memory
- Try smaller models (`mistral:7b` instead of `llama3.1:8b`)
- Close other applications
- Use quantized models (e.g., `llama3.1:8b-instruct-q4_0`)

### Slow Performance
- Use SSD storage
- Ensure good cooling
- Try smaller models
- Check CPU/RAM usage

### Fallback to Gemini
The application automatically falls back to Gemini if:
- Ollama is not running
- Selected model is not available
- Ollama analysis fails
- `use_gemini_fallback=true` is set

## 📁 File Structure

```
backend/
├── main.py                    # Updated with Ollama support
├── ollama_api_structured.py   # NEW: Ollama integration
├── gemini_api_structured.py   # Kept for fallback
├── setup_ollama.py           # NEW: Setup helper script
├── requirements.txt          # Updated dependencies
└── .env.example              # NEW: Configuration template
```

## 🔄 Migration from Gemini-Only

If you were using the Gemini-only version:

1. **Your existing data is safe** - all analysis files are compatible
2. **API endpoints are the same** - just new optional parameters
3. **Gemini still works** - as a fallback option
4. **No breaking changes** - existing integrations continue working

## 💡 Tips for Best Results

### Model Selection
- **Development**: Use `llama3.1:8b` for good balance
- **Production**: Consider `llama3.1:70b` for best quality (if resources allow)
- **Budget**: Use `mistral:7b` for decent performance with lower requirements

### Hardware Optimization
- **RAM**: More is better - models load entirely into RAM
- **Storage**: SSD recommended for faster model loading
- **CPU**: More cores help with inference speed
- **GPU**: Some models support GPU acceleration

### Performance Tuning
```env
# Fine-tune in .env file
OLLAMA_MODEL=llama3.1:8b
# Try different models based on your needs
```

## 🔒 Privacy Benefits

With Ollama, your CV data:
- ✅ Never leaves your machine
- ✅ Is not stored by third parties  
- ✅ Is not used to train other models
- ✅ Remains completely under your control

This is especially important for:
- Confidential job applications
- Personal information in CVs
- Company compliance requirements
- GDPR and privacy regulations

## 🚦 Production Deployment

For production use:

1. **Dedicated Server**: Use a server with sufficient RAM (16GB+ recommended)
2. **Model Management**: Automate model updates and health checks
3. **Monitoring**: Monitor Ollama service status and performance
4. **Scaling**: Consider load balancing for multiple concurrent users
5. **Fallback**: Always configure Gemini fallback for reliability

---

**Enjoy your new local, private, and cost-free CV analysis! 🎉**