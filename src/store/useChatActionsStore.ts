import { create } from 'zustand';

interface ChatActionsState {
  activeDropdown: string | null;
  setActiveDropdown: (conversationId: string | null) => void;
  closeDropdown: () => void;
}

export const useChatActionsStore = create<ChatActionsState>((set) => ({
  activeDropdown: null,
  setActiveDropdown: (conversationId) => set({ activeDropdown: conversationId }),
  closeDropdown: () => set({ activeDropdown: null }),
}));