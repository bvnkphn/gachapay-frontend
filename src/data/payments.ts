export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  category: "thai" | "international" | "crypto";
  description?: string;
  processingTime: string;
  fee?: number;
}

export const paymentMethods: PaymentMethod[] = [
  // Thai payment methods
  {
    id: "promptpay",
    name: "PromptPay",
    icon: "📱",
    category: "thai",
    description: "สแกน QR Code ชำระเงินทันที",
    processingTime: "ทันที",
    fee: 0,
  },
  {
    id: "truemoney",
    name: "TrueMoney Wallet",
    icon: "💚",
    category: "thai",
    description: "ชำระผ่าน TrueMoney Wallet",
    processingTime: "ทันที",
    fee: 0,
  },
  {
    id: "mobile-banking",
    name: "Mobile Banking",
    icon: "🏦",
    category: "thai",
    description: "โอนผ่านแอปธนาคาร",
    processingTime: "1-5 นาที",
    fee: 0,
  },
  {
    id: "7-eleven",
    name: "7-Eleven",
    icon: "🏪",
    category: "thai",
    description: "ชำระเงินที่ 7-Eleven",
    processingTime: "5-15 นาที",
    fee: 15,
  },
  // International payment methods
  {
    id: "credit-card",
    name: "Credit/Debit Card",
    icon: "💳",
    category: "international",
    description: "Visa, Mastercard, JCB",
    processingTime: "ทันที",
    fee: 0,
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: "🅿️",
    category: "international",
    description: "ชำระผ่าน PayPal",
    processingTime: "ทันที",
    fee: 0,
  },
  // Crypto
  {
    id: "usdt",
    name: "USDT (Tether)",
    icon: "💲",
    category: "crypto",
    description: "TRC20 / ERC20",
    processingTime: "5-30 นาที",
    fee: 0,
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    icon: "₿",
    category: "crypto",
    description: "BTC Network",
    processingTime: "10-60 นาที",
    fee: 0,
  },
];

export const getPaymentsByCategory = (
  category: "thai" | "international" | "crypto"
): PaymentMethod[] => {
  return paymentMethods.filter((method) => method.category === category);
};

export const getPaymentById = (id: string): PaymentMethod | undefined => {
  return paymentMethods.find((method) => method.id === id);
};
