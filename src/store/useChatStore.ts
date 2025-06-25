import { create } from 'zustand';
import type { ConversationMessage } from '@/types';
import { SupabaseService } from '@/services/supabase-service';

interface ChatState {
  messages: ConversationMessage[];
  isLoading: boolean;
  isTyping: boolean;
  
  // Actions
  loadConversationHistory: () => Promise<void>;
  addMessage: (message: Omit<ConversationMessage, 'id' | 'created_at'>) => Promise<void>;
  setTyping: (typing: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  isTyping: false,

  loadConversationHistory: async () => {
    set({ isLoading: true });
    
    try {
      const messages = await SupabaseService.getConversationHistory();
      set({ messages, isLoading: false });
    } catch (error) {
      console.error('Error loading conversation history:', error);
      set({ isLoading: false });
    }
  },

  addMessage: async (messageData) => {
    // Optimistically add message to local state
    const tempMessage: ConversationMessage = {
      ...messageData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    set((state) => ({
      messages: [...state.messages, tempMessage]
    }));

    // Save to database
    try {
      const savedMessage = await SupabaseService.saveMessage(messageData);
      
      if (savedMessage) {
        // Replace temp message with saved message
        set((state) => ({
          messages: state.messages.map(msg => 
            msg.id === tempMessage.id ? savedMessage : msg
          )
        }));
      }
    } catch (error) {
      console.error('Error saving message:', error);
      // Keep the optimistic message even if save fails
    }
  },

  setTyping: (typing) => {
    set({ isTyping: typing });
  },

  clearMessages: () => {
    set({ messages: [] });
  }
}));