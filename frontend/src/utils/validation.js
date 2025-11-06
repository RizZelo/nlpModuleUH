/**
 * Validation Utility
 * Provides input validation functions
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL format
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates phone number (flexible format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export function isValidPhone(phone) {
  // Flexible phone regex - allows various formats
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validates text length
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {Object} Validation result {valid: boolean, error?: string}
 */
export function validateTextLength(text, minLength = 0, maxLength = Infinity) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Text is required' };
  }

  const length = text.trim().length;

  if (length < minLength) {
    return { valid: false, error: `Text must be at least ${minLength} characters` };
  }

  if (length > maxLength) {
    return { valid: false, error: `Text must be at most ${maxLength} characters` };
  }

  return { valid: true };
}

/**
 * Sanitizes text input by removing potentially harmful content
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
  if (!text) return '';
  
  // First encode special characters, then remove any remaining HTML tags
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;[^&]*&gt;/g, '')
    .trim();
}
