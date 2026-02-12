export interface GamePackage {
  id: string;
  name: string;
  amount: number;
  price: number;
  originalPrice?: number;
  bonus?: string;
  popular?: boolean;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  currency: string;
  currencyIcon: string;
  description: string;
  packages: GamePackage[];
  requiresServer?: boolean;
  servers?: { id: string; name: string }[];
}

export const games: Game[] = [
  {
    id: "1",
    name: "Free Fire",
    slug: "free-fire",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    category: "Battle Royale",
    currency: "Diamonds",
    currencyIcon: "💎",
    description: "เติมเพชร Free Fire รับทันที!",
    packages: [
      { id: "ff-1", name: "100 Diamonds", amount: 100, price: 35, popular: false },
      { id: "ff-2", name: "310 Diamonds", amount: 310, price: 99, bonus: "+31 โบนัส", popular: true },
      { id: "ff-3", name: "520 Diamonds", amount: 520, price: 165, bonus: "+52 โบนัส" },
      { id: "ff-4", name: "1060 Diamonds", amount: 1060, price: 330, bonus: "+106 โบนัส", popular: true },
      { id: "ff-5", name: "2180 Diamonds", amount: 2180, price: 660, bonus: "+218 โบนัส" },
      { id: "ff-6", name: "5600 Diamonds", amount: 5600, price: 1650, originalPrice: 1800, bonus: "+560 โบนัส" },
    ],
  },
  {
    id: "2",
    name: "Mobile Legends",
    slug: "mobile-legends",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
    category: "MOBA",
    currency: "Diamonds",
    currencyIcon: "💎",
    description: "เติมเพชร Mobile Legends: Bang Bang",
    packages: [
      { id: "ml-1", name: "86 Diamonds", amount: 86, price: 35 },
      { id: "ml-2", name: "172 Diamonds", amount: 172, price: 69, popular: true },
      { id: "ml-3", name: "257 Diamonds", amount: 257, price: 99 },
      { id: "ml-4", name: "344 Diamonds", amount: 344, price: 135 },
      { id: "ml-5", name: "514 Diamonds", amount: 514, price: 199, popular: true },
      { id: "ml-6", name: "706 Diamonds", amount: 706, price: 265 },
      { id: "ml-7", name: "2195 Diamonds", amount: 2195, price: 799, bonus: "+220 โบนัส" },
    ],
  },
  {
    id: "3",
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop",
    category: "Battle Royale",
    currency: "UC",
    currencyIcon: "🪙",
    description: "เติม UC สำหรับ PUBG Mobile",
    packages: [
      { id: "pubg-1", name: "60 UC", amount: 60, price: 35 },
      { id: "pubg-2", name: "325 UC", amount: 325, price: 165, bonus: "+25 โบนัส", popular: true },
      { id: "pubg-3", name: "660 UC", amount: 660, price: 330, bonus: "+60 โบนัส" },
      { id: "pubg-4", name: "1800 UC", amount: 1800, price: 825, bonus: "+300 โบนัส", popular: true },
      { id: "pubg-5", name: "3850 UC", amount: 3850, price: 1650, bonus: "+850 โบนัส" },
      { id: "pubg-6", name: "8100 UC", amount: 8100, price: 3300, originalPrice: 3600, bonus: "+2100 โบนัส" },
    ],
  },
  {
    id: "4",
    name: "Genshin Impact",
    slug: "genshin-impact",
    image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=300&fit=crop",
    category: "RPG",
    currency: "Genesis Crystals",
    currencyIcon: "💠",
    description: "เติม Genesis Crystals สำหรับ Genshin Impact",
    requiresServer: true,
    servers: [
      { id: "asia", name: "Asia" },
      { id: "america", name: "America" },
      { id: "europe", name: "Europe" },
      { id: "tw-hk-mo", name: "TW, HK, MO" },
    ],
    packages: [
      { id: "gi-1", name: "60 Crystals", amount: 60, price: 35 },
      { id: "gi-2", name: "330 Crystals", amount: 330, price: 175, bonus: "+30 โบนัส" },
      { id: "gi-3", name: "980 Crystals", amount: 980, price: 520, bonus: "+110 โบนัส", popular: true },
      { id: "gi-4", name: "1980 Crystals", amount: 1980, price: 1050, bonus: "+260 โบนัส" },
      { id: "gi-5", name: "3280 Crystals", amount: 3280, price: 1750, bonus: "+600 โบนัส", popular: true },
      { id: "gi-6", name: "6480 Crystals", amount: 6480, price: 3500, originalPrice: 3800, bonus: "+1600 โบนัส" },
    ],
  },
  {
    id: "5",
    name: "ROV (Arena of Valor)",
    slug: "rov",
    image: "https://images.unsplash.com/photo-1493711662062-fa541f7f7a96?w=400&h=300&fit=crop",
    category: "MOBA",
    currency: "Vouchers",
    currencyIcon: "🎟️",
    description: "เติม Vouchers สำหรับ ROV",
    packages: [
      { id: "rov-1", name: "90 Vouchers", amount: 90, price: 35 },
      { id: "rov-2", name: "230 Vouchers", amount: 230, price: 89, popular: true },
      { id: "rov-3", name: "470 Vouchers", amount: 470, price: 179 },
      { id: "rov-4", name: "950 Vouchers", amount: 950, price: 359, popular: true },
      { id: "rov-5", name: "1900 Vouchers", amount: 1900, price: 699 },
      { id: "rov-6", name: "4750 Vouchers", amount: 4750, price: 1699, originalPrice: 1899 },
    ],
  },
  {
    id: "6",
    name: "Honkai: Star Rail",
    slug: "honkai-star-rail",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop",
    category: "RPG",
    currency: "Oneiric Shards",
    currencyIcon: "✨",
    description: "เติม Oneiric Shards สำหรับ Honkai: Star Rail",
    requiresServer: true,
    servers: [
      { id: "asia", name: "Asia" },
      { id: "america", name: "America" },
      { id: "europe", name: "Europe" },
    ],
    packages: [
      { id: "hsr-1", name: "60 Shards", amount: 60, price: 35 },
      { id: "hsr-2", name: "330 Shards", amount: 330, price: 175, bonus: "+30 โบนัส" },
      { id: "hsr-3", name: "980 Shards", amount: 980, price: 520, bonus: "+110 โบนัส", popular: true },
      { id: "hsr-4", name: "1980 Shards", amount: 1980, price: 1050, bonus: "+260 โบนัส" },
      { id: "hsr-5", name: "3280 Shards", amount: 3280, price: 1750, bonus: "+600 โบนัส", popular: true },
      { id: "hsr-6", name: "6480 Shards", amount: 6480, price: 3500, originalPrice: 3800, bonus: "+1600 โบนัส" },
    ],
  },
  {
    id: "7",
    name: "Valorant",
    slug: "valorant",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&h=300&fit=crop",
    category: "FPS",
    currency: "VP",
    currencyIcon: "🔷",
    description: "เติม Valorant Points (VP)",
    packages: [
      { id: "val-1", name: "475 VP", amount: 475, price: 165 },
      { id: "val-2", name: "1000 VP", amount: 1000, price: 330, popular: true },
      { id: "val-3", name: "2050 VP", amount: 2050, price: 660 },
      { id: "val-4", name: "3650 VP", amount: 3650, price: 1150, popular: true },
      { id: "val-5", name: "5350 VP", amount: 5350, price: 1650 },
      { id: "val-6", name: "11000 VP", amount: 11000, price: 3300, originalPrice: 3500 },
    ],
  },
  {
    id: "8",
    name: "Roblox",
    slug: "roblox",
    image: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=400&h=300&fit=crop",
    category: "Sandbox",
    currency: "Robux",
    currencyIcon: "🅡",
    description: "เติม Robux สำหรับ Roblox",
    packages: [
      { id: "rbx-1", name: "80 Robux", amount: 80, price: 35 },
      { id: "rbx-2", name: "400 Robux", amount: 400, price: 165, popular: true },
      { id: "rbx-3", name: "800 Robux", amount: 800, price: 330 },
      { id: "rbx-4", name: "1700 Robux", amount: 1700, price: 660, popular: true },
      { id: "rbx-5", name: "4500 Robux", amount: 4500, price: 1650, bonus: "+450 โบนัส" },
      { id: "rbx-6", name: "10000 Robux", amount: 10000, price: 3300, originalPrice: 3600, bonus: "+1000 โบนัส" },
    ],
  },
];

export const getGameBySlug = (slug: string): Game | undefined => {
  return games.find((game) => game.slug === slug);
};

export const searchGames = (query: string): Game[] => {
  const lowerQuery = query.toLowerCase();
  return games.filter(
    (game) =>
      game.name.toLowerCase().includes(lowerQuery) ||
      game.category.toLowerCase().includes(lowerQuery)
  );
};
