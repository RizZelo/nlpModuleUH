import React, { useMemo } from 'react';
import { FileText, Download } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * CV Viewer Component
 * Displays the original uploaded file (PDF/DOCX) in an iframe
 * This allows users to see the formatted document, not just extracted text
 */
const CVViewer = ({ originalFile, editedCvText }) => {
  // Create blob URL from base64 data
  const fileUrl = useMemo(() => {
    if (!originalFile || !originalFile.data) {
      return null;
    }

    try {
      // Decode base64 to binary
      const binaryString = atob(originalFile.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob
      const blob = new Blob([bytes], { type: originalFile.content_type });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating blob URL:', error);
      return null;
    }
  }, [originalFile]);

  const handleDownload = () => {
    if (originalFile && originalFile.data) {
      // Decode base64 and create download
      const binaryString = atob(originalFile.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: originalFile.content_type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalFile.filename || 'cv_document';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Fallback to text download
      const blob = new Blob([editedCvText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited_cv.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Cleanup blob URL on unmount
  React.useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <Card
      title="Your CV - Original Document"
      icon={FileText}
      headerAction={
        <Button
          onClick={handleDownload}
          variant="success"
          size="sm"
          icon={Download}
        >
          Download
        </Button>
      }
    >
      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
        <p className="text-blue-800">
          📄 <strong>Viewing original file:</strong> {originalFile?.filename || 'Uploaded document'}
        </p>
        <p className="text-blue-600 text-xs mt-1">
          This is your original formatted document. Apply suggestions from the panel on the right to improve it.
        </p>
      </div>

      {fileUrl ? (
        <div className="relative" style={{ height: '600px' }}>
          <iframe
            src={fileUrl}
            className="w-full h-full border border-gray-300 rounded"
            title="CV Preview"
            style={{ minHeight: '600px' }}
          />
        </div>
      ) : (
        // Fallback: Show extracted text if original file not available
        <div className="relative" style={{ height: '600px' }}>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm">
            <p className="text-yellow-800">
              ⚠️ <strong>Note:</strong> Original file preview not available. Showing extracted text instead.
            </p>
          </div>
          <textarea
            className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm resize-none font-sans"
            style={{ height: 'calc(600px - 80px)' }}
            value={editedCvText}
            readOnly
            placeholder="Your CV content will appear here..."
          />
        </div>
      )}

      {originalFile && (
        <div className="mt-4 text-sm text-gray-500 flex justify-between">
          <div>
            File: {originalFile.filename}
          </div>
          <div>
            Size: {(originalFile.size_bytes / 1024).toFixed(2)} KB
          </div>
        </div>
      )}
    </Card>
  );
};

export default CVViewer;
