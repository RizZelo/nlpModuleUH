/**
 * CVDisplay Component
 * Displays formatted CV in a read-only, professional format
 */
import React from 'react';
import { formatCVText } from '../../utils/formatCV';
import { Eye } from 'lucide-react';

export default function CVDisplay({ cvText, structured }) {
  const formattedHTML = formatCVText(cvText);

  // PDF export removed; using Markdown export in Structured CV tab instead.

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          CV Preview
        </h2>
        
      </div>
      
      {/* Safe to use dangerouslySetInnerHTML here because:
          1. Content comes from backend-parsed CV (not user input)
          2. formatCVText() only generates controlled HTML with known tags
          3. No script tags or event handlers are generated */}
      <div
        className="p-8 min-h-[600px] prose max-w-none overflow-auto"
        dangerouslySetInnerHTML={{ __html: formattedHTML }}
      />
      
      <div className="bg-gray-50 border-t border-gray-200 p-4 text-sm text-gray-600">
        Professional CV display
      </div>
    </div>
  );
}
