import React from 'react';
import { AlertCircle, Lightbulb, XCircle, CheckCircle } from 'lucide-react';
import { getGradeColor } from '../../../utils/scoreUtils';

/**
 * Suggestions Panel Component
 * Displays priorities, inline suggestions, all issues, and category details
 */
const SuggestionsPanel = ({
  analysis,
  inlineSuggestions,
  setActiveSuggestion,
  setSuggestionPosition,
}) => {
  const getFlagIcon = (type) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="col-span-5 space-y-4 max-h-screen overflow-y-auto">
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
  );
};

export default SuggestionsPanel;
