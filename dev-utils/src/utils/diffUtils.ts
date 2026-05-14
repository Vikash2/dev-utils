import DiffMatchPatch from 'diff-match-patch';
import { DiffResult } from '../types';

const dmp = new DiffMatchPatch();

export interface DiffLine {
  type: 'add' | 'remove' | 'equal';
  content: string;
  lineNumber: number;
}

export interface DiffSummary {
  additions: number;
  deletions: number;
  totalLines: number;
  summary: string;
}

export interface SplitViewRow {
  originalLine: string | null;
  modifiedLine: string | null;
  originalLineNumber: number | null;
  modifiedLineNumber: number | null;
  type: 'add' | 'remove' | 'equal' | 'modified';
  originalWords?: WordDiff[];
  modifiedWords?: WordDiff[];
}

export interface WordDiff {
  text: string;
  type: 'add' | 'remove' | 'equal';
}

// Compute word-level diff for a single line
export const computeWordDiff = (original: string, modified: string): { originalWords: WordDiff[]; modifiedWords: WordDiff[] } => {
  const diffs = dmp.diff_main(original, modified);
  dmp.diff_cleanupSemantic(diffs);

  const originalWords: WordDiff[] = [];
  const modifiedWords: WordDiff[] = [];

  for (const [type, text] of diffs) {
    if (type === -1) {
      // Removed from original
      originalWords.push({ text, type: 'remove' });
    } else if (type === 1) {
      // Added to modified
      modifiedWords.push({ text, type: 'add' });
    } else {
      // Equal in both
      originalWords.push({ text, type: 'equal' });
      modifiedWords.push({ text, type: 'equal' });
    }
  }

  return { originalWords, modifiedWords };
};

// Compute split-view aligned rows
export const computeSplitViewDiff = (original: string, modified: string): SplitViewRow[] => {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  
  const diffs = dmp.diff_main(original, modified);
  dmp.diff_cleanupSemantic(diffs);

  const rows: SplitViewRow[] = [];
  let origLineIdx = 0;
  let modLineIdx = 0;

  for (const [type, content] of diffs) {
    const contentLines = content.split('\n');
    
    // Remove empty last element if content ends with newline
    if (contentLines[contentLines.length - 1] === '' && contentLines.length > 1) {
      contentLines.pop();
    }

    if (type === -1) {
      // Lines removed from original
      for (const line of contentLines) {
        rows.push({
          originalLine: line,
          modifiedLine: null,
          originalLineNumber: origLineIdx + 1,
          modifiedLineNumber: null,
          type: 'remove',
        });
        origLineIdx++;
      }
    } else if (type === 1) {
      // Lines added to modified
      for (const line of contentLines) {
        rows.push({
          originalLine: null,
          modifiedLine: line,
          originalLineNumber: null,
          modifiedLineNumber: modLineIdx + 1,
          type: 'add',
        });
        modLineIdx++;
      }
    } else {
      // Equal lines
      for (let i = 0; i < contentLines.length; i++) {
        const origLine = originalLines[origLineIdx] || '';
        const modLine = modifiedLines[modLineIdx] || '';
        
        // Check if lines are truly equal or just similar
        if (origLine === modLine) {
          rows.push({
            originalLine: origLine,
            modifiedLine: modLine,
            originalLineNumber: origLineIdx + 1,
            modifiedLineNumber: modLineIdx + 1,
            type: 'equal',
          });
        } else {
          // Lines are modified - compute word-level diff
          const { originalWords, modifiedWords } = computeWordDiff(origLine, modLine);
          rows.push({
            originalLine: origLine,
            modifiedLine: modLine,
            originalLineNumber: origLineIdx + 1,
            modifiedLineNumber: modLineIdx + 1,
            type: 'modified',
            originalWords,
            modifiedWords,
          });
        }
        
        origLineIdx++;
        modLineIdx++;
      }
    }
  }

  return rows;
};

export const computeDiff = (original: string, modified: string): DiffLine[] => {
  const diffs = dmp.diff_main(original, modified);
  dmp.diff_cleanupSemantic(diffs);

  const lines: DiffLine[] = [];
  let lineNumber = 1;

  for (const [type, content] of diffs) {
    const contentLines = content.split('\n');
    
    for (let i = 0; i < contentLines.length; i++) {
      if (contentLines[i] || i < contentLines.length - 1) {
        lines.push({
          type: type === 1 ? 'add' : type === -1 ? 'remove' : 'equal',
          content: contentLines[i],
          lineNumber: lineNumber,
        });
        if (i < contentLines.length - 1) {
          lineNumber++;
        }
      }
    }
  }

  return lines;
};

export const calculateDiffStats = (original: string, modified: string): DiffResult => {
  const diffs = dmp.diff_main(original, modified);
  
  let added = 0;
  let removed = 0;
  let totalCharChanges = 0;

  for (const [type, content] of diffs) {
    if (type === 1) {
      added += content.length;
      totalCharChanges += content.length;
    } else if (type === -1) {
      removed += content.length;
      totalCharChanges += content.length;
    }
  }

  const originalLines = original.split('\n').length;
  const modifiedLines = modified.split('\n').length;
  const modified_count = Math.abs(originalLines - modifiedLines);

  return {
    added,
    removed,
    modified: modified_count,
    totalCharChanges,
  };
};

export const calculateDiffSummary = (original: string, modified: string): DiffSummary => {
  const diffs = dmp.diff_main(original, modified);
  
  let addedLines = 0;
  let deletedLines = 0;

  for (const [type, content] of diffs) {
    if (type === 1) {
      addedLines += content.split('\n').filter(line => line.length > 0).length;
    } else if (type === -1) {
      deletedLines += content.split('\n').filter(line => line.length > 0).length;
    }
  }

  const totalLines = Math.max(original.split('\n').length, modified.split('\n').length);
  const summary = `${addedLines} additions, ${deletedLines} deletions`;

  return {
    additions: addedLines,
    deletions: deletedLines,
    totalLines,
    summary,
  };
};

export const getMonacoLanguage = (language: string): string => {
  const languageMap: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    json: 'json',
    xml: 'xml',
    html: 'html',
    css: 'css',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    plaintext: 'plaintext',
  };
  return languageMap[language] || 'plaintext';
};

export const detectLanguage = (content: string): string => {
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      return 'javascript';
    }
  }
  if (content.trim().startsWith('<')) {
    return content.includes('<?xml') ? 'xml' : 'html';
  }
  return 'plaintext';
};
