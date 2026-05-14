import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, File, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidePanelProps {
  recentFiles: string[];
  onRecentFileClick: (filename: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  recentFiles,
  onRecentFileClick,
  isOpen,
  onToggle,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    recent: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 256 : 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="overflow-hidden bg-gray-900 border-r border-gray-700 flex flex-col"
    >
      {/* Sidebar Header with Close Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-white font-semibold whitespace-nowrap">Navigation</h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white flex-shrink-0"
          title="Collapse sidebar (Cmd+B)"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Recent Files Section */}
        <div>
          <button
            onClick={() => toggleSection('recent')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition-colors text-white font-medium"
          >
            {expandedSections.recent ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <Clock size={16} />
            <span>Recent Files</span>
          </button>

          <AnimatePresence>
            {expandedSections.recent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1 pl-4"
              >
                {recentFiles.length === 0 ? (
                  <p className="text-gray-500 text-sm py-2">No recent files</p>
                ) : (
                  recentFiles.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => onRecentFileClick(file)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors text-gray-300 hover:text-white text-sm flex items-center gap-2 truncate group"
                      title={file}
                    >
                      <File size={14} className="flex-shrink-0 group-hover:text-blue-400" />
                      <span className="truncate group-hover:text-blue-400">{file}</span>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
