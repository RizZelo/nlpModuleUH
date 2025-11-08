/**
 * FieldSuggestions Component
 * Displays field-targeted suggestions with Apply buttons for structured CV
 */
import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Target, Check } from 'lucide-react';

export default function FieldSuggestions({ suggestions, onApplySuggestion }) {
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[severity] || colors.medium;
  };

  const getFieldPathDisplay = (fieldPath) => {
    if (!fieldPath || fieldPath.length === 0) return 'Unknown field';
    
    // Convert field path to readable format
    // e.g., ["experience", 0, "description"] -> "Experience #1: Description"
    const parts = [];
    
    for (let i = 0; i < fieldPath.length; i++) {
      const part = fieldPath[i];
      
      if (typeof part === 'number' || !isNaN(part)) {
        parts.push(`#${parseInt(part) + 1}`);
      } else {
        parts.push(part.charAt(0).toUpperCase() + part.slice(1));
      }
    }
    
    return parts.join(' → ');
  };

  const handleApply = async (suggestion) => {
    setApplyingId(suggestion.suggestionId);
    
    try {
      await onApplySuggestion(suggestion);
      
      // Mark as applied
      setAppliedSuggestions(prev => new Set([...prev, suggestion.suggestionId]));
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      alert('Failed to apply suggestion. Please try again.');
    } finally {
      setApplyingId(null);
    }
  };

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No field suggestions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Field-Targeted Suggestions</p>
            <p>Click "Apply" to automatically update the specific field in your CV. Changes are made directly to the structured data.</p>
          </div>
        </div>
      </div>

      {suggestions.map((sugg) => {
        const isApplied = appliedSuggestions.has(sugg.suggestionId);
        const isApplying = applyingId === sugg.suggestionId;
        
        return (
          <div 
            key={sugg.suggestionId} 
            className={`bg-white rounded-lg shadow-sm border-2 p-5 transition-all ${
              isApplied ? 'border-green-300 bg-green-50' : 'border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityBadge(sugg.severity)}`}>
                  {sugg.severity?.toUpperCase()}
                </span>
                <span className="text-xs text-gray-600 font-medium">{sugg.issue_type}</span>
                {sugg.impact && (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                    Impact: {sugg.impact}
                  </span>
                )}
              </div>
              
              {isApplied && (
                <div className="flex items-center gap-1 text-green-700 font-semibold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Applied
                </div>
              )}
            </div>
            
            {/* Field Location */}
            <div className="mb-3 text-sm">
              <span className="font-semibold text-gray-700">Target Field:</span>
              <span className="ml-2 text-blue-700 font-medium">
                {getFieldPathDisplay(sugg.fieldPath)}
              </span>
              {sugg.fieldId && (
                <span className="ml-2 text-gray-500 text-xs">({sugg.fieldId})</span>
              )}
            </div>
            
            {/* Problem Description */}
            <div className="mb-3 text-sm text-gray-700">
              <strong>Problem:</strong> {sugg.problem}
            </div>
            
            {/* Original Value */}
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
              <div className="text-xs font-semibold text-red-800 mb-1">Current:</div>
              <div className="text-sm text-gray-800 italic">"{sugg.originalValue}"</div>
            </div>
            
            {/* Improved Value */}
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
              <div className="text-xs font-semibold text-green-800 mb-1">Improved:</div>
              <div className="text-sm text-gray-800 font-medium">"{sugg.improvedValue}"</div>
            </div>
            
            {/* Explanation */}
            {sugg.explanation && (
              <div className="text-xs text-gray-600 italic border-l-2 border-gray-300 pl-3 mb-3">
                {sugg.explanation}
              </div>
            )}
            
            {/* Apply Button */}
            <div className="flex justify-end">
              <button
                onClick={() => handleApply(sugg)}
                disabled={isApplied || isApplying}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  isApplied
                    ? 'bg-green-600 text-white cursor-default'
                    : isApplying
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
              >
                {isApplying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Applying...
                  </>
                ) : isApplied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Applied
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Apply Suggestion
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
