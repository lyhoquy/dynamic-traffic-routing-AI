import { create } from 'zustand';
import type { ChatMessage } from '../types/chat';

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;

  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isOpen: false,
  isLoading: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m,
      ),
    })),

  clearMessages: () => set({ messages: [] }),
  setOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setLoading: (isLoading) => set({ isLoading }),
}));
