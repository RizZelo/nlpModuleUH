/**
 * ProgressBar Component
 * Shows animated progress during CV analysis
 */
import React, { useState, useEffect } from 'react';

export default function ProgressBar({ isActive = false, onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    // Simulate progress from 0 to 95% while analyzing
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we approach 95%
        if (prev >= 95) {
          return prev;
        }
        const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 80 ? 2 : 1;
        return Math.min(prev + increment, 95);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    // Complete progress when analysis is done
    if (!isActive && progress > 0 && progress < 100) {
      setProgress(100);
      if (onComplete) {
        setTimeout(() => onComplete(), 500);
      }
    }
  }, [isActive, progress, onComplete]);

  if (progress === 0 && !isActive) {
    return null;
  }

  const getProgressColor = () => {
    if (progress < 30) return 'bg-blue-500';
    if (progress < 60) return 'bg-indigo-500';
    if (progress < 90) return 'bg-purple-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">
            {progress < 100 ? 'Analyzing CV...' : 'Analysis Complete!'}
          </span>
          <span className="text-sm font-bold text-gray-900">{progress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-300 ease-out ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          >
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          {progress < 30 && 'Extracting text from document...'}
          {progress >= 30 && progress < 60 && 'Analyzing CV structure...'}
          {progress >= 60 && progress < 90 && 'Running AI analysis...'}
          {progress >= 90 && progress < 100 && 'Finalizing results...'}
          {progress === 100 && 'Ready!'}
        </div>
      </div>
    </div>
  );
}
