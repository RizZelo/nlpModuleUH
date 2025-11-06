/**
 * LoadingSpinner Component
 * Displays loading state with spinner animation
 */
import React from 'react';

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8'
  };

  return (
    <span className="flex items-center gap-3">
      <div className={`animate-spin rounded-full border-b-2 border-white ${sizeClasses[size]}`}></div>
      {message}
    </span>
  );
}
