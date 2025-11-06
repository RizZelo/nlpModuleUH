/**
 * AnalysisTab Component
 * Displays overview, critical issues, and score breakdown
 */
import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

export default function AnalysisTab({ analysis }) {
  const criticalIssues = analysis.critical_issues || [];
  const jobMatch = analysis.job_match_analysis || {};

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
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
  );
}
