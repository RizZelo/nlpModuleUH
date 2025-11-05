/**
 * Score Utility Functions
 * 
 * Reusable functions for handling scores and grades
 */

// Score thresholds
export const SCORE_THRESHOLDS = {
  EXCELLENT: 8,
  GOOD: 6,
};

/**
 * Get color class based on score/grade
 * @param {number} grade - Score value (0-10)
 * @returns {string} Tailwind CSS color class
 */
export const getGradeColor = (grade) => {
  if (grade >= SCORE_THRESHOLDS.EXCELLENT) return 'text-green-600';
  if (grade >= SCORE_THRESHOLDS.GOOD) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Get background color class based on score/grade
 * @param {number} grade - Score value (0-10)
 * @returns {string} Tailwind CSS background color class
 */
export const getGradeBgColor = (grade) => {
  if (grade >= SCORE_THRESHOLDS.EXCELLENT) return 'bg-green-50';
  if (grade >= SCORE_THRESHOLDS.GOOD) return 'bg-yellow-50';
  return 'bg-red-50';
};

/**
 * Get label for score/grade
 * @param {number} grade - Score value (0-10)
 * @returns {string} Label for the grade
 */
export const getGradeLabel = (grade) => {
  if (grade >= SCORE_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (grade >= SCORE_THRESHOLDS.GOOD) return 'Good';
  return 'Needs Improvement';
};
