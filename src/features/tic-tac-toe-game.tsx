import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components';
import { Icon } from '@iconify/react';

type Player = 'X' | 'O' | null;

export const TicTacToeGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player | 'tie' | null>(null);

  const checkWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    return squares.every(square => square !== null) ? 'tie' : null;
  };

  const makeMove = (index: number) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
      return;
    }

    // AI move (simple random)
    setTimeout(() => {
      const availableMoves = newBoard
        .map((cell, idx) => cell === null ? idx : null)
        .filter(val => val !== null) as number[];
      
      if (availableMoves.length > 0) {
        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        newBoard[randomMove] = 'O';
        setBoard([...newBoard]);
        
        const finalResult = checkWinner(newBoard);
        if (finalResult) {
          setWinner(finalResult);
        } else {
          setIsPlayerTurn(true);
        }
      }
    }, 1000);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack} className="text-brown-100 hover:text-gold">
          <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
          Back to Games
        </Button>
        <h1 className="text-2xl font-im font-bold text-brown-100">
          Tic-Tac-Tech
        </h1>
        <Button variant="ghost" onClick={resetGame} className="text-brown-100 hover:text-gold">
          <Icon icon="lucide:rotate-ccw" className="w-4 h-4" />
          Reset
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brown-100/5 backdrop-blur-sm rounded-lg p-8 border border-brown-100/20 text-center"
      >
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gold/20 rounded-lg border border-gold"
          >
            <p className="text-gold font-im text-xl">
              {winner === 'tie' ? 'A draw! Well played.' : 
               winner === 'X' ? 'Victory is thine!' : 
               'Thy doppelganger prevails!'}
            </p>
          </motion.div>
        )}

        <div className="mb-4">
          <p className="text-brown-100/80 font-lato">
            {!winner && (isPlayerTurn ? 
              "Thy turn, choose wisely..." : 
              "Thy doppelganger ponders their move...")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-6">
          {board.map((cell, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => makeMove(index)}
              className="aspect-square bg-brown-100 rounded-lg text-4xl font-bold text-brown-800 hover:bg-gold/20 hover:text-brown-800 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 border-2 border-brown-300/20 hover:border-gold/40"
              disabled={!!cell || !!winner || !isPlayerTurn}
            >
              <span className={cell === 'X' ? 'text-brown-800' : cell === 'O' ? 'text-brown-300' : ''}>
                {cell}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="text-center">
          <p className="text-brown-100/70 italic font-im">
            "A peasant's game? Nay — a battlefield of cunning in nine squares."
          </p>
        </div>
      </motion.div>
    </div>
  );
};