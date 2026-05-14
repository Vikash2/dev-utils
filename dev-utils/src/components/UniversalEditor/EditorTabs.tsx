import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { EditorTab } from '../../store/editorStore';

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onTabRename?: (id: string, newName: string) => void;
  onNewTab?: () => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onTabRename,
  onNewTab,
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!tabsContainerRef.current) return;
    const scrollAmount = 200;
    const newPosition =
      direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
    setScrollPosition(newPosition);
    tabsContainerRef.current.scrollLeft = newPosition;
  };

  const handleRenameStart = (tab: EditorTab) => {
    setRenamingId(tab.id);
    setNewName(tab.name);
  };

  const handleRenameSave = (id: string) => {
    if (onTabRename && newName.trim()) {
      onTabRename(id, newName.trim());
    }
    setRenamingId(null);
  };

  const handleCloseTab = (id: string) => {
    // Prevent closing the last tab - instead clear it
    if (tabs.length === 1) {
      // Just clear the content instead of closing
      return;
    }
    onTabClose(id);
  };

  if (tabs.length === 0) {
    return (
      <div className="h-12 bg-gray-900 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-500">
        No files open
      </div>
    );
  }

  return (
    <div className="h-12 bg-gray-900 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-700 flex items-center gap-1 px-2 overflow-hidden">
      {/* Scroll Left Button */}
      {tabs.length > 4 && (
        <button
          onClick={() => handleScroll('left')}
          className="p-1 hover:bg-gray-800 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
          title="Scroll tabs left"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft size={16} className="text-gray-400 dark:text-gray-400" />
        </button>
      )}

      {/* Tabs Container - Scrollable */}
      <div
        ref={tabsContainerRef}
        className="flex-1 flex gap-1 overflow-x-auto scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="popLayout">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-t cursor-pointer whitespace-nowrap transition-all group ${
                activeTabId === tab.id
                  ? 'bg-gray-700 dark:bg-gray-700 text-white dark:text-white border-b-2 border-blue-500 dark:border-blue-500 shadow-lg font-semibold'
                  : 'bg-gray-800/40 dark:bg-gray-800/40 text-gray-400 dark:text-gray-400 hover:bg-gray-800/70 dark:hover:bg-gray-800/70 hover:text-gray-300 dark:hover:text-gray-300'
              }`}
              onClick={() => onTabClick(tab.id)}
              onDoubleClick={() => handleRenameStart(tab)}
            >
              {renamingId === tab.id ? (
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => handleRenameSave(tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSave(tab.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-700 dark:bg-gray-700 text-white dark:text-white px-2 py-1 rounded text-sm outline-none border border-blue-500 dark:border-blue-500"
                />
              ) : (
                <>
                  <span className="text-sm font-medium">{tab.name}</span>
                  {tab.isDirty && (
                    <div
                      className="w-2 h-2 bg-yellow-500 dark:bg-yellow-500 rounded-full"
                      title="Unsaved changes"
                      aria-label="Unsaved changes"
                    />
                  )}
                </>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(tab.id);
                }}
                className={`p-0.5 rounded transition-colors ${
                  tabs.length === 1
                    ? 'opacity-0 cursor-default'
                    : 'hover:bg-gray-700 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100'
                }`}
                title={tabs.length === 1 ? 'Cannot close last tab' : 'Close tab'}
                aria-label={tabs.length === 1 ? 'Cannot close last tab' : 'Close tab'}
                disabled={tabs.length === 1}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        className="p-1 hover:bg-gray-800 dark:hover:bg-gray-800 rounded transition-colors ml-1"
        title="New Tab"
        aria-label="New Tab"
      >
        <Plus size={16} className="text-gray-400 dark:text-gray-400" />
      </button>

      {/* Scroll Right Button */}
      {tabs.length > 4 && (
        <button
          onClick={() => handleScroll('right')}
          className="p-1 hover:bg-gray-800 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
          title="Scroll tabs right"
          aria-label="Scroll tabs right"
        >
          <ChevronRight size={16} className="text-gray-400 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
};
