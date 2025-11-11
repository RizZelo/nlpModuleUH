# Ollama Setup Guide for CV Analysis

This guide will help you set up Ollama with recommended models for CV analysis.

## 1. Install Ollama

### Windows
1. Download Ollama from: https://ollama.ai/download
2. Run the installer
3. Open Command Prompt or PowerShell

### Verify Installation
```bash
ollama --version
```

## 2. Install Recommended Models

For CV analysis, we recommend these models in order of performance vs resource usage:

### Option 1: Llama 3.1 8B (Recommended - Good Performance, Moderate Resources)
```bash
ollama pull llama3.1:8b
```
- **RAM Required**: ~8GB
- **Performance**: Excellent for CV analysis
- **Response Time**: Fast
- **Accuracy**: Very good

### Option 2: Llama 3.1 70B (Best Performance, High Resources)
```bash
ollama pull llama3.1:70b
```
- **RAM Required**: ~40GB+ (requires powerful machine)
- **Performance**: Outstanding for complex analysis
- **Response Time**: Slower
- **Accuracy**: Excellent

### Option 3: Mistral 7B (Good Alternative)
```bash
ollama pull mistral:7b
```
- **RAM Required**: ~7GB
- **Performance**: Good for CV analysis
- **Response Time**: Fast
- **Accuracy**: Good

### Option 4: Qwen 2.5 7B (Lightweight Alternative)
```bash
ollama pull qwen2.5:7b
```
- **RAM Required**: ~7GB
- **Performance**: Good, especially for structured tasks
- **Response Time**: Fast
- **Accuracy**: Good

## 3. Start Ollama Server

Ollama usually starts automatically, but you can manually start it:

```bash
ollama serve
```

The server runs on `http://localhost:11434` by default.

## 4. Test Your Installation

### Test if Ollama is running:
```bash
curl http://localhost:11434/api/tags
```

### Test model inference:
```bash
ollama run llama3.1:8b "Analyze this text for job-relevant skills: I worked with Python for 3 years"
```

## 5. Configure Environment Variables (Optional)

Create a `.env` file in your backend directory:

```env
# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Gemini Fallback (optional)
GEMINI_API_KEY=your_gemini_key_here
```

## 6. Model Comparison for CV Analysis

| Model | RAM | Speed | Quality | Best For |
|-------|-----|-------|---------|----------|
| llama3.1:8b | 8GB | Fast | Very Good | **General use (Recommended)** |
| llama3.1:70b | 40GB+ | Slow | Excellent | High-end machines |
| mistral:7b | 7GB | Fast | Good | Budget systems |
| qwen2.5:7b | 7GB | Fast | Good | Structured analysis |

## 7. Performance Tips

### For Better Performance:
- Close other heavy applications
- Use SSD storage
- Ensure good cooling
- Monitor CPU/GPU usage

### For Faster Responses:
- Use smaller models (7B-8B)
- Reduce context length if needed
- Keep model loaded (don't restart Ollama frequently)

### For Better Quality:
- Use larger models (70B) if you have resources
- Provide more detailed prompts
- Use temperature settings around 0.3

## 8. Troubleshooting

### Ollama not starting:
```bash
# Check if port is in use
netstat -an | findstr 11434

# Kill existing Ollama process
taskkill /F /IM ollama.exe

# Restart Ollama
ollama serve
```

### Model not downloading:
```bash
# Check available models
ollama list

# Pull specific version
ollama pull llama3.1:8b-instruct-q4_0
```

### Out of memory errors:
1. Try smaller models (7B instead of 8B)
2. Close other applications
3. Restart your computer
4. Use quantized models (they use less RAM)

## 9. API Usage in the Application

The application will automatically:
- Check if Ollama is running
- Verify if your chosen model is available
- Fall back to Gemini if Ollama fails (if configured)
- Show status in the API root endpoint

## 10. Production Recommendations

### For Production Use:
1. **Use llama3.1:8b** for good balance of speed/quality
2. **Set up monitoring** for Ollama service
3. **Configure fallback** to Gemini or other cloud API
4. **Use dedicated server** with sufficient RAM
5. **Implement rate limiting** to prevent overload

### System Requirements:
- **Minimum**: 16GB RAM, 4-core CPU, SSD storage
- **Recommended**: 32GB RAM, 8-core CPU, NVMe SSD
- **Optimal**: 64GB RAM, 16-core CPU, GPU acceleration

That's it! Your local LLM should now be ready for CV analysis.