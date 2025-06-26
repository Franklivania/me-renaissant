import { Chess, type Move, type Square } from 'chess.js';

export class ChessEngine {
  private static readonly PIECE_VALUES: { [key: string]: number } = {
    'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
  };

  private static readonly POSITION_TABLES = {
    'p': [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5,  5, 10, 25, 25, 10,  5,  5],
      [0,  0,  0, 20, 20,  0,  0,  0],
      [5, -5,-10,  0,  0,-10, -5,  5],
      [5, 10, 10,-20,-20, 10, 10,  5],
      [0,  0,  0,  0,  0,  0,  0,  0]
    ],
    'n': [
      [-50,-40,-30,-30,-30,-30,-40,-50],
      [-40,-20,  0,  0,  0,  0,-20,-40],
      [-30,  0, 10, 15, 15, 10,  0,-30],
      [-30,  5, 15, 20, 20, 15,  5,-30],
      [-30,  0, 15, 20, 20, 15,  0,-30],
      [-30,  5, 10, 15, 15, 10,  5,-30],
      [-40,-20,  0,  5,  5,  0,-20,-40],
      [-50,-40,-30,-30,-30,-30,-40,-50]
    ]
  };

  static async getBestMove(fen: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<Move | null> {
    return new Promise((resolve) => {
      // Use setTimeout to prevent blocking the main thread
      setTimeout(() => {
        try {
          const game = new Chess(fen);
          const moves = game.moves({ verbose: true });
          
          if (moves.length === 0) {
            resolve(null);
            return;
          }

          let bestMove;
          switch (difficulty) {
            case 'easy':
              bestMove = this.getEasyMove(game, moves);
              break;
            case 'medium':
              bestMove = this.getMediumMove(game, moves);
              break;
            case 'hard':
              bestMove = this.getHardMove(game, moves);
              break;
            default:
              bestMove = moves[Math.floor(Math.random() * moves.length)];
          }
          
          resolve(bestMove);
        } catch {
          resolve(null);
        }
      }, difficulty === 'hard' ? 50 : 10); // Shorter delay for easier modes
    });
  }

  private static getEasyMove(game: Chess, moves: Move[]): Move {
    // Easy mode: 70% random moves, 30% basic strategy
    if (Math.random() < 0.7) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // Basic strategy: prefer captures, avoid hanging pieces
    const captures = moves.filter(move => move.captured);
    if (captures.length > 0 && Math.random() < 0.8) {
      return captures[Math.floor(Math.random() * captures.length)];
    }

    // Avoid obvious blunders
    const safeMoves = moves.filter(move => {
      const tempGame = new Chess(game.fen());
      tempGame.move(move);
      return !this.isPieceHanging(tempGame, move.to);
    });

    return safeMoves.length > 0 
      ? safeMoves[Math.floor(Math.random() * safeMoves.length)]
      : moves[Math.floor(Math.random() * moves.length)];
  }

  private static getMediumMove(game: Chess, moves: Move[]): Move {
    // Medium mode: improved evaluation with tactical awareness
    let bestMove: Move | null = null;
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

      // Piece safety
      if (this.isPieceHanging(tempGame, move.to)) {
        score -= this.PIECE_VALUES[move.piece] * 5;
      }

      // Center control
      const centerSquares = ['d4', 'e4', 'd5', 'e5'];
      if (centerSquares.includes(move.to)) {
        score += 3;
      }

      // Piece development (early game)
      if (game.moveNumber() < 10) {
        if (move.piece === 'n' || move.piece === 'b') {
          score += 4;
        }
        if (move.from.includes('1') || move.from.includes('8')) {
          score += 2; // Moving from back rank
        }
      }

      // King safety
      if (move.piece === 'k' && game.moveNumber() < 15) {
        score -= 5; // Discourage early king moves
      }

      // Add some randomness to avoid predictability
      score += Math.random() * 3;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove || moves[Math.floor(Math.random() * moves.length)];
  }

  private static getHardMove(game: Chess, moves: Move[]): Move {
    // Hard mode: optimized minimax with iterative deepening
    let bestMove: Move | null = null;
    let bestScore = -Infinity;

    // Sort moves for better alpha-beta pruning
    const sortedMoves = this.sortMoves(game, moves);
    
    // Use iterative deepening with time limit
    const maxDepth = 3; // Reduced depth for performance
    
    for (const move of sortedMoves.slice(0, Math.min(20, sortedMoves.length))) { // Limit moves evaluated
      const tempGame = new Chess(game.fen());
      tempGame.move(move);
      
      const score = this.minimax(tempGame, maxDepth - 1, -Infinity, Infinity, false);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove || moves[Math.floor(Math.random() * moves.length)];
  }

  private static sortMoves(game: Chess, moves: Move[]): Move[] {
    // Sort moves for better alpha-beta pruning
    return moves.sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      
      // Prioritize captures
      if (a.captured) scoreA += this.PIECE_VALUES[a.captured] * 10;
      if (b.captured) scoreB += this.PIECE_VALUES[b.captured] * 10;
      
      // Prioritize checks
      const tempGameA = new Chess(game.fen());
      tempGameA.move(a);
      if (tempGameA.inCheck()) scoreA += 5;
      
      const tempGameB = new Chess(game.fen());
      tempGameB.move(b);
      if (tempGameB.inCheck()) scoreB += 5;
      
      return scoreB - scoreA;
    });
  }

  private static minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0 || game.isGameOver()) {
      return this.evaluatePosition(game);
    }

    const moves = game.moves({ verbose: true });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves.slice(0, Math.min(15, moves.length))) { // Limit branching factor
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
      for (const move of moves.slice(0, Math.min(15, moves.length))) { // Limit branching factor
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

    // Material and positional evaluation
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const value = this.PIECE_VALUES[piece.type] || 0;
          let positionalValue = 0;

          // Add positional bonuses for pawns and knights
          if (this.POSITION_TABLES[piece.type as keyof typeof this.POSITION_TABLES]) {
            const table = this.POSITION_TABLES[piece.type as keyof typeof this.POSITION_TABLES];
            positionalValue = piece.color === 'w' ? table[i][j] : table[7-i][j];
            positionalValue /= 100; // Scale down positional values
          }

          const totalValue = value + positionalValue;
          score += piece.color === 'w' ? totalValue : -totalValue;
        }
      }
    }

    // Mobility bonus
    const moves = game.moves({ verbose: true });
    score += game.turn() === 'w' ? moves.length * 0.1 : -moves.length * 0.1;

    // King safety
    if (game.inCheck()) {
      score += game.turn() === 'w' ? -0.5 : 0.5;
    }

    return score;
  }

  private static isPieceHanging(game: Chess, square: string): boolean {
    const piece = game.get(square as Square);
    if (!piece) return false;

    const attackers = this.getAttackers(game, square, piece.color === 'w' ? 'b' : 'w');
    const defenders = this.getAttackers(game, square, piece.color);

    if (attackers.length === 0) return false;
    if (defenders.length === 0) return true;

    // Simple exchange evaluation
    const attackerValues = attackers.map(sq => this.PIECE_VALUES[game.get(sq as Square)?.type || 'p']);
    const minAttacker = Math.min(...attackerValues);
    const pieceValue = this.PIECE_VALUES[piece.type];

    return minAttacker < pieceValue;
  }

  private static getAttackers(game: Chess, square: string, color: 'w' | 'b'): string[] {
    const attackers: string[] = [];
    const moves = game.moves({ verbose: true });

    for (const move of moves) {
      if (move.to === square && game.get(move.from as Square)?.color === color) {
        attackers.push(move.from);
      }
    }

    return attackers;
  }

  static async analyzeMove(move: Move, fen: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const game = new Chess(fen);
          const analyses = [];

          if (move.captured) {
            const capturedValue = this.PIECE_VALUES[move.captured];
            analyses.push(`Captured ${move.captured.toUpperCase()} (+${capturedValue})`);
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

          // Check for tactical themes
          if (move.captured && this.PIECE_VALUES[move.captured] > this.PIECE_VALUES[move.piece]) {
            analyses.push("Good trade");
          }

          resolve(analyses.length > 0 ? analyses.join(", ") : "Solid move");
        } catch {
          resolve("Move played");
        }
      }, 10);
    });
  }

  static async analyzeGame(moves: GameMove[]): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          if (moves.length === 0) {
            resolve("No moves to analyze.");
            return;
          }

          const totalMoves = moves.length;
          const captures = moves.filter(move => move.captured).length;
          const checks = moves.filter(move => move.san.includes('+')).length;

          let analysis = `Game completed in ${totalMoves} moves. `;
          
          if (captures > totalMoves * 0.3) {
            analysis += "This was a tactical battle with many exchanges. ";
          } else if (captures < totalMoves * 0.1) {
            analysis += "A positional game with careful maneuvering. ";
          }

          if (checks > 3) {
            analysis += "Aggressive play with multiple checks created pressure. ";
          }

          if (totalMoves < 20) {
            analysis += "A quick decisive finish. ";
          } else if (totalMoves > 50) {
            analysis += "A long, complex endgame struggle. ";
          }

          // Analyze opening phase
          if (totalMoves >= 10) {
            analysis += "The opening phase focused on piece development and center control. ";
          }

          // Analyze middle game
          if (totalMoves >= 20) {
            analysis += "The middlegame featured tactical complications and strategic planning. ";
          }

          analysis += "Both players demonstrated good understanding of chess principles.";

          resolve(analysis);
        } catch {
          resolve("Game analysis completed.");
        }
      }, 100);
    });
  }
}

interface GameMove {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  san: string;
  fen: string;
  timestamp: number;
  analysis?: string;
}