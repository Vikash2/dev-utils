import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { getMonacoLanguage } from '../../utils/languageDetector';
import type { SupportedLanguage } from '../../utils/languageDetector';

interface MonacoEditorWrapperProps {
  value: string;
  language: SupportedLanguage;
  onChange: (value: string) => void;
  theme: 'dark' | 'light';
  fontSize: number;
  wordWrap: boolean;
  showMinimap: boolean;
  readOnly?: boolean;
}

export const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({
  value,
  language,
  onChange,
  theme,
  fontSize,
  wordWrap,
  showMinimap,
  readOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Define custom light theme with better contrast
    monaco.editor.defineTheme('custom-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: '098658' },
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'type', foreground: '267F99' },
        { token: 'function', foreground: '795E26' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#333333',
        'editor.lineNumbersBackground': '#F3F3F3',
        'editor.lineNumbersForeground': '#858585',
        'editor.selectionBackground': '#ADD6FF',
        'editor.lineHighlightBackground': '#F7F7F7',
        'editorCursor.foreground': '#000000',
        'editorWhitespace.foreground': '#BFBFBF',
        'editorBracketMatch.background': '#FFE5B4',
        'editorBracketMatch.border': '#FF9800',
      },
    });

    // Define custom dark theme with enhanced contrast
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.lineNumbersBackground': '#1E1E1E',
        'editor.lineNumbersForeground': '#858585',
        'editor.selectionBackground': '#264F78',
        'editor.lineHighlightBackground': '#2D2D30',
        'editorCursor.foreground': '#AEAFAD',
        'editorWhitespace.foreground': '#3E3E42',
        'editorBracketMatch.background': '#593500',
        'editorBracketMatch.border': '#CE7E00',
      },
    });

    const editor = monaco.editor.create(containerRef.current, {
      value,
      language: getMonacoLanguage(language),
      theme: theme === 'dark' ? 'custom-dark' : 'custom-light',
      fontSize,
      wordWrap: wordWrap ? 'on' : 'off',
      minimap: { enabled: showMinimap },
      readOnly,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      bracketPairColorization: { enabled: true },
      formatOnPaste: true,
      formatOnType: true,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoClosingOvertype: 'always',
      autoSurround: 'languageDefined',
      folding: true,
      foldingStrategy: 'auto',
      showFoldingControls: 'mouseover',
      lineNumbersMinChars: 3,
      renderLineHighlight: 'all',
      renderWhitespace: 'selection',
      smoothScrolling: true,
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: 'on',
      mouseWheelZoom: true,
      fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
      fontLigatures: true,
      links: true,
      colorDecorators: true,
      padding: { top: 16, bottom: 16 },
    });

    editorRef.current = editor;

    const disposable = editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue();
      // Only call onChange if the value actually changed and it's different from the prop
      if (newValue !== value) {
        onChange(newValue);
      }
    });

    return () => {
      disposable.dispose();
      editor.dispose();
      editorRef.current = null;
    };
  }, []); // Keep empty dependency array - editor should only be created once

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      // Only update if the value is actually different to avoid cursor jumps
      if (currentValue !== value) {
        const position = editorRef.current.getPosition();
        editorRef.current.setValue(value);
        // Restore cursor position if possible
        if (position) {
          editorRef.current.setPosition(position);
        }
      }
    }
  }, [value]);

  // Update language
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, getMonacoLanguage(language));
      }
    }
  }, [language]);

  // Update theme - this is the critical theme synchronization
  useEffect(() => {
    const themeName = theme === 'dark' ? 'custom-dark' : 'custom-light';
    monaco.editor.setTheme(themeName);
    
    // Force editor to re-render with new theme
    if (editorRef.current) {
      editorRef.current.updateOptions({});
    }
  }, [theme]);

  // Update font size
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  // Update word wrap
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ wordWrap: wordWrap ? 'on' : 'off' });
    }
  }, [wordWrap]);

  // Update minimap
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ minimap: { enabled: showMinimap } });
    }
  }, [showMinimap]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ minHeight: '400px' }}
    >
      {/* Placeholder text when editor is empty - only show when no content and not focused */}
      {value.length === 0 && !readOnly && (
        <div 
          className="absolute top-4 left-16 text-gray-400 dark:text-gray-600 pointer-events-none font-mono text-sm z-0"
          style={{ 
            opacity: editorRef.current?.hasTextFocus() ? 0 : 1,
            transition: 'opacity 0.2s ease-in-out'
          }}
        >
          Paste your code here or use the toolbar to open a file...
        </div>
      )}
    </div>
  );
};
