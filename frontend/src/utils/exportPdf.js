// Simple PDF export for structured CV
/*
  Deprecated: Structured CV PDF export (jsPDF-based)

  This module has been intentionally disabled. The app now uses Markdown export
  (see src/utils/generateMarkdownCV.js) and browser print for preview PDFs.

  The original implementation depended on 'jspdf', which has been removed from
  dependencies. Keeping this file as a stub prevents accidental reintroduction
  and makes any usage immediately obvious during development.
*/

// If anything imports this by mistake, throw loudly to surface the issue early.
export function exportStructuredCVToPdf() {
  throw new Error(
    'exportStructuredCVToPdf is deprecated and has been removed. Use generateMarkdownCV for export.'
  );
}

export default exportStructuredCVToPdf;