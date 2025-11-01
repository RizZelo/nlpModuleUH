import React, { useState, useRef, useEffect } from 'react';
import { FileText, Briefcase, CheckCircle, XCircle, AlertCircle, Upload, Download, Edit3, Lightbulb, X, Sparkles, TrendingUp, Target, Zap, Clock, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react';

// Reusable EmptyState component
const EmptyState = ({ icon: Icon, message }) => (
  <div className="text-center py-12 text-gray-500">
    <Icon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
    <p>{message}</p>
  </div>
);

export default function EnhancedCVAnalyzer() {
  const [cvFile, setCvFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editableHTML, setEditableHTML] = useState('');
  const [showStructured, setShowStructured] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const editorRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['.pdf', '.docx', '.doc', '.txt', '.odt', '.tex', '.html', '.rtf'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(ext)) {
      alert(`Unsupported file type. Please upload: ${validTypes.join(', ')}`);
      return;
    }
    
    setCvFile(file);
  };

  const handleAnalyze = async () => {
    if (!cvFile) {
      alert('Please upload a CV');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("cv_file", cvFile);
    formData.append("job_description", jobDesc);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (data.gemini_analysis?.error) {
        alert("Analysis Error: " + data.gemini_analysis.error);
        setLoading(false);
        return;
      }

      // Set editable HTML
      const htmlContent = data.cv_stats?.html || `<div>${data.cv_stats?.full_text || ''}</div>`;
      setEditableHTML(htmlContent);

      const analysisData = data.gemini_analysis?.analysis || {};
      
      setAnalysis({
        ...analysisData,
        metadata: data.cv_stats?.metadata || {},
        structured: data.cv_stats?.structured || {}
      });

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze CV. Make sure backend is running on port 8000.");
    }

    setLoading(false);
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    const content = editorRef.current?.innerHTML || editableHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CV</title>
          <style>
            @page { margin: 0.75in; }
            * { box-sizing: border-box; }
            body { 
              font-family: 'Georgia', 'Times New Roman', serif; 
              font-size: 11pt; 
              line-height: 1.5;
              color: #000;
              margin: 0;
              padding: 0;
            }
            h1 { font-size: 24pt; margin: 0 0 8px 0; }
            h2 { font-size: 14pt; margin: 18px 0 6px 0; border-bottom: 1px solid #333; padding-bottom: 2px; }
            h3 { font-size: 12pt; margin: 12px 0 4px 0; font-weight: 600; }
            p { margin: 0 0 8px 0; }
            ul { margin: 4px 0 12px 0; padding-left: 20px; }
            li { margin-bottom: 4px; }
            strong { font-weight: 600; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const applySuggestion = (suggestion) => {
    if (!editorRef.current || !suggestion.replacement) return;
    
    const content = editorRef.current.innerHTML;
    const updated = content.replace(suggestion.text_snippet, suggestion.replacement);
    editorRef.current.innerHTML = updated;
    setEditableHTML(updated);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100 border-green-300';
    if (score >= 60) return 'bg-yellow-100 border-yellow-300';
    if (score >= 40) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[severity] || colors.medium;
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">AI CV Analyzer Pro</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Upload your CV in any format → Get comprehensive AI analysis → Edit with rich editor → Export to PDF
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* CV Upload */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold">Your CV</h2>
              </div>
              
              <div className="mb-6">
                <label className="flex flex-col items-center justify-center w-full h-48 border-3 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-7">
                    <Upload className="w-12 h-12 mb-4 text-gray-400 group-hover:text-blue-500 transition" />
                    <p className="mb-2 text-base font-semibold text-gray-700">
                      Drop your CV here or click to upload
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, DOCX, DOC, TXT, ODT, LaTeX, HTML, RTF
                    </p>
                    <p className="text-xs text-gray-400 mt-2">MAX. 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc,.txt,.odt,.tex,.html,.rtf"
                    onChange={handleFileUpload}
                  />
                </label>
                
                {cvFile && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-green-900">{cvFile.name}</div>
                        <div className="text-sm text-green-700">{(cvFile.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCvFile(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Supported formats:</strong> We extract text from all major CV formats including Canva exports, LaTeX resumes, and standard office documents.
                </p>
              </div>
            </div>
            
            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold">Target Job <span className="text-sm text-gray-500 font-normal">(Optional)</span></h2>
              </div>
              
              <textarea
                className="w-full h-56 p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Paste the full job description here (optional)...&#10;&#10;Leave empty to analyze your CV for general best practices and ATS compatibility.&#10;&#10;Or include: requirements, responsibilities, desired skills, and qualifications for job-specific analysis."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />
              
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Job description is optional. Without it, we'll analyze your CV for general quality, formatting, and ATS compatibility.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleAnalyze}
              disabled={loading || !cvFile}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition shadow-lg disabled:shadow-none transform hover:scale-105 disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing Your CV...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Analyze CV with AI
                </span>
              )}
            </button>
            
            {!cvFile ? (
              <p className="mt-4 text-sm text-gray-500">
                Please upload your CV to continue
              </p>
            ) : !jobDesc ? (
              <p className="mt-4 text-sm text-gray-400 italic">
                Job description is optional - you can analyze your CV for general best practices
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Analysis view
  const inlineSuggestions = analysis.inline_suggestions || [];
  const criticalIssues = analysis.critical_issues || [];
  const quickWins = analysis.quick_wins || [];
  const sectionAnalysis = analysis.section_analysis || [];
  const jobMatch = analysis.job_match_analysis || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">AI CV Analysis</h1>
                <p className="text-sm text-gray-600">{cvFile?.name}</p>
              </div>
            </div>
            
            {/* Score Display */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(analysis.overall_score || 0)}`}>
                  {analysis.overall_score || 0}
                </div>
                <div className="text-xs text-gray-600 uppercase font-semibold">Overall</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(analysis.ats_score || 0)}`}>
                  {analysis.ats_score || 0}
                </div>
                <div className="text-xs text-gray-600 uppercase font-semibold">ATS</div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAnalysis(null);
                    setCvFile(null);
                    setJobDesc('');
                    setEditableHTML('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                >
                  New Analysis
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
              <nav className="space-y-2">
                {[
                  { id: 'overview', icon: Target, label: 'Overview' },
                  { id: 'editor', icon: Edit3, label: 'Edit CV' },
                  { id: 'suggestions', icon: Lightbulb, label: 'Suggestions', count: inlineSuggestions.length },
                  { id: 'sections', icon: FileText, label: 'Sections', count: sectionAnalysis.length },
                  { id: 'ats', icon: TrendingUp, label: 'ATS Match' },
                  { id: 'quick-wins', icon: Zap, label: 'Quick Wins', count: quickWins.length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </div>
                    {tab.count !== undefined && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-7">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold mb-4">Executive Summary</h2>
                  <p className="text-gray-700 leading-relaxed">{analysis.summary || 'No summary available'}</p>
                </div>

                {/* Critical Issues */}
                {criticalIssues.length > 0 && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                    <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Critical Issues ({criticalIssues.length})
                    </h3>
                    <ul className="space-y-2">
                      {criticalIssues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-red-800">
                          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Score Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold mb-4">Score Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Overall Quality', score: analysis.overall_score || 0 },
                      { label: 'ATS Compatibility', score: analysis.ats_score || 0 },
                      { label: 'Readability', score: analysis.readability_score || 0 },
                      { label: 'Job Match', score: jobMatch.relevance_score || 0 }
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{item.label}</span>
                          <span className={`font-bold ${getScoreColor(item.score)}`}>
                            {item.score}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              item.score >= 80 ? 'bg-green-500' :
                              item.score >= 60 ? 'bg-yellow-500' :
                              item.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
                  <h2 className="font-bold flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-blue-600" />
                    Rich Text Editor
                  </h2>
                  <button
                    onClick={() => setShowStructured(!showStructured)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {showStructured ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showStructured ? 'Hide' : 'Show'} Structure
                  </button>
                </div>
                
                {showStructured && analysis.structured && (
                  <div className="bg-blue-50 border-b border-blue-200 p-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Sections:</strong> {analysis.structured.sections?.length || 0}
                      </div>
                      <div>
                        <strong>Bullet Points:</strong> {analysis.structured.bullet_points?.length || 0}
                      </div>
                      <div>
                        <strong>Contacts:</strong> {Object.keys(analysis.structured.contacts || {}).join(', ') || 'None'}
                      </div>
                      <div>
                        <strong>Dates:</strong> {analysis.structured.dates?.length || 0}
                      </div>
                    </div>
                  </div>
                )}
                
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="p-8 min-h-[600px] focus:outline-none prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: editableHTML }}
                  onInput={(e) => setEditableHTML(e.currentTarget.innerHTML)}
                  style={{ fontFamily: 'Georgia, serif' }}
                />
                
                <div className="bg-gray-50 border-t border-gray-200 p-4 text-sm text-gray-600">
                  Click any text to edit • Use formatting tools above • Changes are auto-saved
                </div>
              </div>
            )}

            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                {inlineSuggestions.map((sugg, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityBadge(sugg.severity)}`}>
                          {sugg.severity?.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-600 font-medium">{sugg.issue_type}</span>
                        {sugg.section && (
                          <span className="text-xs text-gray-500">• {sugg.section}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="text-xs font-semibold text-red-800 mb-1">Original:</div>
                        <div className="text-sm text-gray-800 italic">"{sugg.text_snippet}"</div>
                      </div>
                      
                      <div className="text-sm text-gray-700">
                        <strong>Problem:</strong> {sugg.problem}
                      </div>
                      
                      <div className="text-sm text-blue-700">
                        <strong>Suggestion:</strong> {sugg.suggestion}
                      </div>
                      
                      {sugg.replacement && (
                        <>
                          <div className="bg-green-50 border border-green-200 rounded p-3">
                            <div className="text-xs font-semibold text-green-800 mb-1">Improved:</div>
                            <div className="text-sm text-gray-800 font-medium">"{sugg.replacement}"</div>
                          </div>
                          
                          <button
                            onClick={() => applySuggestion(sugg)}
                            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Apply This Suggestion
                          </button>
                        </>
                      )}
                      
                      {sugg.explanation && (
                        <div className="text-xs text-gray-600 italic border-l-2 border-gray-300 pl-3">
                          {sugg.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {inlineSuggestions.length === 0 && (
                  <EmptyState icon={Lightbulb} message="No suggestions available" />
                )}
              </div>
            )}

            {activeTab === 'quick-wins' && (
              <div className="space-y-4">
                {quickWins.map((win, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                      <Zap className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">{win.change}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-700">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>{win.where}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{win.effort}</span>
                          </div>
                          <div className="font-semibold text-orange-700">
                            Impact: {win.impact}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {quickWins.length === 0 && (
                  <EmptyState icon={Zap} message="No quick wins available" />
                )}
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-4">
                {sectionAnalysis.map((section, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{section.name}</h3>
                        {section.quality_score !== undefined && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-sm text-gray-600">Quality Score:</div>
                            <div className={`text-lg font-bold ${getScoreColor(section.quality_score * 10)}`}>
                              {section.quality_score}/10
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {section.feedback && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-gray-700">{section.feedback}</p>
                      </div>
                    )}
                    
                    {section.suggestions && section.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Suggestions:</h4>
                        <ul className="space-y-1">
                          {section.suggestions.map((suggestion, sidx) => (
                            <li key={sidx} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                
                {sectionAnalysis.length === 0 && (
                  <EmptyState icon={FileText} message="No section analysis available" />
                )}
              </div>
            )}

            {activeTab === 'ats' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    ATS Compatibility Score
                  </h2>
                  
                  <div className="flex items-center justify-center mb-6">
                    <div className={`text-6xl font-bold ${getScoreColor(jobMatch.relevance_score || 0)}`}>
                      {jobMatch.relevance_score || 0}
                    </div>
                    <div className="text-2xl text-gray-500 ml-2">/100</div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        (jobMatch.relevance_score || 0) >= 80 ? 'bg-green-500' :
                        (jobMatch.relevance_score || 0) >= 60 ? 'bg-yellow-500' :
                        (jobMatch.relevance_score || 0) >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${jobMatch.relevance_score || 0}%` }}
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600 text-center">
                    {(jobMatch.relevance_score || 0) >= 80 ? 'Excellent! Your CV is well-optimized for ATS systems.' :
                     (jobMatch.relevance_score || 0) >= 60 ? 'Good. Some improvements can increase your ATS score.' :
                     (jobMatch.relevance_score || 0) >= 40 ? 'Fair. Consider addressing the recommendations below.' :
                     'Needs improvement. Follow the recommendations to optimize for ATS.'}
                  </p>
                </div>
                
                {jobMatch.keyword_matches && jobMatch.keyword_matches.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                    <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Matching Keywords ({jobMatch.keyword_matches.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {jobMatch.keyword_matches.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {jobMatch.missing_keywords && jobMatch.missing_keywords.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                    <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      Missing Keywords ({jobMatch.missing_keywords.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {jobMatch.missing_keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {jobMatch.recommendations && jobMatch.recommendations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                    <h3 className="font-bold text-blue-900 mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {jobMatch.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-blue-800">
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Top Priorities */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-24">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Top Priorities
              </h3>
              
              <div className="space-y-3">
                {(analysis.top_priorities || []).slice(0, 5).map((priority, idx) => (
                  <div key={idx} className="border-l-4 border-orange-500 pl-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-orange-600">#{priority.priority}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        priority.impact === 'High' ? 'bg-red-100 text-red-800' :
                        priority.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {priority.impact}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {priority.action}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {priority.time_estimate}
                      </span>
                      <span className="text-gray-500">{priority.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}