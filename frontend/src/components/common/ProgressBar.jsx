/**
 * ProgressBar Component
 * Shows animated progress during CV analysis
 */
import React, { useState, useEffect } from 'react';

export default function ProgressBar({ isActive = false, onComplete, completionDelay = 500 }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    // Start with initial progress immediately
    setProgress(5);

    // Simulate progress from 5 to 95% while analyzing
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
        setTimeout(() => onComplete(), completionDelay);
      }
    }
  }, [isActive, progress, onComplete, completionDelay]);

  // Hide the progress bar only when it's not active and has no progress
  if (!isActive && progress === 0) {
    return null;
  }

  const getProgressColor = () => {
    if (progress < 30) return 'bg-blue-500';
    if (progress < 60) return 'bg-indigo-500';
    if (progress < 90) return 'bg-purple-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold text-gray-700">
          {progress < 100 ? 'Processing...' : 'Complete!'}
        </span>
        <span className="text-2xl font-bold text-blue-600">{progress}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
        <div
          className={`h-6 rounded-full transition-all duration-500 ease-out ${getProgressColor()} relative`}
          style={{ width: `${progress}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-base font-medium text-gray-700">
          {progress < 30 && '📄 Extracting text from document...'}
          {progress >= 30 && progress < 60 && '🔍 Analyzing CV structure...'}
          {progress >= 60 && progress < 90 && '🤖 Running AI analysis...'}
          {progress >= 90 && progress < 100 && '✨ Finalizing results...'}
          {progress === 100 && '✅ Analysis Complete!'}
        </p>
      </div>
    </div>
  );
}
