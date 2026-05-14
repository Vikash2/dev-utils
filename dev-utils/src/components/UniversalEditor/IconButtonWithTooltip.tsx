import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IconButtonWithTooltipProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
  ariaLabel?: string;
}

/**
 * Reusable icon button component with tooltip support
 * Provides consistent visual feedback and accessibility
 */
export const IconButtonWithTooltip: React.FC<IconButtonWithTooltipProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
  className = '',
  ariaLabel,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');

  const variantClasses = {
    default: 'hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white',
    success: 'hover:bg-green-700/30 dark:hover:bg-green-700/30 text-green-400 dark:text-green-400',
    warning: 'hover:bg-yellow-700/30 dark:hover:bg-yellow-700/30 text-yellow-400 dark:text-yellow-400',
    danger: 'hover:bg-red-700/30 dark:hover:bg-red-700/30 text-red-400 dark:text-red-400',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Check if tooltip would go off-screen
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.top < 100) {
      setTooltipPosition('bottom');
    } else {
      setTooltipPosition('top');
    }
    setShowTooltip(true);
  };

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={ariaLabel || label}
        title={label}
        className={`p-2 rounded transition-all duration-200 ${variantClasses[variant]} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${className}`}
      >
        {icon}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-1/2 transform -translate-x-1/2 ${
              tooltipPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            } px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white dark:text-white text-xs rounded whitespace-nowrap pointer-events-none z-50 shadow-lg border border-gray-700 dark:border-gray-600`}
            role="tooltip"
          >
            {label}
            {/* Arrow */}
            <div
              className={`absolute left-1/2 transform -translate-x-1/2 border-4 border-transparent ${
                tooltipPosition === 'top'
                  ? 'top-full border-t-gray-800 dark:border-t-gray-700'
                  : 'bottom-full border-b-gray-800 dark:border-b-gray-700'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
