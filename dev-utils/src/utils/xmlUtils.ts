import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { ValidationError } from '../types';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: true,
});

export const formatXML = (input: string, indent: number = 2): string => {
  try {
    const parsed = xmlParser.parse(input);
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      indentBy: ' '.repeat(indent),
    });
    return builder.build(parsed) as string;
  } catch (error) {
    throw new Error(`Invalid XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const minifyXML = (input: string): string => {
  try {
    const parsed = xmlParser.parse(input);
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: false,
    });
    return builder.build(parsed) as string;
  } catch (error) {
    throw new Error(`Invalid XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const validateXML = (input: string): ValidationError | null => {
  try {
    xmlParser.parse(input);
    return null;
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message;
      const lineMatch = message.match(/line (\d+)/);
      const colMatch = message.match(/column (\d+)/);

      return {
        message,
        line: lineMatch ? parseInt(lineMatch[1]) : undefined,
        column: colMatch ? parseInt(colMatch[1]) : undefined,
      };
    }
    return {
      message: 'Invalid XML',
    };
  }
};

export interface XMLNode {
  tag: string;
  attributes?: Record<string, string>;
  children?: XMLNode[];
  text?: string;
  expanded?: boolean;
}

export const parseXMLToTree = (input: string): XMLNode | null => {
  try {
    const parsed = xmlParser.parse(input);
    const firstKey = Object.keys(parsed)[0];
    return valueToXMLNode(firstKey, parsed[firstKey]);
  } catch {
    return null;
  }
};

const valueToXMLNode = (tag: string, value: any): XMLNode => {
  const node: XMLNode = {
    tag,
    expanded: false,
  };

  if (typeof value === 'string' || typeof value === 'number') {
    node.text = String(value);
    return node;
  }

  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      node.children = value.map((item, index) => valueToXMLNode(`${tag}[${index}]`, item));
    } else {
      node.children = Object.entries(value).map(([key, val]) => {
        if (key.startsWith('@_')) {
          if (!node.attributes) node.attributes = {};
          node.attributes[key.substring(2)] = String(val);
          return null;
        }
        return valueToXMLNode(key, val);
      }).filter((n) => n !== null) as XMLNode[];
    }
  }

  return node;
};
