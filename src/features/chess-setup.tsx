import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components';
import { Icon } from '@iconify/react';

interface GameSettings {
  timeLimit: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  playerColor: 'white' | 'black';
}

interface ChessGameSetupProps {
  onStartGame: (settings: GameSettings) => void;
  onBack: () => void;
}

export const ChessGameSetup: React.FC<ChessGameSetupProps> = ({ onStartGame, onBack }) => {
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [customTime, setCustomTime] = useState<string>('');
  const [showCustomTime, setShowCustomTime] = useState(false);

  const timeOptions = [
    { label: '2 Minutes', value: 120 },
    { label: '5 Minutes', value: 300 },
    { label: '10 Minutes', value: 600 },
    { label: 'Custom', value: 'custom' },
    { label: 'Casual (No Timer)', value: null }
  ];

  const difficultyOptions = [
    { 
      value: 'easy', 
      label: 'Easy', 
      description: 'Beginner friendly with move hints' 
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      description: 'Balanced challenge with analysis' 
    },
    { 
      value: 'hard', 
      label: 'Hard', 
      description: 'Expert level, post-game analysis only' 
    }
  ];

  const handleTimeSelect = (value: number | string | null) => {
    if (value === 'custom') {
      setShowCustomTime(true);
      setTimeLimit(null);
    } else {
      setShowCustomTime(false);
      setTimeLimit(value as number | null);
    }
  };

  const handleCustomTimeSubmit = () => {
    const minutes = parseInt(customTime);
    if (minutes > 0 && minutes <= 60) {
      setTimeLimit(minutes * 60);
      setShowCustomTime(false);
    }
  };

  const handleStartGame = () => {
    let finalTimeLimit = timeLimit;
    
    if (showCustomTime && customTime) {
      const minutes = parseInt(customTime);
      if (minutes > 0 && minutes <= 60) {
        finalTimeLimit = minutes * 60;
      } else {
        return; // Invalid custom time
      }
    }

    // Randomly choose player color
    const playerColor = Math.random() < 0.5 ? 'white' : 'black';

    onStartGame({
      timeLimit: finalTimeLimit,
      difficulty,
      playerColor
    });
  };

  const isValidSetup = () => {
    if (showCustomTime) {
      const minutes = parseInt(customTime);
      return minutes > 0 && minutes <= 60;
    }
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
        <h3 className="text-2xl font-im font-bold text-brown-100">
          Chess Setup
        </h3>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brown-100/5 backdrop-blur-sm rounded-lg p-8 border border-brown-100/20 max-w-2xl mx-auto"
      >
        <div className="space-y-8">
          {/* Time Selection */}
          <div>
            <h4 className="text-xl font-im text-brown-100 mb-4">Choose Time Control</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {timeOptions.map((option) => (
                <motion.button
                  key={option.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTimeSelect(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    (option.value === timeLimit) || 
                    (option.value === 'custom' && showCustomTime) ||
                    (option.value === null && timeLimit === null && !showCustomTime)
                      ? 'bg-brown-100/10 border-brown-100 text-brown-100'
                      : 'bg-transparent border-brown-100/40 text-brown-100/80 hover:border-brown-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    <Icon 
                      icon={option.value === null ? "lucide:infinity" : "lucide:clock"} 
                      className="w-5 h-5" 
                    />
                  </div>
                </motion.button>
              ))}
            </div>

            {showCustomTime && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-brown-100/5 rounded-lg border border-brown-100/20"
              >
                <label className="block text-brown-100 mb-2">Custom Time (minutes)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="flex-1 px-3 py-2 bg-brown-800 border border-brown-100/20 rounded text-brown-100 focus:outline-none focus:border-gold"
                    placeholder="Enter minutes (1-60)"
                  />
                  <Button
                    size="sm"
                    onClick={handleCustomTimeSubmit}
                    disabled={!customTime || parseInt(customTime) <= 0 || parseInt(customTime) > 60}
                  >
                    Set
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Difficulty Selection */}
          <div>
            <h4 className="text-xl font-im text-brown-100 mb-4">Choose Difficulty</h4>
            <div className="space-y-3">
              {difficultyOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDifficulty(option.value as 'easy' | 'medium' | 'hard')}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    difficulty === option.value
                      ? 'bg-brown-100/10 border-brown-100 text-brown-100'
                      : 'bg-transparent border-brown-100/40 text-brown-100/80 hover:border-brown-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-lg">{option.label}</span>
                    <Icon 
                      icon={
                        option.value === 'easy' ? "lucide:smile" :
                        option.value === 'medium' ? "lucide:meh" : "lucide:frown"
                      } 
                      className="w-5 h-5" 
                    />
                  </div>
                  <p className="text-sm text-brown-100/60">{option.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Game Info */}
          <div className="p-4 bg-brown-100/5 rounded-lg border border-brown-100/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="lucide:info" className="w-5 h-5 text-gold" />
              <span className="font-medium text-brown-100">Game Setup</span>
            </div>
            <ul className="text-sm text-brown-100/70 space-y-1">
              <li>• Your color will be chosen randomly</li>
              <li>• Easy & Medium modes show possible moves</li>
              <li>• Click pieces then destination to move</li>
              <li>• Drag & drop also works</li>
              <li>• Analysis provided based on difficulty</li>
            </ul>
          </div>

          {/* Start Button */}
          <Button
            size="lg"
            onClick={handleStartGame}
            disabled={!isValidSetup()}
            className="w-full"
          >
            <Icon icon="lucide:play" className="w-5 h-5 mr-2" />
            Start Game
          </Button>
        </div>
      </motion.div>
    </div>
  );
};