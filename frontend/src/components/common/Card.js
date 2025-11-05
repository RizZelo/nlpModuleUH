import React from 'react';

/**
 * Reusable Card Component
 */
const Card = ({ children, title, icon: Icon, className = '', headerAction }) => {
  return (
    <div className={`bg-white p-6 rounded border border-gray-200 ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5" />}
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
