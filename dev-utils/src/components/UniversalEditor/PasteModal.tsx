import React, { useState } from 'react';
import { Clipboard, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { detectLanguage } from '../../utils/languageDetector';

interface PasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaste: (content: string, filename: string, language: string) => void;
}

export const PasteModal: React.FC<PasteModalProps> = ({
  isOpen,
  onClose,
  onPaste,
}) => {
  const [content, setContent] = useState('');
  const [filename, setFilename] = useState('pasted-code.txt');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasteFromClipboard = async () => {
    try {
      setIsLoading(true);
      const clipboardContent = await navigator.clipboard.readText();
      setContent(clipboardContent);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      return;
    }

    const language = detectLanguage(filename, content);
    onPaste(content, filename, language);
    
    // Reset form
    setContent('');
    setFilename('pasted-code.txt');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Paste Code
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Filename Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filename (for language detection)
          </label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="e.g., script.js, data.json, style.css"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            The file extension helps detect the programming language
          </p>
        </div>

        {/* Content Textarea */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Code Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your code here..."
            className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handlePasteFromClipboard}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
                Pasting...
              </>
            ) : (
              <>
                <Clipboard size={16} />
                Paste from Clipboard
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Open in Editor
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
