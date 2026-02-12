import { motion } from "framer-motion";
import { Zap, ArrowRight, Shield, Clock, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import SearchBar from "@/components/SearchBar";
import GameCard from "@/components/GameCard";
import { games } from "@/data/games";

const features = [
  {
    icon: Zap,
    title: "เติมไว",
    description: "รับไอเทมภายใน 1-5 นาที",
  },
  {
    icon: Shield,
    title: "ปลอดภัย 100%",
    description: "ระบบความปลอดภัยระดับสูง",
  },
  {
    icon: Clock,
    title: "24/7",
    description: "บริการตลอด 24 ชั่วโมง",
  },
  {
    icon: Headphones,
    title: "ซัพพอร์ต",
    description: "ทีมงานพร้อมช่วยเหลือ",
  },
];

const Index = () => {
  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-20">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-cyber-grid bg-grid-size opacity-30" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-1.5s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                แพลตฟอร์มเติมเกมอันดับ 1
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              <span className="text-foreground">เติมเกม</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}ง่าย รวดเร็ว{" "}
              </span>
              <span className="text-foreground">ปลอดภัย</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
            >
              บริการเติมเกมออนไลน์ที่ไว้วางใจได้ รองรับทุกเกมยอดนิยม 
              พร้อมโปรโมชันพิเศษสำหรับสมาชิก VIP
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-md mx-auto mb-8"
            >
              <SearchBar />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-gradient-cyber hover:opacity-90 text-primary-foreground font-semibold px-8 pulse-glow"
                asChild
              >
                <Link to={`/topup/${games[0].slug}`}>
                  เริ่มเติมเกมเลย
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10"
                asChild
              >
                <Link to="/vip">
                  สมัครสมาชิก VIP
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass-card rounded-xl p-4 md:p-6 text-center hover-lift"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-cyber flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                เกมยอดนิยม
              </h2>
              <p className="text-muted-foreground mt-1">
                เลือกเกมที่ต้องการเติมได้เลย
              </p>
            </div>
            <Link
              to="/"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Games Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {games.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-cyber p-8 md:p-12"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-lg">
              <span className="inline-block px-3 py-1 text-xs font-bold bg-white/20 rounded-full text-white mb-4">
                🎉 โปรโมชันพิเศษ
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                สมัครสมาชิก VIP วันนี้ รับส่วนลดสูงสุด 15%
              </h3>
              <p className="text-white/80 mb-6">
                พร้อมรับแต้มสะสมทุกการเติม และสิทธิพิเศษมากมาย
              </p>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold"
                asChild
              >
                <Link to="/vip">
                  สมัครเลย
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom padding for mobile nav */}
      <div className="h-20 md:h-0" />
    </PageTransition>
  );
};

export default Index;
