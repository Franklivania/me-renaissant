import { create } from 'zustand';
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
  
  // Actions
  loadConversations: () => Promise<void>;
  loadConversationHistory: (conversationId?: string) => Promise<void>;
  addMessage: (message: Omit<ConversationMessage, 'id' | 'created_at'>) => Promise<void>;
  setTyping: (typing: boolean) => void;
  setCurrentConversation: (id: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  isTyping: false,

  loadConversations: async () => {
    try {
      const messages = await SupabaseService.getConversationHistory();
      
      // Group messages by persona_id to create conversation list
      const conversationMap = new Map<string, Conversation>();
      
      messages.forEach(msg => {
        const conversationId = msg.persona_id || 'default';
        
        if (!conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, {
            id: conversationId,
            title: conversationId === 'default' ? 'Main Conversation' : `Chat ${conversationId.slice(0, 8)}`,
            lastMessage: msg.message,
            lastMessageTime: msg.created_at,
            messageCount: 1
          });
        } else {
          const conv = conversationMap.get(conversationId)!;
          conv.lastMessage = msg.message;
          conv.lastMessageTime = msg.created_at;
          conv.messageCount++;
        }
      });

      const conversations = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

      set({ conversations });
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  },

  loadConversationHistory: async (conversationId?: string) => {
    set({ isLoading: true });
    
    try {
      const allMessages = await SupabaseService.getConversationHistory();
      
      // Filter messages by conversation ID if provided
      const messages = conversationId 
        ? allMessages.filter(msg => msg.persona_id === conversationId)
        : allMessages.filter(msg => !msg.persona_id || msg.persona_id === 'default');
      
      set({ 
        messages, 
        isLoading: false,
        currentConversationId: conversationId || null
      });
    } catch (error) {
      console.error('Error loading conversation history:', error);
      set({ isLoading: false });
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
          )
        }));
      }

      // Refresh conversations list
      get().loadConversations();
    } catch (error) {
      console.error('Error saving message:', error);
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
  }
}));