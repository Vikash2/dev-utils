import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { readFileAsText, isTextFile } from '../../utils/fileUtils';
import { detectLanguage } from '../../utils/languageDetector';

interface FileUploaderProps {
  onFilesSelected: (files: Array<{ name: string; content: string; language: string }>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  isOpen,
  onClose,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      setIsLoading(true);

      try {
        const results = [];

        for (const file of acceptedFiles) {
          if (!isTextFile(file.name)) {
            setError(`${file.name} is not a supported text file`);
            continue;
          }

          const content = await readFileAsText(file);
          const language = detectLanguage(file.name, content);

          results.push({
            name: file.name,
            content,
            language,
          });
        }

        if (results.length > 0) {
          onFilesSelected(results);
          onClose();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to read files');
      } finally {
        setIsLoading(false);
      }
    },
    [onFilesSelected, onClose]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
      'text/html': ['.html', '.htm'],
      'text/css': ['.css', '.scss'],
      'text/markdown': ['.md'],
      'text/x-yaml': ['.yaml', '.yml'],
      'text/x-sql': ['.sql'],
      'text/javascript': ['.js', '.jsx'],
      'text/typescript': ['.ts', '.tsx'],
      'text/x-python': ['.py'],
      'text/x-java': ['.java'],
      'text/x-c': ['.c'],
      'text/x-cpp': ['.cpp', '.cc', '.cxx'],
      'text/x-csharp': ['.cs'],
      'text/x-php': ['.php'],
    },
  });

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
        className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">Open Files</h2>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-300 font-medium">
            {isDragActive
              ? 'Drop files here'
              : 'Drag files here or click to select'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Supports text, code, and data files
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded flex items-start gap-2">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full" />
            </div>
            <p className="text-gray-400 text-sm mt-2">Processing files...</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};
