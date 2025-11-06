/**
 * ErrorMessage Component
 * Displays error messages in a consistent format
 */
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start justify-between">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-red-800">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800"
          aria-label="Close error message"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
