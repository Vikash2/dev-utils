import { ValidationError } from '../types';

export const formatJSON = (input: string, indent: number | string = 2): string => {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, indent);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const minifyJSON = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const validateJSON = (input: string): ValidationError | null => {
  try {
    JSON.parse(input);
    return null;
  } catch (error) {
    if (error instanceof SyntaxError) {
      const match = error.message.match(/position (\d+)/);
      const position = match ? parseInt(match[1]) : 0;
      
      let line = 1;
      let column = 1;
      for (let i = 0; i < position && i < input.length; i++) {
        if (input[i] === '\n') {
          line++;
          column = 1;
        } else {
          column++;
        }
      }

      return {
        message: error.message,
        line,
        column,
      };
    }
    return {
      message: 'Invalid JSON',
    };
  }
};

export interface JSONNode {
  key?: string;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  children?: JSONNode[];
  expanded?: boolean;
}

export const parseJSONToTree = (input: string): JSONNode | null => {
  try {
    const parsed = JSON.parse(input);
    return valueToNode(parsed);
  } catch {
    return null;
  }
};

const valueToNode = (value: any, key?: string): JSONNode => {
  if (value === null) {
    return { key, value: 'null', type: 'null' };
  }

  if (Array.isArray(value)) {
    return {
      key,
      value: `Array(${value.length})`,
      type: 'array',
      children: value.map((item, index) => valueToNode(item, `[${index}]`)),
      expanded: false,
    };
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return {
      key,
      value: `Object(${keys.length})`,
      type: 'object',
      children: keys.map((k) => valueToNode(value[k], k)),
      expanded: false,
    };
  }

  if (typeof value === 'string') {
    return { key, value, type: 'string' };
  }

  if (typeof value === 'number') {
    return { key, value, type: 'number' };
  }

  if (typeof value === 'boolean') {
    return { key, value: value.toString(), type: 'boolean' };
  }

  return { key, value, type: 'string' };
};
