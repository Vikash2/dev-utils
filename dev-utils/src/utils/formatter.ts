import * as prettier from 'prettier';
import { format as sqlFormat } from 'sql-formatter';
import * as beautify from 'js-beautify';
import xmlFormat from 'xml-formatter';
import type { SupportedLanguage } from './languageDetector';

export interface FormatterOptions {
  indent?: number;
  lineWidth?: number;
  useTabs?: boolean;
}

const defaultOptions: FormatterOptions = {
  indent: 2,
  lineWidth: 80,
  useTabs: false,
};

async function formatWithPrettier(
  content: string,
  language: SupportedLanguage,
  options: FormatterOptions = {}
): Promise<string> {
  const opts = { ...defaultOptions, ...options };

  const parserMap: Record<SupportedLanguage, string> = {
    javascript: 'babel',
    typescript: 'typescript',
    jsx: 'babel',
    tsx: 'typescript',
    json: 'json',
    html: 'html',
    css: 'css',
    scss: 'scss',
    markdown: 'markdown',
    yaml: 'yaml',
    xml: 'babel-flow',
    sql: 'babel',
    python: 'babel',
    java: 'babel',
    c: 'babel',
    cpp: 'babel',
    csharp: 'babel',
    php: 'babel',
    plaintext: 'babel',
  };

  try {
    return await (prettier as any).format(content, {
      parser: parserMap[language] || 'babel',
      printWidth: opts.lineWidth,
      tabWidth: opts.indent,
      useTabs: opts.useTabs,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
    } as any);
  } catch (error) {
    throw new Error(`Prettier formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function formatWithBeautify(
  content: string,
  language: SupportedLanguage,
  options: FormatterOptions = {}
): string {
  const opts = { ...defaultOptions, ...options };
  const beautifyOptions = {
    indent_size: opts.indent,
    indent_char: opts.useTabs ? '\t' : ' ',
  };

  try {
    switch (language) {
      case 'html':
        return beautify.html(content, beautifyOptions);
      case 'css':
      case 'scss':
        return beautify.css(content, beautifyOptions);
      case 'javascript':
      case 'jsx':
        return beautify.js(content, beautifyOptions);
      default:
        return content;
    }
  } catch (error) {
    throw new Error(`Beautify formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function formatXml(content: string, options: FormatterOptions = {}): string {
  const opts = { ...defaultOptions, ...options };
  try {
    return xmlFormat(content, {
      indentation: opts.useTabs ? '\t' : ' '.repeat(opts.indent || 2),
    });
  } catch (error) {
    throw new Error(`XML formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function formatSql(content: string, options: FormatterOptions = {}): string {
  const opts = { ...defaultOptions, ...options };
  try {
    return sqlFormat(content, {
      indentation: opts.useTabs ? '\t' : ' '.repeat(opts.indent || 2),
      lineWidth: opts.lineWidth,
    } as any);
  } catch (error) {
    throw new Error(`SQL formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function formatCode(
  content: string,
  language: SupportedLanguage,
  options: FormatterOptions = {}
): Promise<string> {
  if (!content.trim()) {
    return content;
  }

  try {
    switch (language) {
      case 'xml':
        return formatXml(content, options);
      case 'sql':
        return formatSql(content, options);
      case 'javascript':
      case 'typescript':
      case 'jsx':
      case 'tsx':
      case 'json':
      case 'html':
      case 'css':
      case 'scss':
      case 'markdown':
      case 'yaml':
        return await formatWithPrettier(content, language, options);
      default:
        return content;
    }
  } catch (error) {
    throw error;
  }
}

export function minifyCode(content: string, language: SupportedLanguage): string {
  if (!content.trim()) {
    return content;
  }

  try {
    switch (language) {
      case 'javascript':
      case 'jsx':
      case 'typescript':
      case 'tsx': {
        // Simple JS minification
        return content
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
          .replace(/\/\/.*/g, '') // Remove line comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/\s*([{}();,:])\s*/g, '$1') // Remove spaces around punctuation
          .trim();
      }
      case 'json': {
        return JSON.stringify(JSON.parse(content));
      }
      case 'html': {
        return content
          .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
          .replace(/>\s+</g, '><') // Remove whitespace between tags
          .replace(/\s+/g, ' ') // Collapse whitespace
          .trim();
      }
      case 'css':
      case 'scss': {
        return content
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around punctuation
          .trim();
      }
      default:
        return content;
    }
  } catch (error) {
    throw new Error(`Minification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function beautifyCode(
  content: string,
  language: SupportedLanguage,
  options: FormatterOptions = {}
): string {
  return formatWithBeautify(content, language, options);
}
