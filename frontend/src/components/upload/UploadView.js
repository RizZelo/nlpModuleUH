import React from 'react';
import { FileText, Briefcase, Upload } from 'lucide-react';
import Card from '../common/Card';
import config from '../../config';

/**
 * Upload View Component
 * Handles CV and job description input
 */
const UploadView = ({ 
  cvText, 
  setCvText, 
  cvFile, 
  setCvFile, 
  jobDesc, 
  setJobDesc 
}) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!config.ACCEPTED_FILE_TYPES.includes(fileExtension)) {
      alert(`Invalid file type. Please upload one of: ${config.ACCEPTED_FILE_TYPES.join(', ')}`);
      return;
    }
    
    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > config.MAX_FILE_SIZE_MB) {
      alert(`File too large. Maximum size is ${config.MAX_FILE_SIZE_MB}MB`);
      return;
    }
    
    setCvFile(file);
    setCvText(`File uploaded: ${file.name}\n\nFile will be processed by backend...`);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* CV Upload Section */}
      <Card title="Your CV" icon={FileText}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Upload CV ({config.ACCEPTED_FILE_TYPES.join(', ').toUpperCase()})
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {config.ACCEPTED_FILE_TYPES.join(', ').toUpperCase()} (MAX. {config.MAX_FILE_SIZE_MB}MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept={config.ACCEPTED_FILE_TYPES.join(',')}
                onChange={handleFileUpload}
              />
            </label>
          </div>
          {cvFile && (
            <div className="mt-2 text-sm text-green-600">
              ✓ {cvFile.name} uploaded
            </div>
          )}
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>
        
        <textarea
          className="w-full h-40 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 mt-4"
          placeholder="Paste your CV text here..."
          value={cvFile ? '' : cvText}
          onChange={(e) => {
            setCvText(e.target.value);
            setCvFile(null);
          }}
          disabled={!!cvFile}
        />
      </Card>
      
      {/* Job Description Section */}
      <Card title="Job Description" icon={Briefcase}>
        <textarea
          className="w-full h-64 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          placeholder="Paste the job description here..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />
      </Card>
    </div>
  );
};

export default UploadView;
