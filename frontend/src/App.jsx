/**
 * Main App Component
 * Lightweight orchestrator for CV analysis application
 */
import React, { useState } from 'react';
import { Sparkles, FileText, Briefcase } from 'lucide-react';
import FileUpload from './components/upload/FileUpload';
import AnalysisContainer from './components/analysis/AnalysisContainer';
import Button from './components/common/Button';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import ProgressBar from './components/common/ProgressBar';
import { analyzeCV, validateCVFile } from './services/api';

export default function EnhancedCVAnalyzer() {
  const [cvFile, setCvFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [cvText, setCvText] = useState('');
  const [originalFile, setOriginalFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (file) => {
    const validation = validateCVFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    setCvFile(file);
    setError(null);
  };

  const handleFileRemove = () => {
    setCvFile(null);
  };

  const handleAnalyze = async () => {
    if (!cvFile) {
      setError('Please upload a CV');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeCV(cvFile, jobDesc);
      
      // Extract CV text and analysis
      const extractedText = data.cv_stats?.full_text || '';
      setCvText(extractedText);

      // Store original file data if available
      if (data.original_file) {
        setOriginalFile(data.original_file);
      }

      const analysisData = data.gemini_analysis?.analysis || {};
      setAnalysis({
        ...analysisData,
        metadata: data.cv_stats?.metadata || {},
        structured: data.cv_stats?.structured || {}
      });
    } catch (err) {
      setError(err.message || 'Failed to analyze CV. Make sure backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
    setCvFile(null);
    setJobDesc('');
    setCvText('');
    setOriginalFile(null);
    setError(null);
  };

  // Show analysis view if analysis exists
  if (analysis) {
    return (
      <AnalysisContainer 
        analysis={analysis} 
        cvFile={cvFile}
        cvText={cvText}
        originalFile={originalFile}
        onNewAnalysis={handleNewAnalysis}
      />
    );
  }

  // Show upload view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI CV Analyzer Pro</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Upload your CV in any format → Get comprehensive AI analysis → Export to PDF
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onClose={() => setError(null)} />
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* CV Upload */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Your CV</h2>
            </div>
            
            <FileUpload 
              file={cvFile}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
            />
            
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Supported formats:</strong> We extract text from all major CV formats including Canva exports, LaTeX resumes, and standard office documents.
              </p>
            </div>
          </div>
          
          {/* Job Description */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Target Job <span className="text-sm text-gray-500 font-normal">(Optional)</span></h2>
            </div>
            
            <textarea
              className="w-full h-56 p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Paste the full job description here (optional)...&#10;&#10;Leave empty to analyze your CV for general best practices and ATS compatibility.&#10;&#10;Or include: requirements, responsibilities, desired skills, and qualifications for job-specific analysis."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
            
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Job description is optional. Without it, we'll analyze your CV for general quality, formatting, and ATS compatibility.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={handleAnalyze}
            disabled={loading || !cvFile}
            variant="primary"
            size="lg"
            icon={loading ? undefined : Sparkles}
            className="transform hover:scale-105 disabled:transform-none"
          >
            {loading ? <LoadingSpinner message="Analyzing Your CV..." /> : 'Analyze CV with AI'}
          </Button>
          
          {!cvFile ? (
            <p className="mt-4 text-sm text-gray-500">
              Please upload your CV to continue
            </p>
          ) : !jobDesc ? (
            <p className="mt-4 text-sm text-gray-400 italic">
              Job description is optional - you can analyze your CV for general best practices
            </p>
          ) : null}
        </div>

        {/* Progress Bar */}
        <ProgressBar isActive={loading} />
      </div>
    </div>
  );
}
