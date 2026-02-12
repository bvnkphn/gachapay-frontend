import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/data/payments";
import { Check } from "lucide-react";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}

const PaymentMethodCard = ({
  method,
  selected,
  onSelect,
}: PaymentMethodCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer rounded-xl p-4 transition-all duration-300 border-2",
        selected
          ? "border-primary bg-primary/10 glow-primary"
          : "border-border/50 glass-card hover:border-primary/50"
      )}
    >
      {/* Selected Check */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2"
        >
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
          {method.icon}
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="font-medium text-foreground">{method.name}</p>
          {method.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {method.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-primary">{method.processingTime}</span>
            {method.fee !== undefined && method.fee > 0 && (
              <span className="text-xs text-muted-foreground">
                • ค่าธรรมเนียม ฿{method.fee}
              </span>
            )}
            {method.fee === 0 && (
              <span className="text-xs text-success">• ฟรีค่าธรรมเนียม</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentMethodCard;
