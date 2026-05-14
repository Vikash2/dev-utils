import { useState, useCallback } from 'react';
import { Copy, Download, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Editor } from '../components/Editor';
import { ActionButton } from '../components/ActionButton';
import { FileUploader } from '../components/FileUploader';
import { AlertContainer } from '../components/Alert';
import { useFormatterStore } from '../store/formatterStore';
import { formatJSON, minifyJSON, validateJSON, parseJSONToTree, JSONNode } from '../utils/jsonUtils';
import { copyToClipboard, downloadFile } from '../utils/fileUtils';
import { motion } from 'framer-motion';

const JSONTreeNode = ({ node, level = 0 }: { node: JSONNode; level?: number }) => {
  const [expanded, setExpanded] = useState(node.expanded ?? true);

  if (!node.children || node.children.length === 0) {
    return (
      <div className="text-sm font-mono text-gray-700 dark:text-gray-300 ml-4">
        <span className="text-blue-600 dark:text-blue-400">{node.key}:</span>{' '}
        <span className={node.type === 'string' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
          {node.value}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="text-sm font-mono text-gray-700 dark:text-gray-300 ml-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="w-4 h-4 inline" /> : <ChevronRight className="w-4 h-4 inline" />}
        <span className="text-blue-600 dark:text-blue-400 ml-1">{node.key}:</span>{' '}
        <span className="text-gray-500">{node.value}</span>
      </div>
      {expanded && (
        <div className="ml-4">
          {node.children.map((child, index) => (
            <JSONTreeNode key={index} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const JSONFormatter = () => {
  const { input, output, setInput, setOutput, clear } = useFormatterStore();
  const [indent, setIndent] = useState<2 | 4 | 'tab'>(2);
  const [alerts, setAlerts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string }>>([]);

  const treeData = parseJSONToTree(input);

  const addAlert = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString();
    setAlerts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleFormat = () => {
    try {
      const indentValue = indent === 'tab' ? '\t' : indent;
      const formatted = formatJSON(input, indentValue);
      setOutput(formatted);
      addAlert('success', 'JSON formatted successfully');
    } catch (error) {
      addAlert('error', error instanceof Error ? error.message : 'Failed to format JSON');
    }
  };

  const handleMinify = () => {
    try {
      const minified = minifyJSON(input);
      setOutput(minified);
      addAlert('success', 'JSON minified successfully');
    } catch (error) {
      addAlert('error', error instanceof Error ? error.message : 'Failed to minify JSON');
    }
  };

  const handleValidate = () => {
    const error = validateJSON(input);
    if (error) {
      addAlert('error', `Validation error at line ${error.line}, column ${error.column}: ${error.message}`);
    } else {
      addAlert('success', 'JSON is valid');
    }
  };

  const handleCopyOutput = async () => {
    try {
      await copyToClipboard(output);
      addAlert('success', 'Copied to clipboard');
    } catch {
      addAlert('error', 'Failed to copy');
    }
  };

  const handleDownload = () => {
    downloadFile(output, 'formatted.json');
    addAlert('success', 'JSON downloaded successfully');
  };

  const handleClear = () => {
    clear();
    setOutput('');
    addAlert('info', 'Cleared');
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">JSON Formatter & Validator</h1>
          <p className="text-gray-600 dark:text-gray-400">Format, minify, and validate JSON with ease</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={indent}
              onChange={(e) => setIndent(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value="tab">Tab</option>
            </select>

            <div className="flex-1" />

            <ActionButton onClick={handleFormat} label="Format" variant="primary" />
            <ActionButton onClick={handleMinify} label="Minify" variant="secondary" />
            <ActionButton onClick={handleValidate} label="Validate" variant="secondary" />
            <ActionButton onClick={handleCopyOutput} icon={Copy} label="Copy" variant="secondary" />
            <ActionButton onClick={handleDownload} icon={Download} label="Download" variant="secondary" />
            <ActionButton onClick={handleClear} icon={Trash2} label="Clear" variant="danger" />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-3"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Input</h2>
            <div className="h-96 md:h-[500px]">
              <Editor
                value={input}
                onChange={setInput}
                language="json"
                placeholder="Paste JSON here or upload a file"
              />
            </div>
            <FileUploader
              onFileRead={(content) => {
                setInput(content);
                addAlert('success', 'File uploaded successfully');
              }}
              onError={(error) => addAlert('error', error)}
              accept=".json,.txt"
            />
          </motion.div>

          {/* Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-3"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Output</h2>
            <div className="h-96 md:h-[500px]">
              <Editor
                value={output}
                onChange={() => {}}
                language="json"
                readOnly
                placeholder="Formatted JSON will appear here"
              />
            </div>
          </motion.div>
        </div>

        {/* Tree View */}
        {treeData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">JSON Tree View</h2>
            <div className="max-h-96 overflow-y-auto">
              <JSONTreeNode node={treeData} />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
