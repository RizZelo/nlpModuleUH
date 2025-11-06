import React, { useState } from 'react';
import UploadView from './components/upload/UploadView';
import AnalysisView from './components/analysis/AnalysisView';
import Button from './components/common/Button';
import { analyzeCV } from './services/api';

export default function CVAnalyzer() {
  const [cvText, setCvText] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editedCvText, setEditedCvText] = useState('');
  const [originalFile, setOriginalFile] = useState(null);
  const [inlineSuggestions, setInlineSuggestions] = useState([]);

  const handleAnalyze = async () => {
    setLoading(true);

    try {
      const data = await analyzeCV(cvFile, cvText, jobDesc);
      
      if (data.gemini_analysis?.error) {
        alert("Gemini Error: " + data.gemini_analysis.error);
        setLoading(false);
        return;
      }

      const extractedCvText = data.cv_stats?.full_text || cvText;
      
      // Store original file data if available
      if (data.original_file) {
        setOriginalFile(data.original_file);
      }
      
      if (cvFile && extractedCvText) {
        setCvText(extractedCvText);
        setEditedCvText(extractedCvText);
      } else {
        setEditedCvText(cvText);
      }

      const geminiData = data.gemini_analysis?.analysis;
      
      // Store inline suggestions
      setInlineSuggestions(geminiData?.inline_suggestions || []);
      
      setAnalysis({
        general: {
          summary: geminiData?.general?.summary || "No analysis received.",
          overallGrade: geminiData?.general?.overall_score || 0,
          formattingGrade: geminiData?.formatting?.score || 0,
          contentGrade: geminiData?.content?.score || 0,
        },
        flags: [
          ...((geminiData?.formatting?.issues || []).map((issue, idx) => ({
            id: `fmt-${idx}`,
            type: 'warning',
            message: issue,
            category: 'Formatting'
          }))),
          ...((geminiData?.content?.weaknesses || []).map((weakness, idx) => ({
            id: `cnt-${idx}`,
            type: 'error',
            message: weakness,
            category: 'Content'
          })))
        ],
        recommendations: geminiData?.general?.top_priorities || [],
        categories: [
          {
            name: "Formatting",
            score: geminiData?.formatting?.score || 0,
            good: [],
            bad: geminiData?.formatting?.issues || [],
            suggestions: geminiData?.formatting?.suggestions || []
          },
          {
            name: "Content Quality",
            score: geminiData?.content?.score || 0,
            good: geminiData?.content?.strengths || [],
            bad: geminiData?.content?.weaknesses || [],
            suggestions: geminiData?.content?.suggestions || []
          }
        ],
      });
    } catch (error) {
      console.error("Error analyzing CV:", error);
      alert("Failed to analyze CV. Please try again.");
    }

    setLoading(false);
  };

  const handleReset = () => {
    setAnalysis(null);
    setCvText('');
    setCvFile(null);
    setJobDesc('');
    setEditedCvText('');
    setOriginalFile(null);
    setInlineSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">CV NLP Analyzer</h1>
          {analysis && (
            <div className="text-sm text-gray-600">
              {inlineSuggestions.length} inline suggestions found
            </div>
          )}
        </div>
        
        {!analysis ? (
          <UploadView
            cvText={cvText}
            setCvText={setCvText}
            cvFile={cvFile}
            setCvFile={setCvFile}
            jobDesc={jobDesc}
            setJobDesc={setJobDesc}
          />
        ) : (
          <AnalysisView
            analysis={analysis}
            editedCvText={editedCvText}
            originalFile={originalFile}
            inlineSuggestions={inlineSuggestions}
          />
        )}

        <div className="mt-6 flex gap-4">
          <Button
            onClick={handleAnalyze}
            disabled={loading || (!cvText && !cvFile) || !jobDesc || analysis}
            variant="primary"
          >
            {loading ? 'Analyzing...' : 'Analyze CV'}
          </Button>
          
          {analysis && (
            <Button
              onClick={handleReset}
              variant="secondary"
            >
              New Analysis
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}