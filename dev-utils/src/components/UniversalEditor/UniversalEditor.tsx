import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useEditorStore } from '../../store/editorStore';
import { formatCode, minifyCode, beautifyCode } from '../../utils/formatter';
import { validateCode } from '../../utils/validator';
import { downloadFile, copyToClipboard } from '../../utils/fileUtils';
import { MonacoEditorWrapper } from './MonacoEditorWrapper';
import { EditorTabs } from './EditorTabs';
import { EditorToolbar } from './EditorToolbar';
import { FileUploader } from './FileUploader';
import { PasteModal } from './PasteModal';
import { ValidationPanel } from './ValidationPanel';
import type { ValidationError } from '../../utils/validator';

interface UniversalEditorProps {
  isEmbedded?: boolean;
}

export const UniversalEditor: React.FC<UniversalEditorProps> = ({ isEmbedded = false }) => {
  const {
    tabs,
    activeTabId,
    theme,
    fontSize,
    wordWrap,
    showMinimap,
    addTab,
    removeTab,
    updateTab,
    setActiveTab,
    setTheme,
    setFontSize,
    toggleWordWrap,
    toggleMinimap,
    addRecentFile,
    renameTab,
  } = useEditorStore();

  const [showFileUploader, setShowFileUploader] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | 'warning' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Initialize editor with empty tab on first load
  useEffect(() => {
    if (tabs.length === 0) {
      // Try to restore from localStorage
      const savedData = localStorage.getItem('editor-autosave');
      if (savedData) {
        try {
          const { tabs: savedTabs } = JSON.parse(savedData);
          if (savedTabs && savedTabs.length > 0) {
            savedTabs.forEach((tab: any) => {
              addTab({
                name: tab.name,
                content: tab.content,
                language: tab.language,
                extension: tab.extension,
              });
            });
            return;
          }
        } catch (error) {
          console.error('Failed to restore auto-saved content:', error);
        }
      }

      // Create empty tab if no saved data
      addTab({
        name: 'Untitled.txt',
        content: '',
        language: 'plaintext',
        extension: 'txt',
      });
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (activeTab) {
      const autoSaveData = {
        tabs: tabs.map((t) => ({
          name: t.name,
          content: t.content,
          language: t.language,
          extension: t.extension,
        })),
        activeTabId,
      };
      localStorage.setItem('editor-autosave', JSON.stringify(autoSaveData));
    }
  }, [tabs, activeTabId]);

  // Handle file upload
  const handleFilesSelected = useCallback(
    (files: Array<{ name: string; content: string; language: string }>) => {
      files.forEach((file) => {
        addTab({
          name: file.name,
          content: file.content,
          language: file.language as any,
          extension: file.name.split('.').pop() || '',
        });
        addRecentFile(file.name);
      });
    },
    [addTab, addRecentFile]
  );

  // Handle paste
  const handlePaste = useCallback(
    (content: string, filename: string, language: string) => {
      addTab({
        name: filename,
        content,
        language: language as any,
        extension: filename.split('.').pop() || '',
      });
      addRecentFile(filename);
    },
    [addTab, addRecentFile]
  );

  // Handle content change
  const handleContentChange = useCallback(
    (content: string) => {
      if (activeTabId) {
        updateTab(activeTabId, { content });
      }
    },
    [activeTabId, updateTab]
  );

  // Handle language change
  const handleLanguageChange = useCallback(
    (language: string) => {
      if (activeTabId) {
        updateTab(activeTabId, { language: language as any });
      }
    },
    [activeTabId, updateTab]
  );

  // Handle new tab
  const handleNewTab = useCallback(() => {
    addTab({
      name: `Untitled-${tabs.length + 1}.txt`,
      content: '',
      language: 'plaintext',
      extension: 'txt',
    });
  }, [addTab, tabs.length]);

  // Format code
  const handleFormat = useCallback(async () => {
    if (!activeTab) return;
    setIsLoading(true);
    try {
      const formatted = await formatCode(activeTab.content, activeTab.language as any);
      updateTab(activeTabId!, { content: formatted });
    } catch (error) {
      console.error('Format error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, activeTabId, updateTab]);

  // Minify code
  const handleMinify = useCallback(() => {
    if (!activeTab) return;
    try {
      const minified = minifyCode(activeTab.content, activeTab.language as any);
      updateTab(activeTabId!, { content: minified });
    } catch (error) {
      console.error('Minify error:', error);
    }
  }, [activeTab, activeTabId, updateTab]);

  // Beautify code
  const handleBeautify = useCallback(() => {
    if (!activeTab) return;
    try {
      const beautified = beautifyCode(activeTab.content, activeTab.language as any);
      updateTab(activeTabId!, { content: beautified });
    } catch (error) {
      console.error('Beautify error:', error);
    }
  }, [activeTab, activeTabId, updateTab]);

  // Validate code
  const handleValidate = useCallback(() => {
    if (!activeTab) return;
    const result = validateCode(activeTab.content, activeTab.language as any);
    setValidationErrors(result.errors);
    setValidationStatus(
      result.isValid ? 'valid' : result.errors.some((e) => e.severity === 'error') ? 'invalid' : 'warning'
    );
    setShowValidation(true);
  }, [activeTab]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!activeTab) return;
    try {
      await copyToClipboard(activeTab.content);
    } catch (error) {
      console.error('Copy error:', error);
    }
  }, [activeTab]);

  // Clear content
  const handleClear = useCallback(() => {
    if (!activeTabId) return;
    if (confirm('Are you sure you want to clear this file?')) {
      updateTab(activeTabId, { content: '' });
    }
  }, [activeTabId, updateTab]);

  // Download file
  const handleDownload = useCallback(() => {
    if (!activeTab) return;
    const filename = activeTab.name;
    downloadFile(activeTab.content, filename);
  }, [activeTab]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleDownload();
            break;
          case 'shift':
            if (e.shiftKey && e.key === 'F') {
              e.preventDefault();
              handleFormat();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDownload, handleFormat]);

  if (!activeTab) {
    return (
      <div className={`${isEmbedded ? 'flex-1' : 'w-full h-screen'} bg-gray-900 flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Loading Editor...</h1>
          <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isEmbedded ? 'flex-1' : 'w-full h-screen'} bg-gray-900 flex flex-col overflow-hidden`}>
      {/* Toolbar */}
      <EditorToolbar
        onOpenFile={() => setShowFileUploader(true)}
        onPaste={() => setShowPasteModal(true)}
        onSaveFile={handleDownload}
        onFormat={handleFormat}
        onMinify={handleMinify}
        onBeautify={handleBeautify}
        onValidate={handleValidate}
        onCopy={handleCopy}
        onClear={handleClear}
        onDownload={handleDownload}
        onUndo={() => {}}
        onRedo={() => {}}
        language={activeTab.language as any}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        wordWrap={wordWrap}
        onWordWrapToggle={toggleWordWrap}
        showMinimap={showMinimap}
        onMinimapToggle={toggleMinimap}
        validationStatus={validationStatus}
        isLoading={isLoading}
      />

      {/* Tabs */}
      <EditorTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={setActiveTab}
        onTabClose={removeTab}
        onTabRename={renameTab}
        onNewTab={handleNewTab}
      />

      {/* File Name Display */}
      {activeTab && (
        <div className="h-8 bg-gray-800 border-b border-gray-700 px-4 flex items-center">
          <span className="text-xs text-gray-400">
            Editing: <span className="text-gray-300 font-medium">{activeTab.name}</span>
          </span>
        </div>
      )}

      {/* Main Content - Full Width Editor */}
      <div className="flex-1 flex overflow-hidden">
        <MonacoEditorWrapper
          key={activeTabId} // Force re-render when switching tabs
          value={activeTab.content}
          language={activeTab.language as any}
          onChange={handleContentChange}
          theme={theme}
          fontSize={fontSize}
          wordWrap={wordWrap}
          showMinimap={showMinimap}
        />
      </div>

      {/* Validation Panel */}
      <AnimatePresence>
        {showValidation && (
          <ValidationPanel
            errors={validationErrors}
            isOpen={showValidation}
            onClose={() => setShowValidation(false)}
          />
        )}
      </AnimatePresence>

      {/* File Uploader Modal */}
      <AnimatePresence>
        {showFileUploader && (
          <FileUploader
            isOpen={showFileUploader}
            onClose={() => setShowFileUploader(false)}
            onFilesSelected={handleFilesSelected}
          />
        )}
      </AnimatePresence>

      {/* Paste Modal */}
      <AnimatePresence>
        {showPasteModal && (
          <PasteModal
            isOpen={showPasteModal}
            onClose={() => setShowPasteModal(false)}
            onPaste={handlePaste}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
