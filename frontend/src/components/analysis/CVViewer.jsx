/**
 * CVViewer Component
 * Displays the original uploaded file (DOCX, PDF, etc.) in an iframe
 * Falls back to formatted text if original file is not available
 */
import React, { useState, useEffect } from 'react';
import { Download, Eye, FileText } from 'lucide-react';

export default function CVViewer({ originalFile, cvText }) {
  const [fileUrl, setFileUrl] = useState(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!originalFile || !originalFile.data) {
      setShowOriginal(false);
      return;
    }

    try {
      // Convert base64 to blob
      const binaryString = atob(originalFile.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: originalFile.content_type });
      const url = URL.createObjectURL(blob);
      setFileUrl(url);

      // Cleanup on unmount
      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    } catch (err) {
      console.error('Error creating file URL:', err);
      setError('Failed to load original file');
      setShowOriginal(false);
    }
  }, [originalFile]);

  const handleDownload = () => {
    if (!fileUrl) return;
    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = originalFile?.filename || 'cv-document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canDisplayInIframe = () => {
    if (!originalFile) return false;
    const contentType = originalFile.content_type.toLowerCase();
    // PDFs can be displayed in iframes
    return contentType.includes('pdf');
  };

  const renderContent = () => {
    if (showOriginal && fileUrl && canDisplayInIframe()) {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-[800px] border-0 rounded"
          title="CV Preview"
        />
      );
    }

    if (showOriginal && fileUrl && !canDisplayInIframe()) {
      // For DOCX and other formats that can't be displayed in iframe
      return (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Document Ready
          </h3>
          <p className="text-gray-700 mb-6">
            Your {originalFile?.filename} is ready for download.
            <br />
            DOCX files cannot be previewed in browser, but you can download them.
          </p>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download {originalFile?.filename}
          </button>
        </div>
      );
    }

    // Fallback to formatted text
    return (
      <div className="bg-white rounded-lg p-8 prose max-w-none">
        <div className="whitespace-pre-wrap font-mono text-sm">
          {cvText || 'No CV content available'}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          {showOriginal && originalFile ? 'Original Document' : 'CV Preview'}
        </h2>
        <div className="flex gap-2">
          {originalFile && (
            <>
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1 rounded border border-blue-300"
              >
                <FileText className="w-4 h-4" />
                {showOriginal ? 'Show Text' : 'Show Original'}
              </button>
              {fileUrl && (
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium flex items-center gap-1 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-b border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="p-6 min-h-[600px] overflow-auto">
        {renderContent()}
      </div>

      <div className="bg-gray-50 border-t border-gray-200 p-4 text-sm text-gray-600">
        {originalFile 
          ? `Original file: ${originalFile.filename} (${(originalFile.data?.length * 0.75 / 1024).toFixed(1)} KB)`
          : 'Displaying extracted text content'
        }
      </div>
    </div>
  );
}
