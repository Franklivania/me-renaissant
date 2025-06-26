import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components';
import { Icon } from '@iconify/react';
import { Chessboard } from 'react-chessboard';
import { ChessAI, type Difficulty } from '@/lib/chess-ai';

export const ChessGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate' | 'draw'>('playing');
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  // Memoize ChessAI to prevent unnecessary re-instantiation
  const chessAI = useMemo(() => new ChessAI(fen, difficulty), [difficulty]);

  // Update AI game state when FEN changes
  useEffect(() => {
    chessAI.updateGame(fen);
  }, [fen, chessAI]);

  // Handle AI move with slight delay for better UX
  useEffect(() => {
    if (currentPlayer === 'black' && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const aiMove = chessAI.getAIMove();
        if (aiMove) {
          const newFen = chessAI.makePlayerMove(aiMove.from, aiMove.to);
          if (newFen) {
            setFen(newFen);
            setGameStatus(chessAI.getGameStatus());
            setCurrentPlayer('white');
          }
        }
      }, 500); // 500ms delay for natural feel
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameStatus, chessAI]);

  const resetGame = () => {
    setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setGameStatus('playing');
    setCurrentPlayer('white');
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (currentPlayer !== 'white' || gameStatus !== 'playing') return false;

    const newFen = chessAI.makePlayerMove(sourceSquare, targetSquare);
    if (newFen) {
      setFen(newFen);
      setGameStatus(chessAI.getGameStatus());
      setCurrentPlayer('black');
      return true;
    }
    return false;
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    resetGame();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-brown-100 hover:text-gold flex items-center"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back to Games</span>
        </Button>
        <h3 className="lg:font-2xl font-im font-bold text-brown-100 sm:block">
          Chess of Time
        </h3>
        <Button
          variant="ghost"
          onClick={resetGame}
          className="text-brown-100 hover:text-gold flex items-center"
        >
          <Icon icon="lucide:rotate-ccw" className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Reset</span>
        </Button>
      </div>

      <div className="flex justify-center mb-4">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
          <Button
            key={level}
            variant={difficulty === level ? 'secondary' : 'ghost'}
            onClick={() => handleDifficultyChange(level)}
            className="mx-2"
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brown-100/5 backdrop-blur-sm rounded-lg p-8 border border-brown-100/20"
      >
        <div className="text-center mb-6">
          <p className="text-brown-100/80 mb-4 font-lato">
            Current Turn: <span className="text-gold font-semibold capitalize">{currentPlayer}</span>
          </p>
          {gameStatus !== 'playing' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gold/20 rounded-lg border border-gold mb-4"
            >
              <p className="text-gold font-im text-xl">
                {gameStatus === 'checkmate'
                  ? 'Checkmate! The game is won!'
                  : gameStatus === 'stalemate'
                  ? 'Stalemate! A draw by position.'
                  : 'The game ends in a draw.'}
              </p>
            </motion.div>
          )}
        </div>

        <div className="max-w-lg mx-auto">
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation="white"
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
  );
};