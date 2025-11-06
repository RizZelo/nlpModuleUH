/**
 * FileUpload Component
 * Handles CV file upload with drag-and-drop support
 */
import React from 'react';
import { Upload, CheckCircle, X } from 'lucide-react';

export default function FileUpload({ file, onFileSelect, onFileRemove }) {
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div>
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
          onChange={handleFileChange}
        />
      </label>
      
      {file && (
        <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-semibold text-green-900">{file.name}</div>
              <div className="text-sm text-green-700">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
          </div>
          <button
            onClick={onFileRemove}
            className="text-red-600 hover:text-red-800"
            aria-label="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
