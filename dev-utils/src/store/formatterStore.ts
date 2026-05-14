import { create } from 'zustand';
import { FormatterState } from '../types';

export const useFormatterStore = create<FormatterState>((set) => ({
  input: '',
  output: '',
  setInput: (input: string) => set({ input }),
  setOutput: (output: string) => set({ output }),
  clear: () => set({ input: '', output: '' }),
}));
