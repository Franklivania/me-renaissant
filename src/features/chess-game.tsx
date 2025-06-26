import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/button';
import { Icon } from '@iconify/react';
import { Chessboard } from 'react-chessboard';
import { Chess, type Square, type Move } from 'chess.js';
import { ChessGameSetup } from './chess-setup';
import { ChessAnalysisBoard } from './chess-analysis-board';
import { ChessEngine } from '@/services/chess-engine';
import { ChessSessionService } from '@/services/chess-session-service';
import { RenaissanceCommentary } from '@/services/renaissance-commentary';
import { useProfileStore } from '@/store/useProfileStore';

interface GameSettings {
  timeLimit: number | null; // in seconds, null for casual
  difficulty: 'easy' | 'medium' | 'hard';
  playerColor: 'white' | 'black';
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

type GameStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'timeout';
type PlayerColor = 'white' | 'black';

export const ChessGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { doppelganger } = useProfileStore();
  
  // Game state
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [moves, setMoves] = useState<GameMove[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[], black: string[] }>({ white: [], black: [] });
  
  // UI state
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [lastMoveSquares, setLastMoveSquares] = useState<{ from: string; to: string } | null>(null);
  
  // Timer state
  const [whiteTime, setWhiteTime] = useState<number | null>(null);
  const [blackTime, setBlackTime] = useState<number | null>(null);
  const [currentTurn, setCurrentTurn] = useState<PlayerColor>('white');
  
  // AI and game state
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [aiThinkingStartTime, setAiThinkingStartTime] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gameAnalysis, setGameAnalysis] = useState<string>('');
  const [winner, setWinner] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [commentary, setCommentary] = useState<string | null>(null);
  const [animatingMove, setAnimatingMove] = useState<boolean>(false);

  // Derived state
  const isPlayerTurn = useMemo(() => {
    return gameSettings ? currentTurn === gameSettings.playerColor : false;
  }, [currentTurn, gameSettings]);

  const aiColor = useMemo(() => {
    return gameSettings ? (gameSettings.playerColor === 'white' ? 'black' : 'white') : 'black';
  }, [gameSettings]);

  // Check for existing session on component mount
  useEffect(() => {
    const loadExistingSession = async () => {
      if (ChessSessionService.hasActiveSession()) {
        const session = await ChessSessionService.loadGameSession();
        if (session && session.gameStatus === 'playing') {
          // Restore game state
          setGameSettings(session.gameSettings);
          setGameStarted(true);
          setSessionId(session.id);
          
          const restoredGame = new Chess(session.currentFen);
          setGame(restoredGame);
          setMoves(session.moves);
          setCapturedPieces(session.capturedPieces);
          setWhiteTime(session.whiteTime);
          setBlackTime(session.blackTime);
          setCurrentTurn(session.currentTurn);
          setGameStatus(session.gameStatus);
          setWinner(session.winner);

          // Show restoration message
          setCommentary("Ah! Our game continues from where we left off. The pieces remember their positions, as do I our noble contest.");
        }
      }
    };

    loadExistingSession();
  }, []);

  // Auto-save session for custom/casual games
  useEffect(() => {
    if (gameStarted && gameSettings && (gameSettings.timeLimit === null || gameSettings.timeLimit >= 600)) {
      const saveSession = async () => {
        const session = {
          id: sessionId || '',
          gameSettings,
          currentFen: game.fen(),
          moves,
          capturedPieces,
          whiteTime,
          blackTime,
          gameStatus,
          currentTurn,
          lastMoveTime: Date.now(),
          winner
        };

        await ChessSessionService.saveGameSession(session);
        if (!sessionId && session.id) {
          setSessionId(session.id);
        }
      };

      const timeoutId = setTimeout(saveSession, 1000); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [gameStarted, gameSettings, game, moves, capturedPieces, whiteTime, blackTime, gameStatus, currentTurn, winner, sessionId]);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || !gameSettings?.timeLimit || gameStatus !== 'playing') return;

    const interval = setInterval(() => {
      if (currentTurn === 'white' && whiteTime !== null && whiteTime > 0) {
        setWhiteTime(prev => prev ? Math.max(0, prev - 1) : 0);
      } else if (currentTurn === 'black' && blackTime !== null && blackTime > 0) {
        setBlackTime(prev => prev ? Math.max(0, prev - 1) : 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameSettings, currentTurn, whiteTime, blackTime, gameStatus]);

  // Check for timeout
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    if (whiteTime === 0) {
      setGameStatus('timeout');
      setWinner('Black wins by timeout');
      setCommentary("Time has run out for White! Like sand through an hourglass, victory slips away. Black claims the crown by patience and persistence.");
    } else if (blackTime === 0) {
      setGameStatus('timeout');
      setWinner('White wins by timeout');
      setCommentary("The clock strikes against Black! Time, that most precious of resources, has been exhausted. White emerges victorious through the passage of moments.");
    }
  }, [whiteTime, blackTime, gameStatus]);

  const processMoveResult = useCallback(async (moveResult: Move, isAIMove: boolean = false) => {
    const thinkingTime = aiThinkingStartTime ? Date.now() - aiThinkingStartTime : 0;
    
    const newMove: GameMove = {
      from: moveResult.from,
      to: moveResult.to,
      piece: moveResult.piece,
      captured: moveResult.captured,
      san: moveResult.san,
      fen: game.fen(),
      timestamp: Date.now()
    };

    // Set last move squares for highlighting
    setLastMoveSquares({ from: moveResult.from, to: moveResult.to });

    // Add to moves list
    setMoves(prev => [...prev, newMove]);

    // Update captured pieces
    if (moveResult.captured) {
      setCapturedPieces(prev => ({
        ...prev,
        [moveResult.color === 'w' ? 'white' : 'black']: [
          ...prev[moveResult.color === 'w' ? 'white' : 'black'],
          moveResult.captured!
        ]
      }));
    }

    // Generate Renaissance commentary
    const gamePhase = RenaissanceCommentary.getGamePhase(moves.length);
    const moveType = RenaissanceCommentary.getMoveType(moveResult, {});
    const moveQuality = RenaissanceCommentary.evaluateMoveQuality(moveResult, {});
    
    const commentaryContext = {
      moveType,
      gamePhase,
      playerAdvantage: 'equal' as const,
      moveQuality,
      isPlayerMove: !isAIMove
    };

    const newCommentary = RenaissanceCommentary.generateComment(commentaryContext, doppelganger || undefined);
    if (newCommentary) {
      setCommentary(newCommentary);
    }

    // Check game status
    if (game.isCheckmate()) {
      setGameStatus('checkmate');
      const winnerText = `${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!`;
      setWinner(winnerText);
      setCommentary(`Checkmate! The king falls, and our noble contest reaches its conclusion. ${game.turn() === 'w' ? 'Black' : 'White'} emerges victorious through superior strategy and tactical prowess!`);
      
      if (gameSettings?.difficulty === 'hard') {
        // Generate full game analysis for hard mode
        try {
          const analysis = await ChessEngine.analyzeGame(moves);
          setGameAnalysis(analysis);
        } catch {
          // Error handled silently
        }
      }

      // Save game outcome
      if (gameSettings && (gameSettings.timeLimit === null || gameSettings.timeLimit < 600)) {
        ChessSessionService.saveGameOutcome(gameSettings, winnerText, [...moves, newMove]);
      }
    } else if (game.isStalemate()) {
      setGameStatus('stalemate');
      setWinner('Draw by stalemate');
      setCommentary("Stalemate! A most curious conclusion - the king stands safe yet cannot move. In chess, as in life, sometimes the mightiest are bound by invisible chains. A draw it is!");
    } else if (game.isDraw()) {
      setGameStatus('draw');
      setWinner('Draw');
      setCommentary("A draw! Like two master swordsmen whose skills are perfectly matched, neither can claim victory. Honor to both players for this well-fought contest!");
    }

    // Switch turns
    setCurrentTurn(game.turn() === 'w' ? 'white' : 'black');

    // Adjust timer for AI thinking time (only for AI moves)
    if (isAIMove && gameSettings?.timeLimit && thinkingTime > 0) {
      const timeUsed = Math.ceil(thinkingTime / 1000);
      
      if (aiColor === 'white') {
        setWhiteTime(prev => prev ? Math.max(0, prev - timeUsed) : null);
      } else {
        setBlackTime(prev => prev ? Math.max(0, prev - timeUsed) : null);
      }
    }

    // Get move analysis for easy/medium modes
    if (!isAIMove && (gameSettings?.difficulty === 'easy' || gameSettings?.difficulty === 'medium')) {
      try {
        const analysis = await ChessEngine.analyzeMove(moveResult, game.fen());
        setMoves(prev => prev.map((move, index) => 
          index === prev.length - 1 ? { ...move, analysis } : move
        ));
      } catch {
        // Error handled silently
      }
    }

    // Clear selection
    setSelectedSquare(null);
    setPossibleMoves([]);
    setErrorMessage(null);
  }, [game, gameSettings, moves, aiThinkingStartTime, doppelganger, aiColor]);

  const makeAIMove = useCallback(async () => {
    if (!gameSettings || isAIThinking || gameStatus !== 'playing') return;
    
    setIsAIThinking(true);
    setAiThinkingStartTime(Date.now());
    
    // Show thinking commentary
    const thinkingComment = RenaissanceCommentary.getThinkingComment();
    setCommentary(thinkingComment);
    
    try {
      // Use requestIdleCallback for better performance
      const bestMove = await new Promise<Move | null>((resolve) => {
        const callback = async () => {
          try {
            const move = await ChessEngine.getBestMove(game.fen(), gameSettings.difficulty);
            resolve(move);
          } catch {
            resolve(null);
          }
        };

        // Use setTimeout to prevent blocking for hard mode
        if (gameSettings.difficulty === 'hard') {
          setTimeout(callback, 500); // Longer delay for hard mode
        } else {
          setTimeout(callback, 200);
        }
      });
      
      if (bestMove) {
        setAnimatingMove(true);
        
        // Add delay for move animation
        setTimeout(() => {
          const moveResult = game.move(bestMove);
          if (moveResult) {
            processMoveResult(moveResult, true);
          }
          setAnimatingMove(false);
        }, 300); // Animation delay
      }
    } catch {
      // Error handled in promise
    } finally {
      setIsAIThinking(false);
      setAiThinkingStartTime(null);
    }
  }, [game, gameSettings, isAIThinking, processMoveResult, gameStatus]);

  // AI move effect - only trigger when it's AI's turn
  useEffect(() => {
    if (gameStarted && !isPlayerTurn && gameStatus === 'playing' && !isAIThinking) {
      makeAIMove();
    }
  }, [gameStarted, isPlayerTurn, gameStatus, isAIThinking, makeAIMove]);

  const startGame = useCallback((settings: GameSettings) => {
    setGameSettings(settings);
    setGameStarted(true);
    
    // Initialize timers
    if (settings.timeLimit) {
      setWhiteTime(settings.timeLimit);
      setBlackTime(settings.timeLimit);
    }

    // Reset game state
    const newGame = new Chess();
    setGame(newGame);
    setMoves([]);
    setCapturedPieces({ white: [], black: [] });
    setGameStatus('playing');
    setCurrentTurn('white');
    setSelectedSquare(null);
    setPossibleMoves([]);
    setErrorMessage(null);
    setGameAnalysis('');
    setWinner(null);
    setIsAIThinking(false);
    setAiThinkingStartTime(null);
    setSessionId(null);
    setCommentary(`Greetings, noble ${settings.playerColor} player! The board is set, the pieces await thy command. May this game be worthy of the masters of old!`);
    setLastMoveSquares(null);
    setAnimatingMove(false);

    // Clear any existing session
    ChessSessionService.clearGameSession();
  }, []);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameSettings(null);
    setGame(new Chess());
    setMoves([]);
    setCapturedPieces({ white: [], black: [] });
    setGameStatus('playing');
    setCurrentTurn('white');
    setSelectedSquare(null);
    setPossibleMoves([]);
    setWhiteTime(null);
    setBlackTime(null);
    setErrorMessage(null);
    setGameAnalysis('');
    setWinner(null);
    setIsAIThinking(false);
    setAiThinkingStartTime(null);
    setSessionId(null);
    setCommentary(null);
    setLastMoveSquares(null);
    setAnimatingMove(false);

    // Clear session
    ChessSessionService.clearGameSession();
  }, []);

  const onSquareClick = useCallback((square: string) => {
    if (!isPlayerTurn || gameStatus !== 'playing' || isAIThinking || animatingMove) return;

    // Clear error message
    setErrorMessage(null);

    // If no square is selected, select this square
    if (!selectedSquare) {
      const piece = game.get(square as Square);
      if (piece && piece.color === (gameSettings!.playerColor === 'white' ? 'w' : 'b')) {
        setSelectedSquare(square);
        
        // Show possible moves for easy/medium modes only
        if (gameSettings!.difficulty === 'easy' || gameSettings!.difficulty === 'medium') {
          const moves = game.moves({ square: square as Square, verbose: true });
          setPossibleMoves(moves.map(move => move.to));
        }
      }
      return;
    }

    // If same square clicked, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // Try to make a move
    try {
      const moveResult = game.move({
        from: selectedSquare,
        to: square,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (moveResult) {
        processMoveResult(moveResult);
      }
    } catch {
      // Invalid move
      setErrorMessage('Invalid move! Try again.');
      setTimeout(() => setErrorMessage(null), 2000);
      
      // Check if clicking on another piece of same color
      const piece = game.get(square as Square);
      if (piece && piece.color === (gameSettings!.playerColor === 'white' ? 'w' : 'b')) {
        setSelectedSquare(square);
        
        // Only show moves for easy/medium modes
        if (gameSettings!.difficulty === 'easy' || gameSettings!.difficulty === 'medium') {
          const moves = game.moves({ square: square as Square, verbose: true });
          setPossibleMoves(moves.map(move => move.to));
        }
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  }, [isPlayerTurn, gameStatus, isAIThinking, animatingMove, selectedSquare, game, gameSettings, processMoveResult]);

  const onPieceDrop = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    if (!isPlayerTurn || gameStatus !== 'playing' || isAIThinking || animatingMove) return false;

    try {
      const moveResult = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (moveResult) {
        processMoveResult(moveResult);
        return true;
      }
    } catch {
      setErrorMessage('Invalid move! Try again.');
      setTimeout(() => setErrorMessage(null), 2000);
    }

    return false;
  }, [isPlayerTurn, gameStatus, isAIThinking, animatingMove, game, processMoveResult]);

  const formatTime = useCallback((seconds: number | null): string => {
    if (seconds === null) return '∞';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // Highlight last move
    if (lastMoveSquares) {
      styles[lastMoveSquares.from] = {
        backgroundColor: 'rgba(212, 175, 55, 0.3)',
        border: '2px solid rgba(212, 175, 55, 0.6)'
      };
      styles[lastMoveSquares.to] = {
        backgroundColor: 'rgba(212, 175, 55, 0.4)',
        border: '2px solid #D4AF37'
      };
    }

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(212, 175, 55, 0.5)',
        border: '3px solid #D4AF37',
        boxShadow: '0 0 10px rgba(212, 175, 55, 0.6)'
      };
    }

    // Highlight possible moves (only for easy/medium modes)
    if (gameSettings?.difficulty !== 'hard') {
      possibleMoves.forEach(square => {
        styles[square] = {
          backgroundColor: 'rgba(61, 153, 112, 0.6)',
          border: '2px solid #3D9970',
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(61, 153, 112, 0.4)'
        };
      });
    }

    return styles;
  }, [selectedSquare, possibleMoves, gameSettings?.difficulty, lastMoveSquares]);

  if (!gameStarted) {
    return <ChessGameSetup onStartGame={startGame} onBack={onBack} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-brown-100 hover:text-gold flex items-center"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back to Games</span>
        </Button>
        <h3 className="text-2xl font-im font-bold text-brown-100">
          Chess of Time
        </h3>
        <Button
          variant="ghost"
          onClick={resetGame}
          className="text-brown-100 hover:text-gold flex items-center"
        >
          <Icon icon="lucide:rotate-ccw" className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">New Game</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chess Board */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brown-100/5 backdrop-blur-sm rounded-lg p-6 border border-brown-100/20"
          >
            {/* Game Status */}
            <div className="text-center mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-brown-100/80">
                  <p className="text-sm">
                    Black {isAIThinking && currentTurn === 'black' ? '(Thinking...)' : ''}
                  </p>
                  <motion.p 
                    className="text-lg font-bold text-gold"
                    animate={{ 
                      scale: (currentTurn === 'black' && blackTime !== null && blackTime <= 30) ? [1, 1.1, 1] : 1,
                      color: (blackTime !== null && blackTime <= 30) ? ['#D4AF37', '#ff6b6b', '#D4AF37'] : '#D4AF37'
                    }}
                    transition={{ duration: 1, repeat: (blackTime !== null && blackTime <= 30) ? Infinity : 0 }}
                  >
                    {formatTime(blackTime)}
                  </motion.p>
                </div>
                <div className="text-center">
                  <p className="text-brown-100/80 mb-2">
                    Turn: <span className="text-gold font-semibold capitalize">{currentTurn}</span>
                  </p>
                  <p className="text-sm text-brown-100/60">
                    You: {gameSettings?.playerColor} • {gameSettings?.difficulty} • {gameSettings?.timeLimit ? `${gameSettings.timeLimit / 60}min` : 'Casual'}
                  </p>
                  {gameSettings?.difficulty === 'hard' && (
                    <p className="text-xs text-brown-100/40 mt-1">
                      Click piece, then destination
                    </p>
                  )}
                </div>
                <div className="text-brown-100/80 text-right">
                  <p className="text-sm">
                    White {isAIThinking && currentTurn === 'white' ? '(Thinking...)' : ''}
                  </p>
                  <motion.p 
                    className="text-lg font-bold text-gold"
                    animate={{ 
                      scale: (currentTurn === 'white' && whiteTime !== null && whiteTime <= 30) ? [1, 1.1, 1] : 1,
                      color: (whiteTime !== null && whiteTime <= 30) ? ['#D4AF37', '#ff6b6b', '#D4AF37'] : '#D4AF37'
                    }}
                    transition={{ duration: 1, repeat: (whiteTime !== null && whiteTime <= 30) ? Infinity : 0 }}
                  >
                    {formatTime(whiteTime)}
                  </motion.p>
                </div>
              </div>

              {/* Commentary */}
              <AnimatePresence mode="wait">
                {commentary && (
                  <motion.div
                    key={commentary}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mb-4 p-3 bg-brown-100/10 rounded-lg border border-brown-100/20"
                  >
                    <div className="flex items-start gap-2">
                      <Icon icon="mdi:account-circle" className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <p className="text-brown-100/90 text-sm italic font-im leading-relaxed">
                        "{commentary}"
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-2 bg-red-400/20 rounded-lg border border-red-400"
                >
                  <p className="text-red-300 text-sm">{errorMessage}</p>
                </motion.div>
              )}

              {gameStatus !== 'playing' && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="p-4 bg-gold/20 rounded-lg border border-gold mb-4"
                >
                  <p className="text-gold font-im text-xl">
                    {winner || 'Game Over'}
                  </p>
                </motion.div>
              )}

              {isAIThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-2 bg-brown-100/10 rounded-lg border border-brown-100/20"
                >
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-brown-100/20 border-t-brown-100 rounded-full"
                    />
                    <p className="text-brown-100/80 text-sm">Thy doppelganger contemplates...</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Chess Board */}
            <div className="max-w-lg mx-auto">
              <motion.div
                animate={{ 
                  scale: animatingMove ? [1, 1.02, 1] : 1,
                  rotateY: animatingMove ? [0, 2, 0] : 0
                }}
                transition={{ duration: 0.3 }}
              >
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={onPieceDrop}
                  onSquareClick={onSquareClick}
                  boardOrientation={gameSettings?.playerColor || 'white'}
                  customSquareStyles={customSquareStyles}
                  customBoardStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  }}
                  customDarkSquareStyle={{ backgroundColor: '#7B2C3B' }}
                  customLightSquareStyle={{ backgroundColor: '#F5F0E1' }}
                  customDropSquareStyle={{ backgroundColor: '#D4AF37', opacity: 0.6 }}
                  areArrowsAllowed={false}
                  arePiecesDraggable={isPlayerTurn && !isAIThinking && !animatingMove}
                  animationDuration={200}
                />
              </motion.div>
            </div>

            <div className="text-center mt-6">
              <p className="text-brown-100/70 italic font-im">
                "In chess, as in life, the pawns go first, but the king decides the fate of all."
              </p>
            </div>
          </motion.div>
        </div>

        {/* Analysis Board */}
        <div className="lg:col-span-1">
          <ChessAnalysisBoard
            gameSettings={gameSettings}
            moves={moves}
            capturedPieces={capturedPieces}
            gameStatus={gameStatus}
            gameAnalysis={gameAnalysis}
            isThinking={isAIThinking}
          />
        </div>
      </div>
    </div>
  );
};