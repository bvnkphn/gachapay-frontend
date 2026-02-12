import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Server, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageTransition from "@/components/PageTransition";
import StepIndicator from "@/components/StepIndicator";
import PackageCard from "@/components/PackageCard";
import PaymentMethodCard from "@/components/PaymentMethodCard";
import { getGameBySlug, GamePackage } from "@/data/games";
import { paymentMethods, getPaymentsByCategory, PaymentMethod } from "@/data/payments";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { number: 1, title: "เลือกแพ็คเกจ" },
  { number: 2, title: "กรอก ID" },
  { number: 3, title: "ชำระเงิน" },
];

const TopUp = () => {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const game = getGameBySlug(gameSlug || "");

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [selectedServer, setSelectedServer] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (!game) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">ไม่พบเกมที่ต้องการ</h1>
            <p className="text-muted-foreground mb-4">กรุณาเลือกเกมจากหน้าแรก</p>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าแรก
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedPackage) {
      toast({
        title: "กรุณาเลือกแพ็คเกจ",
        description: "เลือกจำนวนที่ต้องการเติมก่อนดำเนินการต่อ",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 2) {
      if (!playerId.trim()) {
        toast({
          title: "กรุณากรอก Player ID",
          description: "ระบุ ID ผู้เล่นเพื่อรับไอเทม",
          variant: "destructive",
        });
        return;
      }
      if (game.requiresServer && !selectedServer) {
        toast({
          title: "กรุณาเลือก Server",
          description: "เลือก Server ที่ต้องการเติม",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      toast({
        title: "กรุณาเลือกช่องทางชำระเงิน",
        description: "เลือกวิธีการชำระเงินที่ต้องการ",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setIsComplete(true);

    toast({
      title: "การเติมเงินสำเร็จ! 🎉",
      description: `${selectedPackage?.name} ได้ถูกส่งไปยัง ID: ${playerId}`,
    });
  };

  const thaiPayments = getPaymentsByCategory("thai");
  const internationalPayments = getPaymentsByCategory("international");
  const cryptoPayments = getPaymentsByCategory("crypto");

  if (isComplete) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-24 pb-24">
          <div className="container mx-auto px-4 max-w-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-success" />
              </motion.div>

              <h1 className="text-2xl font-bold mb-2">เติมเงินสำเร็จ!</h1>
              <p className="text-muted-foreground mb-6">
                ระบบกำลังดำเนินการส่งไอเทมให้คุณ
              </p>

              <div className="bg-muted/30 rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เกม:</span>
                  <span className="font-medium">{game.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">แพ็คเกจ:</span>
                  <span className="font-medium">{selectedPackage?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Player ID:</span>
                  <span className="font-medium">{playerId}</span>
                </div>
                {selectedServer && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Server:</span>
                    <span className="font-medium">{selectedServer}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">ยอดชำระ:</span>
                  <span className="font-bold text-primary">
                    ฿{selectedPackage?.price}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/history")}
                >
                  ดูประวัติ
                </Button>
                <Button
                  className="flex-1 bg-gradient-cyber"
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedPackage(null);
                    setPlayerId("");
                    setSelectedServer("");
                    setSelectedPayment(null);
                    setIsComplete(false);
                  }}
                >
                  เติมอีกครั้ง
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img
                src={game.image}
                alt={game.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h1 className="font-bold text-lg">{game.name}</h1>
                <p className="text-xs text-muted-foreground">{game.description}</p>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <StepIndicator steps={steps} currentStep={currentStep} />

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {/* Step 1: Select Package */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-6"
              >
                <h2 className="text-lg font-semibold mb-4">
                  เลือกจำนวน {game.currency} {game.currencyIcon}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {game.packages.map((pkg, index) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      currencyIcon={game.currencyIcon}
                      selected={selectedPackage?.id === pkg.id}
                      onSelect={() => setSelectedPackage(pkg)}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Enter Player ID */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-6 space-y-6"
              >
                {/* Selected Package Summary */}
                {selectedPackage && (
                  <div className="glass-card rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-lg">
                        {game.currencyIcon}
                      </div>
                      <div>
                        <p className="font-medium">{selectedPackage.name}</p>
                        {selectedPackage.bonus && (
                          <p className="text-xs text-success">{selectedPackage.bonus}</p>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-primary">฿{selectedPackage.price}</p>
                  </div>
                )}

                {/* Player ID Input */}
                <div className="space-y-3">
                  <Label htmlFor="playerId" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Player ID
                  </Label>
                  <Input
                    id="playerId"
                    placeholder="กรอก User ID / Player ID"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    * ตรวจสอบ Player ID ให้ถูกต้องก่อนดำเนินการ
                  </p>
                </div>

                {/* Server Selection */}
                {game.requiresServer && game.servers && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      เลือก Server
                    </Label>
                    <Select value={selectedServer} onValueChange={setSelectedServer}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="เลือก Server" />
                      </SelectTrigger>
                      <SelectContent>
                        {game.servers.map((server) => (
                          <SelectItem key={server.id} value={server.name}>
                            {server.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-6 space-y-6"
              >
                {/* Order Summary */}
                <div className="glass-card rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    สรุปคำสั่งซื้อ
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">เกม:</span>
                      <span>{game.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">แพ็คเกจ:</span>
                      <span>{selectedPackage?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Player ID:</span>
                      <span>{playerId}</span>
                    </div>
                    {selectedServer && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Server:</span>
                        <span>{selectedServer}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <span className="font-medium">ยอดชำระทั้งหมด</span>
                    <span className="text-xl font-bold text-primary text-glow">
                      ฿{selectedPackage?.price}
                    </span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  {/* Thai Payments */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      ช่องทางไทย
                    </h4>
                    <div className="space-y-2">
                      {thaiPayments.map((method) => (
                        <PaymentMethodCard
                          key={method.id}
                          method={method}
                          selected={selectedPayment?.id === method.id}
                          onSelect={() => setSelectedPayment(method)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* International Payments */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      ช่องทางต่างประเทศ
                    </h4>
                    <div className="space-y-2">
                      {internationalPayments.map((method) => (
                        <PaymentMethodCard
                          key={method.id}
                          method={method}
                          selected={selectedPayment?.id === method.id}
                          onSelect={() => setSelectedPayment(method)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Crypto Payments */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      คริปโตเคอเรนซี
                    </h4>
                    <div className="space-y-2">
                      {cryptoPayments.map((method) => (
                        <PaymentMethodCard
                          key={method.id}
                          method={method}
                          selected={selectedPayment?.id === method.id}
                          onSelect={() => setSelectedPayment(method)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="fixed bottom-20 md:bottom-0 left-0 right-0 p-4 glass border-t border-border/50 md:relative md:mt-8 md:p-0 md:bg-transparent md:border-0 md:backdrop-blur-none">
            <div className="container mx-auto max-w-2xl flex gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  ย้อนกลับ
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  className="flex-1 bg-gradient-cyber"
                >
                  ถัดไป
                </Button>
              ) : (
                <Button
                  onClick={handlePayment}
                  className="flex-1 bg-gradient-cyber pulse-glow"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    <>ชำระเงิน ฿{selectedPackage?.price}</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TopUp;
