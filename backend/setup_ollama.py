#!/usr/bin/env python3
"""
Ollama Setup Helper for CV Analysis
This script helps set up and manage Ollama models for the CV analysis application.
"""

import requests
import subprocess
import sys
import json
import time
import os
from typing import Dict, List


class OllamaSetupHelper:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url.rstrip('/')
        
    def check_ollama_installed(self) -> bool:
        """Check if Ollama is installed on the system."""
        try:
            result = subprocess.run(['ollama', '--version'], 
                                  capture_output=True, text=True, timeout=10)
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
    
    def check_ollama_running(self) -> bool:
        """Check if Ollama server is running."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def get_available_models(self) -> List[str]:
        """Get list of available models."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=10)
            response.raise_for_status()
            data = response.json()
            return [model["name"] for model in data.get("models", [])]
        except requests.RequestException:
            return []
    
    def pull_model(self, model_name: str) -> bool:
        """Pull a model from Ollama registry."""
        try:
            print(f"🔄 Pulling model: {model_name}")
            print("This may take a while depending on model size and internet speed...")
            
            # Use subprocess to pull model as it shows progress
            result = subprocess.run(['ollama', 'pull', model_name], 
                                  capture_output=False, text=True)
            
            if result.returncode == 0:
                print(f"✅ Successfully pulled {model_name}")
                return True
            else:
                print(f"❌ Failed to pull {model_name}")
                return False
                
        except subprocess.SubprocessError as e:
            print(f"❌ Error pulling model: {e}")
            return False
    
    def test_model(self, model_name: str) -> bool:
        """Test if a model is working properly."""
        try:
            print(f"🧪 Testing model: {model_name}")
            
            test_prompt = "Respond with exactly 'TEST SUCCESS' if you can process this message."
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": model_name,
                    "prompt": test_prompt,
                    "stream": False,
                    "options": {"temperature": 0}
                },
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
            response_text = result.get("response", "").strip()
            
            if "TEST SUCCESS" in response_text.upper():
                print(f"✅ Model {model_name} is working correctly")
                return True
            else:
                print(f"⚠️ Model {model_name} responded but with unexpected output: {response_text}")
                return False
                
        except requests.RequestException as e:
            print(f"❌ Error testing model {model_name}: {e}")
            return False
    
    def get_system_info(self) -> Dict:
        """Get system information for model recommendations."""
        import psutil
        
        return {
            "ram_gb": round(psutil.virtual_memory().total / (1024**3), 1),
            "cpu_count": psutil.cpu_count(),
            "available_ram_gb": round(psutil.virtual_memory().available / (1024**3), 1)
        }
    
    def recommend_models(self) -> List[Dict]:
        """Recommend models based on system capabilities."""
        system_info = self.get_system_info()
        ram_gb = system_info["available_ram_gb"]
        
        recommendations = []
        
        if ram_gb >= 40:
            recommendations.append({
                "name": "llama3.1:70b",
                "size": "~40GB",
                "performance": "Excellent",
                "description": "Best quality, requires powerful machine"
            })
        
        if ram_gb >= 8:
            recommendations.append({
                "name": "llama3.1:8b",
                "size": "~8GB",
                "performance": "Very Good",
                "description": "Recommended - Best balance of quality and speed"
            })
        
        if ram_gb >= 7:
            recommendations.extend([
                {
                    "name": "mistral:7b",
                    "size": "~7GB",
                    "performance": "Good",
                    "description": "Good alternative, fast inference"
                },
                {
                    "name": "qwen2.5:7b",
                    "size": "~7GB",
                    "performance": "Good",
                    "description": "Good for structured tasks"
                }
            ])
        
        if ram_gb < 7:
            recommendations.append({
                "name": "llama3.1:8b-instruct-q4_0",
                "size": "~5GB",
                "performance": "Fair",
                "description": "Quantized version for low-memory systems"
            })
        
        return recommendations


def main():
    print("🦙 Ollama Setup Helper for CV Analysis")
    print("=" * 50)
    
    helper = OllamaSetupHelper()
    
    # Check if Ollama is installed
    print("🔍 Checking Ollama installation...")
    if not helper.check_ollama_installed():
        print("❌ Ollama is not installed!")
        print("\nPlease install Ollama first:")
        print("1. Visit: https://ollama.ai/download")
        print("2. Download and install Ollama for your OS")
        print("3. Run this script again")
        sys.exit(1)
    
    print("✅ Ollama is installed")
    
    # Check if Ollama is running
    print("🔍 Checking Ollama server...")
    if not helper.check_ollama_running():
        print("❌ Ollama server is not running!")
        print("\nTrying to start Ollama server...")
        try:
            # Try to start Ollama
            subprocess.Popen(['ollama', 'serve'], 
                           stdout=subprocess.DEVNULL, 
                           stderr=subprocess.DEVNULL)
            
            # Wait a bit for server to start
            time.sleep(5)
            
            if helper.check_ollama_running():
                print("✅ Ollama server started successfully")
            else:
                print("❌ Failed to start Ollama server")
                print("Please start it manually: ollama serve")
                sys.exit(1)
        except Exception as e:
            print(f"❌ Error starting Ollama: {e}")
            print("Please start it manually: ollama serve")
            sys.exit(1)
    
    print("✅ Ollama server is running")
    
    # Get system info and recommendations
    print("\n💻 System Information:")
    system_info = helper.get_system_info()
    print(f"RAM: {system_info['ram_gb']} GB total, {system_info['available_ram_gb']} GB available")
    print(f"CPU Cores: {system_info['cpu_count']}")
    
    print("\n📋 Model Recommendations for your system:")
    recommendations = helper.recommend_models()
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec['name']}")
        print(f"   Size: {rec['size']}, Performance: {rec['performance']}")
        print(f"   Description: {rec['description']}")
        print()
    
    # Check current models
    print("🔍 Checking available models...")
    available_models = helper.get_available_models()
    
    if available_models:
        print("✅ Available models:")
        for model in available_models:
            print(f"  - {model}")
        
        # Test available models
        print("\n🧪 Testing available models...")
        working_models = []
        for model in available_models:
            if helper.test_model(model):
                working_models.append(model)
        
        if working_models:
            print(f"\n✅ Working models: {', '.join(working_models)}")
            print(f"\nRecommended model for .env file: {working_models[0]}")
            
            # Create .env template
            env_content = f"""# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL={working_models[0]}

# Gemini Fallback (optional)
GEMINI_API_KEY=your_gemini_key_here
"""
            
            with open(".env.ollama", "w") as f:
                f.write(env_content)
            
            print(f"📝 Created .env.ollama file with recommended settings")
            print("💡 Rename it to .env to use these settings")
    else:
        print("⚠️ No models found")
        
        # Ask user if they want to install recommended model
        print("\n🤖 Would you like to install the recommended model?")
        if recommendations:
            rec_model = recommendations[0]["name"]
            print(f"Recommended: {rec_model}")
            
            choice = input("Install recommended model? (y/N): ").lower().strip()
            
            if choice in ['y', 'yes']:
                if helper.pull_model(rec_model):
                    print(f"\n🧪 Testing {rec_model}...")
                    if helper.test_model(rec_model):
                        print(f"\n🎉 Setup complete! {rec_model} is ready to use.")
                        
                        # Create .env file
                        env_content = f"""# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL={rec_model}

# Gemini Fallback (optional)
GEMINI_API_KEY=your_gemini_key_here
"""
                        with open(".env.ollama", "w") as f:
                            f.write(env_content)
                        
                        print("📝 Created .env.ollama file with recommended settings")
                        print("💡 Rename it to .env to use these settings")
                    else:
                        print(f"❌ {rec_model} failed testing")
                else:
                    print(f"❌ Failed to install {rec_model}")
    
    print("\n" + "=" * 50)
    print("🎯 Setup Summary:")
    print("1. Ollama is installed and running")
    print("2. Check available models above")
    print("3. Use .env.ollama as template for configuration")
    print("4. Start your CV analysis API!")
    print("\nFor more help, see OLLAMA_SETUP.md")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Setup interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()