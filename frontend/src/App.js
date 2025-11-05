import React, { useState, useRef, useEffect } from 'react';
import { FileText, Briefcase, CheckCircle, XCircle, AlertCircle, Upload, Download, Edit3, Lightbulb, X, Loader } from 'lucide-react';

export default function CVAnalyzer() {
  const [cvText, setCvText] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  
  // Loading stage constants
  const LOADING_STAGES = {
    UPLOADING: 'Uploading CV...',
    EXTRACTING: 'Extracting text and layout...',
    ANALYZING: 'Analyzing with AI...',
    PREPARING: 'Preparing suggestions...'
  };
  
  const getLoadingProgress = (stage) => {
    switch(stage) {
      case LOADING_STAGES.UPLOADING: return 25;
      case LOADING_STAGES.EXTRACTING: return 50;
      case LOADING_STAGES.ANALYZING: return 75;
      case LOADING_STAGES.PREPARING: return 90;
      default: return 0;
    }
  };
  const [editedCvText, setEditedCvText] = useState('');
  const [inlineSuggestions, setInlineSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [suggestionPosition, setSuggestionPosition] = useState({ x: 0, y: 0 });
  const editorRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCvFile(file);
    setCvText(`File uploaded: ${file.name}\n\nFile will be processed by backend...`);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setLoadingStage(LOADING_STAGES.UPLOADING);

    const formData = new FormData();
    if (cvFile) {
      formData.append("cv_file", cvFile);
    } else {
      formData.append("cv_text", cvText);
    }
    formData.append("job_description", jobDesc);

    try {
      setLoadingStage(LOADING_STAGES.EXTRACTING);
      
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      setLoadingStage(LOADING_STAGES.ANALYZING);
      const data = await response.json();
      
      setLoadingStage(LOADING_STAGES.PREPARING);
      
      if (data.gemini_analysis?.error) {
        alert("Gemini Error: " + data.gemini_analysis.error);
        setLoading(false);
        setLoadingStage('');
        return;
      }

      const extractedCvText = data.cv_stats?.full_text || cvText;
      
      if (cvFile && extractedCvText) {
        setCvText(extractedCvText);
        setEditedCvText(extractedCvText);
      } else {
        setEditedCvText(cvText);
      }

      const geminiData = data.gemini_analysis?.analysis;
      
      // Store inline suggestions
      setInlineSuggestions(geminiData?.inline_suggestions || []);
      
      setAnalysis({
        general: {
          summary: geminiData?.general?.summary || "No analysis received.",
          overallGrade: geminiData?.general?.overall_score || 0,
          formattingGrade: geminiData?.formatting?.score || 0,
          contentGrade: geminiData?.content?.score || 0,
        },
        flags: [
          ...((geminiData?.formatting?.issues || []).map((issue, idx) => ({
            id: `fmt-${idx}`,
            type: 'warning',
            message: issue,
            category: 'Formatting'
          }))),
          ...((geminiData?.content?.weaknesses || []).map((weakness, idx) => ({
            id: `cnt-${idx}`,
            type: 'error',
            message: weakness,
            category: 'Content'
          })))
        ],
        recommendations: geminiData?.general?.top_priorities || [],
        categories: [
          {
            name: "Formatting",
            score: geminiData?.formatting?.score || 0,
            good: [],
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
    setLoadingStage('');
  };

  const handleDownload = () => {
    const blob = new Blob([editedCvText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited_cv.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const applySuggestion = (suggestion) => {
    if (suggestion.replacement && suggestion.text_snippet) {
      const newText = editedCvText.replace(suggestion.text_snippet, suggestion.replacement);
      setEditedCvText(newText);
      setActiveSuggestion(null);
    }
  };

  const highlightText = (text) => {
    if (!inlineSuggestions.length) return text;

    let highlightedText = text;
    const markers = [];

    inlineSuggestions.forEach((sugg, idx) => {
      const index = highlightedText.indexOf(sugg.text_snippet);
      if (index !== -1) {
        markers.push({
          start: index,
          end: index + sugg.text_snippet.length,
          suggestion: sugg,
          id: idx
        });
      }
    });

    // Sort markers by position
    markers.sort((a, b) => a.start - b.start);

    // Build highlighted version
    let result = '';
    let lastIndex = 0;

    markers.forEach(marker => {
      result += text.substring(lastIndex, marker.start);
      result += `<mark class="bg-red-200 cursor-pointer hover:bg-red-300" data-suggestion="${marker.id}">${text.substring(marker.start, marker.end)}</mark>`;
      lastIndex = marker.end;
    });
    result += text.substring(lastIndex);

    return result;
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
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex flex-col items-center">
              <Loader className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Analyzing Your CV</h3>
              <p className="text-gray-600 text-center mb-4">{loadingStage}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getLoadingProgress(loadingStage)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">CV NLP Analyzer</h1>
          {analysis && (
            <div className="text-sm text-gray-600">
              {inlineSuggestions.length} inline suggestions found
            </div>
          )}
        </div>
        
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
          <div className="grid grid-cols-12 gap-6">
            {/* CV Editor - Middle Column */}
            <div className="col-span-7 space-y-4">
              <div className="bg-white p-6 rounded border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    <h2 className="text-xl font-semibold">Your CV - Edit Mode</h2>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm">
                  <p className="text-yellow-800">
                    💡 <strong>Tip:</strong> Red highlighted text indicates issues. Click on them to see and apply suggestions!
                  </p>
                </div>

                {/* Editable CV Text Area */}
                <div className="relative">
                  <textarea
                    ref={editorRef}
                    className="w-full h-[600px] p-4 border border-gray-300 rounded focus:outline-none focus:border-blue-500 font-mono text-sm resize-none"
                    value={editedCvText}
                    onChange={(e) => setEditedCvText(e.target.value)}
                    placeholder="Your CV content will appear here..."
                    onClick={(e) => {
                      // Check if clicked on a suggestion
                      const clickedText = window.getSelection().toString();
                      const matchingSugg = inlineSuggestions.find(s => 
                        editedCvText.includes(s.text_snippet) && clickedText.includes(s.text_snippet)
                      );
                      if (matchingSugg) {
                        setActiveSuggestion(matchingSugg);
                        setSuggestionPosition({ x: e.clientX, y: e.clientY });
                      }
                    }}
                  />
                  
                  {/* Inline Suggestion Popup */}
                  {activeSuggestion && (
                    <div 
                      className="fixed bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 z-50 max-w-md"
                      style={{
                        left: `${Math.min(suggestionPosition.x, window.innerWidth - 400)}px`,
                        top: `${Math.min(suggestionPosition.y + 20, window.innerHeight - 300)}px`
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-blue-900">Suggestion</h3>
                        </div>
                        <button 
                          onClick={() => setActiveSuggestion(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">Issue:</div>
                          <div className="text-gray-600">{activeSuggestion.problem}</div>
                        </div>
                        
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">Current text:</div>
                          <div className="bg-red-50 p-2 rounded text-gray-800 italic">
                            "{activeSuggestion.text_snippet}"
                          </div>
                        </div>
                        
                        {activeSuggestion.replacement && (
                          <div>
                            <div className="font-semibold text-gray-700 mb-1">Suggested replacement:</div>
                            <div className="bg-green-50 p-2 rounded text-gray-800">
                              "{activeSuggestion.replacement}"
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <div className="font-semibold text-gray-700 mb-1">Recommendation:</div>
                          <div className="text-gray-600">{activeSuggestion.suggestion}</div>
                        </div>
                        
                        {activeSuggestion.replacement && (
                          <button
                            onClick={() => applySuggestion(activeSuggestion)}
                            className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                          >
                            Apply Suggestion
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-sm text-gray-500 flex justify-between">
                  <div>
                    Characters: {editedCvText.length} | Words: {editedCvText.split(/\s+/).filter(w => w).length}
                  </div>
                  <div className="text-blue-600">
                    {inlineSuggestions.length} suggestions available
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations - Right Sidebar */}
            <div className="col-span-5 space-y-4 max-h-screen overflow-y-auto">
              {/* Scores Card */}
              <div className="bg-white p-6 rounded border border-gray-200 sticky top-0 z-10">
                <h3 className="text-lg font-semibold mb-4">Overall Scores</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getGradeColor(analysis.general.overallGrade)}`}>
                      {analysis.general.overallGrade}
                    </div>
                    <div className="text-xs text-gray-600">Overall</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getGradeColor(analysis.general.formattingGrade)}`}>
                      {analysis.general.formattingGrade}
                    </div>
                    <div className="text-xs text-gray-600">Format</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getGradeColor(analysis.general.contentGrade)}`}>
                      {analysis.general.contentGrade}
                    </div>
                    <div className="text-xs text-gray-600">Content</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-700">{analysis.general.summary}</p>
                </div>
              </div>

              {/* Top Priorities */}
              <div className="bg-white p-6 rounded border border-gray-200">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Top Priorities
                </h3>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-orange-50 border border-orange-200 rounded text-sm">
                      <span className="font-semibold text-orange-800">{idx + 1}.</span> {rec}
                    </div>
                  ))}
                </div>
              </div>

              {/* Inline Suggestions List */}
              {inlineSuggestions.length > 0 && (
                <div className="bg-white p-6 rounded border border-gray-200">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-500" />
                    Inline Suggestions ({inlineSuggestions.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {inlineSuggestions.map((sugg, idx) => (
                      <div 
                        key={idx}
                        className="p-3 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100 text-xs"
                        onClick={() => {
                          setActiveSuggestion(sugg);
                          setSuggestionPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
                        }}
                      >
                        <div className="font-semibold text-blue-900 mb-1">
                          {sugg.issue_type}
                        </div>
                        <div className="text-gray-700 mb-2">
                          "{sugg.text_snippet.substring(0, 50)}..."
                        </div>
                        <div className="text-gray-600">
                          💡 {sugg.suggestion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Issues */}
              <div className="bg-white p-6 rounded border border-gray-200">
                <h3 className="font-semibold mb-3">All Issues ({analysis.flags.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analysis.flags.map((flag) => (
                    <div 
                      key={flag.id}
                      className="flex items-start gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100"
                    >
                      {getFlagIcon(flag.type)}
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">{flag.category}</div>
                        <div className="text-sm">{flag.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Details */}
              {analysis.categories.map((cat, idx) => (
                <div key={idx} className="bg-white p-6 rounded border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">{cat.name}</h3>
                    <span className={`text-xl font-bold ${getGradeColor(cat.score)}`}>
                      {cat.score}
                    </span>
                  </div>
                  
                  {cat.good.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-green-700 mb-2">✓ Strengths</h4>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {cat.good.map((item, i) => <li key={i}>• {item}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {cat.bad.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-red-700 mb-2">✗ Issues</h4>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {cat.bad.map((item, i) => <li key={i}>• {item}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {cat.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Suggestions</h4>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {cat.suggestions.map((item, i) => <li key={i}>• {item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
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
                setEditedCvText('');
                setInlineSuggestions([]);
                setActiveSuggestion(null);
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