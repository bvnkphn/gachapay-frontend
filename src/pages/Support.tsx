import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  Facebook,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PageTransition from "@/components/PageTransition";
import { useToast } from "@/hooks/use-toast";

const faqs = [
  {
    question: "เติมเกมแล้วจะได้รับไอเทมภายในกี่นาที?",
    answer:
      "โดยปกติระบบจะดำเนินการส่งไอเทมให้ภายใน 1-5 นาที หลังจากชำระเงินสำเร็จ ในกรณีที่มีปัญหา ทีมงานจะดำเนินการให้ภายใน 24 ชั่วโมง",
  },
  {
    question: "รองรับช่องทางการชำระเงินอะไรบ้าง?",
    answer:
      "เรารองรับหลายช่องทาง ได้แก่ PromptPay, TrueMoney Wallet, Mobile Banking, บัตรเครดิต/เดบิต, PayPal และ Cryptocurrency (USDT, Bitcoin)",
  },
  {
    question: "ถ้าเติมเงินแล้วไม่ได้รับไอเทมต้องทำอย่างไร?",
    answer:
      "กรุณาติดต่อทีมซัพพอร์ตพร้อมแนบหลักฐานการชำระเงิน เช่น สลิปโอนเงิน และ Order ID เราจะดำเนินการตรวจสอบและแก้ไขให้โดยเร็วที่สุด",
  },
  {
    question: "แต้ม VIP คำนวณอย่างไร?",
    answer:
      "ทุกๆ 100 บาทที่เติม จะได้รับ 10 แต้ม VIP สะสมแต้มเพื่ออัพระดับและรับส่วนลดมากขึ้น ตั้งแต่ 3% ถึง 15%",
  },
  {
    question: "สามารถขอคืนเงินได้หรือไม่?",
    answer:
      "เนื่องจากเป็นสินค้าดิจิทัล เราไม่สามารถคืนเงินได้หลังจากที่ไอเทมถูกส่งไปยังบัญชีผู้เล่นแล้ว กรุณาตรวจสอบ Player ID ให้ถูกต้องก่อนทำรายการ",
  },
  {
    question: "CYBERPAY ปลอดภัยหรือไม่?",
    answer:
      "เราใช้ระบบความปลอดภัยระดับสูง SSL Encryption และไม่เก็บข้อมูลการชำระเงินของคุณ ทุกรายการผ่านการยืนยันจาก Payment Gateway ที่ได้มาตรฐาน",
  },
];

const socialLinks = [
  {
    name: "Facebook",
    icon: Facebook,
    url: "#",
    color: "bg-blue-600",
  },
  {
    name: "Line",
    icon: MessageSquare,
    url: "#",
    color: "bg-green-500",
  },
  {
    name: "Email",
    icon: Mail,
    url: "mailto:support@cyberpay.com",
    color: "bg-primary",
  },
  {
    name: "Phone",
    icon: Phone,
    url: "tel:+6621234567",
    color: "bg-secondary",
  },
];

const Support = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "ชื่อ, อีเมล และข้อความ เป็นข้อมูลที่จำเป็น",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "ส่งข้อความสำเร็จ! ✉️",
      description: "ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
              <MessageCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold">ศูนย์ช่วยเหลือ</h1>
            <p className="text-muted-foreground mt-1">
              ทีมงานพร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง
            </p>
          </div>

          {/* Quick Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          >
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${link.color} rounded-xl p-4 text-white text-center hover:opacity-90 transition-opacity`}
              >
                <link.icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{link.name}</span>
              </motion.a>
            ))}
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-6 mb-8"
          >
            <h2 className="text-lg font-semibold mb-4">คำถามที่พบบ่อย</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold mb-4">ติดต่อเรา</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ *</Label>
                  <Input
                    id="name"
                    placeholder="ชื่อของคุณ"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">หัวข้อ</Label>
                <Input
                  id="subject"
                  placeholder="หัวข้อที่ต้องการสอบถาม"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">ข้อความ *</Label>
                <Textarea
                  id="message"
                  placeholder="รายละเอียดปัญหาหรือข้อสงสัยของคุณ..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-cyber">
                <Send className="w-4 h-4 mr-2" />
                ส่งข้อความ
              </Button>
            </form>
          </motion.div>

          {/* Live Chat Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40"
          >
            <Button
              size="lg"
              className="rounded-full w-14 h-14 bg-gradient-cyber shadow-lg pulse-glow"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Support;
