export interface UserProfile {
  id: string;
  session_id: string;
  name: string | null;
  gender: string | null;
  role: string | null;
  drink: string | null;
  hobbies: string[] | null;
  soul_question: string | null;
  doppelganger_name: string | null;
  doppelganger_title: string | null;
  renaissance_occupation: string | null;
  description: string | null;
  created_at: string | null;
}

export interface DoppelgangerPersona {
  name: string;
  title: string;
  occupation: string;
  description: string;
  personality_traits: string[];
  speaking_style: 'formal' | 'poetic' | 'mystical' | 'scholarly';
  background_story: string;
}

export interface OnboardingData {
  name: string;
  gender: string;
  role: string;
  drink: string;
  hobbies: string[];
  preferredHome: string;
  soulQuestion: string;
}

export interface ConversationMessage {
  id: string;
  session_id: string;
  persona_id: string | null;
  sender: 'user' | 'doppelganger';
  message: string;
  created_at: string;
}

export interface ChessGame {
  id: string;
  session_id: string;
  game_mode: string;
  time_limit: number | null;
  player_color: 'white' | 'black';
  current_fen: string;
  moves: ChessMove[];
  captured_pieces: {
    black: string[];
    white: string[];
  };
  game_status: 'active' | 'checkmate' | 'stalemate' | 'draw';
  winner: string | null;
  white_time_remaining: number | null;
  black_time_remaining: number | null;
  created_at: string;
  updated_at: string;
}

export interface ChessMove {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  san: string;
  fen: string;
  timestamp: number;
  analysis?: string;
}

// Chess-specific types for strict typing
export type ChessColor = 'white' | 'black';
export type ChessPiece = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type GameStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'timeout';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameSettings {
  timeLimit: number | null;
  difficulty: Difficulty;
  playerColor: ChessColor;
}

export interface MoveAnalysis {
  quality: 'excellent' | 'good' | 'questionable' | 'poor';
  comment: string;
  tactical?: boolean;
  positional?: boolean;
}