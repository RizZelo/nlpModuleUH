import React from 'react';
import { getGradeColor } from '../../../utils/scoreUtils';

/**
 * Scores Card Component
 * Displays overall, formatting, and content scores
 */
const ScoresCard = ({ analysis }) => {
  return (
    <div className="bg-white p-6 rounded border border-gray-200 sticky top-0 z-10">
      <h3 className="text-lg font-semibold mb-4">Overall Scores</h3>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getGradeColor(analysis.general.overallGrade)}`}>
            {analysis.general.overallGrade}
          </div>
          <div className="text-xs text-gray-600">Overall</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${getGradeColor(analysis.general.formattingGrade)}`}>
            {analysis.general.formattingGrade}
          </div>
          <div className="text-xs text-gray-600">Format</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${getGradeColor(analysis.general.contentGrade)}`}>
            {analysis.general.contentGrade}
          </div>
          <div className="text-xs text-gray-600">Content</div>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-700">{analysis.general.summary}</p>
      </div>
    </div>
  );
};

export default ScoresCard;
