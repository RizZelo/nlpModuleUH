/**
 * API Service
 * Centralizes all backend API calls
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000' : ''
);

/**
 * Analyzes a CV file with optional job description
 * @param {File} cvFile - The CV file to analyze
 * @param {string} jobDescription - Optional job description for targeted analysis
 * @returns {Promise<Object>} Analysis results
 */
// Removed legacy analyzeCV (POST /analyze). Use analyzeStructuredCV instead.

/**
 * Analyzes a CV file using structured data approach
 * @param {File} cvFile - The CV file to analyze
 * @param {string} jobDescription - Optional job description for targeted analysis
 * @returns {Promise<Object>} Structured analysis results
 */
export async function analyzeStructuredCV(cvFile, jobDescription = '') {
  const formData = new FormData();
  formData.append('cv_file', cvFile);
  formData.append('job_description', jobDescription);

  const response = await fetch(`${API_BASE_URL}/analyze-structured`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  if (data.gemini_analysis?.error) {
    throw new Error(data.gemini_analysis.error);
  }

  return data;
}

/**
 * Applies a suggestion to the structured CV data
 * @param {Object} structuredCV - The structured CV object
 * @param {Object} suggestion - The suggestion to apply
 * @returns {Promise<Object>} Updated CV data
 */
export async function applySuggestion(structuredCV, suggestion) {
  const response = await fetch(`${API_BASE_URL}/apply-suggestion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      structured_cv: structuredCV,
      suggestion: suggestion
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'success') {
    throw new Error(data.message || 'Failed to apply suggestion');
  }

  return data;
}

/**
 * Validates file type and size before upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result {valid: boolean, error?: string}
 */
export function validateCVFile(file) {
  const validTypes = ['.pdf', '.docx', '.doc', '.txt', '.odt', '.tex', '.html', '.rtf'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const ext = '.' + file.name.split('.').pop().toLowerCase();
  
  if (!validTypes.includes(ext)) {
    return { 
      valid: false, 
      error: `Unsupported file type. Please upload: ${validTypes.join(', ')}` 
    };
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'File size exceeds 10MB limit' 
    };
  }

  return { valid: true };
}
