import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { GamePackage } from "@/data/games";
import { cn } from "@/lib/utils";

interface PackageCardProps {
  pkg: GamePackage;
  currencyIcon: string;
  selected: boolean;
  onSelect: () => void;
  index?: number;
}

const PackageCard = ({
  pkg,
  currencyIcon,
  selected,
  onSelect,
  index = 0,
}: PackageCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer rounded-xl p-4 transition-all duration-300",
        "border-2",
        selected
          ? "border-primary bg-primary/10 glow-primary"
          : "border-border/50 glass-card hover:border-primary/50"
      )}
    >
      {/* Popular Badge */}
      {pkg.popular && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-cyber text-primary-foreground rounded-full">
            ยอดนิยม
          </span>
        </div>
      )}

      {/* Selected Check */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 left-2"
        >
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        </motion.div>
      )}

      {/* Package Content */}
      <div className="text-center space-y-2">
        {/* Amount */}
        <div className="flex items-center justify-center gap-1">
          <span className="text-xl">{currencyIcon}</span>
          <span className="text-xl font-bold text-foreground">
            {pkg.amount.toLocaleString()}
          </span>
        </div>

        {/* Bonus */}
        {pkg.bonus && (
          <span className="inline-block px-2 py-0.5 text-xs font-medium text-success bg-success/10 rounded-full">
            {pkg.bonus}
          </span>
        )}

        {/* Price */}
        <div className="pt-2 border-t border-border/30">
          {pkg.originalPrice && (
            <span className="text-xs text-muted-foreground line-through mr-2">
              ฿{pkg.originalPrice}
            </span>
          )}
          <span
            className={cn(
              "text-lg font-bold",
              selected ? "text-primary text-glow" : "text-foreground"
            )}
          >
            ฿{pkg.price}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PackageCard;
