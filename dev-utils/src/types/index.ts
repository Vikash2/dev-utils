export type Language = 
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'xml'
  | 'html'
  | 'css'
  | 'python'
  | 'java'
  | 'cpp'
  | 'plaintext';

export type Theme = 'light' | 'dark';

export interface DiffResult {
  added: number;
  removed: number;
  modified: number;
  totalCharChanges: number;
}

export interface ValidationError {
  message: string;
  line?: number;
  column?: number;
}

export interface EditorState {
  leftCode: string;
  rightCode: string;
  language: Language;
  setLeftCode: (code: string) => void;
  setRightCode: (code: string) => void;
  setLanguage: (lang: Language) => void;
  clear: () => void;
}

export interface FormatterState {
  input: string;
  output: string;
  setInput: (input: string) => void;
  setOutput: (output: string) => void;
  clear: () => void;
}
