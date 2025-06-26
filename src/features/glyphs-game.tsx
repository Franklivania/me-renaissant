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
    <div className="max-w-2xl mx-auto px-4 py-8">
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
          House of Glyphs
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
          <p className="text-brown-100/80 mb-2 font-lato">
            Moves: <span className="text-gold font-semibold">{moves}</span> |
            Matches: <span className="text-gold font-semibold">{matches}</span>/{GLYPHS.length}
          </p>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gold/20 rounded-lg border border-gold"
            >
              <p className="text-gold font-im text-xl">
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
                    className={`absolute inset-0 rounded-lg border-2 backface-hidden transition-all duration-300 ${card.isFlipped || card.isMatched
                        ? 'bg-brown-100 border-gold text-brown-800'
                        : 'bg-brown-300/20 border-brown-100/40 hover:border-brown-100/60'
                      }`}
                    style={{
                      transform: card.isFlipped || card.isMatched ? 'rotateY(0deg)' : 'rotateY(0deg)',
                    }}
                  >
                    <div className="flex items-center justify-center h-full text-3xl">
                      {card.isFlipped || card.isMatched ? card.glyph : (
                        <Icon icon="mdi:help" className="w-8 h-8 text-brown-100/60" />
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="text-center mt-6">
          <p className="text-brown-100/70 italic font-im">
            "In the dance of memory and meaning, truth reveals itself to those who seek..."
          </p>
        </div>
      </motion.div>
    </div>
  );
};