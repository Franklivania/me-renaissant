import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components';
import { Icon } from '@iconify/react';

const GLYPHS = ['⚡', '🌙', '⭐', '🔥', '🌊', '🌿', '💎', '🗝️'];

interface Card {
  id: number;
  glyph: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const GlyphsGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const initializeGame = () => {
    const gameGlyphs = [...GLYPHS, ...GLYPHS];
    const shuffled = gameGlyphs
      .sort(() => Math.random() - 0.5)
      .map((glyph, index) => ({
        id: index,
        glyph,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setIsComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];
      
      setMoves(prev => prev + 1);

      if (firstCard.glyph === secondCard.glyph) {
        setCards(prev => prev.map(card => 
          card.id === first || card.id === second 
            ? { ...card, isMatched: true }
            : card
        ));
        setMatches(prev => prev + 1);
        setFlippedCards([]);

        if (matches + 1 === GLYPHS.length) {
          setIsComplete(true);
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards, matches]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    ));
    setFlippedCards(prev => [...prev, id]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack}>
          <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
          Back to Games
        </Button>
        <h1 className="text-2xl font-serif font-bold text-parchment-100">
          House of Glyphs
        </h1>
        <Button variant="ghost" onClick={initializeGame}>
          <Icon icon="lucide:rotate-ccw" className="w-4 h-4" />
          Reset
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-renaissance-800 bg-opacity-60 backdrop-blur-sm rounded-lg p-8 border border-parchment-400"
      >
        <div className="text-center mb-6">
          <p className="text-parchment-200 mb-2">
            Moves: {moves} | Matches: {matches}/{GLYPHS.length}
          </p>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gold-400 bg-opacity-20 rounded-lg border border-gold-400"
            >
              <p className="text-gold-400 font-serif text-xl">
                The glyphs have revealed their secrets! Victory in {moves} moves.
              </p>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          <AnimatePresence>
            {cards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(card.id)}
                className="aspect-square cursor-pointer"
              >
                <div className="relative w-full h-full">
                  <motion.div
                    className={`absolute inset-0 rounded-lg border-2 backface-hidden ${
                      card.isFlipped || card.isMatched
                        ? 'bg-parchment-200 border-gold-400 text-renaissance-800'
                        : 'bg-renaissance-700 border-parchment-400'
                    }`}
                    style={{
                      transform: card.isFlipped || card.isMatched ? 'rotateY(0deg)' : 'rotateY(0deg)',
                    }}
                  >
                    <div className="flex items-center justify-center h-full text-3xl">
                      {card.isFlipped || card.isMatched ? card.glyph : '?'}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="text-center mt-6">
          <p className="text-parchment-300 italic">
            "In the dance of memory and meaning, truth reveals itself to those who seek..."
          </p>
        </div>
      </motion.div>
    </div>
  );
};