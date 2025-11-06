/**
 * Button Component
 * Reusable button with consistent styling
 */
import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = ''
}) {
  const baseClasses = 'rounded-lg font-medium transition flex items-center gap-2 justify-center';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-12 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'cursor-not-allowed' : ''} ${className}`}
    >
      {Icon && <Icon className={size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />}
      {children}
    </button>
  );
}
