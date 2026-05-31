import { Review } from './types';

// Random reviewer profiles for realistic variance
const REVIEWER_PROFILES = [
  { username: "Kojo_S88", context: "Local Café Owner", location: "Accra, GH" },
  { username: "Abiodun_TechStartup", context: "SaaS Dev Lead", location: "Lagos, NG" },
  { username: "Wanjiku_Creative", context: "Commercial Videographer", location: "Nairobi, KE" },
  { username: "Grace_Cakes", context: "Baking Hobbyist", location: "Entebbe, UG" },
  { username: "Elena_V", context: "Content Agency Lead", location: "London, UK" },
  { username: "Marcus_Photo", context: "Studio Coordinator", location: "Atlanta, US" },
  { username: "Amina_Bakes", context: "Artisanal Baker", location: "Abuja, NG" },
  { username: "Kwame_Agency", context: "SEO Consultant", location: "Kumasi, GH" },
  { username: "Otieno_J", context: "Remote Technical Coach", location: "Mombasa, KE" },
  { username: "Sami_Dropship", context: "E-Commerce Director", location: "Berlin, DE" }
];

const GENERIC_COMMENTS_HIGH = [
  {
    rating: 5,
    text: "Exceeded all my expectations. For the price, you cannot get anything more reliable. Heavily recommended if you are trying to bootstrap standard operations!"
  },
  {
    rating: 5,
    text: "Absolute game-changer! Sourced this option as part of my initial first-day inventory upgrade. Zero regrets so far. Extremely sturdy."
  },
  {
    rating: 4,
    text: "Very solid build quality. A small learning curve to align it perfectly, but fits seamlessly in my daily workflow. Sourced safely."
  },
  {
    rating: 4,
    text: "An indispensable asset for my workspace. Very responsive interface and handles heavy workloads without any delay."
  }
];

const CATEGORY_SPECIFIC_IDEAS: { [key: string]: string[] } = {
  "Audio": [
    "Incredible frequency response. The noise isolation is brilliant for recording crisp clear voice tracks.",
    "Bargain price but studio quality. Solved my echoing issues completely when paired with dynamic ranges."
  ],
  "Video": [
    "Amazing autofocus speeds and battery endurance. Great in low-light conditions for indoor shoots.",
    "Very heavy-duty build. Fits standard mount plates securely and the glass clarity is spotless."
  ],
  "Input": [
    "Extremely ergonomic mechanical feedback. Keys bounce perfectly and tactile sensation helps sustain long typing times.",
    "Plug-and-play is instant and compatible with modern iPad/macOS configurations right out of the box."
  ],
  "Oven": [
    "Even thermal heat circulation keeps my sourdough loaves perfectly puffy with nice crusty textures. Highly dependable.",
    "Heats up quickly, saving fuel costs. The timer alerts are loud enough to hear in the next room!"
  ],
  "Mixer": [
    "Strong torque motor. Kneads sticky bread dough or whips lightweight egg meringue easily without overheating.",
    "The lock-lever doesn't wiggle at all under heavy industrial loads. Pure stainless steel build!"
  ],
  "Software": [
    "Simplifies automatic indexing of transactions. Saved me at least 5 hours of manual writing per week.",
    "Seamless cloud integration. Multiple client profiles are kept segregated and safe with fast loading."
  ]
};

export function generateDefaultReviewsForItem(itemId: string, itemName: string, category: string): Review[] {
  // Select reviews based on item keywords or return generic high quality
  const isAudio = itemName.toLowerCase().includes("mic") || itemName.toLowerCase().includes("audio") || itemName.toLowerCase().includes("headset") || category.toLowerCase().includes("sound");
  const isVideo = itemName.toLowerCase().includes("camera") || itemName.toLowerCase().includes("lens") || itemName.toLowerCase().includes("light") || category.toLowerCase().includes("captur") || category.toLowerCase().includes("lighting");
  const isBaking = itemName.toLowerCase().includes("oven") || itemName.toLowerCase().includes("baking");
  const isMixer = itemName.toLowerCase().includes("mixer") || itemName.toLowerCase().includes("blender");
  const isSoftware = itemName.toLowerCase().includes("software") || itemName.toLowerCase().includes("subscription") || itemName.toLowerCase().includes("app") || itemName.toLowerCase().includes("platform");

  let customTexts: string[] = [];
  if (isAudio && CATEGORY_SPECIFIC_IDEAS["Audio"]) customTexts = CATEGORY_SPECIFIC_IDEAS["Audio"];
  else if (isVideo && CATEGORY_SPECIFIC_IDEAS["Video"]) customTexts = CATEGORY_SPECIFIC_IDEAS["Video"];
  else if (isBaking && CATEGORY_SPECIFIC_IDEAS["Oven"]) customTexts = CATEGORY_SPECIFIC_IDEAS["Oven"];
  else if (isMixer && CATEGORY_SPECIFIC_IDEAS["Mixer"]) customTexts = CATEGORY_SPECIFIC_IDEAS["Mixer"];
  else if (isSoftware && CATEGORY_SPECIFIC_IDEAS["Software"]) customTexts = CATEGORY_SPECIFIC_IDEAS["Software"];

  // Pick reviewer profiles with pseudo-random offsets based on itemId characters
  const seed1 = itemId.charCodeAt(0) % REVIEWER_PROFILES.length;
  const seed2 = (itemId.charCodeAt(itemId.length - 1) || 3) % REVIEWER_PROFILES.length;

  const profile1 = REVIEWER_PROFILES[seed1];
  const profile2 = REVIEWER_PROFILES[seed2 === seed1 ? (seed2 + 1) % REVIEWER_PROFILES.length : seed2];

  // Pick dates in late 2025 / early 2026
  const date1 = `2026-02-${10 + (seed1 % 18)}`;
  const date2 = `2026-04-${12 + (seed2 % 15)}`;

  const reviews: Review[] = [
    {
      id: `${itemId}_rev1`,
      rating: 5,
      username: profile1.username,
      date: date1,
      comment: customTexts[0] 
        ? `${customTexts[0]} Truly premium product quality.` 
        : `Outstanding purchase on ${itemName}! Sourced it for my startup and it has been exceptionally helpful. Great value compared to others.`,
      verified: true,
      context: `${profile1.context} (${profile1.location})`
    },
    {
      id: `${itemId}_rev2`,
      rating: 4,
      username: profile2.username,
      date: date2,
      comment: customTexts[1] 
        ? `${customTexts[1]} Highly recommend considering this tier.`
        : `Really glad I got this ${itemName}. Good build quality, sturdy framework, and runs silently. Worth the investment.`,
      verified: seed2 % 2 === 0,
      context: `${profile2.context} (${profile2.location})`
    }
  ];

  return reviews;
}
