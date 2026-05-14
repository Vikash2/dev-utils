import { XMLParser } from 'fast-xml-parser';
import type { SupportedLanguage } from './languageDetector';

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

function validateJson(content: string): ValidationResult {
  const errors: ValidationError[] = [];

  try {
    JSON.parse(content);
    return { isValid: true, errors };
  } catch (error) {
    if (error instanceof SyntaxError) {
      const match = error.message.match(/position (\d+)/);
      const position = match ? parseInt(match[1]) : 0;
      const lines = content.substring(0, position).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;

      errors.push({
        line,
        column,
        message: error.message,
        severity: 'error',
      });
    }
    return { isValid: false, errors };
  }
}

function validateXml(content: string): ValidationResult {
  const errors: ValidationError[] = [];

  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
    });
    parser.parse(content);
    return { isValid: true, errors };
  } catch (error) {
    errors.push({
      line: 1,
      column: 1,
      message: error instanceof Error ? error.message : 'XML parsing failed',
      severity: 'error',
    });
    return { isValid: false, errors };
  }
}

function validateHtml(content: string): ValidationResult {
  const errors: ValidationError[] = [];

  // Basic HTML validation
  const tagStack: Array<{ tag: string; line: number }> = [];
  const lines = content.split('\n');
  const selfClosingTags = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ]);

  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\s*[^>]*>/g;

  lines.forEach((line, lineIndex) => {
    let match;
    while ((match = tagRegex.exec(line)) !== null) {
      const tag = match[1].toLowerCase();
      const isClosing = match[0].startsWith('</');
      const isSelfClosing = match[0].endsWith('/>') || selfClosingTags.has(tag);

      if (isClosing) {
        if (tagStack.length === 0 || tagStack[tagStack.length - 1].tag !== tag) {
          errors.push({
            line: lineIndex + 1,
            column: match.index + 1,
            message: `Unexpected closing tag: </${tag}>`,
            severity: 'error',
          });
        } else {
          tagStack.pop();
        }
      } else if (!isSelfClosing) {
        tagStack.push({ tag, line: lineIndex + 1 });
      }
    }
  });

  if (tagStack.length > 0) {
    const unclosed = tagStack[tagStack.length - 1];
    errors.push({
      line: unclosed.line,
      column: 1,
      message: `Unclosed tag: <${unclosed.tag}>`,
      severity: 'error',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateYaml(content: string): ValidationResult {
  const errors: ValidationError[] = [];

  // Basic YAML validation
  const lines = content.split('\n');
  let indentStack: number[] = [0];

  lines.forEach((line, lineIndex) => {
    if (!line.trim() || line.trim().startsWith('#')) {
      return;
    }

    const indent = line.search(/\S/);
    const trimmed = line.trim();

    // Check for valid YAML structure
    if (trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':');
      const beforeColon = trimmed.substring(0, colonIndex).trim();

      if (!beforeColon || /^[0-9]/.test(beforeColon)) {
        errors.push({
          line: lineIndex + 1,
          column: indent + 1,
          message: 'Invalid YAML key',
          severity: 'error',
        });
      }
    }

    // Check indentation consistency
    if (indent > 0) {
      const lastIndent = indentStack[indentStack.length - 1];
      if (indent > lastIndent && (indent - lastIndent) % 2 !== 0) {
        errors.push({
          line: lineIndex + 1,
          column: indent + 1,
          message: 'Inconsistent indentation',
          severity: 'warning',
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateJavaScript(content: string): ValidationResult {
  const errors: ValidationError[] = [];

  try {
    // Use Function constructor for basic syntax validation
    new Function(content);
    return { isValid: true, errors };
  } catch (error) {
    if (error instanceof SyntaxError) {
      const match = error.message.match(/line (\d+)/);
      const line = match ? parseInt(match[1]) : 1;

      errors.push({
        line,
        column: 1,
        message: error.message,
        severity: 'error',
      });
    }
    return { isValid: false, errors };
  }
}

function validateSql(content: string): ValidationResult {
  const errors: ValidationError[] = [];

  // Basic SQL validation
  const keywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP'];
  const upperContent = content.toUpperCase();

  let hasKeyword = false;
  for (const keyword of keywords) {
    if (upperContent.includes(keyword)) {
      hasKeyword = true;
      break;
    }
  }

  if (!hasKeyword && content.trim()) {
    errors.push({
      line: 1,
      column: 1,
      message: 'No SQL keywords found',
      severity: 'warning',
    });
  }

  // Check for unclosed strings
  const singleQuotes = (content.match(/'/g) || []).length;
  const doubleQuotes = (content.match(/"/g) || []).length;

  if (singleQuotes % 2 !== 0) {
    errors.push({
      line: 1,
      column: 1,
      message: 'Unclosed single quote',
      severity: 'error',
    });
  }

  if (doubleQuotes % 2 !== 0) {
    errors.push({
      line: 1,
      column: 1,
      message: 'Unclosed double quote',
      severity: 'error',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateCode(
  content: string,
  language: SupportedLanguage
): ValidationResult {
  if (!content.trim()) {
    return { isValid: true, errors: [] };
  }

  try {
    switch (language) {
      case 'json':
        return validateJson(content);
      case 'xml':
        return validateXml(content);
      case 'html':
        return validateHtml(content);
      case 'yaml':
        return validateYaml(content);
      case 'javascript':
      case 'jsx':
        return validateJavaScript(content);
      case 'sql':
        return validateSql(content);
      default:
        return { isValid: true, errors: [] };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [
        {
          line: 1,
          column: 1,
          message: error instanceof Error ? error.message : 'Validation failed',
          severity: 'error',
        },
      ],
    };
  }
}
