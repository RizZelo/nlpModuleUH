/**
 * AnalysisContainer Component
 * Main container for analysis view with tabs
 */
import React, { useState } from 'react';
import { 
  Sparkles, Target, Edit3, Lightbulb, 
  FileText, TrendingUp, Zap, Clock, AlertCircle, 
  CheckCircle, XCircle, Layers, Database
} from 'lucide-react';
import CVViewer from './CVViewer';
import AnalysisTab from './tabs/AnalysisTab';
import StatisticsTab from './tabs/StatisticsTab';
import FieldSuggestions from './FieldSuggestions';
import StructuredCVDisplay from './StructuredCVDisplay';

export default function AnalysisContainer({ 
  analysis, 
  cvFile, 
  cvText, 
  structuredCV, 
  originalFile, 
  onNewAnalysis, 
  onApplySuggestion 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const inlineSuggestions = analysis.inline_suggestions || [];
  const fieldSuggestions = analysis.field_suggestions || [];
  const quickWins = analysis.quick_wins || [];
  const sectionAnalysis = analysis.section_analysis || [];
  const jobMatch = analysis.job_match_analysis || {};

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
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
              
              <button
                onClick={onNewAnalysis}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                New Analysis
              </button>
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
                  { id: 'structured-cv', icon: Database, label: 'Structured CV' },
                  { id: 'cv-display', icon: Edit3, label: 'View CV' },
                  { id: 'field-suggestions', icon: Layers, label: 'Apply Changes', count: fieldSuggestions.length },
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
            {activeTab === 'overview' && <AnalysisTab analysis={analysis} />}
            
            {activeTab === 'structured-cv' && (
              <div>
                <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <Database className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Structured CV Data</h3>
                      <p className="text-sm text-gray-700">
                        Your CV has been parsed into structured fields. This enables precise, field-level improvements 
                        and better tracking of your CV content.
                      </p>
                    </div>
                  </div>
                </div>
                <StructuredCVDisplay structuredCV={structuredCV} />
              </div>
            )}
            
            {activeTab === 'cv-display' && (
              <CVViewer originalFile={originalFile} cvText={cvText} />
            )}

            {activeTab === 'field-suggestions' && (
              <div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <Layers className="w-8 h-8 text-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Field-Targeted Improvements</h3>
                      <p className="text-sm text-gray-700">
                        These suggestions target specific fields in your CV structure. Click "Apply" to automatically 
                        update the field with the improved text. Each change is made directly to your structured CV data.
                      </p>
                    </div>
                  </div>
                </div>
                <FieldSuggestions 
                  suggestions={fieldSuggestions} 
                  onApplySuggestion={onApplySuggestion}
                />
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
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="text-xs font-semibold text-green-800 mb-1">Improved:</div>
                          <div className="text-sm text-gray-800 font-medium">"{sugg.replacement}"</div>
                        </div>
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
                  <div className="text-center py-12 text-gray-500">
                    <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No suggestions available</p>
                  </div>
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
                  <div className="text-center py-12 text-gray-500">
                    <Zap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No quick wins available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sections' && <StatisticsTab analysis={analysis} />}

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
