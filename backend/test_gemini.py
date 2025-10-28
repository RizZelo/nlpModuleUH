"""
Quick test script for Gemini API
"""

import os
os.environ['GRPC_VERBOSITY'] = 'ERROR'
os.environ['GLOG_minloglevel'] = '2'

import google.generativeai as genai

# Set your API key here
API_KEY = "AIzaSyDCKmLckcU6UwH5WV-KjY9G0idbHkSLI7M"  # Replace with your actual key

print("Testing Gemini API connection...")
print("="*50)

try:
    # Configure
    genai.configure(api_key=API_KEY)
    print("✅ API configured")
    
    # Create model (try latest first)
    models_to_try = [
        'gemini-2.0-flash-exp',  # Latest experimental
        'gemini-1.5-pro',        # Best quality
        'gemini-1.5-flash'       # Good balance
    ]
    
    model = None
    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            print(f"✅ Model created: {model_name}")
            break
        except Exception as e:
            print(f"⚠️ {model_name} not available: {str(e)}")
            continue
    
    if not model:
        print("❌ No models available")
        exit(1)
    
    # Simple test
    print("\n🤖 Sending test request...")
    response = model.generate_content("Say 'Hello, API is working!' in JSON format: {\"message\": \"...\"}")
    
    print("\n✅ Response received:")
    print(response.text)
    print("\n" + "="*50)
    print("🎉 Success! Your API key works!")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    print("\nPossible issues:")
    print("1. Invalid API key")
    print("2. No internet connection")
    print("3. API quota exceeded")
    print("4. Firewall blocking requests")