/**
 * StatisticsTab Component
 * Displays section analysis and other statistics
 */
import React from 'react';
import { CheckCircle, FileText } from 'lucide-react';

export default function StatisticsTab({ analysis }) {
  const sectionAnalysis = analysis.section_analysis || [];

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  if (sectionAnalysis.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No section analysis available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sectionAnalysis.map((section, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{section.name}</h3>
              {section.quality_score !== undefined && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-sm text-gray-600">Quality Score:</div>
                  <div className={`text-lg font-bold ${getScoreColor(section.quality_score)}`}>
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
    </div>
  );
}
