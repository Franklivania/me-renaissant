import { Chess } from 'chess.js';

export class ChessEngine {
  private static readonly PIECE_VALUES: { [key: string]: number } = {
    'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
  };

  static async getBestMove(fen: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<any> {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });
    
    if (moves.length === 0) return null;

    switch (difficulty) {
      case 'easy':
        return this.getEasyMove(game, moves);
      case 'medium':
        return this.getMediumMove(game, moves);
      case 'hard':
        return this.getHardMove(game, moves);
      default:
        return moves[Math.floor(Math.random() * moves.length)];
    }
  }

  private static getEasyMove(game: Chess, moves: any[]): any {
    // Easy mode: 60% random moves, 40% basic strategy
    if (Math.random() < 0.6) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // Basic strategy: prefer captures, avoid hanging pieces
    const captures = moves.filter(move => move.captured);
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    }

    // Avoid moves that hang pieces
    const safeMoves = moves.filter(move => {
      const tempGame = new Chess(game.fen());
      tempGame.move(move);
      return !this.isPieceHanging(tempGame, move.to);
    });

    return safeMoves.length > 0 
      ? safeMoves[Math.floor(Math.random() * safeMoves.length)]
      : moves[Math.floor(Math.random() * moves.length)];
  }

  private static getMediumMove(game: Chess, moves: any[]): any {
    // Medium mode: basic evaluation with some randomness
    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of moves) {
      let score = 0;

      // Capture value
      if (move.captured) {
        score += this.PIECE_VALUES[move.captured] * 10;
      }

      // Check bonus
      const tempGame = new Chess(game.fen());
      tempGame.move(move);
      if (tempGame.inCheck()) {
        score += 5;
      }

      // Checkmate bonus
      if (tempGame.isCheckmate()) {
        score += 1000;
      }

      // Center control
      const centerSquares = ['d4', 'e4', 'd5', 'e5'];
      if (centerSquares.includes(move.to)) {
        score += 2;
      }

      // Piece development (early game)
      if (game.moveNumber() < 10) {
        if (move.piece === 'n' || move.piece === 'b') {
          score += 3;
        }
      }

      // Add some randomness
      score += Math.random() * 2;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove || moves[Math.floor(Math.random() * moves.length)];
  }

  private static getHardMove(game: Chess, moves: any[]): any {
    // Hard mode: minimax with alpha-beta pruning (depth 3)
    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of moves) {
      const tempGame = new Chess(game.fen());
      tempGame.move(move);
      
      const score = this.minimax(tempGame, 2, -Infinity, Infinity, false);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove || moves[Math.floor(Math.random() * moves.length)];
  }

  private static minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0 || game.isGameOver()) {
      return this.evaluatePosition(game);
    }

    const moves = game.moves({ verbose: true });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const tempGame = new Chess(game.fen());
        tempGame.move(move);
        const eval_ = this.minimax(tempGame, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const tempGame = new Chess(game.fen());
        tempGame.move(move);
        const eval_ = this.minimax(tempGame, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return minEval;
    }
  }

  private static evaluatePosition(game: Chess): number {
    if (game.isCheckmate()) {
      return game.turn() === 'w' ? -1000 : 1000;
    }
    if (game.isDraw()) {
      return 0;
    }

    let score = 0;
    const board = game.board();

    // Material evaluation
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const value = this.PIECE_VALUES[piece.type] || 0;
          score += piece.color === 'w' ? value : -value;
        }
      }
    }

    // Positional bonuses
    const moves = game.moves({ verbose: true });
    score += game.turn() === 'w' ? moves.length * 0.1 : -moves.length * 0.1;

    return score;
  }

  private static isPieceHanging(game: Chess, square: string): boolean {
    const piece = game.get(square);
    if (!piece) return false;

    const attackers = this.getAttackers(game, square, piece.color === 'w' ? 'b' : 'w');
    const defenders = this.getAttackers(game, square, piece.color);

    return attackers.length > defenders.length;
  }

  private static getAttackers(game: Chess, square: string, color: 'w' | 'b'): string[] {
    const attackers: string[] = [];
    const moves = game.moves({ verbose: true });

    for (const move of moves) {
      if (move.to === square && game.get(move.from)?.color === color) {
        attackers.push(move.from);
      }
    }

    return attackers;
  }

  static async analyzeMove(move: any, fen: string): Promise<string> {
    const game = new Chess(fen);
    
    // Simple move analysis
    const analyses = [];

    if (move.captured) {
      analyses.push(`Captured ${move.captured.toUpperCase()}`);
    }

    if (game.inCheck()) {
      analyses.push("Check!");
    }

    if (move.promotion) {
      analyses.push("Promotion");
    }

    // Positional comments
    const centerSquares = ['d4', 'e4', 'd5', 'e5'];
    if (centerSquares.includes(move.to)) {
      analyses.push("Controls center");
    }

    if (move.piece === 'n' || move.piece === 'b') {
      analyses.push("Piece development");
    }

    return analyses.length > 0 
      ? analyses.join(", ") 
      : "Solid move";
  }

  static async analyzeGame(moves: any[]): Promise<string> {
    if (moves.length === 0) return "No moves to analyze.";

    const totalMoves = moves.length;
    const captures = moves.filter(move => move.captured).length;
    const checks = moves.filter(move => move.san.includes('+')).length;

    let analysis = `Game completed in ${totalMoves} moves. `;
    
    if (captures > totalMoves * 0.3) {
      analysis += "This was a tactical battle with many captures. ";
    } else if (captures < totalMoves * 0.1) {
      analysis += "A positional game with few captures. ";
    }

    if (checks > 3) {
      analysis += "Aggressive play with multiple checks. ";
    }

    if (totalMoves < 20) {
      analysis += "A quick decisive game. ";
    } else if (totalMoves > 50) {
      analysis += "A long, complex struggle. ";
    }

    analysis += "Key moments included piece development, center control, and tactical opportunities.";

    return analysis;
  }
}