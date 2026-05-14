export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'json'
  | 'xml'
  | 'html'
  | 'css'
  | 'scss'
  | 'markdown'
  | 'yaml'
  | 'sql'
  | 'python'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'php'
  | 'plaintext';

const extensionMap: Record<string, SupportedLanguage> = {
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  json: 'json',
  xml: 'xml',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  md: 'markdown',
  markdown: 'markdown',
  yaml: 'yaml',
  yml: 'yaml',
  sql: 'sql',
  py: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  cs: 'csharp',
  php: 'php',
  txt: 'plaintext',
};

const contentPatterns: Array<[RegExp, SupportedLanguage]> = [
  [/^{[\s\n]*"/, 'json'],
  [/^<\?xml/, 'xml'],
  [/^<!DOCTYPE html/i, 'html'],
  [/^<html/i, 'html'],
  [/^import\s+|^export\s+|^const\s+|^function\s+/, 'javascript'],
  [/^#!/, 'plaintext'],
];

export function detectLanguage(
  filename: string,
  content?: string
): SupportedLanguage {
  // Try extension first
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext && ext in extensionMap) {
    return extensionMap[ext];
  }

  // Try content patterns
  if (content) {
    const trimmedContent = content.trim();
    for (const [pattern, language] of contentPatterns) {
      if (pattern.test(trimmedContent)) {
        return language;
      }
    }
  }

  return 'plaintext';
}

export function getMonacoLanguage(language: SupportedLanguage): string {
  const monacoMap: Record<SupportedLanguage, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    json: 'json',
    xml: 'xml',
    html: 'html',
    css: 'css',
    scss: 'scss',
    markdown: 'markdown',
    yaml: 'yaml',
    sql: 'sql',
    python: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    csharp: 'csharp',
    php: 'php',
    plaintext: 'plaintext',
  };

  return monacoMap[language] || 'plaintext';
}

export function getFileExtension(language: SupportedLanguage): string {
  const extensionMap: Record<SupportedLanguage, string> = {
    javascript: 'js',
    typescript: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
    json: 'json',
    xml: 'xml',
    html: 'html',
    css: 'css',
    scss: 'scss',
    markdown: 'md',
    yaml: 'yaml',
    sql: 'sql',
    python: 'py',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    csharp: 'cs',
    php: 'php',
    plaintext: 'txt',
  };

  return extensionMap[language];
}
