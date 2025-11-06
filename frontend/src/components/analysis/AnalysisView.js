import React from 'react';
import CVViewer from './CVViewer';
import ScoresCard from './tabs/ScoresCard';
import SuggestionsPanel from './tabs/SuggestionsPanel';

/**
 * Analysis View Component
 * Main container for the analysis results display
 */
const AnalysisView = ({
  analysis,
  editedCvText,
  originalFile,
  inlineSuggestions,
}) => {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* CV Viewer - Middle Column */}
      <div className="col-span-7 space-y-4">
        <CVViewer
          originalFile={originalFile}
          editedCvText={editedCvText}
        />
      </div>

      {/* Recommendations - Right Sidebar */}
      <ScoresCard analysis={analysis} />
      <SuggestionsPanel
        analysis={analysis}
        inlineSuggestions={inlineSuggestions}
      />
    </div>
  );
};

export default AnalysisView;
