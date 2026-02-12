import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { games, Game } from "@/data/games";
import { Link } from "react-router-dom";

interface SearchBarProps {
  className?: string;
}

const SearchBar = ({ className }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = games.filter(
      (game) =>
        game.name.toLowerCase().includes(lowerQuery) ||
        game.category.toLowerCase().includes(lowerQuery)
    );
    setResults(filtered);
  }, [query]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
  };

  const handleSelectGame = () => {
    setQuery("");
    setResults([]);
    setIsFocused(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ค้นหาเกม..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full h-12 pl-12 pr-10 rounded-xl bg-muted/50 border-border/50 focus:border-primary focus:glow-primary transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isFocused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden z-50 shadow-lg"
          >
            {results.map((game, index) => (
              <Link
                key={game.id}
                to={`/topup/${game.slug}`}
                onClick={handleSelectGame}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{game.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {game.category} • {game.currency}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}

        {isFocused && query && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl p-4 z-50"
          >
            <p className="text-center text-muted-foreground">
              ไม่พบเกมที่ค้นหา
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
