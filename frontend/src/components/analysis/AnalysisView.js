import React from 'react';
import CVEditor from './CVEditor';
import ScoresCard from './tabs/ScoresCard';
import SuggestionsPanel from './tabs/SuggestionsPanel';

/**
 * Analysis View Component
 * Main container for the analysis results display
 */
const AnalysisView = ({
  analysis,
  editedCvText,
  setEditedCvText,
  inlineSuggestions,
  activeSuggestion,
  setActiveSuggestion,
  suggestionPosition,
  setSuggestionPosition,
  applySuggestion,
}) => {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* CV Editor - Middle Column */}
      <div className="col-span-7 space-y-4">
        <CVEditor
          editedCvText={editedCvText}
          setEditedCvText={setEditedCvText}
          inlineSuggestions={inlineSuggestions}
          activeSuggestion={activeSuggestion}
          setActiveSuggestion={setActiveSuggestion}
          suggestionPosition={suggestionPosition}
          setSuggestionPosition={setSuggestionPosition}
          applySuggestion={applySuggestion}
        />
      </div>

      {/* Recommendations - Right Sidebar */}
      <ScoresCard analysis={analysis} />
      <SuggestionsPanel
        analysis={analysis}
        inlineSuggestions={inlineSuggestions}
        setActiveSuggestion={setActiveSuggestion}
        setSuggestionPosition={setSuggestionPosition}
      />
    </div>
  );
};

export default AnalysisView;
