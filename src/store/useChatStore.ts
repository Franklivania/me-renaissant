import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConversationMessage } from '@/types';
import { SupabaseService } from '@/services/supabase-service';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
}

interface ChatState {
  messages: ConversationMessage[];
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  isTyping: boolean;
  isConnected: boolean;
  
  // Actions
  initializeChat: () => Promise<void>;
  loadConversations: () => Promise<void>;
  loadConversationHistory: (conversationId?: string) => Promise<void>;
  addMessage: (message: Omit<ConversationMessage, 'id' | 'created_at'>) => Promise<void>;
  setTyping: (typing: boolean) => void;
  setCurrentConversation: (id: string | null) => void;
  clearMessages: () => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  testConnection: () => Promise<boolean>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      isTyping: false,
      isConnected: false,

      initializeChat: async () => {
        const connected = await get().testConnection();
        set({ isConnected: connected });
        
        if (connected) {
          await get().loadConversations();
        }
      },

      testConnection: async () => {
        try {
          const connected = await SupabaseService.testConnection();
          set({ isConnected: connected });
          return connected;
        } catch (error) {
          console.error('Connection test failed:', error);
          set({ isConnected: false });
          return false;
        }
      },

      loadConversations: async () => {
        try {
          const conversations = await SupabaseService.getConversationsList();
          set({ conversations });
        } catch (error) {
          console.error('Error loading conversations:', error);
          set({ isConnected: false });
        }
      },

      loadConversationHistory: async (conversationId?: string) => {
        set({ isLoading: true });
        
        try {
          const messages = await SupabaseService.getConversationHistory(conversationId);
          
          set({ 
            messages, 
            isLoading: false,
            currentConversationId: conversationId || null,
            isConnected: true
          });
        } catch (error) {
          console.error('Error loading conversation history:', error);
          set({ isLoading: false, isConnected: false });
        }
      },

      addMessage: async (messageData) => {
        const { currentConversationId } = get();
        
        // Use current conversation ID or generate new one
        const conversationId = currentConversationId || crypto.randomUUID();
        
        const messageWithConversation = {
          ...messageData,
          session_id: SupabaseService.getSessionId(),
          persona_id: conversationId
        };

        // Optimistically add message to local state
        const tempMessage: ConversationMessage = {
          ...messageWithConversation,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        };

        set((state) => ({
          messages: [...state.messages, tempMessage],
          currentConversationId: conversationId
        }));

        // Save to database
        try {
          const savedMessage = await SupabaseService.saveMessage(messageWithConversation);
          
          if (savedMessage) {
            // Replace temp message with saved message
            set((state) => ({
              messages: state.messages.map(msg => 
                msg.id === tempMessage.id ? savedMessage : msg
              ),
              isConnected: true
            }));
          }

          // Refresh conversations list
          await get().loadConversations();
        } catch (error) {
          console.error('Error saving message:', error);
          set({ isConnected: false });
          // Keep the optimistic message even if save fails
        }
      },

      setTyping: (typing) => {
        set({ isTyping: typing });
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },

      clearMessages: () => {
        set({ messages: [], currentConversationId: null });
      },

      deleteConversation: async (conversationId) => {
        try {
          const success = await SupabaseService.deleteConversation(conversationId);
          
          if (success) {
            // Remove from local state
            set((state) => ({
              conversations: state.conversations.filter(conv => conv.id !== conversationId),
              messages: state.currentConversationId === conversationId ? [] : state.messages,
              currentConversationId: state.currentConversationId === conversationId ? null : state.currentConversationId
            }));
          }
          
          return success;
        } catch (error) {
          console.error('Error deleting conversation:', error);
          return false;
        }
      }
    }),
    {
      name: 'renaissance-chat-store',
      partialize: (state) => ({
        currentConversationId: state.currentConversationId,
        conversations: state.conversations
      })
    }
  )
);