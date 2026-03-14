// ─── Game Constants ──────────────────────────────────────────

export const EQUIPMENT_COSTS = [0, 0, 5000, 10000, 20000, 40000];
export const DECOR_COSTS = [0, 0, 3000, 6000, 12000, 25000];

export const BEAN_TIERS = [
  { tier: 1, label: "Basic", costPerStore: 200, qualityMult: 0.7 },
  { tier: 2, label: "Premium", costPerStore: 500, qualityMult: 1.0 },
  { tier: 3, label: "Specialty", costPerStore: 1000, qualityMult: 1.4 },
];

export const MARKETING_TIERS = [
  { tier: 0, label: "None", weeklyCost: 0, repBonus: 0, trafficMult: 1.0 },
  { tier: 1, label: "Local Flyers", weeklyCost: 500, repBonus: 1, trafficMult: 1.08 },
  { tier: 2, label: "Social Media", weeklyCost: 2000, repBonus: 2, trafficMult: 1.18 },
  { tier: 3, label: "City-Wide Ads", weeklyCost: 5000, repBonus: 3, trafficMult: 1.30 },
];

export const LOCATIONS = [
  { key: "downtown", label: "Downtown", rent: 2100, traffic: 12000 },
  { key: "suburbs", label: "Suburbs", rent: 1050, traffic: 7000 },
  { key: "university", label: "University", rent: 1400, traffic: 10000 },
  { key: "waterfront", label: "Waterfront", rent: 2450, traffic: 11000 },
  { key: "business_district", label: "Business District", rent: 2800, traffic: 13000 },
];

export const CITIES = [
  { key: "seattle", label: "Seattle", unlockCost: 0, rentMult: 1.0, trafficMult: 1.15, demandBias: "espresso", description: "Coffee capital, high demand", icon: "coffee" },
  { key: "austin", label: "Austin", unlockCost: 30000, rentMult: 0.85, trafficMult: 1.1, demandBias: "cold", description: "Fast-growing, loves cold brew", icon: "sun" },
  { key: "chicago", label: "Chicago", unlockCost: 40000, rentMult: 1.05, trafficMult: 1.0, demandBias: "food", description: "Big market, food-forward", icon: "building" },
  { key: "new_york", label: "New York", unlockCost: 60000, rentMult: 1.4, trafficMult: 1.25, demandBias: "espresso", description: "Massive market, premium rent", icon: "building" },
  { key: "san_francisco", label: "San Francisco", unlockCost: 55000, rentMult: 1.35, trafficMult: 1.05, demandBias: "specialty", description: "Tech-savvy, specialty drinks", icon: "star" },
  { key: "tokyo", label: "Tokyo", unlockCost: 75000, rentMult: 1.5, trafficMult: 1.3, demandBias: "specialty", description: "Premium market, high traffic", icon: "star" },
  { key: "london", label: "London", unlockCost: 65000, rentMult: 1.3, trafficMult: 1.15, demandBias: "espresso", description: "Classic coffee culture", icon: "coffee" },
  { key: "paris", label: "Paris", unlockCost: 70000, rentMult: 1.25, trafficMult: 1.1, demandBias: "food", description: "Cafe culture, food lovers", icon: "coffee" },
  { key: "sydney", label: "Sydney", unlockCost: 50000, rentMult: 1.1, trafficMult: 1.05, demandBias: "cold", description: "Beach vibes, flat whites", icon: "sun" },
  { key: "miami", label: "Miami", unlockCost: 35000, rentMult: 0.95, trafficMult: 1.0, demandBias: "cold", description: "Tropical, iced everything", icon: "sun" },
];

export const BANKS = [
  { key: "first_national", label: "First National Bank", loanRate: 600, locRate: 450, maxMult: 2.0, locThreshold: 100000 },
  { key: "pacific_trust", label: "Pacific Trust", loanRate: 500, locRate: 400, maxMult: 2.5, locThreshold: 150000 },
  { key: "metro_capital", label: "Metro Capital Bank", loanRate: 700, locRate: 500, maxMult: 1.8, locThreshold: 75000 },
  { key: "summit_financial", label: "Summit Financial", loanRate: 550, locRate: 350, maxMult: 3.0, locThreshold: 200000 },
];

export const STOCK_COMPANIES = [
  { sector: "finance", name: "Global Finance Corp", basePrice: 45 },
  { sector: "finance", name: "Pacific Bancorp", basePrice: 32 },
  { sector: "energy", name: "SunPower Holdings", basePrice: 28 },
  { sector: "energy", name: "BlueSky Energy", basePrice: 55 },
  { sector: "technology", name: "NexGen Tech", basePrice: 120 },
  { sector: "technology", name: "CloudScale Inc", basePrice: 85 },
  { sector: "biotech", name: "GenLife Sciences", basePrice: 67 },
  { sector: "biotech", name: "MediCore Labs", basePrice: 43 },
  { sector: "entertainment", name: "StreamVibe Media", basePrice: 38 },
  { sector: "entertainment", name: "Pixel Studios", basePrice: 92 },
];

export const DEFAULT_MENU = [
  { name: "Espresso", category: "espresso", price: 350, cost: 80, enabled: true },
  { name: "Latte", category: "espresso", price: 500, cost: 120, enabled: true },
  { name: "Cappuccino", category: "espresso", price: 475, cost: 110, enabled: true },
  { name: "Cold Brew", category: "cold", price: 450, cost: 90, enabled: true },
  { name: "Muffin", category: "food", price: 350, cost: 100, enabled: true },
  { name: "Croissant", category: "food", price: 400, cost: 120, enabled: true },
];

export const COMPETITOR_NAMES = [
  "Brewtopia", "Java Junction", "The Daily Grind", "Cafe Noir",
  "Bean & Leaf", "Roast Republic", "Sip & Savor", "Grind Central",
  "Espresso Express", "The Copper Kettle", "Moonbean Cafe", "Perk Up",
];

export const PHASE_THRESHOLDS = {
  growth: { revenue: 50000, reputation: 55 },
  expansion: { revenue: 200000, reputation: 65 },
  franchise: { revenue: 600000, reputation: 65, stores: 3 },
  ipo: { revenue: 2000000, reputation: 85, stores: 5 },
};

export const DIFFICULTY_SETTINGS: Record<string, { cash: number; trafficMult: number; costMult: number }> = {
  easy: { cash: 150000, trafficMult: 1.3, costMult: 0.8 },
  simulation: { cash: 100000, trafficMult: 1.0, costMult: 1.0 },
  tycoon: { cash: 75000, trafficMult: 0.8, costMult: 1.2 },
  admin: { cash: 5000000, trafficMult: 1.3, costMult: 0.8 },
};

export const MAX_STORES_PER_LOCATION = 100;

export const LOCATION_SCARCITY: Record<string, number> = {
  downtown: 0.40,
  business_district: 0.35,
  waterfront: 0.50,
  university: 0.65,
  suburbs: 0.75,
};

export const COMPETITOR_EXPANSION: Record<string, { baseChance: number; timeRampPer10Weeks: number; maxChance: number }> = {
  easy: { baseChance: 0.02, timeRampPer10Weeks: 0.003, maxChance: 0.08 },
  simulation: { baseChance: 0.05, timeRampPer10Weeks: 0.005, maxChance: 0.15 },
  tycoon: { baseChance: 0.08, timeRampPer10Weeks: 0.008, maxChance: 0.25 },
  admin: { baseChance: 0.02, timeRampPer10Weeks: 0.003, maxChance: 0.08 },
};

export const TECH_BOOST: Record<number, number> = {
  0: 1.0, 1: 1.05, 2: 1.08, 3: 1.12, 4: 1.17, 5: 1.25,
};

export const FEEDBACK_TEMPLATES = {
  great: ["Love this place!", "Best coffee in town!", "Amazing atmosphere!", "My go-to spot!", "Incredible quality!"],
  good: ["Really nice coffee.", "Good spot to work.", "Solid drinks.", "Will come back.", "Pleasant experience."],
  okay: ["It's alright.", "Coffee is okay.", "Nothing special.", "Average experience.", "Decent enough."],
  bad: ["Too expensive.", "Coffee was cold.", "Slow service.", "Not impressed.", "Needs improvement."],
};

// ─── Pricing & Demand ─────────────────────────────────────────
// Category-based price elasticity: how sensitive customers are to price by product type
// Higher = more price-sensitive (customers flee faster when overpriced)
export const CATEGORY_ELASTICITY: Record<string, number> = {
  espresso: 1.4,   // Most sensitive — people compare coffee prices constantly
  cold: 1.2,       // Slightly less sensitive
  specialty: 0.9,  // People expect to pay more for specialty drinks
  food: 0.8,       // Least sensitive — food margins are understood
};

// Base "fair" markup multiplier (cost × this = what customers consider reasonable)
// Quality and reputation shift this up/down per shop
export const FAIR_MARKUP_BASE = 3.5;
