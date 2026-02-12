import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Game } from "@/data/games";

interface GameCardProps {
  game: Game;
  index?: number;
}

const GameCard = ({ game, index = 0 }: GameCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Link to={`/topup/${game.slug}`}>
        <div className="glass-card rounded-xl overflow-hidden hover:glow-primary transition-all duration-300">
          {/* Game Image */}
          <div className="relative h-40 overflow-hidden">
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full border border-primary/30">
                {game.category}
              </span>
            </div>
          </div>

          {/* Game Info */}
          <div className="p-4">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {game.name}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <span>{game.currencyIcon}</span>
              <span>{game.currency}</span>
            </div>
            
            {/* Price hint */}
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                เริ่มต้น{" "}
                <span className="text-primary font-semibold">
                  ฿{game.packages[0]?.price}
                </span>
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default GameCard;
