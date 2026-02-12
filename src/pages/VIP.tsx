import { motion } from "framer-motion";
import { Crown, Gift, Percent, Star, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PageTransition from "@/components/PageTransition";
import {
  vipTiers,
  mockUserVip,
  getTierByPoints,
  getNextTier,
  getPointsToNextTier,
} from "@/data/vip";
import { cn } from "@/lib/utils";

const VIP = () => {
  const userVip = mockUserVip;
  const currentTierInfo = getTierByPoints(userVip.points);
  const nextTierInfo = getNextTier(currentTierInfo.id);
  const pointsToNext = getPointsToNextTier(userVip.points);

  const progressPercent = nextTierInfo
    ? ((userVip.points - currentTierInfo.minPoints) /
        (currentTierInfo.maxPoints - currentTierInfo.minPoints + 1)) *
      100
    : 100;

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-cyber mb-4"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold">สมาชิก VIP</h1>
            <p className="text-muted-foreground mt-1">
              รับสิทธิพิเศษมากมายจากการเป็นสมาชิก
            </p>
          </div>

          {/* Current Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "relative overflow-hidden rounded-2xl p-6 mb-6",
              "bg-gradient-to-br",
              currentTierInfo.color
            )}
          >
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm">ระดับปัจจุบัน</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-3xl">{currentTierInfo.icon}</span>
                    <span className="text-2xl font-bold text-white">
                      {currentTierInfo.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">แต้มสะสม</p>
                  <p className="text-2xl font-bold text-white">
                    {userVip.points.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress to Next Tier */}
              {nextTierInfo && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                    <span>อีก {pointsToNext.toLocaleString()} แต้ม ถึง {nextTierInfo.name}</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/80 text-xs">ยอดใช้จ่ายรวม</p>
                  <p className="text-lg font-bold text-white">
                    ฿{userVip.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/80 text-xs">ส่วนลดปัจจุบัน</p>
                  <p className="text-lg font-bold text-white">
                    {currentTierInfo.discount}%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Current Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-6 mb-6"
          >
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-primary" />
              สิทธิพิเศษของคุณ
            </h2>
            <div className="space-y-3">
              {currentTierInfo.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Star className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* All Tiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-secondary" />
              ระดับสมาชิกทั้งหมด
            </h2>
            {vipTiers.map((tier, index) => {
              const isCurrent = tier.id === currentTierInfo.id;
              const isLocked = tier.minPoints > userVip.points;

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={cn(
                    "glass-card rounded-xl p-4 transition-all",
                    isCurrent && "border-2 border-primary glow-primary",
                    isLocked && "opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                          "bg-gradient-to-br",
                          tier.color
                        )}
                      >
                        {tier.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{tier.name}</p>
                          {isCurrent && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                              ปัจจุบัน
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tier.minPoints.toLocaleString()}+ แต้ม
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          -{tier.discount}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ส่วนลด
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">
              ยิ่งเติมมาก ยิ่งได้แต้มมาก อัพระดับเพื่อรับส่วนลดเพิ่ม!
            </p>
            <Button className="bg-gradient-cyber pulse-glow">
              <Percent className="w-4 h-4 mr-2" />
              เริ่มเติมเกมเลย
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default VIP;
