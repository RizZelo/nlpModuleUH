import React, { useRef } from 'react';
import { Edit3, Download, Lightbulb, X } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import config from '../../config';

/**
 * CV Editor Component
 * Displays CV with inline suggestions
 */
const CVEditor = ({
  editedCvText,
  setEditedCvText,
  inlineSuggestions,
  activeSuggestion,
  setActiveSuggestion,
  suggestionPosition,
  setSuggestionPosition,
  applySuggestion,
}) => {
  const editorRef = useRef(null);

  const handleDownload = () => {
    const blob = new Blob([editedCvText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited_cv.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTextAreaClick = (e) => {
    // Check if clicked on a suggestion
    const clickedText = window.getSelection().toString();
    const matchingSugg = inlineSuggestions.find(s =>
      editedCvText.includes(s.text_snippet) && clickedText.includes(s.text_snippet)
    );
    if (matchingSugg) {
      setActiveSuggestion(matchingSugg);
      setSuggestionPosition({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <Card
      title="Your CV - Edit Mode"
      icon={Edit3}
      headerAction={
        <Button
          onClick={handleDownload}
          variant="success"
          size="sm"
          icon={Download}
        >
          Download
        </Button>
      }
    >
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm">
        <p className="text-yellow-800">
          💡 <strong>Tip:</strong> Red highlighted text indicates issues. Click on them to see and apply suggestions!
        </p>
      </div>

      {/* Editable CV Text Area */}
      <div className="relative">
        <textarea
          ref={editorRef}
          className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm resize-none font-sans"
          style={{ height: config.EDITOR_HEIGHT }}
          value={editedCvText}
          onChange={(e) => setEditedCvText(e.target.value)}
          placeholder="Your CV content will appear here..."
          onClick={handleTextAreaClick}
        />

        {/* Inline Suggestion Popup */}
        {activeSuggestion && (
          <div
            className="fixed bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 z-50 max-w-md"
            style={{
              left: `${Math.min(suggestionPosition.x, window.innerWidth - 400)}px`,
              top: `${Math.min(suggestionPosition.y + 20, window.innerHeight - 300)}px`
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Suggestion</h3>
              </div>
              <button
                onClick={() => setActiveSuggestion(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold text-gray-700 mb-1">Issue:</div>
                <div className="text-gray-600">{activeSuggestion.problem}</div>
              </div>

              <div>
                <div className="font-semibold text-gray-700 mb-1">Current text:</div>
                <div className="bg-red-50 p-2 rounded text-gray-800 italic">
                  "{activeSuggestion.text_snippet}"
                </div>
              </div>

              {activeSuggestion.replacement && (
                <div>
                  <div className="font-semibold text-gray-700 mb-1">Suggested replacement:</div>
                  <div className="bg-green-50 p-2 rounded text-gray-800">
                    "{activeSuggestion.replacement}"
                  </div>
                </div>
              )}

              <div>
                <div className="font-semibold text-gray-700 mb-1">Recommendation:</div>
                <div className="text-gray-600">{activeSuggestion.suggestion}</div>
              </div>

              {activeSuggestion.replacement && (
                <button
                  onClick={() => applySuggestion(activeSuggestion)}
                  className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                >
                  Apply Suggestion
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500 flex justify-between">
        <div>
          Characters: {editedCvText.length} | Words: {editedCvText.split(/\s+/).filter(w => w).length}
        </div>
        <div className="text-blue-600">
          {inlineSuggestions.length} suggestions available
        </div>
      </div>
    </Card>
  );
};

export default CVEditor;
