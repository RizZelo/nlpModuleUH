/**
 * CV Formatter Utility
 * Transforms plain text CV into professionally formatted HTML
 */

/**
 * Formats plain text CV content into styled HTML
 * @param {string} text - Raw CV text content
 * @returns {string} Formatted HTML with professional styling
 */
export function formatCVText(text) {
  if (!text) {
    return '<div style="padding: 20px; text-align: center; color: #666;">No CV content available</div>';
  }

  const lines = text.split('\n');
  let html = '';
  let inList = false;
  let listItems = [];

  const closeList = () => {
    if (inList && listItems.length > 0) {
      html += '<ul style="margin: 8px 0 16px 0; padding-left: 24px; line-height: 1.6;">';
      listItems.forEach(item => {
        html += `<li style="margin-bottom: 6px;">${item}</li>`;
      });
      html += '</ul>';
      listItems = [];
      inList = false;
    }
  };

  const isHeader = (line) => {
    const trimmed = line.trim();
    // All caps (at least 2 chars) or ends with colon
    return (trimmed === trimmed.toUpperCase() && trimmed.length >= 2 && /[A-Z]/.test(trimmed)) || 
           trimmed.endsWith(':');
  };

  const isBulletPoint = (line) => {
    const trimmed = line.trim();
    return /^[•\-*]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed);
  };

  const isDateRange = (line) => {
    const trimmed = line.trim();
    // Contains years and dashes (e.g., "2020-2023", "Jan 2020 - Present")
    return /\d{4}/.test(trimmed) && (/[-–—]/.test(trimmed) || /present/i.test(trimmed));
  };

  const isJobTitle = (line) => {
    const trimmed = line.trim();
    const jobKeywords = [
      'developer', 'engineer', 'manager', 'analyst', 'designer', 'architect',
      'consultant', 'specialist', 'coordinator', 'director', 'lead', 'senior',
      'junior', 'intern', 'associate', 'assistant', 'administrator', 'officer'
    ];
    return jobKeywords.some(keyword => trimmed.toLowerCase().includes(keyword));
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Skip empty lines (but close lists if needed)
    if (!trimmed) {
      closeList();
      html += '<div style="height: 12px;"></div>';
      return;
    }

    // Check for bullet points
    if (isBulletPoint(trimmed)) {
      inList = true;
      // Remove bullet/number prefix
      const content = trimmed.replace(/^[•\-*]\s+/, '').replace(/^\d+[.)]\s+/, '');
      listItems.push(content);
      return;
    }

    // Close list if we're not in a bullet point anymore
    closeList();

    // Format section headers
    if (isHeader(trimmed)) {
      html += `<h2 style="font-size: 16pt; font-weight: 600; margin: 24px 0 12px 0; padding-bottom: 4px; border-bottom: 2px solid #333; color: #1a1a1a;">${trimmed.replace(/:$/, '')}</h2>`;
      return;
    }

    // Format date ranges
    if (isDateRange(trimmed)) {
      html += `<p style="margin: 8px 0; color: #666; font-style: italic; font-size: 10pt;">${trimmed}</p>`;
      return;
    }

    // Format job titles
    if (isJobTitle(trimmed)) {
      html += `<h3 style="font-size: 13pt; font-weight: 600; margin: 16px 0 6px 0; color: #2c3e50;">${trimmed}</h3>`;
      return;
    }

    // Regular paragraph
    html += `<p style="margin: 0 0 10px 0; line-height: 1.6; color: #333;">${trimmed}</p>`;
  });

  // Close any remaining open list
  closeList();

  // Wrap in a container with professional styling
  return `
    <div style="
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 850px;
      margin: 0 auto;
      background: white;
    ">
      ${html}
    </div>
  `;
}

/**
 * Validates if the provided text is valid CV content
 * @param {string} text - Text to validate
 * @returns {boolean} True if valid CV content
 */
export function isValidCVText(text) {
  if (!text || typeof text !== 'string') return false;
  // Basic validation: at least 50 characters
  return text.trim().length >= 50;
}
