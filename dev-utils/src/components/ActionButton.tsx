import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  onClick: () => void;
  icon?: LucideIcon;
  label: string;
  tooltip?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActionButton = ({
  onClick,
  icon: Icon,
  label,
  tooltip,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}: ActionButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const baseClasses =
    'px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700',
  };

  return (
    <div className="relative inline-block">
      <motion.button
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onMouseEnter={() => tooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title={tooltip}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{loading ? 'Processing...' : label}</span>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: -12 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs font-medium rounded whitespace-nowrap pointer-events-none z-50"
          >
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-700" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
