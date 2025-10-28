import React, { useState } from 'react';
import { FileText, Briefcase, CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react';

export default function CVAnalyzer() {
  const [cvText, setCvText] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCvFile(file);
    
    // For now, just store the file
    // When you connect to FastAPI, you'll send this file directly
    // Your backend will handle PDF/DOCX extraction
    
    // Display filename as placeholder
    setCvText(`File uploaded: ${file.name}\n\nFile will be processed by backend...`);
  };

  const handleAnalyze = async () => {
  setLoading(true);

  const formData = new FormData();
  if (cvFile) {
    formData.append("cv_file", cvFile);
  } else {
    formData.append("cv_text", cvText);
  }
  formData.append("job_description", jobDesc);

  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    
    if (data.gemini_analysis?.error) {
      alert("Gemini Error: " + data.gemini_analysis.error);
      setLoading(false);
      return;
    }

    const geminiData = data.gemini_analysis?.analysis;
    
    setAnalysis({
      general: {
        summary: geminiData?.general?.summary || "No analysis received.",
        overallGrade: geminiData?.general?.overall_score || 0,
        formattingGrade: geminiData?.formatting?.score || 0,
        contentGrade: geminiData?.content?.score || 0,
      },
      flags: [
        // Convert issues to flags
        ...((geminiData?.formatting?.issues || []).map(issue => ({
          type: 'warning',
          message: `Formatting: ${issue}`
        }))),
        ...((geminiData?.content?.weaknesses || []).map(weakness => ({
          type: 'error',
          message: `Content: ${weakness}`
        })))
      ],
      recommendations: geminiData?.general?.top_priorities || [],
      categories: [
        {
          name: "Formatting",
          score: geminiData?.formatting?.score || 0,
          good: [], // Formatting doesn't have "good" items in our structure
          bad: geminiData?.formatting?.issues || [],
          suggestions: geminiData?.formatting?.suggestions || []
        },
        {
          name: "Content Quality",
          score: geminiData?.content?.score || 0,
          good: geminiData?.content?.strengths || [],
          bad: geminiData?.content?.weaknesses || [],
          suggestions: geminiData?.content?.suggestions || []
        }
      ],
    });
  } catch (error) {
    console.error("Error analyzing CV:", error);
    alert("Failed to analyze CV. Please try again.");
  }

  setLoading(false);
};

  const getGradeColor = (grade) => {
    if (grade >= 8) return 'text-green-600';
    if (grade >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFlagIcon = (type) => {
    switch(type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">CV NLP Analyzer</h1>
        
        {!analysis ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Your CV</h2>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Upload CV (PDF or DOCX)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded cursor-pointer hover:bg-gray-50">
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
                  <div className="mt-2 text-sm text-green-600">
                    ✓ {cvFile.name} uploaded
                  </div>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>
              
              <textarea
                className="w-full h-40 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 mt-4"
                placeholder="Paste your CV text here..."
                value={cvFile ? '' : cvText}
                onChange={(e) => {
                  setCvText(e.target.value);
                  setCvFile(null);
                }}
                disabled={!!cvFile}
              />
            </div>
            
            <div className="bg-white p-6 rounded border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Job Description</h2>
              </div>
              <textarea
                className="w-full h-64 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Paste the job description here..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* General Analysis */}
              <div className="bg-white p-6 rounded border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4">General Analysis</h2>
                <p className="text-gray-700 mb-4">{analysis.general.summary}</p>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getGradeColor(analysis.general.overallGrade)}`}>
                      {analysis.general.overallGrade}
                    </div>
                    <div className="text-sm text-gray-600">Overall</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getGradeColor(analysis.general.formattingGrade)}`}>
                      {analysis.general.formattingGrade}
                    </div>
                    <div className="text-sm text-gray-600">Formatting</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getGradeColor(analysis.general.contentGrade)}`}>
                      {analysis.general.contentGrade}
                    </div>
                    <div className="text-sm text-gray-600">Content</div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <h3 className="font-semibold">Flags</h3>
                  {analysis.flags.map((flag, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                      {getFlagIcon(flag.type)}
                      <span className="text-sm">{flag.message}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-2 mb-2 bg-blue-50 rounded text-sm">
                      {idx + 1}. {rec}
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Categories */}
              {analysis.categories.map((cat, idx) => (
                <div key={idx} className="bg-white p-6 rounded border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{cat.name}</h3>
                    <span className={`text-2xl font-bold ${getGradeColor(cat.score)}`}>
                      {cat.score}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-green-700 mb-2">✓ What's Good</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {cat.good.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-red-700 mb-2">✗ Issues Found</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {cat.bad.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">💡 Suggestions</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {cat.suggestions.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* CV Preview Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded border border-gray-200 sticky top-8">
                <h3 className="font-semibold mb-3">Your CV</h3>
                <div className="text-xs text-gray-600 max-h-96 overflow-y-auto whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {cvText || 'No CV text provided'}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h3 className="font-semibold mb-3">Future Updates</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Skill Gap Analyzer</li>
                  <li>• CV History Tracking</li>
                  <li>• AI Skill Suggestions</li>
                  <li>• Export Improved CV</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleAnalyze}
            disabled={loading || (!cvText && !cvFile) || !jobDesc || analysis}
            className="px-6 py-3 bg-blue-600 text-white rounded font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            {loading ? 'Analyzing...' : 'Analyze CV'}
          </button>
          
          {analysis && (
            <button
              onClick={() => {
                setAnalysis(null);
                setCvText('');
                setCvFile(null);
                setJobDesc('');
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700"
            >
              New Analysis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}