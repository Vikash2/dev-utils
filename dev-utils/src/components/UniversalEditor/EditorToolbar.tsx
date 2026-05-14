import React, { useState } from 'react';
import {
  FileUp,
  Save,
  Wand2,
  Minimize2,
  Copy,
  Trash2,
  Download,
  RotateCcw,
  RotateCw,
  WrapText,
  AlignLeft,
  Map,
  MapMinus,
  Type,
  Moon,
  Sun,
  Check,
  Clipboard,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { IconButtonWithTooltip } from './IconButtonWithTooltip';
import type { SupportedLanguage } from '../../utils/languageDetector';

interface EditorToolbarProps {
  onOpenFile: () => void;
  onPaste: () => void;
  onSaveFile: () => void;
  onFormat: () => void;
  onMinify: () => void;
  onBeautify: () => void;
  onValidate: () => void;
  onCopy: () => void;
  onClear: () => void;
  onDownload: () => void;
  onUndo: () => void;
  onRedo: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  wordWrap: boolean;
  onWordWrapToggle: () => void;
  showMinimap: boolean;
  onMinimapToggle: () => void;
  validationStatus?: 'valid' | 'invalid' | 'warning' | null;
  isLoading?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onOpenFile,
  onPaste,
  onSaveFile,
  onFormat,
  onMinify,
  onBeautify,
  onValidate,
  onCopy,
  onClear,
  onDownload,
  onUndo,
  onRedo,
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  fontSize,
  onFontSizeChange,
  wordWrap,
  onWordWrapToggle,
  showMinimap,
  onMinimapToggle,
  validationStatus,
  isLoading,
}: EditorToolbarProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-gray-900 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-700 px-4 py-2 space-y-2">
      {/* Main Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* File Operations */}
        <div className="flex items-center gap-1 border-r border-gray-700 dark:border-gray-700 pr-2">
          <IconButtonWithTooltip
            icon={<FileUp size={18} />}
            label="Open File"
            onClick={onOpenFile}
          />
          <IconButtonWithTooltip
            icon={<Clipboard size={18} />}
            label="Paste Code"
            onClick={onPaste}
          />
          <IconButtonWithTooltip
            icon={<Save size={18} />}
            label="Save/Download"
            onClick={onSaveFile}
          />
          <IconButtonWithTooltip
            icon={<Download size={18} />}
            label="Download File"
            onClick={onDownload}
          />
        </div>

        {/* Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-700 dark:border-gray-700 pr-2">
          <IconButtonWithTooltip
            icon={<Wand2 size={18} />}
            label="Format Code"
            onClick={onFormat}
            disabled={isLoading}
          />
          <IconButtonWithTooltip
            icon={<Minimize2 size={18} />}
            label="Minify Code"
            onClick={onMinify}
            disabled={isLoading}
          />
          <IconButtonWithTooltip
            icon={<Copy size={18} />}
            label="Beautify Code"
            onClick={onBeautify}
            disabled={isLoading}
          />
        </div>

        {/* Validation */}
        <div className="flex items-center gap-1 border-r border-gray-700 dark:border-gray-700 pr-2">
          <IconButtonWithTooltip
            icon={<Check size={18} />}
            label="Validate Code"
            onClick={onValidate}
            variant={
              validationStatus === 'valid'
                ? 'success'
                : validationStatus === 'invalid'
                  ? 'danger'
                  : validationStatus === 'warning'
                    ? 'warning'
                    : 'default'
            }
            disabled={isLoading}
          />
        </div>

        {/* Edit Operations */}
        <div className="flex items-center gap-1 border-r border-gray-700 dark:border-gray-700 pr-2">
          <IconButtonWithTooltip
            icon={<RotateCcw size={18} />}
            label="Undo"
            onClick={onUndo}
          />
          <IconButtonWithTooltip
            icon={<RotateCw size={18} />}
            label="Redo"
            onClick={onRedo}
          />
          <IconButtonWithTooltip
            icon={<Copy size={18} />}
            label="Copy to Clipboard"
            onClick={onCopy}
          />
          <IconButtonWithTooltip
            icon={<Trash2 size={18} />}
            label="Clear Content"
            onClick={onClear}
            variant="danger"
          />
        </div>

        {/* Language Selector */}
        <div className="border-r border-gray-700 dark:border-gray-700 pr-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 dark:text-gray-400">Language:</label>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              aria-label="Select programming language"
              className="bg-gray-800 dark:bg-gray-800 text-white dark:text-white px-2 py-1 rounded text-sm border border-gray-700 dark:border-gray-700 hover:border-gray-600 dark:hover:border-gray-600 transition-colors"
            >
              <option value="plaintext">Auto-detect / Plain Text</option>
              <optgroup label="Web">
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="jsx">JSX</option>
                <option value="tsx">TSX</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="scss">SCSS</option>
              </optgroup>
              <optgroup label="Data">
                <option value="json">JSON</option>
                <option value="xml">XML</option>
                <option value="yaml">YAML</option>
                <option value="sql">SQL</option>
              </optgroup>
              <optgroup label="Backend">
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
              </optgroup>
              <optgroup label="Markup">
                <option value="markdown">Markdown</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Theme & View Options */}
        <div className="flex items-center gap-1 border-r border-gray-700 dark:border-gray-700 pr-2">
          <IconButtonWithTooltip
            icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            onClick={onThemeToggle}
          />
          <IconButtonWithTooltip
            icon={wordWrap ? <WrapText size={18} /> : <AlignLeft size={18} />}
            label={`${wordWrap ? 'Disable' : 'Enable'} Word Wrap`}
            onClick={onWordWrapToggle}
          />
          <IconButtonWithTooltip
            icon={showMinimap ? <Map size={18} /> : <MapMinus size={18} />}
            label={`${showMinimap ? 'Hide' : 'Show'} Minimap`}
            onClick={onMinimapToggle}
          />
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-label={`${showAdvanced ? 'Hide' : 'Show'} advanced options`}
          className="ml-auto px-3 py-1 rounded text-sm bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-4 pt-2 border-t border-gray-700 dark:border-gray-700"
        >
          <div className="flex items-center gap-2">
            <Type size={16} className="text-gray-400 dark:text-gray-400" />
            <label className="text-sm text-gray-400 dark:text-gray-400">Font Size:</label>
            <input
              type="range"
              min="10"
              max="24"
              value={fontSize}
              onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
              aria-label="Adjust font size"
              className="w-24"
            />
            <span className="text-sm text-gray-400 dark:text-gray-400 w-8">{fontSize}px</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
