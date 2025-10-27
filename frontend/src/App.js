import React, { useState } from 'react';
import { FileText, Briefcase, CheckCircle, Upload, AlertCircle } from 'lucide-react';

export default function CVAnalyzer() {
  const [cvText, setCvText] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCvFile(file);
    setCvText(`File ready: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    setError(null);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setTestResults(null);
  
    const formData = new FormData();
    if (cvFile) {
      formData.append("cv_file", cvFile);
    } else {
      formData.append("cv_text", cvText);
    }
    formData.append("job_description", jobDesc);

    try {
      console.log("Sending request to backend...");
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Response from backend:", data);
      
      if (data.error) {
        setError(data.error);
      } else {
        setTestResults(data);
      }
    } catch (error) {
      console.error("Error analyzing CV:", error);
      setError(`Network error: ${error.message}. Make sure your backend is running on http://127.0.0.1:8000`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">CV Parser Testing Tool</h1>
          <p className="text-gray-600 mb-6">Test your backend connection and parser functionality</p>
        
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* CV Upload Section */}
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Your CV</h2>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Upload CV (PDF or DOCX)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF or DOCX (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                {cvFile && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    ✓ {cvFile.name} ({(cvFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>
              
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste your CV text here..."
                value={cvFile ? '' : cvText}
                onChange={(e) => {
                  setCvText(e.target.value);
                  setCvFile(null);
                }}
                disabled={!!cvFile}
              />
            </div>
            
            {/* Job Description Section */}
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Job Description</h2>
              </div>
              <textarea
                className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste the job description here..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Error:</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || (!cvText && !cvFile) || !jobDesc}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {loading ? 'Testing...' : 'Test Parser'}
            </button>
            
            {testResults && (
              <button
                onClick={() => {
                  setTestResults(null);
                  setCvText('');
                  setCvFile(null);
                  setJobDesc('');
                  setError(null);
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">Test Results</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {testResults.cv_stats?.total_characters || 0}
                </div>
                <div className="text-sm text-gray-600">Characters Extracted</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {testResults.cv_stats?.word_count || 0}
                </div>
                <div className="text-sm text-gray-600">Words</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {testResults.cv_stats?.line_count || 0}
                </div>
                <div className="text-sm text-gray-600">Lines</div>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-800">Summary</h3>
              <p className="text-gray-700">{testResults.summary}</p>
            </div>

            {testResults.file_info && testResults.file_info.filename && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-3 text-gray-800">File Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Filename:</span> {testResults.file_info.filename}</div>
                  <div><span className="font-medium">File Size:</span> {(testResults.file_info.file_size_bytes / 1024).toFixed(2)} KB</div>
                  <div><span className="font-medium">Extracted Length:</span> {testResults.file_info.extracted_text_length} characters</div>
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-800">Text Preview (First 200 characters)</h3>
              <div className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200 font-mono whitespace-pre-wrap">
                {testResults.cv_stats?.preview || 'No preview available'}
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">✓ Backend connection working!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your parser successfully extracted text from the CV. Check your terminal for detailed logs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}