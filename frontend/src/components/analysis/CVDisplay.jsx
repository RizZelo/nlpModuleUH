/**
 * CVDisplay Component
 * Displays formatted CV in a read-only, professional format
 */
import React from 'react';
import { formatCVText } from '../../utils/formatCV';
import { Download, Eye, EyeOff } from 'lucide-react';

export default function CVDisplay({ cvText, structured }) {
  const [showStructure, setShowStructure] = React.useState(false);
  const formattedHTML = formatCVText(cvText);

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CV</title>
          <style>
            @page { margin: 0.75in; }
            * { box-sizing: border-box; }
            body { 
              font-family: Georgia, 'Times New Roman', serif; 
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
        <body>${formattedHTML}</body>
      </html>
    `);
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          CV Preview
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStructure(!showStructure)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1 rounded border border-blue-300"
          >
            {showStructure ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showStructure ? 'Hide' : 'Show'} Structure
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium flex items-center gap-1 text-sm"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>
      
      {showStructure && structured && (
        <div className="bg-blue-50 border-b border-blue-200 p-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Sections:</strong> {structured.sections?.length || 0}
            </div>
            <div>
              <strong>Bullet Points:</strong> {structured.bullet_points?.length || 0}
            </div>
            <div>
              <strong>Contacts:</strong> {Object.keys(structured.contacts || {}).join(', ') || 'None'}
            </div>
            <div>
              <strong>Dates:</strong> {structured.dates?.length || 0}
            </div>
          </div>
        </div>
      )}
      
      {/* Safe to use dangerouslySetInnerHTML here because:
          1. Content comes from backend-parsed CV (not user input)
          2. formatCVText() only generates controlled HTML with known tags
          3. No script tags or event handlers are generated */}
      <div
        className="p-8 min-h-[600px] prose max-w-none overflow-auto"
        dangerouslySetInnerHTML={{ __html: formattedHTML }}
      />
      
      <div className="bg-gray-50 border-t border-gray-200 p-4 text-sm text-gray-600">
        Professional CV display • Click "Export PDF" to download
      </div>
    </div>
  );
}
