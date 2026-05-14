import { useState, useCallback } from 'react';
import { Copy, Download, RotateCw, Trash2 } from 'lucide-react';
import { Editor } from '../components/Editor';
import { ActionButton } from '../components/ActionButton';
import { FileUploader } from '../components/FileUploader';
import { AlertContainer } from '../components/Alert';
import { VisualDiffViewer } from '../components/VisualDiffViewer';
import { DifferenceSummary } from '../components/DifferenceSummary';
import { useDiffStore } from '../store/diffStore';
import { calculateDiffStats, calculateDiffSummary, detectLanguage } from '../utils/diffUtils';
import { copyToClipboard, downloadFile } from '../utils/fileUtils';
import { Language } from '../types';
import { motion } from 'framer-motion';

export const DiffChecker = () => {
  const { leftCode, rightCode, language, setLeftCode, setRightCode, setLanguage, clear } = useDiffStore();
  const [alerts, setAlerts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string }>>([]);

  const stats = calculateDiffStats(leftCode, rightCode);
  const summary = calculateDiffSummary(leftCode, rightCode);

  const addAlert = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString();
    setAlerts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleSwap = () => {
    const temp = leftCode;
    setLeftCode(rightCode);
    setRightCode(temp);
  };

  const handleCopyLeft = async () => {
    try {
      await copyToClipboard(leftCode);
      addAlert('success', 'Copied to clipboard');
    } catch {
      addAlert('error', 'Failed to copy');
    }
  };

  const handleCopyRight = async () => {
    try {
      await copyToClipboard(rightCode);
      addAlert('success', 'Copied to clipboard');
    } catch {
      addAlert('error', 'Failed to copy');
    }
  };

  const handleDownload = () => {
    const content = `Original Code:\n${leftCode}\n\n---\n\nModified Code:\n${rightCode}`;
    downloadFile(content, 'diff-result.txt');
    addAlert('success', 'Diff downloaded successfully');
  };

  const handleFileUpload = (content: string, side: 'left' | 'right') => {
    const detectedLang = detectLanguage(content);
    if (side === 'left') {
      setLeftCode(content);
    } else {
      setRightCode(content);
    }
    setLanguage(detectedLang as Language);
    addAlert('success', `File uploaded to ${side} editor`);
  };

  const handleClear = () => {
    clear();
    addAlert('info', 'Editors cleared');
  };

  const languages: Language[] = ['javascript', 'typescript', 'json', 'xml', 'html', 'css', 'python', 'java', 'cpp', 'plaintext'];

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 md:p-8 overflow-auto">
      <AlertContainer alerts={alerts} onRemove={removeAlert} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Code Difference Checker</h1>
          <p className="text-gray-600 dark:text-gray-400">Compare two code snippets side by side</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="px-3 py-2 rounded-lg border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>

            <div className="flex-1" />

            <ActionButton 
              onClick={handleSwap} 
              icon={RotateCw} 
              label="Swap" 
              tooltip="Swap original and modified code"
              variant="secondary" 
            />
            <ActionButton 
              onClick={handleCopyLeft} 
              icon={Copy} 
              label="Copy Left" 
              tooltip="Copy original code to clipboard"
              variant="secondary" 
            />
            <ActionButton 
              onClick={handleCopyRight} 
              icon={Copy} 
              label="Copy Right" 
              tooltip="Copy modified code to clipboard"
              variant="secondary" 
            />
            <ActionButton 
              onClick={handleDownload} 
              icon={Download} 
              label="Download" 
              tooltip="Download diff as text file"
              variant="secondary" 
            />
            <ActionButton 
              onClick={handleClear} 
              icon={Trash2} 
              label="Clear" 
              tooltip="Clear both editors"
              variant="danger" 
            />
          </div>
        </div>

        {/* Statistics */}
        {(leftCode || rightCode) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 p-4 shadow-sm">
              <p className="text-sm text-gray-700 dark:text-gray-400">Added</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.added}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 p-4 shadow-sm">
              <p className="text-sm text-gray-700 dark:text-gray-400">Removed</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.removed}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 p-4 shadow-sm">
              <p className="text-sm text-gray-700 dark:text-gray-400">Modified</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.modified}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 p-4 shadow-sm">
              <p className="text-sm text-gray-700 dark:text-gray-400">Total Changes</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCharChanges}</p>
            </div>
          </motion.div>
        )}

        {/* Difference Summary Badge */}
        {(leftCode || rightCode) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <DifferenceSummary 
              additions={summary.additions} 
              deletions={summary.deletions}
            />
          </motion.div>
        )}

        {/* Editors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-3"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Original Code</h2>
            <div className="h-96 md:h-[500px]">
              <Editor
                value={leftCode}
                onChange={setLeftCode}
                language={language}
                placeholder="Paste original code here or upload a file"
              />
            </div>
            <FileUploader
              onFileRead={(content) => handleFileUpload(content, 'left')}
              onError={(error) => addAlert('error', error)}
            />
          </motion.div>

          {/* Right Editor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-3"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Modified Code</h2>
            <div className="h-96 md:h-[500px]">
              <Editor
                value={rightCode}
                onChange={setRightCode}
                language={language}
                placeholder="Paste modified code here or upload a file"
              />
            </div>
            <FileUploader
              onFileRead={(content) => handleFileUpload(content, 'right')}
              onError={(error) => addAlert('error', error)}
            />
          </motion.div>
        </div>

        {/* Visual Diff Viewer */}
        {(leftCode || rightCode) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visual Diff</h2>
            <VisualDiffViewer 
              original={leftCode} 
              modified={rightCode}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
