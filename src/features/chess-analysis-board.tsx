import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';

interface GameSettings {
  timeLimit: number | null;
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

interface ChessAnalysisBoardProps {
  gameSettings: GameSettings | null;
  moves: GameMove[];
  capturedPieces: { white: string[], black: string[] };
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw';
  gameAnalysis: string;
}

const PIECE_VALUES: { [key: string]: number } = {
  'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
};

const PIECE_SYMBOLS: { [key: string]: string } = {
  'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚'
};

export const ChessAnalysisBoard: React.FC<ChessAnalysisBoardProps> = ({
  gameSettings,
  moves,
  capturedPieces,
  gameStatus,
  gameAnalysis
}) => {
  if (!gameSettings) return null;

  const calculateCapturedValue = (pieces: string[]) => {
    return pieces.reduce((total, piece) => total + (PIECE_VALUES[piece] || 0), 0);
  };

  const whiteValue = calculateCapturedValue(capturedPieces.white);
  const blackValue = calculateCapturedValue(capturedPieces.black);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return 'Casual';
    const mins = Math.floor(seconds / 60);
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-brown-100/5 backdrop-blur-sm rounded-lg p-6 border border-brown-100/20 h-fit"
    >
      <h4 className="text-xl font-im text-brown-100 mb-6 flex items-center gap-2">
        <Icon icon="lucide:bar-chart-3" className="w-5 h-5" />
        Game Analysis
      </h4>

      {/* Game Info */}
      <div className="space-y-4 mb-6">
        <div className="p-3 bg-brown-100/5 rounded-lg">
          <h5 className="text-brown-100 font-medium mb-2">Game Type</h5>
          <div className="text-sm text-brown-100/70 space-y-1">
            <p>Difficulty: <span className="text-gold capitalize">{gameSettings.difficulty}</span></p>
            <p>Time: <span className="text-gold">{formatTime(gameSettings.timeLimit)}</span></p>
            <p>Playing as: <span className="text-gold capitalize">{gameSettings.playerColor}</span></p>
          </div>
        </div>

        {/* Move Count */}
        <div className="p-3 bg-brown-100/5 rounded-lg">
          <h5 className="text-brown-100 font-medium mb-2">Moves Made</h5>
          <p className="text-2xl font-bold text-gold">{moves.length}</p>
        </div>
      </div>

      {/* Captured Pieces */}
      <div className="space-y-4 mb-6">
        <h5 className="text-brown-100 font-medium">Captured Pieces</h5>
        
        {/* White Captured */}
        <div className="p-3 bg-brown-100/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-brown-100/70">White Captured</span>
            <span className="text-gold font-bold">+{whiteValue}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {capturedPieces.white.length > 0 ? (
              capturedPieces.white.map((piece, index) => (
                <span key={index} className="text-lg">
                  {PIECE_SYMBOLS[piece] || piece}
                </span>
              ))
            ) : (
              <span className="text-brown-100/40 text-sm">None</span>
            )}
          </div>
        </div>

        {/* Black Captured */}
        <div className="p-3 bg-brown-100/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-brown-100/70">Black Captured</span>
            <span className="text-gold font-bold">+{blackValue}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {capturedPieces.black.length > 0 ? (
              capturedPieces.black.map((piece, index) => (
                <span key={index} className="text-lg">
                  {PIECE_SYMBOLS[piece] || piece}
                </span>
              ))
            ) : (
              <span className="text-brown-100/40 text-sm">None</span>
            )}
          </div>
        </div>

        {/* Material Advantage */}
        {(whiteValue !== blackValue) && (
          <div className="p-3 bg-gold/10 rounded-lg border border-gold/20">
            <div className="text-center">
              <p className="text-sm text-brown-100/70 mb-1">Material Advantage</p>
              <p className="text-gold font-bold">
                {whiteValue > blackValue 
                  ? `White +${whiteValue - blackValue}`
                  : `Black +${blackValue - whiteValue}`
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Moves */}
      {moves.length > 0 && (
        <div className="space-y-4 mb-6">
          <h5 className="text-brown-100 font-medium">Recent Moves</h5>
          <div className="max-h-40 overflow-y-auto space-y-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#D4AF37 #2A1F14'
          }}>
            {moves.slice(-6).map((move, index) => (
              <div key={index} className="p-2 bg-brown-100/5 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-brown-100">{move.san}</span>
                  <span className="text-brown-100/60 text-xs">
                    {Math.floor((moves.length - moves.slice(-6).length + index + 1) / 2) + 1}
                  </span>
                </div>
                {move.analysis && (gameSettings.difficulty === 'easy' || gameSettings.difficulty === 'medium') && (
                  <p className="text-xs text-brown-100/60 mt-1 italic">{move.analysis}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Analysis (Hard mode or game over) */}
      {gameAnalysis && (
        <div className="space-y-4">
          <h5 className="text-brown-100 font-medium flex items-center gap-2">
            <Icon icon="lucide:brain" className="w-4 h-4" />
            AI Analysis
          </h5>
          <div className="p-3 bg-brown-100/5 rounded-lg border border-brown-100/20">
            <p className="text-sm text-brown-100/80 leading-relaxed">{gameAnalysis}</p>
          </div>
        </div>
      )}

      {/* Live Analysis for Easy/Medium */}
      {(gameSettings.difficulty === 'easy' || gameSettings.difficulty === 'medium') && 
       gameStatus === 'playing' && moves.length > 0 && (
        <div className="space-y-4">
          <h5 className="text-brown-100 font-medium flex items-center gap-2">
            <Icon icon="lucide:lightbulb" className="w-4 h-4" />
            Live Tips
          </h5>
          <div className="p-3 bg-mint/10 rounded-lg border border-mint/20">
            <p className="text-sm text-brown-100/80">
              {gameSettings.difficulty === 'easy' 
                ? "Green squares show where you can move. Look for captures and checks!"
                : "Analyze each move carefully. Consider piece safety and board control."
              }
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};