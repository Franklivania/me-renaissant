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
        return null;
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
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile:', error);
        return null;
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
        return null;
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
      const { data, error } = await supabase
        .from('conversations')
        .insert(message)
        .select()
        .single();

      if (error) {
        console.error('Error saving message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveMessage:', error);
      return null;
    }
  }

  static async getConversationHistory(): Promise<ConversationMessage[]> {
    try {
      const sessionId = this.getSessionId();
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching conversation history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConversationHistory:', error);
      return [];
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
        return null;
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
        return null;
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
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active chess game:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getActiveChessGame:', error);
      return null;
    }
  }
}