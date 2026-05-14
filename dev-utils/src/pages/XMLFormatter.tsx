import { useState, useCallback } from 'react';
import { Copy, Download, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Editor } from '../components/Editor';
import { ActionButton } from '../components/ActionButton';
import { FileUploader } from '../components/FileUploader';
import { AlertContainer } from '../components/Alert';
import { useFormatterStore } from '../store/formatterStore';
import { formatXML, minifyXML, validateXML, parseXMLToTree, XMLNode } from '../utils/xmlUtils';
import { copyToClipboard, downloadFile } from '../utils/fileUtils';
import { motion } from 'framer-motion';

const XMLTreeNode = ({ node, level = 0 }: { node: XMLNode; level?: number }) => {
  const [expanded, setExpanded] = useState(node.expanded ?? true);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="text-sm font-mono text-gray-700 dark:text-gray-300 ml-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded flex items-center"
        onClick={() => setExpanded(!expanded)}
      >
        {hasChildren && (expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
        {!hasChildren && <span className="w-4" />}
        <span className="text-blue-600 dark:text-blue-400 ml-1">&lt;{node.tag}&gt;</span>
        {node.text && <span className="text-green-600 dark:text-green-400 ml-2">{node.text}</span>}
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children!.map((child, index) => (
            <XMLTreeNode key={index} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const XMLFormatter = () => {
  const { input, output, setInput, setOutput, clear } = useFormatterStore();
  const [indent, setIndent] = useState<number>(2);
  const [alerts, setAlerts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string }>>([]);

  const treeData = parseXMLToTree(input);

  const addAlert = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString();
    setAlerts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleFormat = () => {
    try {
      const formatted = formatXML(input, indent);
      setOutput(formatted);
      addAlert('success', 'XML formatted successfully');
    } catch (error) {
      addAlert('error', error instanceof Error ? error.message : 'Failed to format XML');
    }
  };

  const handleMinify = () => {
    try {
      const minified = minifyXML(input);
      setOutput(minified);
      addAlert('success', 'XML minified successfully');
    } catch (error) {
      addAlert('error', error instanceof Error ? error.message : 'Failed to minify XML');
    }
  };

  const handleValidate = () => {
    const error = validateXML(input);
    if (error) {
      const location = error.line ? ` at line ${error.line}` : '';
      addAlert('error', `Validation error${location}: ${error.message}`);
    } else {
      addAlert('success', 'XML is valid');
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
    downloadFile(output, 'formatted.xml');
    addAlert('success', 'XML downloaded successfully');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">XML Formatter & Validator</h1>
          <p className="text-gray-600 dark:text-gray-400">Format, minify, and validate XML with ease</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={indent}
              onChange={(e) => setIndent(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
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
                language="xml"
                placeholder="Paste XML here or upload a file"
              />
            </div>
            <FileUploader
              onFileRead={(content) => {
                setInput(content);
                addAlert('success', 'File uploaded successfully');
              }}
              onError={(error) => addAlert('error', error)}
              accept=".xml,.txt"
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
                language="xml"
                readOnly
                placeholder="Formatted XML will appear here"
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">XML Tree View</h2>
            <div className="max-h-96 overflow-y-auto">
              <XMLTreeNode node={treeData} />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
