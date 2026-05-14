import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { readFileAsText, isTextFile } from '../utils/fileUtils';
import { motion } from 'framer-motion';

interface FileUploaderProps {
  onFileRead: (content: string) => void;
  onError?: (error: string) => void;
  accept?: string;
}

export const FileUploader = ({
  onFileRead,
  onError,
  accept = '.txt,.js,.ts,.json,.xml,.html,.css,.py,.java,.cpp',
}: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!isTextFile(file.name)) {
      onError?.('Unsupported file type. Please upload a text-based file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError?.('File size exceeds 10MB limit.');
      return;
    }

    try {
      const content = await readFileAsText(file);
      onFileRead(content);
    } catch (error) {
      onError?.('Failed to read file. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <motion.div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        accept={accept}
        className="hidden"
        aria-label="Upload file"
      />
      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500 dark:text-gray-400" />
      <p className="text-sm font-medium text-gray-800 dark:text-gray-300">
        Drag and drop your file here or click to browse
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        Supported formats: .txt, .js, .ts, .json, .xml, .html, .css, .py, .java, .cpp
      </p>
    </motion.div>
  );
};
