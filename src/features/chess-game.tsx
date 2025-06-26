import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components';
import { Icon } from '@iconify/react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { ChessGameSetup } from './chess-setup';
import { ChessAnalysisBoard } from './chess-analysis-board';
import { ChessEngine } from '@/services/chess-engine';

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

export const ChessGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate' | 'draw'>('playing');
  const [moves, setMoves] = useState<GameMove[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[], black: string[] }>({ white: [], black: [] });
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [whiteTime, setWhiteTime] = useState<number | null>(null);
  const [blackTime, setBlackTime] = useState<number | null>(null);
  const [currentTurn, setCurrentTurn] = useState<'white' | 'black'>('white');
  const [isThinking, setIsThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gameAnalysis, setGameAnalysis] = useState<string>('');

  // Timer effect
  useEffect(() => {
    if (!gameStarted || !gameSettings?.timeLimit || gameStatus !== 'playing') return;

    const interval = setInterval(() => {
      if (currentTurn === 'white' && whiteTime !== null && whiteTime > 0) {
        setWhiteTime(prev => prev! - 1);
      } else if (currentTurn === 'black' && blackTime !== null && blackTime > 0) {
        setBlackTime(prev => prev! - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameSettings, currentTurn, whiteTime, blackTime, gameStatus]);

  // Check for time out
  useEffect(() => {
    if (whiteTime === 0) {
      setGameStatus('checkmate');
    } else if (blackTime === 0) {
      setGameStatus('checkmate');
    }
  }, [whiteTime, blackTime]);

  // AI move effect
  useEffect(() => {
    if (gameStarted && currentTurn !== gameSettings?.playerColor && gameStatus === 'playing') {
      makeAIMove();
    }
  }, [currentTurn, gameStarted, gameSettings, gameStatus]);

  const startGame = (settings: GameSettings) => {
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
  };

  const resetGame = () => {
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
  };

  const makeAIMove = async () => {
    if (!gameSettings) return;
    
    setIsThinking(true);
    
    try {
      const bestMove = await ChessEngine.getBestMove(game.fen(), gameSettings.difficulty);
      
      if (bestMove) {
        const moveResult = game.move(bestMove);
        if (moveResult) {
          await processMoveResult(moveResult, true);
        }
      }
    } catch (error) {
      console.error('AI move error:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const processMoveResult = async (moveResult: any, isAIMove: boolean = false) => {
    const newMove: GameMove = {
      from: moveResult.from,
      to: moveResult.to,
      piece: moveResult.piece,
      captured: moveResult.captured,
      san: moveResult.san,
      fen: game.fen(),
      timestamp: Date.now()
    };

    // Add to moves list
    setMoves(prev => [...prev, newMove]);

    // Update captured pieces
    if (moveResult.captured) {
      setCapturedPieces(prev => ({
        ...prev,
        [moveResult.color === 'w' ? 'white' : 'black']: [
          ...prev[moveResult.color === 'w' ? 'white' : 'black'],
          moveResult.captured
        ]
      }));
    }

    // Check game status
    if (game.isCheckmate()) {
      setGameStatus('checkmate');
      if (gameSettings?.difficulty === 'hard') {
        // Generate full game analysis for hard mode
        const analysis = await ChessEngine.analyzeGame(moves);
        setGameAnalysis(analysis);
      }
    } else if (game.isStalemate()) {
      setGameStatus('stalemate');
    } else if (game.isDraw()) {
      setGameStatus('draw');
    }

    // Switch turns
    setCurrentTurn(game.turn() === 'w' ? 'white' : 'black');

    // Get move analysis for easy/medium modes
    if (!isAIMove && (gameSettings?.difficulty === 'easy' || gameSettings?.difficulty === 'medium')) {
      try {
        const analysis = await ChessEngine.analyzeMove(moveResult, game.fen());
        setMoves(prev => prev.map((move, index) => 
          index === prev.length - 1 ? { ...move, analysis } : move
        ));
      } catch (error) {
        console.error('Move analysis error:', error);
      }
    }

    // Clear selection
    setSelectedSquare(null);
    setPossibleMoves([]);
    setErrorMessage(null);
  };

  const onSquareClick = (square: string) => {
    if (currentTurn !== gameSettings?.playerColor || gameStatus !== 'playing') return;

    // Clear error message
    setErrorMessage(null);

    // If no square is selected, select this square
    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === (gameSettings.playerColor === 'white' ? 'w' : 'b')) {
        setSelectedSquare(square);
        
        // Show possible moves for easy/medium modes
        if (gameSettings.difficulty === 'easy' || gameSettings.difficulty === 'medium') {
          const moves = game.moves({ square, verbose: true });
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
    } catch (error) {
      // Invalid move
      setErrorMessage('Invalid move! Try again.');
      setTimeout(() => setErrorMessage(null), 2000);
      
      // Check if clicking on another piece of same color
      const piece = game.get(square);
      if (piece && piece.color === (gameSettings.playerColor === 'white' ? 'w' : 'b')) {
        setSelectedSquare(square);
        
        if (gameSettings.difficulty === 'easy' || gameSettings.difficulty === 'medium') {
          const moves = game.moves({ square, verbose: true });
          setPossibleMoves(moves.map(move => move.to));
        }
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  };

  const onPieceDrop = (sourceSquare: string, targetSquare: string) => {
    if (currentTurn !== gameSettings?.playerColor || gameStatus !== 'playing') return false;

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
    } catch (error) {
      setErrorMessage('Invalid move! Try again.');
      setTimeout(() => setErrorMessage(null), 2000);
    }

    return false;
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '∞';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(212, 175, 55, 0.4)',
        border: '2px solid #D4AF37'
      };
    }

    // Highlight possible moves
    possibleMoves.forEach(square => {
      styles[square] = {
        backgroundColor: 'rgba(61, 153, 112, 0.6)',
        border: '2px solid #3D9970'
      };
    });

    return styles;
  }, [selectedSquare, possibleMoves]);

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
                  <p className="text-sm">Black {isThinking && currentTurn === 'black' ? '(Thinking...)' : ''}</p>
                  <p className="text-lg font-bold text-gold">{formatTime(blackTime)}</p>
                </div>
                <div className="text-center">
                  <p className="text-brown-100/80 mb-2">
                    Turn: <span className="text-gold font-semibold capitalize">{currentTurn}</span>
                  </p>
                  <p className="text-sm text-brown-100/60">
                    {gameSettings?.difficulty} • {gameSettings?.timeLimit ? `${gameSettings.timeLimit / 60}min` : 'Casual'}
                  </p>
                </div>
                <div className="text-brown-100/80 text-right">
                  <p className="text-sm">White {isThinking && currentTurn === 'white' ? '(Thinking...)' : ''}</p>
                  <p className="text-lg font-bold text-gold">{formatTime(whiteTime)}</p>
                </div>
              </div>

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-2 bg-red-400/20 rounded-lg border border-red-400"
                >
                  <p className="text-red-300 text-sm">{errorMessage}</p>
                </motion.div>
              )}

              {gameStatus !== 'playing' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gold/20 rounded-lg border border-gold mb-4"
                >
                  <p className="text-gold font-im text-xl">
                    {gameStatus === 'checkmate'
                      ? `Checkmate! ${currentTurn === 'white' ? 'Black' : 'White'} wins!`
                      : gameStatus === 'stalemate'
                      ? 'Stalemate! The game is a draw.'
                      : 'The game ends in a draw.'}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Chess Board */}
            <div className="max-w-lg mx-auto">
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
              />
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
          />
        </div>
      </div>
    </div>
  );
};