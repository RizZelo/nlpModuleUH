/**
 * Application Configuration
 * 
 * Centralizes configuration values that may vary between environments.
 * In production, consider using environment variables (process.env)
 */

const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000',
  
  // File Upload Configuration
  MAX_FILE_SIZE_MB: 10,
  ACCEPTED_FILE_TYPES: ['.pdf', '.docx', '.doc'],
  ACCEPTED_MIME_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
  
  // UI Configuration
  EDITOR_HEIGHT: '600px',
  INLINE_SUGGESTIONS_LIMIT: 10,
};

export default config;
