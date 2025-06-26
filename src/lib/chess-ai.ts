import { Chess, Move } from 'chess.js';

type Difficulty = 'easy' | 'medium' | 'hard';

interface AIMove {
  from: string;
  to: string;
}

class ChessAI {
  private game: Chess;
  private difficulty: Difficulty;
  private pieceValues: { [key: string]: number } = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  };

  constructor(fen: string, difficulty: Difficulty = 'easy') {
    this.game = new Chess(fen);
    this.difficulty = difficulty;
  }

  public getAIMove(): AIMove | null {
    if (this.game.isGameOver()) return null;

    const moves = this.game.moves({ verbose: true }) as Move[];
    if (moves.length === 0) return null;

    switch (this.difficulty) {
      case 'easy':
        return this.getEasyMove(moves);
      case 'medium':
        return this.getMediumMove(moves);
      case 'hard':
        return this.getHardMove(moves);
      default:
        return this.getEasyMove(moves);
    }
  }

  // Easy mode: Random moves, 50% chance to skip captures, no checks/checkmates
  private getEasyMove(moves: Move[]): AIMove | null {
    const shouldSkipCaptures = Math.random() < 0.5;
    const nonCaptureMoves = moves.filter((move) => !move.captured && !this.leadsToCheck(move));
    const possibleMoves = shouldSkipCaptures && nonCaptureMoves.length > 0 ? nonCaptureMoves : moves;

    return this.randomMove(possibleMoves);
  }

  // Medium mode: Prioritize captures and checks, 20% chance for random move
  private getMediumMove(moves: Move[]): AIMove | null {
    if (Math.random() < 0.2) return this.randomMove(moves); // Simulate occasional mistakes

    const captureOrCheckMoves = moves.filter((move) => move.captured || this.leadsToCheck(move));
    if (captureOrCheckMoves.length > 0) {
      return this.randomMove(captureOrCheckMoves);
    }
    return this.randomMove(moves);
  }

  // Hard mode: Minimax with material and positional evaluation
  private getHardMove(moves: Move[]): AIMove | null {
    let bestMove: AIMove | null = null;
    let bestScore = -Infinity;

    for (const move of moves) {
      const score = this.evaluateMove(move, 2); // Depth 2 for performance
      if (score > bestScore) {
        bestScore = score;
        bestMove = { from: move.from, to: move.to };
      }
    }

    return bestMove || this.randomMove(moves);
  }

  // Minimax evaluation with depth limit
  private evaluateMove(move: Move, depth: number): number {
    const tempGame = new Chess(this.game.fen());
    tempGame.move(move);

    if (tempGame.isCheckmate()) return 10000;
    if (tempGame.isDraw()) return 0;

    let score = 0;
    if (move.captured) {
      score += this.pieceValues[move.captured] || 0;
    }
    if (this.leadsToCheck(move)) {
      score += 0.5; // Small bonus for checks
    }

    // Basic positional score: encourage piece activity (central squares)
    const toSquare = move.to;
    const centralSquares = ['d4', 'e4', 'd5', 'e5'];
    if (centralSquares.includes(toSquare)) {
      score += 0.2;
    }

    if (depth === 0) return score;

    // Minimax: Evaluate opponent's best response
    const opponentMoves = tempGame.moves({ verbose: true }) as Move[];
    let bestOpponentScore = -Infinity;
    for (const oppMove of opponentMoves) {
      const oppScore = -this.evaluateMove(oppMove, depth - 1);
      bestOpponentScore = Math.max(bestOpponentScore, oppScore);
    }

    return score - bestOpponentScore;
  }

  // Check if move leads to check
  private leadsToCheck(move: Move): boolean {
    const tempGame = new Chess(this.game.fen());
    tempGame.move(move);
    return tempGame.inCheck();
  }

  // Random move selector
  private randomMove(moves: Move[]): AIMove {
    const randomIndex = Math.floor(Math.random() * moves.length);
    const move = moves[randomIndex];
    return { from: move.from, to: move.to };
  }

  public updateGame(fen: string) {
    this.game.load(fen);
  }

  public getGameStatus(): 'playing' | 'checkmate' | 'stalemate' | 'draw' {
    if (this.game.isCheckmate()) return 'checkmate';
    if (this.game.isStalemate()) return 'stalemate';
    if (this.game.isDraw()) return 'draw';
    return 'playing';
  }

  public makePlayerMove(from: string, to: string): string | null {
    try {
      const move = this.game.move({ from, to, promotion: 'q' });
      return move ? this.game.fen() : null;
    } catch {
      return null;
    }
  }
}

export { ChessAI };
export type { Difficulty };