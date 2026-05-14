import { create } from 'zustand';
import { EditorState, Language } from '../types';

export const useDiffStore = create<EditorState>((set) => ({
  leftCode: '',
  rightCode: '',
  language: 'javascript',
  setLeftCode: (code: string) => set({ leftCode: code }),
  setRightCode: (code: string) => set({ rightCode: code }),
  setLanguage: (lang: Language) => set({ language: lang }),
  clear: () => set({ leftCode: '', rightCode: '' }),
}));
