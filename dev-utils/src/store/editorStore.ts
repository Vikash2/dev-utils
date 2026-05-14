import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EditorTab {
  id: string;
  name: string;
  content: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
  extension: string;
}

export interface EditorState {
  tabs: EditorTab[];
  activeTabId: string | null;
  theme: 'dark' | 'light';
  fontSize: number;
  wordWrap: boolean;
  showMinimap: boolean;
  recentFiles: string[];
  autoSave: boolean;
  autoSaveInterval: number;
}

export interface EditorActions {
  addTab: (tab: Omit<EditorTab, 'id' | 'isDirty' | 'isActive'>) => void;
  removeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<EditorTab>) => void;
  setActiveTab: (id: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setFontSize: (size: number) => void;
  toggleWordWrap: () => void;
  toggleMinimap: () => void;
  addRecentFile: (filename: string) => void;
  clearTabs: () => void;
  renameTab: (id: string, newName: string) => void;
  setAutoSave: (enabled: boolean) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useEditorStore = create<EditorState & EditorActions>()(
  persist(
    (set) => ({
      tabs: [],
      activeTabId: null,
      theme: 'dark',
      fontSize: 14,
      wordWrap: true,
      showMinimap: true,
      recentFiles: [],
      autoSave: true,
      autoSaveInterval: 30000,

      addTab: (tab) =>
        set((state) => {
          const newTab: EditorTab = {
            ...tab,
            id: generateId(),
            isDirty: false,
            isActive: true,
          };

          return {
            tabs: state.tabs.map((t) => ({ ...t, isActive: false })).concat(newTab),
            activeTabId: newTab.id,
          };
        }),

      removeTab: (id) =>
        set((state) => {
          if (state.tabs.length === 1) {
            return {
              tabs: state.tabs.map((t) =>
                t.id === id ? { ...t, content: '', isDirty: false } : t
              ),
            };
          }

          const newTabs = state.tabs.filter((t) => t.id !== id);
          let newActiveId = state.activeTabId;

          if (state.activeTabId === id) {
            newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
          }

          return {
            tabs: newTabs,
            activeTabId: newActiveId,
          };
        }),

      updateTab: (id, updates) =>
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === id ? { ...t, ...updates, isDirty: true } : t
          ),
        })),

      setActiveTab: (id) =>
        set((state) => ({
          tabs: state.tabs.map((t) => ({
            ...t,
            isActive: t.id === id,
          })),
          activeTabId: id,
        })),

      setTheme: (theme) => set({ theme }),

      setFontSize: (size) => set({ fontSize: Math.max(10, Math.min(24, size)) }),

      toggleWordWrap: () => set((state) => ({ wordWrap: !state.wordWrap })),

      toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),

      addRecentFile: (filename) =>
        set((state) => ({
          recentFiles: [
            filename,
            ...state.recentFiles.filter((f) => f !== filename),
          ].slice(0, 10),
        })),

      clearTabs: () =>
        set({
          tabs: [],
          activeTabId: null,
        }),

      renameTab: (id, newName) =>
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === id ? { ...t, name: newName } : t
          ),
        })),

      setAutoSave: (enabled) => set({ autoSave: enabled }),
    }),
    {
      name: 'editor-store',
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        wordWrap: state.wordWrap,
        showMinimap: state.showMinimap,
        recentFiles: state.recentFiles,
        autoSave: state.autoSave,
      }),
    }
  )
);
