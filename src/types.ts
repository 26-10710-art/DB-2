export type CarbonLevel = "high" | "medium" | "low";

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  carbonLevel: CarbonLevel;
  carbonReason: string;
  pointImpact: number;
}

export interface ReceiptHistory {
  id: string;
  date: string;
  items: ReceiptItem[];
  totalPointImpact: number;
  source: string;
}

export interface DecorationItem {
  id: string;
  name: string;
  category: "energy" | "nature" | "waste" | "living" | "transport";
  price: number;
  emoji: string;
  description: string;
  ecoScoreBonus: number; // contribution to village green rating
}

export interface PlacedDecoration {
  id: string; // unique instance id
  itemId: string; // references DecorationItem.id
  x: number; // grid percentage or tile coordinate
  y: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  points: number;
  unlockedDecorations: string[]; // item ids purchased
  placedDecorations: PlacedDecoration[]; // list of placed decorations in village
  receiptHistory: ReceiptHistory[];
}

export interface GuideCategory {
  id: string;
  name: string;
  level: CarbonLevel;
  pointChange: string;
  description: string;
  examples: string[];
  emoji: string;
  color: string;
}
