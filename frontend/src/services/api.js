/**
 * API Service
 * 
 * Centralizes all API calls to the backend.
 * Makes it easier to test, mock, and maintain API interactions.
 */

import config from '../config';

/**
 * Analyze CV against job description
 * @param {File|null} cvFile - CV file to upload
 * @param {string} cvText - CV text (used if no file provided)
 * @param {string} jobDescription - Job description to analyze against
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeCV = async (cvFile, cvText, jobDescription) => {
  const formData = new FormData();
  
  if (cvFile) {
    formData.append("cv_file", cvFile);
  } else {
    formData.append("cv_text", cvText);
  }
  formData.append("job_description", jobDescription);

  const response = await fetch(`${config.API_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get the latest CV data
 * @returns {Promise<Object>} Latest CV data
 */
export const getLatestCV = async () => {
  const response = await fetch(`${config.API_BASE_URL}/latest-cv`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Get the latest analysis
 * @returns {Promise<Object>} Latest analysis data
 */
export const getLatestAnalysis = async () => {
  const response = await fetch(`${config.API_BASE_URL}/latest-analysis`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Health check
 * @returns {Promise<Object>} API status
 */
export const healthCheck = async () => {
  const response = await fetch(`${config.API_BASE_URL}/`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
};
