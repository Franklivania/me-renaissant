import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components';
import { Icon } from '@iconify/react';
import { Chessboard } from 'react-chessboard';

export const ChessGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [game, setGame] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate' | 'draw'>('playing');
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');

  const resetGame = () => {
    setGame('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setGameStatus('playing');
    setCurrentPlayer('white');
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // This is a simplified implementation
    // In a real chess game, you'd need proper chess logic validation
    console.log(`Move from ${sourceSquare} to ${targetSquare}`);
    
    // Toggle player for demo purposes
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
    
    return true;
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
          onClick={initializeGame}
          className="text-brown-100 hover:text-gold flex items-center"
        >
          <Icon icon="lucide:rotate-ccw" className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Reset</span>
        </Button>
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
                {gameStatus === 'checkmate' ? 'Checkmate! The game is won!' :
                 gameStatus === 'stalemate' ? 'Stalemate! A draw by position.' :
                 'The game ends in a draw.'}
              </p>
            </motion.div>
          )}
        </div>

        <div className="max-w-lg mx-auto">
          <Chessboard
            position={game}
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