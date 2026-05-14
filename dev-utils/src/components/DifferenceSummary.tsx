import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface DifferenceSummaryProps {
  additions: number;
  deletions: number;
  className?: string;
}

export const DifferenceSummary: React.FC<DifferenceSummaryProps> = ({
  additions,
  deletions,
  className = '',
}) => {
  const totalChanges = additions + deletions;

  if (totalChanges === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ${className}`}
      >
        <span className="text-sm font-medium">No differences</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-4 px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-sm ${className}`}
    >
      {/* Additions */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900">
          <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
          {additions} {additions === 1 ? 'addition' : 'additions'}
        </span>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

      {/* Deletions */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900">
          <Minus className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
          {deletions} {deletions === 1 ? 'deletion' : 'deletions'}
        </span>
      </div>

      {/* Total */}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {totalChanges} total
      </span>
    </motion.div>
  );
};
