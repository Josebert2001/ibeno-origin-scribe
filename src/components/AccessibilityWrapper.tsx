import React from 'react';

interface AccessibilityWrapperProps {
  children: React.ReactNode;
  role?: string;
  ariaLabel?: string;
  tabIndex?: number;
}

const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({ 
  children, 
  role, 
  ariaLabel, 
  tabIndex 
}) => {
  return (
    <div 
      role={role}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
    >
      {children}
    </div>
  );
};

export default AccessibilityWrapper;