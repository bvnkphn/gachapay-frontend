export type OrderStatus = "pending" | "processing" | "completed" | "failed";

export interface Order {
  id: string;
  gameId: string;
  gameName: string;
  gameImage: string;
  packageName: string;
  amount: number;
  currency: string;
  price: number;
  playerId: string;
  server?: string;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string;
}

export const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    gameId: "1",
    gameName: "Free Fire",
    gameImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    packageName: "1060 Diamonds",
    amount: 1060,
    currency: "Diamonds",
    price: 330,
    playerId: "1234567890",
    paymentMethod: "PromptPay",
    status: "completed",
    createdAt: "2024-01-25T10:30:00Z",
    completedAt: "2024-01-25T10:31:00Z",
  },
  {
    id: "ORD-2024-002",
    gameId: "2",
    gameName: "Mobile Legends",
    gameImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
    packageName: "514 Diamonds",
    amount: 514,
    currency: "Diamonds",
    price: 199,
    playerId: "9876543210",
    paymentMethod: "TrueMoney Wallet",
    status: "completed",
    createdAt: "2024-01-24T15:45:00Z",
    completedAt: "2024-01-24T15:46:00Z",
  },
  {
    id: "ORD-2024-003",
    gameId: "4",
    gameName: "Genshin Impact",
    gameImage: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=300&fit=crop",
    packageName: "3280 Crystals",
    amount: 3280,
    currency: "Genesis Crystals",
    price: 1750,
    playerId: "812345678",
    server: "Asia",
    paymentMethod: "Credit Card",
    status: "processing",
    createdAt: "2024-01-26T09:00:00Z",
  },
  {
    id: "ORD-2024-004",
    gameId: "3",
    gameName: "PUBG Mobile",
    gameImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop",
    packageName: "660 UC",
    amount: 660,
    currency: "UC",
    price: 330,
    playerId: "5551234567",
    paymentMethod: "Mobile Banking",
    status: "failed",
    createdAt: "2024-01-23T20:15:00Z",
  },
  {
    id: "ORD-2024-005",
    gameId: "5",
    gameName: "ROV (Arena of Valor)",
    gameImage: "https://images.unsplash.com/photo-1493711662062-fa541f7f7a96?w=400&h=300&fit=crop",
    packageName: "950 Vouchers",
    amount: 950,
    currency: "Vouchers",
    price: 359,
    playerId: "1122334455",
    paymentMethod: "PromptPay",
    status: "pending",
    createdAt: "2024-01-26T11:30:00Z",
  },
];

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "completed":
      return "text-success";
    case "processing":
      return "text-primary";
    case "pending":
      return "text-warning";
    case "failed":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
};

export const getStatusText = (status: OrderStatus): string => {
  switch (status) {
    case "completed":
      return "สำเร็จ";
    case "processing":
      return "กำลังดำเนินการ";
    case "pending":
      return "รอดำเนินการ";
    case "failed":
      return "ล้มเหลว";
    default:
      return status;
  }
};
