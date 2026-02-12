// src/pages/ForgotPassword.tsx - ใช้ UI เดิม
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Gamepad2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import PageTransition from '@/components/PageTransition';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false); // แค่ toggle ระหว่าง email/otp
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { forgotPassword, verifyResetOTP } = useAuth();
  const navigate = useNavigate();

  // ส่ง OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await forgotPassword(email);

    if (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'ส่งรหัส OTP แล้ว',
        description: 'กรุณาตรวจสอบอีเมลของคุณ',
      });
      setShowOTP(true); // แสดง OTP input
    }

    setIsLoading(false);
  };

  // ยืนยัน OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error, resetToken } = await verifyResetOTP(email, otp);

    if (error) {
      toast({
        title: 'รหัส OTP ไม่ถูกต้อง',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      // ไปหน้า reset password พร้อม token
      navigate('/reset-password', { state: { resetToken, email } });
    }

    setIsLoading(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo - เหมือนเดิม */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-3 mb-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-cyber flex items-center justify-center glow-primary">
                <Gamepad2 className="w-7 h-7 text-background" />
              </div>
              <span className="text-3xl font-bold text-glow">CYBERPAY</span>
            </motion.div>
          </div>

          <Card className="glass-card border-border/50">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center">
                {!showOTP ? 'ลืมรหัสผ่าน' : 'ยืนยัน OTP'}
              </CardTitle>
              <CardDescription className="text-center">
                {!showOTP
                  ? 'กรอกอีเมลเพื่อรับรหัส OTP'
                  : `ส่งรหัส OTP ไปยัง ${email}`
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Email Form - แสดงเมื่อยังไม่ส่ง OTP */}
              {!showOTP && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-cyber hover:opacity-90 text-background font-semibold h-11 pulse-glow"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'ส่งรหัส OTP'
                    )}
                  </Button>
                </form>
              )}

              {/* OTP Form - แสดงเมื่อส่ง OTP แล้ว */}
              {showOTP && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">รหัส OTP (6 หลัก)</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-cyber hover:opacity-90 text-background font-semibold h-11 pulse-glow"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'ยืนยัน OTP'
                    )}
                  </Button>

                  {/* ปุ่มกลับไปกรอกอีเมลใหม่ */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowOTP(false);
                      setOtp('');
                    }}
                    className="w-full"
                  >
                    กรอกอีเมลใหม่
                  </Button>
                </form>
              )}

              {/* Link กลับไป Login - เหมือนเดิม */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-primary hover:underline"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ForgotPassword;
