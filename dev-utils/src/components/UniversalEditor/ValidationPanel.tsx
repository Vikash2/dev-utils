import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ValidationError } from '../../utils/validator';

interface ValidationPanelProps {
  errors: ValidationError[];
  isOpen: boolean;
  onClose: () => void;
  onErrorClick?: (error: ValidationError) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  errors,
  isOpen,
  onClose,
  onErrorClick,
}) => {
  if (!isOpen) return null;

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-gray-800 border-t border-gray-700 max-h-64 overflow-y-auto"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-white">Validation Results</h3>
            {errorCount > 0 && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </span>
            )}
            {errorCount === 0 && warningCount === 0 && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                No issues found
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {errors.length === 0 ? (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle size={20} />
            <span>All validations passed!</span>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {errors.map((error, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => onErrorClick?.(error)}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    error.severity === 'error'
                      ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
                      : 'bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {error.severity === 'error' ? (
                      <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{error.message}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Line {error.line}, Column {error.column}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
