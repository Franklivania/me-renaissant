import { SupabaseService } from './supabase-service';
import type { ChessGame, ChessMove } from '@/types';

interface ChessGameSession {
  id: string;
  gameSettings: {
    timeLimit: number | null;
    difficulty: 'easy' | 'medium' | 'hard';
    playerColor: 'white' | 'black';
  };
  currentFen: string;
  moves: ChessMove[];
  capturedPieces: { white: string[], black: string[] };
  whiteTime: number | null;
  blackTime: number | null;
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'timeout';
  currentTurn: 'white' | 'black';
  lastMoveTime: number;
  winner: string | null;
}

interface GameSettings {
  timeLimit: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  playerColor: 'white' | 'black';
}

export class ChessSessionService {
  private static readonly STORAGE_KEY = 'chess_game_session';

  // Save game session to both localStorage and Supabase (for custom/casual games)
  static async saveGameSession(session: ChessGameSession): Promise<void> {
    try {
      // Always save to localStorage for immediate access
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

      // Save to Supabase only for custom/casual games
      const { gameSettings } = session;
      if (gameSettings.timeLimit === null || gameSettings.timeLimit >= 600) { // Casual or 10+ minutes
        const gameData: Partial<ChessGame> = {
          game_mode: gameSettings.timeLimit === null ? 'casual' : 'custom',
          time_limit: gameSettings.timeLimit,
          player_color: gameSettings.playerColor,
          current_fen: session.currentFen,
          moves: session.moves,
          captured_pieces: session.capturedPieces,
          game_status: 
            session.gameStatus === "playing" ? "active" :
            session.gameStatus === "timeout" ? "draw" :
            session.gameStatus,
          winner: session.winner,
          white_time_remaining: session.whiteTime,
          black_time_remaining: session.blackTime
        };

        if (session.id) {
          await SupabaseService.updateChessGame(session.id, gameData);
        } else {
          const savedGame = await SupabaseService.createChessGame(gameData);
          if (savedGame) {
            session.id = savedGame.id;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
          }
        }
      }
    } catch {
      // Error handled silently
    }
  }

  // Load game session from localStorage or Supabase
  static async loadGameSession(): Promise<ChessGameSession | null> {
    try {
      // First try localStorage
      const localSession = localStorage.getItem(this.STORAGE_KEY);
      if (localSession) {
        const session = JSON.parse(localSession) as ChessGameSession;
        
        // If it's a custom/casual game, try to sync with Supabase
        if (session.gameSettings.timeLimit === null || session.gameSettings.timeLimit >= 600) {
          const supabaseGame = await SupabaseService.getActiveChessGame();
          if (supabaseGame && supabaseGame.id === session.id) {
            // Update local session with Supabase data if it's newer
            if (new Date(supabaseGame.updated_at).getTime() > session.lastMoveTime) {
              return this.convertSupabaseToSession(supabaseGame);
            }
          }
        }
        
        return session;
      }

      // If no local session, try Supabase
      const supabaseGame = await SupabaseService.getActiveChessGame();
      if (supabaseGame) {
        return this.convertSupabaseToSession(supabaseGame);
      }

      return null;
    } catch {
      return null;
    }
  }

  // Clear game session
  static async clearGameSession(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // Error handled silently
    }
  }

  // Save only game outcome for quick games
  static async saveGameOutcome(gameSettings: GameSettings, winner: string, moves: ChessMove[]): Promise<void> {
    try {
      const gameData: Partial<ChessGame> = {
        game_mode: 'quick',
        time_limit: gameSettings.timeLimit,
        player_color: gameSettings.playerColor,
        game_status: 'draw', // Use 'draw' instead of 'completed'
        winner: winner,
        moves: moves.slice(-10) // Only save last 10 moves for quick games
      };

      await SupabaseService.createChessGame(gameData);
    } catch {
      // Error handled silently
    }
  }

  // Convert Supabase game to session format
  private static convertSupabaseToSession(game: ChessGame): ChessGameSession {
    return {
      id: game.id,
      gameSettings: {
        timeLimit: game.time_limit,
        difficulty: 'medium', // Default difficulty for loaded games
        playerColor: game.player_color
      },
      currentFen: game.current_fen,
      moves: game.moves || [],
      capturedPieces: game.captured_pieces || { white: [], black: [] },
      whiteTime: game.white_time_remaining,
      blackTime: game.black_time_remaining,
      gameStatus: game.game_status as ChessGameSession['gameStatus'],
      currentTurn: game.current_fen.includes(' w ') ? 'white' : 'black',
      lastMoveTime: new Date(game.updated_at).getTime(),
      winner: game.winner
    };
  }

  // Check if there's an active session
  static hasActiveSession(): boolean {
    try {
      const session = localStorage.getItem(this.STORAGE_KEY);
      if (session) {
        const parsed = JSON.parse(session) as ChessGameSession;
        return parsed.gameStatus === 'playing';
      }
      return false;
    } catch {
      return false;
    }
  }
}