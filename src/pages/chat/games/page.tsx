import Image from "@/components/image";
import { games } from "./_data";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GlyphsGame } from "@/features/glyphs-game";
import { TicTacToeGame } from "@/features/tic-tac-toe-game";
import { ChessGame } from "@/features/chess-game";
import { motion } from "motion/react";

export default function GamesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentGame = searchParams.get('game');

  const handleGameSelect = (gameId: string) => {
    navigate(`/chat/games?game=${gameId}`);
  };

  const handleBackToGames = () => {
    navigate('/chat/games');
  };

  // Render specific game based on URL parameter
  if (currentGame === 'glyphs') {
    return <GlyphsGame onBack={handleBackToGames} />;
  }

  if (currentGame === 'tic-tac-toe') {
    return <TicTacToeGame onBack={handleBackToGames} />;
  }

  if (currentGame === 'chess') {
    return <ChessGame onBack={handleBackToGames} />;
  }

  // Default games selection view
  return (
    <div className="m-auto space-y-10">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-brown-100 font-im text-xl"
      >
        So, you want to joust with me? Let me see what best you can do!
      </motion.h2>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
        {games.map((item, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGameSelect(item.id)}
            className="w-full flex flex-col items-center justify-center p-6 rounded-xl bg-brown-100/5 border-2 border-brown-100/20 hover:border-brown-100/40 hover:bg-brown-100/10 transition-all ease-in-out duration-300 group cursor-pointer"
          >
            <div className="mb-4 p-4 rounded-full bg-brown-100/10 group-hover:bg-brown-100/20 transition-colors duration-300">
              <Image 
                src={item.image} 
                alt={item?.title} 
                width={80} 
                height={80} 
                className="w-20 h-20 object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
              />
            </div>
            <div className="text-center">
              <h3 className="text-brown-100 text-lg font-semibold mb-2 group-hover:text-gold transition-colors duration-300">
                {item?.title}
              </h3>
              <p className="font-im opacity-70 text-brown-100/80 text-sm leading-relaxed">
                {item?.desc}
              </p>
            </div>
          </motion.button>
        ))}
      </section>
    </div>
  )
}