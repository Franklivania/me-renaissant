import { supabase } from '@/lib/supabase';
import type { UserProfile, ConversationMessage, ChessGame } from '@/types';

export class SupabaseService {
  // Generate or get session ID
  static getSessionId(): string {
    let sessionId = localStorage.getItem('renaissance_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('renaissance_session_id', sessionId);
    }
    return sessionId;
  }

  // Test connection
  static async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  }

  // Profile operations
  static async createProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const sessionId = this.getSessionId();
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          session_id: sessionId,
          ...profileData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return null;
    }
  }

  static async getProfile(): Promise<UserProfile | null> {
    try {
      const sessionId = this.getSessionId();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const sessionId = this.getSessionId();
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('session_id', sessionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return null;
    }
  }

  // Conversation operations
  static async saveMessage(message: Omit<ConversationMessage, 'id' | 'created_at'>): Promise<ConversationMessage | null> {
    try {
      const sessionId = this.getSessionId();
      
      const messageData = {
        ...message,
        session_id: sessionId
      };

      const { data, error } = await supabase
        .from('conversations')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Error saving message:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in saveMessage:', error);
      return null;
    }
  }

  static async getConversationHistory(conversationId?: string): Promise<ConversationMessage[]> {
    try {
      const sessionId = this.getSessionId();
      
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      // Filter by conversation ID if provided
      if (conversationId) {
        query = query.eq('persona_id', conversationId);
      } else {
        // For default conversation, get messages with null persona_id
        query = query.is('persona_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching conversation history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConversationHistory:', error);
      return [];
    }
  }

  static async getConversationsList(): Promise<Array<{
    id: string;
    title: string;
    lastMessage: string;
    lastMessageTime: string;
    messageCount: number;
  }>> {
    try {
      const sessionId = this.getSessionId();
      
      const { data, error } = await supabase
        .from('conversations')
        .select('persona_id, message, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations list:', error);
        throw error;
      }

      // Group messages by persona_id to create conversation list
      const conversationMap = new Map();
      
      data?.forEach(msg => {
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
          const conv = conversationMap.get(conversationId);
          // Only update if this message is more recent
          if (new Date(msg.created_at) > new Date(conv.lastMessageTime)) {
            conv.lastMessage = msg.message;
            conv.lastMessageTime = msg.created_at;
          }
          conv.messageCount++;
        }
      });

      return Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    } catch (error) {
      console.error('Error in getConversationsList:', error);
      return [];
    }
  }

  static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const sessionId = this.getSessionId();
      
      // Delete all messages for this conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('session_id', sessionId)
        .eq('persona_id', conversationId);

      if (error) {
        console.error('Error deleting conversation from Supabase:', error);
        throw error;
      }

      console.log(`Successfully deleted conversation ${conversationId} from Supabase`);
      return true;
    } catch (error) {
      console.error('Error in deleteConversation:', error);
      return false;
    }
  }

  // Chess game operations
  static async createChessGame(gameData: Partial<ChessGame>): Promise<ChessGame | null> {
    try {
      const sessionId = this.getSessionId();
      
      const { data, error } = await supabase
        .from('chess_games')
        .insert({
          session_id: sessionId,
          ...gameData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chess game:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createChessGame:', error);
      return null;
    }
  }

  static async updateChessGame(gameId: string, updates: Partial<ChessGame>): Promise<ChessGame | null> {
    try {
      const { data, error } = await supabase
        .from('chess_games')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId)
        .select()
        .single();

      if (error) {
        console.error('Error updating chess game:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateChessGame:', error);
      return null;
    }
  }

  static async getActiveChessGame(): Promise<ChessGame | null> {
    try {
      const sessionId = this.getSessionId();
      
      const { data, error } = await supabase
        .from('chess_games')
        .select('*')
        .eq('session_id', sessionId)
        .eq('game_status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching active chess game:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getActiveChessGame:', error);
      return null;
    }
  }

  // Real-time subscriptions
  static subscribeToConversations(
    callback: (payload: RealtimePayload) => void,
    conversationId?: string
  ) {
    const sessionId = this.getSessionId();
    
    let channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `session_id=eq.${sessionId}`
        },
        callback
      );

    if (conversationId) {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `persona_id=eq.${conversationId}`
        },
        callback
      );
    }

    channel.subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }
}

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  schema: string;
  table: string;
}