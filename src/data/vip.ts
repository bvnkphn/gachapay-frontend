export type VipTier = "bronze" | "silver" | "gold" | "platinum";

export interface VipTierInfo {
  id: VipTier;
  name: string;
  thaiName: string;
  icon: string;
  color: string;
  minPoints: number;
  maxPoints: number;
  discount: number;
  cashbackRate: number;
  benefits: string[];
}

export const vipTiers: VipTierInfo[] = [
  {
    id: "bronze",
    name: "Bronze",
    thaiName: "บรอนซ์",
    icon: "🥉",
    color: "from-amber-700 to-amber-900",
    minPoints: 0,
    maxPoints: 999,
    discount: 3,
    cashbackRate: 1,
    benefits: [
      "ส่วนลด 3% ทุกการเติม",
      "รับ 1% คืนเป็นแต้ม",
      "สิทธิ์ร่วมกิจกรรมพิเศษ",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    thaiName: "ซิลเวอร์",
    icon: "🥈",
    color: "from-slate-400 to-slate-600",
    minPoints: 1000,
    maxPoints: 4999,
    discount: 5,
    cashbackRate: 2,
    benefits: [
      "ส่วนลด 5% ทุกการเติม",
      "รับ 2% คืนเป็นแต้ม",
      "สิทธิ์ร่วมกิจกรรมพิเศษ",
      "โปรโมชันพิเศษเฉพาะ Silver",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    thaiName: "โกลด์",
    icon: "🥇",
    color: "from-yellow-500 to-yellow-700",
    minPoints: 5000,
    maxPoints: 14999,
    discount: 10,
    cashbackRate: 3,
    benefits: [
      "ส่วนลด 10% ทุกการเติม",
      "รับ 3% คืนเป็นแต้ม",
      "ช่องทาง Support พิเศษ",
      "โปรโมชันพิเศษเฉพาะ Gold",
      "ของขวัญวันเกิด",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    thaiName: "แพลทินัม",
    icon: "💎",
    color: "from-primary to-secondary",
    minPoints: 15000,
    maxPoints: Infinity,
    discount: 15,
    cashbackRate: 5,
    benefits: [
      "ส่วนลด 15% ทุกการเติม",
      "รับ 5% คืนเป็นแต้ม",
      "Support VIP ตลอด 24 ชม.",
      "โปรโมชันพิเศษเฉพาะ Platinum",
      "ของขวัญวันเกิดสุดพิเศษ",
      "สิทธิ์เข้าถึงดีลพิเศษก่อนใคร",
      "ฟรีค่าธรรมเนียม",
    ],
  },
];

export interface UserVipData {
  currentTier: VipTier;
  points: number;
  totalSpent: number;
  memberSince: string;
}

export const mockUserVip: UserVipData = {
  currentTier: "silver",
  points: 2450,
  totalSpent: 8500,
  memberSince: "2023-06-15",
};

export const getTierByPoints = (points: number): VipTierInfo => {
  return (
    vipTiers.find((tier) => points >= tier.minPoints && points <= tier.maxPoints) ||
    vipTiers[0]
  );
};

export const getNextTier = (currentTier: VipTier): VipTierInfo | null => {
  const currentIndex = vipTiers.findIndex((tier) => tier.id === currentTier);
  if (currentIndex < vipTiers.length - 1) {
    return vipTiers[currentIndex + 1];
  }
  return null;
};

export const getPointsToNextTier = (currentPoints: number): number => {
  const currentTier = getTierByPoints(currentPoints);
  if (currentTier.maxPoints === Infinity) return 0;
  return currentTier.maxPoints + 1 - currentPoints;
};
