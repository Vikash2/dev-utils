import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { computeDiff, computeSplitViewDiff, DiffLine, WordDiff } from '../utils/diffUtils';
import { motion } from 'framer-motion';

interface VisualDiffViewerProps {
  original: string;
  modified: string;
}

type ViewMode = 'split' | 'unified';

export const VisualDiffViewer: React.FC<VisualDiffViewerProps> = ({ original, modified }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const diffLines = computeDiff(original, modified);
  const splitViewRows = computeSplitViewDiff(original, modified);

  // Group diff lines by type for better visualization
  const groupedDiffs = diffLines.reduce(
    (acc, line, idx) => {
      const lastGroup = acc[acc.length - 1];
      if (lastGroup && lastGroup.type === line.type) {
        lastGroup.lines.push(line);
      } else {
        acc.push({ type: line.type, lines: [line], id: idx });
      }
      return acc;
    },
    [] as Array<{ type: 'add' | 'remove' | 'equal'; lines: DiffLine[]; id: number }>
  );

  const toggleSection = (id: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const renderDiffLine = (line: DiffLine, index: number) => {
    const baseClasses = 'px-4 py-2 font-mono text-sm break-words whitespace-pre-wrap flex items-start gap-2';
    
    switch (line.type) {
      case 'add':
        return (
          <div key={index} className={`${baseClasses} bg-green-900/30 dark:bg-green-900/30 text-green-100 border-l-4 border-green-500`}>
            <span className="text-green-500 font-bold flex-shrink-0 w-4 text-center">+</span>
            <span className="flex-1">{line.content}</span>
          </div>
        );
      case 'remove':
        return (
          <div key={index} className={`${baseClasses} bg-red-900/30 dark:bg-red-900/30 text-red-100 border-l-4 border-red-500`}>
            <span className="text-red-500 font-bold flex-shrink-0 w-4 text-center">−</span>
            <span className="flex-1">{line.content}</span>
          </div>
        );
      case 'equal':
        return (
          <div key={index} className={`${baseClasses} bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-l-4 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}>
            <span className="text-gray-500 dark:text-gray-600 flex-shrink-0 w-4 text-center"> </span>
            <span className="flex-1">{line.content}</span>
          </div>
        );
    }
  };

  // Render word-level diff with highlighting
  const renderWordDiff = (words: WordDiff[] | undefined, isOriginal: boolean) => {
    if (!words || words.length === 0) return null;

    return (
      <span>
        {words.map((word, idx) => {
          if (word.type === 'equal') {
            return <span key={idx}>{word.text}</span>;
          } else if (word.type === 'remove' && isOriginal) {
            return (
              <span key={idx} className="bg-red-500 text-white px-0.5 rounded">
                {word.text}
              </span>
            );
          } else if (word.type === 'add' && !isOriginal) {
            return (
              <span key={idx} className="bg-green-500 text-white px-0.5 rounded">
                {word.text}
              </span>
            );
          }
          return null;
        })}
      </span>
    );
  };

  const renderSplitView = () => {
    return (
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-2 gap-0 border-b border-gray-300 dark:border-gray-700">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-r border-gray-300 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Original</h3>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Modified</h3>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-96 overflow-y-auto">
          {splitViewRows.map((row, idx) => {
            const getRowClasses = (type: string, side: 'left' | 'right') => {
              const baseClasses = 'px-4 py-2 font-mono text-sm break-words whitespace-pre-wrap border-b border-gray-200 dark:border-gray-800 min-h-[2.5rem]';
              
              if (type === 'remove' && side === 'left') {
                return `${baseClasses} bg-red-900/20 dark:bg-red-900/20`;
              } else if (type === 'add' && side === 'right') {
                return `${baseClasses} bg-green-900/20 dark:bg-green-900/20`;
              } else if (type === 'modified') {
                return `${baseClasses} bg-yellow-900/10 dark:bg-yellow-900/10`;
              } else if (type === 'equal') {
                return `${baseClasses} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`;
              }
              return `${baseClasses} bg-gray-50 dark:bg-gray-900`;
            };

            const getGutterIndicator = (type: string, side: 'left' | 'right') => {
              if (type === 'remove' && side === 'left') {
                return <span className="text-red-500 font-bold">−</span>;
              } else if (type === 'add' && side === 'right') {
                return <span className="text-green-500 font-bold">+</span>;
              } else if (type === 'modified') {
                return <span className="text-yellow-500 font-bold">~</span>;
              }
              return <span className="text-gray-500"> </span>;
            };

            return (
              <div key={idx} className="grid grid-cols-2 gap-0">
                {/* Left Side - Original */}
                <div className={`${getRowClasses(row.type, 'left')} border-r border-gray-300 dark:border-gray-700`}>
                  {row.originalLine !== null ? (
                    <>
                      <span className="text-gray-500 dark:text-gray-600 mr-2 inline-block w-6 text-right">
                        {row.originalLineNumber}
                      </span>
                      <span className="inline-block w-4 text-center mr-2">
                        {getGutterIndicator(row.type, 'left')}
                      </span>
                      {row.type === 'modified' && row.originalWords ? (
                        renderWordDiff(row.originalWords, true)
                      ) : (
                        <span>{row.originalLine}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600 italic">
                      {/* Empty spacer for alignment */}
                    </span>
                  )}
                </div>

                {/* Right Side - Modified */}
                <div className={getRowClasses(row.type, 'right')}>
                  {row.modifiedLine !== null ? (
                    <>
                      <span className="text-gray-500 dark:text-gray-600 mr-2 inline-block w-6 text-right">
                        {row.modifiedLineNumber}
                      </span>
                      <span className="inline-block w-4 text-center mr-2">
                        {getGutterIndicator(row.type, 'right')}
                      </span>
                      {row.type === 'modified' && row.modifiedWords ? (
                        renderWordDiff(row.modifiedWords, false)
                      ) : (
                        <span>{row.modifiedLine}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600 italic">
                      {/* Empty spacer for alignment */}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUnifiedView = () => {
    return (
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-300 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Unified Diff</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {groupedDiffs.map((group) => (
            <motion.div key={group.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {group.type === 'equal' && group.lines.length > 3 ? (
                <div>
                  <button
                    onClick={() => toggleSection(group.id)}
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    {expandedSections.has(group.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    <span>{group.lines.length} unchanged lines</span>
                  </button>
                  {expandedSections.has(group.id) && (
                    <div>
                      {group.lines.map((line, idx) => renderDiffLine(line, idx))}
                    </div>
                  )}
                </div>
              ) : (
                group.lines.map((line, idx) => renderDiffLine(line, idx))
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  if (!original && !modified) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>Add code to both editors to see the visual diff</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('split')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            viewMode === 'split'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Split View
        </button>
        <button
          onClick={() => setViewMode('unified')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            viewMode === 'unified'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Unified View
        </button>
      </div>

      {/* Diff Viewer */}
      {viewMode === 'split' ? renderSplitView() : renderUnifiedView()}
    </motion.div>
  );
};
