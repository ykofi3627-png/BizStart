export interface EquipmentTierOption {
  name: string;
  price: number; // In USD
  source: 'Amazon' | 'Jiji' | 'Jumia';
  sourceNotes: string; // Details like "Used/Refurbished on Jiji", "Official Store on Jumia"
  brandModel: string;
}

export interface Review {
  id: string;
  rating: number; // 1-5
  username: string;
  date: string;
  comment: string;
  verified: boolean;
  context: string; // e.g. "Home Baker", "Photographer"
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: string; // e.g., "Capturing / Inputs", "Audio / Sound", "Support & Lighting", "Processing & Editing"
  importance: 'essential' | 'recommended' | 'optional';
  description: string;
  lowerGrade: EquipmentTierOption;
  middleGrade: EquipmentTierOption;
  professional: EquipmentTierOption;
}

export interface BusinessSetupPlan {
  query: string;
  businessName: string;
  industry: string;
  summary: string;
  overview: string;
  usefulSkills: string[];
  licensingTips: string;
  keyCategories: string[];
  equipment: EquipmentItem[];
  currencySymbol: string; // e.g., "$"
  conversionRate: {
    Naira?: number; // Nigerian Naira for Jiji/Jumia
    Cedis?: number; // Ghanaian Cedis
    Euro?: number; // Euros
  };
}

export interface CustomBudgetSelection {
  [itemId: string]: 'lowerGrade' | 'middleGrade' | 'professional' | 'excluded';
}

export interface ReviewsDictionary {
  [itemId: string]: Review[];
}
