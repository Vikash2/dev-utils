import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useThemeStore } from '../store/themeStore';
import { Language } from '../types';
import { getMonacoLanguage } from '../utils/diffUtils';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: Language;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

export const Editor = ({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  placeholder,
  className = '',
}: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = monaco.editor.create(editorRef.current, {
      value,
      language: getMonacoLanguage(language),
      theme: theme === 'dark' ? 'vs-dark' : 'vs',
      readOnly,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
      fontFamily: "'Fira Code', 'Courier New', monospace",
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
      tabSize: 2,
      insertSpaces: true,
      padding: { top: 16, bottom: 16 },
    });

    monacoEditorRef.current = editor;

    const handleChange = () => {
      const newValue = editor.getValue();
      onChange(newValue);
    };

    const subscription = editor.onDidChangeModelContent(handleChange);

    return () => {
      subscription.dispose();
      editor.dispose();
    };
  }, []);

  useEffect(() => {
    if (monacoEditorRef.current && monacoEditorRef.current.getValue() !== value) {
      monacoEditorRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (monacoEditorRef.current) {
      const model = monacoEditorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, getMonacoLanguage(language));
      }
    }
  }, [language]);

  useEffect(() => {
    if (monacoEditorRef.current) {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
  }, [theme]);

  return (
    <div
      ref={editorRef}
      className={`w-full h-full border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm ${className}`}
      role="textbox"
      aria-label={placeholder}
    />
  );
};
