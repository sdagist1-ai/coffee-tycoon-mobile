// ─── Coffee Tycoon Game Engine ─────────────────────────────────
// Pure functions: take state, return new state. No side effects.
// Ported faithfully from server.ts

import {
  EQUIPMENT_COSTS,
  DECOR_COSTS,
  BEAN_TIERS,
  MARKETING_TIERS,
  LOCATIONS,
  CITIES,
  BANKS,
  STOCK_COMPANIES,
  DEFAULT_MENU,
  COMPETITOR_NAMES,
  PHASE_THRESHOLDS,
  DIFFICULTY_SETTINGS,
  MAX_STORES_PER_LOCATION,
  LOCATION_SCARCITY,
  COMPETITOR_EXPANSION,
  TECH_BOOST,
} from "./constants";

// ─── ID Generation ─────────────────────────────────────────────
let nextId = Date.now();
function genId(): number {
  return nextId++;
}

// ─── Interfaces ────────────────────────────────────────────────

export interface Store {
  id: number;
  name: string;
  location: string;
  weeklyRent: number;
  footTraffic: number;
  equipmentLevel: number;
  decorLevel: number;
  baristas: number;
  hasManager: boolean;
  weeklyRevenue: number;
  weeklyCustomers: number;
  satisfaction: number;
  city: string;
  priceRating: number;
  productRating: number;
  serviceRating: number;
  atmosphereRating: number;
  weeklyCogs: number;
  weeklyLabor: number;
  customerFeedback: { stars: number; text: string }[];
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;
  enabled: boolean;
}

export interface Competitor {
  id: number;
  name: string;
  location: string;
  strength: number;
  priceLevel: number;
  reputation: number;
  isPublic: boolean;
  marketCap: number;
  sector: string;
  city: string;
  storeCount: number;
  estimatedRevenue: number;
  intelLevel: number;
}

export interface GameEvent {
  id: number;
  week: number;
  type: string;
  title: string;
  description: string;
}

export interface Investment {
  id: number;
  sector: string;
  companyName: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

export interface Loan {
  id: number;
  bankName: string;
  type: string;
  principal: number;
  remainingBalance: number;
  weeklyPayment: number;
  interestRate: number;
}

export interface TechProject {
  id: number;
  tech: string;
  speedTier: string;
  weeksTotal: number;
  weeksRemaining: number;
  maxStars: number;
}

export interface QuarterlyReport {
  quarter: number;
  startWeek: number;
  endWeek: number;
  revenue: number;
  expenses: number;
  profit: number;
  startCash: number;
  endCash: number;
  startReputation: number;
  endReputation: number;
  storeCount: number;
}

export interface Company {
  name: string;
  week: number;
  cash: number;
  totalRevenue: number;
  totalExpenses: number;
  reputation: number;
  phase: string;
  beanTier: number;
  marketingTier: number;
  hasOffice: boolean;
  weeklyProfit: number;
  ipoValuation: number;
  gameOver: boolean;
  ceoName: string;
  brandLogo: string;
  difficulty: string;
  bankName: string;
  loanBalance: number;
  locLimit: number;
  locBalance: number;
  hasCfo: boolean;
  hasPickup: boolean;
  hasDelivery: boolean;
  techRdProgress: number;
  pickupStars: number;
  deliveryStars: number;
  pickupBuiltWeek: number;
  deliveryBuiltWeek: number;
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyCogs: number;
  weeklyLabor: number;
  weeklyRent: number;
  weeklyMarketing: number;
  weeklyOther: number;
  startDate: string;
  creditScore: number;
  homeCity: string;
}

export interface GameState {
  company: Company;
  stores: Store[];
  menu: MenuItem[];
  competitors: Competitor[];
  events: GameEvent[];
  investments: Investment[];
  loans: Loan[];
  techProjects: TechProject[];
  quarterlyReports: QuarterlyReport[];
  marketOccupancy: Record<string, number>;
}

// ─── Constants (server-side values not in constants.ts) ────────

const BARISTA_WEEKLY_SALARY = 800;
const MANAGER_WEEKLY_SALARY = 1500;
const BARISTA_CAPACITY = 500;
const MANAGER_CAPACITY_BOOST = 1.2;

const REGIONAL_MANAGER_COST = 15000;
const REGIONAL_MANAGER_SALARY = 2000;

const CFO_COST = 25000;
const CFO_WEEKLY_SALARY = 3000;

const PICKUP_RD_COST = 25000;
const DELIVERY_RD_COST = 50000;

const STAR_DEGRADE_INTERVAL = 15;

const RD_SPEED_TIERS: Record<string, { weeks: number; maxStars: number; label: string }> = {
  fast: { weeks: 5, maxStars: 3, label: "Fast" },
  great: { weeks: 15, maxStars: 4, label: "Great" },
  amazing: { weeks: 20, maxStars: 5, label: "Amazing" },
};

// ─── Lookup Helpers ────────────────────────────────────────────
// The constants file uses arrays; server.ts uses Record<string, ...>.
// We build lookup helpers here.

function findLocation(key: string) {
  return LOCATIONS.find((l) => l.key === key);
}

function findCity(key: string) {
  return CITIES.find((c) => c.key === key);
}

function findBank(key: string) {
  return BANKS.find((b) => b.key === key);
}

function findBeanTier(tier: number) {
  return BEAN_TIERS.find((b) => b.tier === tier);
}

function findMarketingTier(tier: number) {
  return MARKETING_TIERS.find((m) => m.tier === tier);
}

// ─── Deterministic Event Generation ────────────────────────────

const WEEKLY_HEADLINES = [
  "Steady Brew Week", "Beans Are Flowing", "Another Week in the Books",
  "The Grind Continues", "Cups Keep Coming", "Espresso Express",
  "Morning Rush Report", "Coffee Culture Update", "The Weekly Roast",
  "Steam & Profits", "Latte Art Leaderboard", "The Bean Counter",
  "Caffeine Chronicles", "Brew Crew Bulletin", "The Daily Drip",
  "Mocha Monday Recap", "Pour-Over Performance", "Barista Beat",
];

function generateWeeklyHeadline(week: number, companyName: string, profit: number, storeCount: number): { title: string; description: string } {
  const headline = WEEKLY_HEADLINES[week % WEEKLY_HEADLINES.length]!;
  const profitStr = profit >= 0 ? `+$${profit.toLocaleString()}` : `-$${Math.abs(profit).toLocaleString()}`;
  const storeStr = storeCount === 1 ? "1 store" : `${storeCount} stores`;
  const descriptions = [
    `${companyName} posted ${profitStr} across ${storeStr} this week.`,
    `Week ${week} wraps up with ${profitStr} profit from ${storeStr}.`,
    `The numbers are in: ${profitStr} net for ${companyName} this week.`,
    `${storeStr} delivered ${profitStr} for the week. The team keeps grinding.`,
  ];
  return { title: headline, description: descriptions[week % descriptions.length]! };
}

const RANDOM_EVENTS = [
  { title: "Health Inspector Visit", description: "A surprise health inspection found your stores in good shape. Customers feel safer.", cashImpact: 0, reputationImpact: 3 },
  { title: "Health Code Violation", description: "An inspector found some issues. You paid the fine and fixed them immediately.", cashImpact: -2000, reputationImpact: -5 },
  { title: "Viral TikTok Review", description: "A food blogger posted a glowing video about your coffee. Lines are out the door!", cashImpact: 0, reputationImpact: 5 },
  { title: "Bad Yelp Review Goes Viral", description: "A negative review gained traction online. Time for some damage control.", cashImpact: 0, reputationImpact: -4 },
  { title: "Equipment Breakdown", description: "An espresso machine broke down and needed emergency repairs.", cashImpact: -3000, reputationImpact: -1 },
  { title: "Local Festival Boost", description: "A nearby festival brought a wave of new customers. Great exposure!", cashImpact: 1500, reputationImpact: 3 },
  { title: "Supplier Discount", description: "Your bean supplier offered a limited-time bulk discount. You stocked up.", cashImpact: 2000, reputationImpact: 0 },
  { title: "Supplier Price Hike", description: "Raw material costs went up this week due to supply chain issues.", cashImpact: -1500, reputationImpact: 0 },
  { title: "Celebrity Spotted!", description: "A local celebrity was photographed at your shop. Social media is buzzing!", cashImpact: 0, reputationImpact: 6 },
  { title: "Staff Appreciation Day", description: "You treated your team to a bonus. Morale is sky-high.", cashImpact: -1000, reputationImpact: 2 },
  { title: "Rainy Week Slowdown", description: "Bad weather kept foot traffic lower than usual across the city.", cashImpact: -500, reputationImpact: 0 },
  { title: "Community Sponsorship", description: "You sponsored a local youth sports team. The community loves it.", cashImpact: -2000, reputationImpact: 4 },
  { title: "New Housing Development", description: "A new apartment complex opened nearby, bringing more potential customers.", cashImpact: 0, reputationImpact: 2 },
  { title: "Competitor Closure", description: "A nearby competitor shut down. Some of their regulars are now checking you out.", cashImpact: 0, reputationImpact: 3 },
  { title: "Plumbing Emergency", description: "A pipe burst in one location. Repairs were costly but handled quickly.", cashImpact: -4000, reputationImpact: -2 },
  { title: "Award Nomination", description: "Your shop was nominated for 'Best Local Coffee' by a city magazine!", cashImpact: 0, reputationImpact: 5 },
  { title: "Power Outage", description: "A power outage forced you to close early one day. Lost some sales.", cashImpact: -800, reputationImpact: -1 },
  { title: "Corporate Catering Deal", description: "A local office signed up for weekly coffee catering. Nice recurring revenue!", cashImpact: 3000, reputationImpact: 2 },
  { title: "Seasonal Menu Hit", description: "Your seasonal special was a huge hit this week. Customers loved it!", cashImpact: 1500, reputationImpact: 3 },
  { title: "Parking Dispute", description: "A parking issue near your shop annoyed some regulars. Hopefully temporary.", cashImpact: 0, reputationImpact: -2 },
];

function getRandomEvent(week: number): (typeof RANDOM_EVENTS)[number] {
  const idx = (week * 7 + 13) % RANDOM_EVENTS.length;
  return RANDOM_EVENTS[idx]!;
}

// ─── Foot Traffic Variability ──────────────────────────────────
function getTrafficMultiplier(): number {
  return 0.85 + Math.random() * 0.30; // 0.85 to 1.15
}

// ─── Seeded Pseudo-Random ──────────────────────────────────────
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ─── Credit Score ──────────────────────────────────────────────

function getCreditScoreLabel(score: number): string {
  if (score >= 750) return "Excellent";
  if (score >= 700) return "Good";
  if (score >= 650) return "Fair";
  if (score >= 550) return "Poor";
  return "Very Poor";
}

function getCreditScoreMultiplier(score: number): { rateMult: number; limitMult: number } {
  if (score >= 750) return { rateMult: 0.7, limitMult: 1.5 };
  if (score >= 700) return { rateMult: 0.85, limitMult: 1.25 };
  if (score >= 650) return { rateMult: 1.0, limitMult: 1.0 };
  if (score >= 550) return { rateMult: 1.3, limitMult: 0.7 };
  return { rateMult: 1.6, limitMult: 0.4 };
}

// ─── Tech Boost ────────────────────────────────────────────────

function getTechBoost(stars: number): number {
  if (stars <= 0) return 1.0;
  return TECH_BOOST[Math.min(stars, 5)] ?? 1.0;
}

// ─── Competitor Expansion ──────────────────────────────────────

function getCompetitorExpansionChance(difficulty: string, week: number): number {
  const settings = COMPETITOR_EXPANSION[difficulty] || COMPETITOR_EXPANSION["simulation"]!;
  const timeBonus = Math.floor(week / 10) * settings.timeRampPer10Weeks;
  return Math.min(settings.maxChance, settings.baseChance + timeBonus);
}

// ─── Phase Progression ─────────────────────────────────────────

function checkPhaseProgression(phase: string, totalRevenue: number, reputation: number, storeCount: number): string | null {
  if (phase === "startup" && totalRevenue >= PHASE_THRESHOLDS.growth.revenue && reputation >= PHASE_THRESHOLDS.growth.reputation) return "growth";
  if (phase === "growth" && totalRevenue >= PHASE_THRESHOLDS.expansion.revenue && reputation >= PHASE_THRESHOLDS.expansion.reputation) return "expansion";
  if (phase === "expansion" && totalRevenue >= PHASE_THRESHOLDS.franchise.revenue && reputation >= PHASE_THRESHOLDS.franchise.reputation && storeCount >= (PHASE_THRESHOLDS.franchise as any).stores) return "franchise";
  if (phase === "franchise" && totalRevenue >= PHASE_THRESHOLDS.ipo.revenue && reputation >= PHASE_THRESHOLDS.ipo.reputation && storeCount >= (PHASE_THRESHOLDS.ipo as any).stores) return "ipo";
  return null;
}

// ─── Store Simulation ──────────────────────────────────────────

interface StoreSimResult {
  weeklyCustomers: number;
  weeklyRevenue: number;
  weeklyCOGS: number;
  laborCost: number;
  weeklyRent: number;
  satisfaction: number;
  priceRating: number;
  productRating: number;
  serviceRating: number;
  atmosphereRating: number;
}

function simulateStore(
  store: Store,
  enabledMenuList: MenuItem[],
  beanTier: number,
  marketingTier: number,
  companyReputation: number,
  trafficFluctuation: number = 1.0,
  competitorPressure: number = 1.0,
): StoreSimResult {
  const loc = findLocation(store.location) || LOCATIONS[0]!;
  const bean = findBeanTier(beanTier) || BEAN_TIERS[0]!;
  const marketing = findMarketingTier(marketingTier) || MARKETING_TIERS[0]!;
  const city = findCity(store.city) || CITIES[0]!;

  // Customer calculation
  const equipmentQuality = store.equipmentLevel / 5; // 0.2 to 1.0
  const decorQuality = store.decorLevel / 5;
  const beanQuality = bean.qualityMult;
  const overallQuality = (equipmentQuality * 0.4 + decorQuality * 0.2 + beanQuality * 0.4);

  // Average menu price (in cents)
  const avgPrice = enabledMenuList.length > 0
    ? enabledMenuList.reduce((sum, item) => sum + item.price, 0) / enabledMenuList.length
    : 400;
  const priceFactor = Math.max(0.5, 1.3 - (avgPrice / 800)); // higher prices = fewer customers

  const reputationFactor = 0.4 + (companyReputation / 100) * 0.8;
  const trafficBase = loc.traffic / 7; // weekly to daily-equivalent
  // Apply city traffic multiplier, demand bias bonus, and competitive pressure
  const demandBonus = enabledMenuList.some((m) => m.category === city.demandBias) ? 1.08 : 1.0;
  const rawCustomers = Math.round(
    trafficBase * overallQuality * priceFactor * reputationFactor *
    marketing.trafficMult * trafficFluctuation * city.trafficMult *
    demandBonus * competitorPressure * 0.25
  );

  // Staff capacity cap
  let capacity = store.baristas * BARISTA_CAPACITY;
  if (store.hasManager) capacity = Math.round(capacity * MANAGER_CAPACITY_BOOST);
  const weeklyCustomers = Math.min(rawCustomers * 7, capacity);

  // Revenue calculation: distribute customers across menu items
  let weeklyRevenue = 0;
  let weeklyCOGS = 0;
  if (enabledMenuList.length > 0) {
    const perItem = weeklyCustomers / enabledMenuList.length;
    for (const item of enabledMenuList) {
      weeklyRevenue += Math.round(perItem * item.price / 100);
      weeklyCOGS += Math.round(perItem * item.cost * bean.qualityMult / 100);
    }
  }

  // Labor costs
  const laborCost = store.baristas * BARISTA_WEEKLY_SALARY + (store.hasManager ? MANAGER_WEEKLY_SALARY : 0);

  // Satisfaction (0-100)
  const staffRatio = weeklyCustomers > 0 ? Math.min(1, capacity / weeklyCustomers) : 1;
  const satisfaction = Math.round(Math.min(100, (overallQuality * 50 + staffRatio * 30 + (enabledMenuList.length / 8) * 20)));

  // Apply city rent multiplier
  const adjustedRent = Math.round(store.weeklyRent * city.rentMult);

  // Per-store ratings (0-50, representing 0.0-5.0 x10)
  const priceRating = Math.round(Math.min(50, Math.max(5, (1.3 - avgPrice / 600) * 35)));
  const productRating = Math.round(Math.min(50, (beanQuality * 25 + (enabledMenuList.length / 8) * 15 + equipmentQuality * 10)));
  const serviceRating = Math.round(Math.min(50, (staffRatio * 30 + (store.hasManager ? 12 : 0) + (store.baristas / 8) * 8)));
  const atmosphereRating = Math.round(Math.min(50, (decorQuality * 40 + equipmentQuality * 10)));

  return {
    weeklyCustomers,
    weeklyRevenue,
    weeklyCOGS,
    laborCost,
    weeklyRent: adjustedRent,
    satisfaction,
    priceRating,
    productRating,
    serviceRating,
    atmosphereRating,
  };
}

// ─── Customer Feedback ─────────────────────────────────────────

function generateCustomerFeedback(sim: StoreSimResult): { stars: number; text: string }[] {
  const reviews: { stars: number; text: string }[] = [];

  const positive: Record<string, string[]> = {
    price: ["Great value for the price!", "Very affordable, will come back."],
    product: ["The coffee is amazing!", "Best espresso in town."],
    service: ["Staff is super friendly and fast.", "Great customer service experience."],
    atmosphere: ["Love the cozy atmosphere!", "Beautiful interior, very relaxing."],
  };
  const negative: Record<string, string[]> = {
    price: ["A bit overpriced for what you get.", "Prices are too high for basic drinks."],
    product: ["Coffee was lukewarm and bland.", "Menu could use more variety."],
    service: ["Long wait times, needs more staff.", "Service was slow and disorganized."],
    atmosphere: ["Place looks dated, needs a refresh.", "Too cramped and noisy inside."],
  };

  const categories = ["price", "product", "service", "atmosphere"] as const;
  const ratings = [sim.priceRating, sim.productRating, sim.serviceRating, sim.atmosphereRating];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]!;
    const rating = ratings[i]!;
    if (rating >= 30) {
      const pool = positive[cat]!;
      reviews.push({ stars: Math.min(5, Math.round(rating / 10)), text: pool[Math.floor(Math.random() * pool.length)]! });
    } else {
      const pool = negative[cat]!;
      reviews.push({ stars: Math.max(1, Math.round(rating / 10)), text: pool[Math.floor(Math.random() * pool.length)]! });
    }
  }

  return reviews.slice(0, 4);
}

// ─── Available Locations ───────────────────────────────────────

export function getAvailableLocations(week: number): string[] {
  const allLocs = LOCATIONS.map((l) => l.key);
  const available: string[] = [];
  for (let i = 0; i < allLocs.length; i++) {
    const loc = allLocs[i]!;
    const chance = LOCATION_SCARCITY[loc] ?? 0.5;
    const roll = seededRandom(week * 100 + i + 7);
    if (roll < chance) available.push(loc);
  }
  // Guarantee at least 2 options
  if (available.length < 2) {
    for (const loc of allLocs) {
      if (!available.includes(loc)) {
        available.push(loc);
        if (available.length >= 2) break;
      }
    }
  }
  return available;
}

// ─── Create New Game ───────────────────────────────────────────

export interface CreateNewGameParams {
  companyName: string;
  storeName: string;
  location: string;
  ceoName?: string;
  brandLogo?: string;
  difficulty?: string;
  bankName?: string;
  homeCity?: string;
}

export function createNewGame(params: CreateNewGameParams): GameState {
  const {
    companyName,
    storeName,
    location,
    ceoName = "",
    brandLogo = "coffee",
    difficulty = "simulation",
    bankName = "",
    homeCity,
  } = params;

  const loc = findLocation(location) || LOCATIONS[0]!;
  const selectedCity = homeCity && findCity(homeCity) ? homeCity : "seattle";
  const diff = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS["simulation"]!;
  const startDate = new Date().toISOString().slice(0, 10);

  // Create first store
  const firstStore: Store = {
    id: genId(),
    name: storeName,
    location: loc.key,
    weeklyRent: loc.rent,
    footTraffic: loc.traffic,
    equipmentLevel: 2,
    decorLevel: 2,
    baristas: 2,
    hasManager: false,
    weeklyRevenue: 0,
    weeklyCustomers: 0,
    satisfaction: 50,
    city: selectedCity,
    priceRating: 0,
    productRating: 0,
    serviceRating: 0,
    atmosphereRating: 0,
    weeklyCogs: 0,
    weeklyLabor: 0,
    customerFeedback: [],
    pickupEnabled: false,
    deliveryEnabled: false,
  };

  // Create default menu
  const menu: MenuItem[] = DEFAULT_MENU.map((item) => ({
    id: genId(),
    name: item.name,
    category: item.category,
    price: item.price,
    cost: item.cost,
    enabled: item.enabled,
  }));

  // Generate competitors (deterministic fallback — no LLM available)
  const allCityKeys = CITIES.map((c) => c.key);
  const allLocKeys = LOCATIONS.map((l) => l.key);
  const competitors: Competitor[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 4; i++) {
    let name = COMPETITOR_NAMES[i % COMPETITOR_NAMES.length]!;
    if (usedNames.has(name)) name = `${name} ${i + 1}`;
    usedNames.add(name);

    const compLoc = allLocKeys[(i + 1) % allLocKeys.length]!;
    // Most competitors in home city, some in other cities
    const compCity = Math.random() < 0.6 ? selectedCity : allCityKeys[Math.floor(Math.random() * allCityKeys.length)]!;

    competitors.push({
      id: genId(),
      name,
      location: compLoc,
      strength: 35 + Math.floor(Math.random() * 30),
      priceLevel: 30 + Math.floor(Math.random() * 40),
      reputation: 35 + Math.floor(Math.random() * 30),
      isPublic: false,
      marketCap: 0,
      sector: "",
      city: compCity,
      storeCount: 1 + Math.floor(Math.random() * 3),
      estimatedRevenue: 5000 + Math.floor(Math.random() * 20000),
      intelLevel: difficulty === "easy" ? 1 : 0,
    });
  }

  // Build initial market occupancy
  const occupancy: Record<string, number> = { [`${selectedCity}:${loc.key}`]: 1 };
  for (const comp of competitors) {
    const key = `${comp.city}:${comp.location}`;
    occupancy[key] = (occupancy[key] || 0) + comp.storeCount;
  }

  // Opening event
  const events: GameEvent[] = [
    {
      id: genId(),
      week: 1,
      type: "milestone",
      title: "Grand Opening!",
      description: `${companyName} opens "${storeName}" in ${loc.label}! You have $${diff.cash.toLocaleString()} to build your empire.`,
    },
  ];

  const company: Company = {
    name: companyName,
    week: 1,
    cash: diff.cash,
    totalRevenue: 0,
    totalExpenses: 0,
    reputation: 40,
    phase: "startup",
    beanTier: 1,
    marketingTier: 0,
    hasOffice: false,
    weeklyProfit: 0,
    ipoValuation: 0,
    gameOver: false,
    ceoName,
    brandLogo,
    difficulty,
    bankName,
    loanBalance: 0,
    locLimit: 0,
    locBalance: 0,
    hasCfo: false,
    hasPickup: false,
    hasDelivery: false,
    techRdProgress: 0,
    pickupStars: 0,
    deliveryStars: 0,
    pickupBuiltWeek: 0,
    deliveryBuiltWeek: 0,
    weeklyRevenue: 0,
    weeklyExpenses: 0,
    weeklyCogs: 0,
    weeklyLabor: 0,
    weeklyRent: 0,
    weeklyMarketing: 0,
    weeklyOther: 0,
    startDate,
    creditScore: 650,
    homeCity: selectedCity,
  };

  let state: GameState = {
    company,
    stores: [firstStore],
    menu,
    competitors,
    events,
    investments: [],
    loans: [],
    techProjects: [],
    quarterlyReports: [],
    marketOccupancy: occupancy,
  };

  // Admin mode: pre-build test environment
  if (difficulty === "admin") {
    state = applyAdminMode(state, companyName, loc, selectedCity);
  }

  return state;
}

// ─── Admin Mode Setup ──────────────────────────────────────────

function applyAdminMode(
  state: GameState,
  _companyName: string,
  _loc: (typeof LOCATIONS)[number],
  selectedCity: string,
): GameState {
  const newCompany: Company = {
    ...state.company,
    week: 30,
    reputation: 75,
    phase: "growth",
    hasCfo: true,
    hasPickup: true,
    hasDelivery: true,
    pickupStars: 4,
    deliveryStars: 3,
    pickupBuiltWeek: 5,
    deliveryBuiltWeek: 10,
    beanTier: 3,
    marketingTier: 3,
    hasOffice: true,
    creditScore: 780,
    totalRevenue: 850000,
    totalExpenses: 620000,
  };

  // Upgrade the initial store
  const upgradedFirstStore: Store = {
    ...state.stores[0]!,
    equipmentLevel: 4,
    decorLevel: 3,
    baristas: 5,
    hasManager: true,
  };

  const adminStores: Store[] = [
    {
      id: genId(), name: "Austin Flagship", location: "downtown", city: "austin",
      weeklyRent: findLocation("downtown")?.rent ?? 2100,
      footTraffic: findLocation("downtown")?.traffic ?? 12000,
      equipmentLevel: 3, decorLevel: 2, baristas: 3, hasManager: true,
      weeklyRevenue: 0, weeklyCustomers: 0, satisfaction: 60,
      priceRating: 0, productRating: 0, serviceRating: 0, atmosphereRating: 0,
      weeklyCogs: 0, weeklyLabor: 0, customerFeedback: [],
      pickupEnabled: true, deliveryEnabled: true,
    },
    {
      id: genId(), name: "Chicago Loop", location: "business_district", city: "chicago",
      weeklyRent: findLocation("business_district")?.rent ?? 2800,
      footTraffic: findLocation("business_district")?.traffic ?? 13000,
      equipmentLevel: 3, decorLevel: 2, baristas: 3, hasManager: true,
      weeklyRevenue: 0, weeklyCustomers: 0, satisfaction: 60,
      priceRating: 0, productRating: 0, serviceRating: 0, atmosphereRating: 0,
      weeklyCogs: 0, weeklyLabor: 0, customerFeedback: [],
      pickupEnabled: true, deliveryEnabled: true,
    },
    {
      id: genId(), name: `${selectedCity === "seattle" ? "Capitol Hill" : "Second"} Branch`,
      location: "university", city: selectedCity,
      weeklyRent: findLocation("university")?.rent ?? 1400,
      footTraffic: findLocation("university")?.traffic ?? 10000,
      equipmentLevel: 3, decorLevel: 2, baristas: 3, hasManager: true,
      weeklyRevenue: 0, weeklyCustomers: 0, satisfaction: 60,
      priceRating: 0, productRating: 0, serviceRating: 0, atmosphereRating: 0,
      weeklyCogs: 0, weeklyLabor: 0, customerFeedback: [],
      pickupEnabled: true, deliveryEnabled: true,
    },
    {
      id: genId(), name: "Waterfront Cafe", location: "waterfront", city: "san_francisco",
      weeklyRent: findLocation("waterfront")?.rent ?? 2450,
      footTraffic: findLocation("waterfront")?.traffic ?? 11000,
      equipmentLevel: 3, decorLevel: 2, baristas: 3, hasManager: true,
      weeklyRevenue: 0, weeklyCustomers: 0, satisfaction: 60,
      priceRating: 0, productRating: 0, serviceRating: 0, atmosphereRating: 0,
      weeklyCogs: 0, weeklyLabor: 0, customerFeedback: [],
      pickupEnabled: true, deliveryEnabled: true,
    },
  ];

  const quarterlyReport: QuarterlyReport = {
    quarter: 1,
    startWeek: 1,
    endWeek: 13,
    revenue: 320000,
    expenses: 245000,
    profit: 75000,
    startCash: 5000000,
    endCash: 5075000,
    startReputation: 40,
    endReputation: 62,
    storeCount: 3,
  };

  const adminEvent: GameEvent = {
    id: genId(),
    week: 30,
    type: "system",
    title: "Admin Mode Active",
    description: "Test environment loaded: 5 stores across 4 cities, $5M cash, CFO hired, tech unlocked, week 30.",
  };

  // Full intel on all competitors in admin mode
  const updatedCompetitors = state.competitors.map((c) => ({ ...c, intelLevel: 2 }));

  return {
    ...state,
    company: newCompany,
    stores: [upgradedFirstStore, ...adminStores],
    competitors: updatedCompetitors,
    events: [...state.events, adminEvent],
    quarterlyReports: [quarterlyReport],
  };
}

// ─── Advance Week ──────────────────────────────────────────────

export function advanceWeek(state: GameState): GameState {
  const { company, stores, menu, competitors, investments, loans, techProjects } = state;

  if (company.gameOver) return state;
  if (stores.length === 0) return state;

  const newWeek = company.week + 1;
  const enabledMenu = menu.filter((m) => m.enabled);

  let totalWeeklyRevenue = 0;
  let totalWeeklyExpenses = 0;

  // Apply tech boosts based on star ratings
  const pickupBoost = getTechBoost(company.pickupStars);
  const deliveryBoost = getTechBoost(company.deliveryStars);

  // Calculate competitive pressure per city
  const compCityCounts: Record<string, number> = {};
  for (const c of competitors) {
    compCityCounts[c.city] = (compCityCounts[c.city] || 0) + c.storeCount;
  }

  // Simulate each store
  const newStores: Store[] = [];
  for (const store of stores) {
    const trafficFluctuation = getTrafficMultiplier();
    const competitorsInCity = compCityCounts[store.city] || 0;
    const competitorPressure = Math.max(0.7, 1.0 - competitorsInCity * 0.03);
    const sim = simulateStore(store, enabledMenu, company.beanTier, company.marketingTier, company.reputation, trafficFluctuation, competitorPressure);

    // Apply tech boosts to store revenue
    let boostedRevenue = sim.weeklyRevenue;
    if (company.hasPickup && company.pickupStars > 0) boostedRevenue = Math.round(boostedRevenue * pickupBoost);
    if (company.hasDelivery && company.deliveryStars > 0) boostedRevenue = Math.round(boostedRevenue * deliveryBoost);

    totalWeeklyRevenue += boostedRevenue;
    totalWeeklyExpenses += sim.weeklyCOGS + sim.laborCost + sim.weeklyRent;

    const feedback = generateCustomerFeedback(sim);

    newStores.push({
      ...store,
      weeklyRevenue: boostedRevenue,
      weeklyCustomers: sim.weeklyCustomers,
      satisfaction: sim.satisfaction,
      priceRating: sim.priceRating,
      productRating: sim.productRating,
      serviceRating: sim.serviceRating,
      atmosphereRating: sim.atmosphereRating,
      weeklyCogs: sim.weeklyCOGS,
      weeklyLabor: sim.laborCost,
      customerFeedback: feedback,
    });
  }

  // Company-level costs
  const bean = findBeanTier(company.beanTier) || BEAN_TIERS[0]!;
  const marketing = findMarketingTier(company.marketingTier) || MARKETING_TIERS[0]!;
  const beanCosts = bean.costPerStore * stores.length;
  const marketingCosts = marketing.weeklyCost;
  const officeCosts = company.hasOffice ? 2000 : 0;
  const cfoCosts = company.hasCfo ? CFO_WEEKLY_SALARY : 0;

  // Regional manager costs
  const citiesWithStores = new Set(stores.map((s) => s.city));
  const extraCities = Math.max(0, citiesWithStores.size - 1);
  const regionalManagerCosts = extraCities * REGIONAL_MANAGER_SALARY;
  const otherCosts = beanCosts + officeCosts + cfoCosts + regionalManagerCosts;
  totalWeeklyExpenses += otherCosts + marketingCosts;

  // Loan payments
  let loanPayment = 0;
  const newLoans: Loan[] = [];
  for (const loan of loans) {
    if (loan.remainingBalance > 0) {
      const payment = Math.min(loan.weeklyPayment, loan.remainingBalance);
      loanPayment += payment;
      newLoans.push({ ...loan, remainingBalance: loan.remainingBalance - payment });
    } else {
      newLoans.push({ ...loan });
    }
  }
  totalWeeklyExpenses += loanPayment;

  const weeklyProfit = totalWeeklyRevenue - totalWeeklyExpenses;
  const newCash = company.cash + weeklyProfit;

  // Financial breakdown
  const totalLaborCost = stores.reduce(
    (sum, st) => sum + st.baristas * BARISTA_WEEKLY_SALARY + (st.hasManager ? MANAGER_WEEKLY_SALARY : 0),
    0,
  );
  const totalRentCost = stores.reduce((sum, s) => sum + s.weeklyRent, 0);
  const newTotalRevenue = company.totalRevenue + totalWeeklyRevenue;
  const newTotalExpenses = company.totalExpenses + totalWeeklyExpenses;

  // Reputation drift
  const avgSatisfaction = stores.length > 0
    ? stores.reduce((sum, s) => sum + s.satisfaction, 0) / stores.length
    : 50;
  let repDelta = 0;
  if (avgSatisfaction > 70) repDelta += 2;
  else if (avgSatisfaction > 50) repDelta += 1;
  else if (avgSatisfaction < 30) repDelta -= 2;
  else if (avgSatisfaction < 50) repDelta -= 1;
  repDelta += marketing.repBonus;
  if (company.hasOffice) repDelta += 1;
  const newReputation = Math.max(0, Math.min(100, company.reputation + repDelta));

  // Phase progression
  const newPhase = checkPhaseProgression(company.phase, newTotalRevenue, newReputation, stores.length);

  // Evolve competitors
  const expansionChance = getCompetitorExpansionChance(company.difficulty, newWeek);
  const currentOccupancy: Record<string, number> = { ...state.marketOccupancy };
  const allLocKeys = LOCATIONS.map((l) => l.key);
  const allCityKeys = CITIES.map((c) => c.key);

  const newCompetitors: Competitor[] = [];
  for (const comp of competitors) {
    const rd = Math.floor(Math.random() * 3) - 1;
    const sd = Math.floor(Math.random() * 3) - 1;
    const storeGrowth = Math.random() < expansionChance ? 1 : 0;
    const revenueGrowth = Math.round(comp.estimatedRevenue * (0.98 + Math.random() * 0.06));

    if (storeGrowth > 0) {
      const targetCity = Math.random() < 0.7 ? comp.city : allCityKeys[Math.floor(Math.random() * allCityKeys.length)]!;
      const targetLoc = allLocKeys[Math.floor(Math.random() * allLocKeys.length)]!;
      const occKey = `${targetCity}:${targetLoc}`;
      const occCount = currentOccupancy[occKey] || 0;
      if (occCount < MAX_STORES_PER_LOCATION) {
        currentOccupancy[occKey] = occCount + 1;
      }
    }

    newCompetitors.push({
      ...comp,
      reputation: Math.max(20, Math.min(85, comp.reputation + rd)),
      strength: Math.max(20, Math.min(85, comp.strength + sd)),
      storeCount: comp.storeCount + storeGrowth,
      estimatedRevenue: revenueGrowth,
    });
  }

  // Credit score updates
  let creditDelta = 0;
  if (weeklyProfit > 0) creditDelta += 2;
  if (weeklyProfit < 0) creditDelta -= 1;
  if (loanPayment > 0) creditDelta += 3;
  const newCreditScore = Math.max(300, Math.min(850, company.creditScore + creditDelta));

  // Quarterly report (every 13 weeks)
  const newQuarterlyReports = [...state.quarterlyReports];
  const newEvents: GameEvent[] = [...state.events];
  const currentQuarter = Math.ceil(newWeek / 13);
  const previousQuarter = Math.ceil(company.week / 13);
  if (currentQuarter > previousQuarter && newWeek > 1) {
    const qStartWeek = (previousQuarter - 1) * 13 + 1;
    const qEndWeek = company.week;
    newQuarterlyReports.push({
      quarter: previousQuarter,
      startWeek: qStartWeek,
      endWeek: qEndWeek,
      revenue: totalWeeklyRevenue * 13,
      expenses: totalWeeklyExpenses * 13,
      profit: weeklyProfit * 13,
      startCash: company.cash,
      endCash: newCash,
      startReputation: company.reputation,
      endReputation: newReputation,
      storeCount: stores.length,
    });
    newEvents.push({
      id: genId(),
      week: newWeek,
      type: "milestone",
      title: `Q${previousQuarter} Earnings Report`,
      description: `Quarterly profit: $${(weeklyProfit * 13).toLocaleString()} | Cash: $${newCash.toLocaleString()} | Stores: ${stores.length} | Reputation: ${newReputation}/100`,
    });
  }

  // Bankruptcy check
  const isBankrupt = newCash < -10000;

  // Compute total COGS for the week
  const totalCogs = totalWeeklyExpenses - totalLaborCost - totalRentCost - marketingCosts - otherCosts - loanPayment;

  // Weekly headline event
  const weeklyEvent = generateWeeklyHeadline(newWeek, company.name, weeklyProfit, stores.length);
  newEvents.push({
    id: genId(),
    week: newWeek,
    type: "weekly",
    title: weeklyEvent.title,
    description: weeklyEvent.description,
  });

  // Random event (~40% chance)
  let cashAfterEvents = newCash;
  let repAfterEvents = newReputation;
  if (Math.random() < 0.4) {
    const randomEvent = getRandomEvent(newWeek);
    newEvents.push({
      id: genId(),
      week: newWeek,
      type: "event",
      title: randomEvent.title,
      description: randomEvent.description,
    });
    cashAfterEvents = cashAfterEvents + randomEvent.cashImpact;
    repAfterEvents = Math.max(0, Math.min(100, repAfterEvents + randomEvent.reputationImpact));
  }

  // Phase progression event
  if (newPhase) {
    const phaseLabels: Record<string, string> = {
      growth: "Growth Phase! You can now open new locations and buy a corporate office.",
      expansion: "Expansion Phase! Your brand is growing. Keep opening stores.",
      franchise: "Franchise Phase! You're a regional powerhouse.",
      ipo: "IPO Ready! You can now take your company public!",
    };
    newEvents.push({
      id: genId(),
      week: newWeek,
      type: "milestone",
      title: `Phase Up: ${newPhase.charAt(0).toUpperCase() + newPhase.slice(1)}`,
      description: phaseLabels[newPhase] ?? `Entered ${newPhase} phase.`,
    });
  }

  // LOC increase event: every ~8 weeks if business is profitable and has LOC
  let newLocLimit = company.locLimit;
  if (newWeek % 8 === 0 && weeklyProfit > 0 && company.locLimit > 0 && !isBankrupt) {
    const healthBonus = newReputation > 70 ? 0.25 : newReputation > 50 ? 0.18 : 0.10;
    const locIncrease = Math.round(company.locLimit * healthBonus);
    newLocLimit = company.locLimit + locIncrease;
    const bank = company.bankName ? findBank(company.bankName) : null;
    const bankLabel = bank ? bank.label : "Your bank";
    newEvents.push({
      id: genId(),
      week: newWeek,
      type: "event",
      title: "Line of Credit Increased",
      description: `Email from ${bankLabel}: "Based on your strong financial performance, we've increased your line of credit to $${newLocLimit.toLocaleString()}." (+$${locIncrease.toLocaleString()})`,
    });
  }

  // Bankruptcy event
  if (isBankrupt) {
    newEvents.push({
      id: genId(),
      week: newWeek,
      type: "milestone",
      title: "Bankruptcy!",
      description: `${company.name} has gone bust. Better luck next time!`,
    });
  }

  // Update stock prices
  const newInvestments: Investment[] = investments.map((inv) => {
    const stockInfo = STOCK_COMPANIES.find((s) => s.name === inv.companyName);
    if (stockInfo) {
      const priceVariation = 1 + (Math.sin(newWeek * 0.3 + inv.companyName.length) * 0.2);
      const newPrice = Math.round(stockInfo.basePrice * priceVariation);
      return { ...inv, currentPrice: newPrice };
    }
    return { ...inv };
  });

  // Advance R&D projects
  let newTechProjects: TechProject[] = [];
  let pickupStarsNow = company.pickupStars;
  let deliveryStarsNow = company.deliveryStars;
  let hasPickupNow = company.hasPickup;
  let hasDeliveryNow = company.hasDelivery;
  let pickupBuiltWeekNow = company.pickupBuiltWeek;
  let deliveryBuiltWeekNow = company.deliveryBuiltWeek;
  let updatedStoresForTech = newStores;

  for (const proj of techProjects) {
    if (proj.weeksRemaining > 0) {
      const remaining = proj.weeksRemaining - 1;
      if (remaining <= 0) {
        // Project complete!
        if (proj.tech === "pickup") {
          hasPickupNow = true;
          pickupStarsNow = proj.maxStars;
          pickupBuiltWeekNow = newWeek;
          // Enable on all stores
          updatedStoresForTech = updatedStoresForTech.map((s) => ({ ...s, pickupEnabled: true }));
          newEvents.push({
            id: genId(),
            week: newWeek,
            type: "milestone",
            title: `Pickup v1.0 Complete! (${proj.maxStars} stars)`,
            description: "Mobile pickup is now live across all stores!",
          });
        } else if (proj.tech === "delivery") {
          hasDeliveryNow = true;
          deliveryStarsNow = proj.maxStars;
          deliveryBuiltWeekNow = newWeek;
          updatedStoresForTech = updatedStoresForTech.map((s) => ({ ...s, deliveryEnabled: true }));
          newEvents.push({
            id: genId(),
            week: newWeek,
            type: "milestone",
            title: `Delivery v1.0 Complete! (${proj.maxStars} stars)`,
            description: "Delivery service is live across all stores!",
          });
        }
        // Don't add to newTechProjects (project is done)
      } else {
        newTechProjects.push({ ...proj, weeksRemaining: remaining });
      }
    } else {
      newTechProjects.push({ ...proj });
    }
  }

  // Degrade tech star ratings over time
  if (pickupStarsNow > 0 && pickupBuiltWeekNow > 0) {
    const weeksSinceBuilt = newWeek - pickupBuiltWeekNow;
    const degradations = Math.floor(weeksSinceBuilt / STAR_DEGRADE_INTERVAL);
    pickupStarsNow = Math.max(1, pickupStarsNow - degradations);
  }
  if (deliveryStarsNow > 0 && deliveryBuiltWeekNow > 0) {
    const weeksSinceBuilt = newWeek - deliveryBuiltWeekNow;
    const degradations = Math.floor(weeksSinceBuilt / STAR_DEGRADE_INTERVAL);
    deliveryStarsNow = Math.max(1, deliveryStarsNow - degradations);
  }

  // Keep only last 50 events to prevent unbounded growth
  const trimmedEvents = newEvents.slice(-50);

  const newCompany: Company = {
    ...company,
    week: newWeek,
    cash: cashAfterEvents,
    totalRevenue: newTotalRevenue,
    totalExpenses: newTotalExpenses,
    reputation: repAfterEvents,
    weeklyProfit,
    weeklyRevenue: totalWeeklyRevenue,
    weeklyExpenses: totalWeeklyExpenses,
    weeklyCogs: totalCogs,
    weeklyLabor: totalLaborCost,
    weeklyRent: totalRentCost,
    weeklyMarketing: marketingCosts,
    weeklyOther: otherCosts + loanPayment,
    creditScore: newCreditScore,
    locLimit: newLocLimit,
    hasPickup: hasPickupNow,
    hasDelivery: hasDeliveryNow,
    pickupStars: pickupStarsNow,
    deliveryStars: deliveryStarsNow,
    pickupBuiltWeek: pickupBuiltWeekNow,
    deliveryBuiltWeek: deliveryBuiltWeekNow,
    ...(newPhase ? { phase: newPhase } : {}),
    ...(isBankrupt ? { gameOver: true } : {}),
  };

  return {
    company: newCompany,
    stores: updatedStoresForTech,
    menu: [...menu],
    competitors: newCompetitors,
    events: trimmedEvents,
    investments: newInvestments,
    loans: newLoans,
    techProjects: newTechProjects,
    quarterlyReports: newQuarterlyReports,
    marketOccupancy: currentOccupancy,
  };
}

// ─── Perform Action ────────────────────────────────────────────

export interface ActionResult {
  success: boolean;
  error?: string;
  state: GameState;
}

export function performAction(
  state: GameState,
  action: string,
  params: {
    storeId?: number;
    itemId?: number;
    value?: number;
    stringValue?: string;
  } = {},
): ActionResult {
  const { company } = state;
  if (company.gameOver) return { success: false, error: "Game over. Start a new game.", state };

  const { storeId, itemId, value, stringValue } = params;

  switch (action) {
    // ─── Store Actions ───
    case "open_store": {
      if (company.phase === "startup") return { success: false, error: "Reach Growth phase to open more stores.", state };
      // stringValue format: "location:city:equipLevel:decorLevel"
      const parts = stringValue?.split(":") || [];
      const locKey = parts[0] || "";
      const cityKey = parts[1] || company.homeCity;
      const equipLevel = Math.min(5, Math.max(2, parseInt(parts[2] || "2", 10) || 2));
      const decorLevel = Math.min(5, Math.max(2, parseInt(parts[3] || "2", 10) || 2));
      const loc = findLocation(locKey);
      if (!loc) return { success: false, error: "Invalid location.", state };
      const cityInfo = findCity(cityKey);
      if (!cityInfo) return { success: false, error: "Invalid city.", state };

      // Check weekly location availability
      const availableLocs = getAvailableLocations(company.week);
      if (!availableLocs.includes(locKey)) return { success: false, error: `${loc.label} is not available this week. Check back next week!`, state };

      // Check market capacity
      const occupancyKey = `${cityKey}:${locKey}`;
      const currentCount = state.marketOccupancy[occupancyKey] || 0;
      if (currentCount >= MAX_STORES_PER_LOCATION) return { success: false, error: `${loc.label} in ${cityInfo.label} is fully saturated. No room for new stores!`, state };

      // Check if player has stores in this city
      const hasStoresInCity = state.stores.some((s) => s.city === cityKey);

      // Calculate total cost
      const baseCost = 25000;
      let equipCost = 0;
      for (let i = 2; i <= equipLevel; i++) equipCost += EQUIPMENT_COSTS[i] ?? 0;
      let decorCostTotal = 0;
      for (let i = 2; i <= decorLevel; i++) decorCostTotal += DECOR_COSTS[i] ?? 0;
      const securityDeposit = Math.round(loc.rent * cityInfo.rentMult * 2);

      let totalCost = baseCost + equipCost + decorCostTotal + securityDeposit;
      if (!hasStoresInCity && cityKey !== company.homeCity) {
        totalCost += REGIONAL_MANAGER_COST;
      }
      if (!hasStoresInCity && cityInfo.unlockCost > 0 && cityKey !== company.homeCity) {
        totalCost += cityInfo.unlockCost;
      }
      if (company.cash < totalCost) return { success: false, error: `Need $${totalCost.toLocaleString()} to open a store in ${cityInfo.label}.`, state };

      const sName = `${company.name} - ${cityInfo.label} ${loc.label}`;
      const newStore: Store = {
        id: genId(),
        name: sName,
        location: locKey,
        weeklyRent: loc.rent,
        footTraffic: loc.traffic,
        equipmentLevel: equipLevel,
        decorLevel: decorLevel,
        baristas: 2,
        hasManager: false,
        weeklyRevenue: 0,
        weeklyCustomers: 0,
        satisfaction: 50,
        city: cityKey,
        priceRating: 0,
        productRating: 0,
        serviceRating: 0,
        atmosphereRating: 0,
        weeklyCogs: 0,
        weeklyLabor: 0,
        customerFeedback: [],
        pickupEnabled: company.hasPickup,
        deliveryEnabled: company.hasDelivery,
      };

      const newOccupancy = { ...state.marketOccupancy, [occupancyKey]: currentCount + 1 };
      const costBreakdown = totalCost > 25000 ? ` (includes regional manager & city expansion fees)` : "";
      const newEvent: GameEvent = {
        id: genId(),
        week: company.week,
        type: "milestone",
        title: "New Store Opened!",
        description: `A new location opens in ${cityInfo.label} - ${loc.label}${costBreakdown}.`,
      };

      return {
        success: true,
        state: {
          ...state,
          company: { ...company, cash: company.cash - totalCost },
          stores: [...state.stores, newStore],
          events: [...state.events, newEvent],
          marketOccupancy: newOccupancy,
        },
      };
    }

    case "upgrade_equipment": {
      if (!storeId) return { success: false, error: "No store selected.", state };
      const store = state.stores.find((s) => s.id === storeId);
      if (!store) return { success: false, error: "Store not found.", state };
      if (store.equipmentLevel >= 5) return { success: false, error: "Equipment already maxed out.", state };
      const nextLevel = store.equipmentLevel + 1;
      const cost = EQUIPMENT_COSTS[nextLevel] ?? 0;
      if (company.cash < cost) return { success: false, error: `Need $${cost.toLocaleString()} to upgrade.`, state };
      return {
        success: true,
        state: {
          ...state,
          company: { ...company, cash: company.cash - cost },
          stores: state.stores.map((s) => s.id === storeId ? { ...s, equipmentLevel: nextLevel } : s),
        },
      };
    }

    case "upgrade_decor": {
      if (!storeId) return { success: false, error: "No store selected.", state };
      const store = state.stores.find((s) => s.id === storeId);
      if (!store) return { success: false, error: "Store not found.", state };
      if (store.decorLevel >= 5) return { success: false, error: "Decor already maxed out.", state };
      const nextLevel = store.decorLevel + 1;
      const cost = DECOR_COSTS[nextLevel] ?? 0;
      if (company.cash < cost) return { success: false, error: `Need $${cost.toLocaleString()} to upgrade.`, state };
      return {
        success: true,
        state: {
          ...state,
          company: { ...company, cash: company.cash - cost },
          stores: state.stores.map((s) => s.id === storeId ? { ...s, decorLevel: nextLevel } : s),
        },
      };
    }

    case "hire_barista": {
      if (!storeId) return { success: false, error: "No store selected.", state };
      const store = state.stores.find((s) => s.id === storeId);
      if (!store) return { success: false, error: "Store not found.", state };
      if (store.baristas >= 8) return { success: false, error: "Max 8 baristas per store.", state };
      const hiringBonus = 300;
      if (company.cash < hiringBonus) return { success: false, error: "Need $300 hiring bonus.", state };
      return {
        success: true,
        state: {
          ...state,
          company: { ...company, cash: company.cash - hiringBonus },
          stores: state.stores.map((s) => s.id === storeId ? { ...s, baristas: s.baristas + 1 } : s),
        },
      };
    }

    case "fire_barista": {
      if (!storeId) return { success: false, error: "No store selected.", state };
      const store = state.stores.find((s) => s.id === storeId);
      if (!store) return { success: false, error: "Store not found.", state };
      if (store.baristas <= 1) return { success: false, error: "Need at least 1 barista.", state };
      return {
        success: true,
        state: {
          ...state,
          stores: state.stores.map((s) => s.id === storeId ? { ...s, baristas: s.baristas - 1 } : s),
        },
      };
    }

    case "hire_manager": {
      if (!storeId) return { success: false, error: "No store selected.", state };
      const store = state.stores.find((s) => s.id === storeId);
      if (!store) return { success: false, error: "Store not found.", state };
      if (store.hasManager) return { success: false, error: "Store already has a manager.", state };
      const hiringBonus = 1000;
      if (company.cash < hiringBonus) return { success: false, error: "Need $1,000 hiring bonus.", state };
      return {
        success: true,
        state: {
          ...state,
          company: { ...company, cash: company.cash - hiringBonus },
          stores: state.stores.map((s) => s.id === storeId ? { ...s, hasManager: true } : s),
        },
      };
    }

    // ─── Menu Actions ───
    case "toggle_item": {
      if (!itemId) return { success: false, error: "No item selected.", state };
      const item = state.menu.find((m) => m.id === itemId);
      if (!item) return { success: false, error: "Item not found.", state };
      return {
        success: true,
        state: {
          ...state,
          menu: state.menu.map((m) => m.id === itemId ? { ...m, enabled: !m.enabled } : m),
        },
      };
    }

    case "set_price": {
      if (!itemId || value === undefined) return { success: false, error: "Need item ID and price.", state };
      if (value < 100 || value > 1500) return { success: false, error: "Price must be $1.00-$15.00.", state };
      const item = state.menu.find((m) => m.id === itemId);
      if (!item) return { success: false, error: "Item not found.", state };
      return {
        success: true,
        state: {
          ...state,
          menu: state.menu.map((m) => m.id === itemId ? { ...m, price: value } : m),
        },
      };
    }

    case "add_menu_item": {
      if (!stringValue) return { success: false, error: "Need item name.", state };
      const rdCost = 3000;
      if (company.cash < rdCost) return { success: false, error: `Need $${rdCost.toLocaleString()} for R&D.`, state };
      const category = value === 1 ? "espresso" : value === 2 ? "cold" : value === 3 ? "specialty" : "food";
      const price = category === "food" ? 400 : category === "specialty" ? 600 : 450;
      const cost = category === "food" ? 130 : category === "specialty" ? 150 : 100;
      const newItem: MenuItem = {
        id: genId(),
        name: stringValue,
        category,
        price,
        cost,
        enabled: true,
      };
      return {
        success: true,
        state: {
          ...state,
          company: { ...company, cash: company.cash - rdCost },
          menu: [...state.menu, newItem],
        },
      };
    }

    // ─── Company Actions ───
    case "set_bean_tier": {
      if (value === undefined || value < 1 || value > 3) return { success: false, error: "Bean tier must be 1-3.", state };
      return {
        success: true,
        state: {
          ...state,
          company: { ...company, beanTier: value },
        },
      };
    }

    case "set_marketing": {
      if (value === undefined || value < 0 || value > 3) return { success: false, error: "Marketing tier must be 0-3.", state };
      return {
        success: true,
        state: {
          ...state,
          company: { ...company, marketingTier: value },
        },
      };
    }

    case "buy_office": {
      if (company.hasOffice) return { success: false, error: "Already have an office.", state };
      if (company.phase === "startup") return { success: false, error: "Reach Growth phase first.", state };
      const officeCost = 50000;
      if (company.cash < officeCost) return { success: false, error: `Need $${officeCost.toLocaleString()}.`, state };
      const officeEvent: GameEvent = {
        id: genId(),
        week: company.week,
        type: "milestone",
        title: "Corporate HQ Acquired!",
        description: `${company.name} now has a corporate office. Professional operations unlocked.`,
      };
      return {
        success: true,
        state: {
          ...state,
          company: { ...company, hasOffice: true, cash: company.cash - officeCost },
          events: [...state.events, officeEvent],
        },
      };
    }

    case "launch_ipo": {
      if (!company.hasCfo) return { success: false, error: "Must hire a CFO before going public.", state };
      if (!company.bankName) return { success: false, error: "Must have a bank for underwriting.", state };
      if (company.ipoValuation > 0) return { success: false, error: "Already went public!", state };
      const totalDebt = company.loanBalance + company.locBalance;
      const baseValuation = company.totalRevenue * 2.5 + company.reputation * 15000 + state.stores.length * 100000;
      const valuation = Math.round(Math.max(baseValuation - totalDebt * 0.5, baseValuation * 0.5));
      const underwritingFee = Math.round(valuation * 0.03);
      if (company.cash < underwritingFee) return { success: false, error: `Need $${underwritingFee.toLocaleString()} for underwriting fee (3% of valuation).`, state };
      const ipoProceeds = Math.round(valuation * 0.20) - underwritingFee;
      const ipoEvent: GameEvent = {
        id: genId(),
        week: company.week,
        type: "milestone",
        title: "IPO Day!",
        description: `${company.name} goes public at $${valuation.toLocaleString()}! Raised $${ipoProceeds.toLocaleString()} after fees. The empire continues!`,
      };
      return {
        success: true,
        state: {
          ...state,
          company: { ...company, ipoValuation: valuation, cash: company.cash + ipoProceeds },
          events: [...state.events, ipoEvent],
        },
      };
    }

    // ─── Market Research ───
    case "buy_intel": {
      if (!value) return { success: false, error: "No competitor selected.", state };
      const comp = state.competitors.find((c) => c.id === value);
      if (!comp) return { success: false, error: "Competitor not found.", state };
      const intelMultiplier = company.difficulty === "tycoon" ? 2.0 : company.difficulty === "easy" ? 0.5 : 1.0;
      const intelCost = Math.round((stringValue === "deep" ? 15000 : 5000) * intelMultiplier);
      const newLevel = stringValue === "deep" ? 2 : 1;
      if (comp.intelLevel >= newLevel) return { success: false, error: "Already have this intel level.", state };
      if (company.cash < intelCost) return { success: false, error: `Need $${intelCost.toLocaleString()} for market research.`, state };
      return {
        success: true,
        state: {
          ...state,
          company: { ...company, cash: company.cash - intelCost },
          competitors: state.competitors.map((c) => c.id === value ? { ...c, intelLevel: newLevel } : c),
        },
      };
    }

    default:
      return { success: false, error: `Unknown action: ${action}`, state };
  }
}

// ─── Banking Functions ─────────────────────────────────────────

export interface LoanOffer {
  label: string;
  amount: number;
  rate: number;
  maturity: number;
  weeklyPayment: number;
}

export interface LoanOffersResult {
  success: boolean;
  error?: string;
  creditScore: number;
  creditLabel: string;
  offers: LoanOffer[];
}

export function getLoanOffers(state: GameState): LoanOffersResult {
  const { company } = state;
  if (!company.bankName) return { success: false, error: "No bank selected.", creditScore: company.creditScore, creditLabel: getCreditScoreLabel(company.creditScore), offers: [] };

  const bank = findBank(company.bankName);
  if (!bank) return { success: false, error: "Invalid bank.", creditScore: company.creditScore, creditLabel: getCreditScoreLabel(company.creditScore), offers: [] };

  const creditMult = getCreditScoreMultiplier(company.creditScore);
  const maxLoan = Math.max(50000, Math.round(company.totalRevenue * bank.maxMult * creditMult.limitMult));
  const baseRate = Math.round(bank.loanRate * creditMult.rateMult);

  const offers: LoanOffer[] = [
    {
      label: "Short-Term",
      amount: Math.min(Math.round(maxLoan * 0.3), maxLoan),
      rate: Math.max(200, baseRate - 100),
      maturity: 26,
      weeklyPayment: 0,
    },
    {
      label: "Standard",
      amount: Math.min(Math.round(maxLoan * 0.6), maxLoan),
      rate: baseRate,
      maturity: 52,
      weeklyPayment: 0,
    },
    {
      label: "Long-Term",
      amount: maxLoan,
      rate: baseRate + 150,
      maturity: 104,
      weeklyPayment: 0,
    },
  ];

  for (const offer of offers) {
    const weeklyInterest = Math.round(offer.amount * offer.rate / 10000 / 52);
    const weeklyPrincipal = Math.round(offer.amount / offer.maturity);
    offer.weeklyPayment = weeklyPrincipal + weeklyInterest;
  }

  return {
    success: true,
    creditScore: company.creditScore,
    creditLabel: getCreditScoreLabel(company.creditScore),
    offers,
  };
}

export function applyForLoan(state: GameState, amount: number, maturity?: number): ActionResult {
  const { company } = state;
  if (company.gameOver) return { success: false, error: "Game over.", state };
  if (!company.bankName) return { success: false, error: "No bank selected.", state };

  const bank = findBank(company.bankName);
  if (!bank) return { success: false, error: "Invalid bank.", state };

  const creditMult = getCreditScoreMultiplier(company.creditScore);
  if (company.creditScore < 450) return { success: false, error: `Credit score too low (${company.creditScore}). Pay off debt and run profitable weeks to improve.`, state };

  const maxLoan = Math.max(50000, Math.round(company.totalRevenue * bank.maxMult * creditMult.limitMult));
  if (amount > maxLoan) return { success: false, error: `Max loan amount: $${maxLoan.toLocaleString()} (credit: ${company.creditScore})`, state };
  if (amount < 10000) return { success: false, error: "Minimum loan: $10,000", state };

  const totalOutstanding = state.loans.reduce((sum, l) => sum + l.remainingBalance, 0);
  if (totalOutstanding + amount > maxLoan) return { success: false, error: `Total debt would exceed limit of $${maxLoan.toLocaleString()}`, state };

  const loanMaturity = maturity ?? 52;
  const adjustedRate = Math.round(bank.loanRate * creditMult.rateMult);
  const weeklyInterest = Math.round(amount * adjustedRate / 10000 / 52);
  const weeklyPrincipal = Math.round(amount / loanMaturity);
  const weeklyPayment = weeklyPrincipal + weeklyInterest;

  const newLoan: Loan = {
    id: genId(),
    bankName: company.bankName,
    type: "business_loan",
    principal: amount,
    remainingBalance: amount,
    weeklyPayment,
    interestRate: adjustedRate,
  };

  return {
    success: true,
    state: {
      ...state,
      company: {
        ...company,
        cash: company.cash + amount,
        loanBalance: company.loanBalance + amount,
      },
      loans: [...state.loans, newLoan],
    },
  };
}

export function applyForLoc(state: GameState): ActionResult {
  const { company } = state;
  if (!company.bankName) return { success: false, error: "No bank selected.", state };

  const bank = findBank(company.bankName);
  if (!bank) return { success: false, error: "Invalid bank.", state };

  if (company.locLimit > 0) return { success: false, error: "You already have a line of credit.", state };
  if (company.totalRevenue < bank.locThreshold) {
    return { success: false, error: `Need $${bank.locThreshold.toLocaleString()} total revenue to qualify. You have $${company.totalRevenue.toLocaleString()}.`, state };
  }

  const locLimit = Math.round(company.totalRevenue * 0.5);

  return {
    success: true,
    state: {
      ...state,
      company: { ...company, locLimit },
    },
  };
}

export function drawFromLoc(state: GameState, amount: number): ActionResult {
  const { company } = state;
  if (company.locLimit <= 0) return { success: false, error: "No line of credit available.", state };

  const available = company.locLimit - company.locBalance;
  if (amount > available) return { success: false, error: `Available: $${available.toLocaleString()}`, state };
  if (amount < 1000) return { success: false, error: "Minimum draw: $1,000", state };

  return {
    success: true,
    state: {
      ...state,
      company: {
        ...company,
        cash: company.cash + amount,
        locBalance: company.locBalance + amount,
      },
    },
  };
}

export function repayLoc(state: GameState, amount: number): ActionResult {
  const { company } = state;
  if (company.locBalance <= 0) return { success: false, error: "No LOC balance to repay.", state };

  const repayAmount = Math.min(amount, company.locBalance, company.cash);
  if (repayAmount <= 0) return { success: false, error: "Not enough cash.", state };

  return {
    success: true,
    state: {
      ...state,
      company: {
        ...company,
        cash: company.cash - repayAmount,
        locBalance: company.locBalance - repayAmount,
      },
    },
  };
}

// ─── Stock Market Functions ────────────────────────────────────

export function buyStock(state: GameState, companyName: string, shares: number): ActionResult {
  const { company } = state;

  const stockInfo = STOCK_COMPANIES.find((s) => s.name === companyName);
  if (!stockInfo) return { success: false, error: "Unknown company.", state };

  const priceVariation = 1 + (Math.sin(company.week * 0.3 + companyName.length) * 0.2);
  const currentPrice = Math.round(stockInfo.basePrice * priceVariation);
  const totalCost = currentPrice * shares;

  if (company.cash < totalCost) return { success: false, error: `Need $${totalCost.toLocaleString()}. You have $${company.cash.toLocaleString()}.`, state };
  if (shares < 1) return { success: false, error: "Must buy at least 1 share.", state };

  const existing = state.investments.find((i) => i.companyName === companyName);

  let newInvestments: Investment[];
  if (existing) {
    const newShares = existing.shares + shares;
    const avgPrice = Math.round((existing.purchasePrice * existing.shares + currentPrice * shares) / newShares);
    newInvestments = state.investments.map((i) =>
      i.companyName === companyName
        ? { ...i, shares: newShares, purchasePrice: avgPrice, currentPrice }
        : i,
    );
  } else {
    newInvestments = [
      ...state.investments,
      {
        id: genId(),
        sector: stockInfo.sector,
        companyName,
        shares,
        purchasePrice: currentPrice,
        currentPrice,
      },
    ];
  }

  return {
    success: true,
    state: {
      ...state,
      company: { ...company, cash: company.cash - totalCost },
      investments: newInvestments,
    },
  };
}

export function sellStock(state: GameState, investmentId: number, shares: number): ActionResult {
  const { company } = state;

  const inv = state.investments.find((i) => i.id === investmentId);
  if (!inv) return { success: false, error: "Investment not found.", state };
  if (shares > inv.shares) return { success: false, error: `Only have ${inv.shares} shares.`, state };

  const stockInfo = STOCK_COMPANIES.find((s) => s.name === inv.companyName);
  const basePrice = stockInfo?.basePrice || inv.purchasePrice;
  const priceVariation = 1 + (Math.sin(company.week * 0.3 + inv.companyName.length) * 0.2);
  const currentPrice = Math.round(basePrice * priceVariation);
  const totalProceeds = currentPrice * shares;

  let newInvestments: Investment[];
  if (shares === inv.shares) {
    newInvestments = state.investments.filter((i) => i.id !== investmentId);
  } else {
    newInvestments = state.investments.map((i) =>
      i.id === investmentId ? { ...i, shares: i.shares - shares, currentPrice } : i,
    );
  }

  return {
    success: true,
    state: {
      ...state,
      company: { ...company, cash: company.cash + totalProceeds },
      investments: newInvestments,
    },
  };
}

// ─── Tech R&D ──────────────────────────────────────────────────

export function investInTechRd(state: GameState, tech: string, speedTier: string): ActionResult {
  const { company } = state;

  const tier = RD_SPEED_TIERS[speedTier];
  if (!tier) return { success: false, error: "Invalid speed tier. Use fast, great, or amazing.", state };

  const existingForTech = state.techProjects.find((p) => p.tech === tech && p.weeksRemaining > 0);
  if (existingForTech) return { success: false, error: `${tech} R&D already in progress (${existingForTech.weeksRemaining} weeks left).`, state };

  const cost = tech === "pickup" ? PICKUP_RD_COST : DELIVERY_RD_COST;

  if (tech === "pickup") {
    if (company.cash < cost) return { success: false, error: `Need $${cost.toLocaleString()}.`, state };
  } else if (tech === "delivery") {
    if (!company.hasPickup) return { success: false, error: "Must have pickup first.", state };
    if (company.cash < cost) return { success: false, error: `Need $${cost.toLocaleString()}.`, state };
  } else {
    return { success: false, error: "Unknown tech: use 'pickup' or 'delivery'.", state };
  }

  const newProject: TechProject = {
    id: genId(),
    tech,
    speedTier,
    weeksTotal: tier.weeks,
    weeksRemaining: tier.weeks,
    maxStars: tier.maxStars,
  };

  const rdEvent: GameEvent = {
    id: genId(),
    week: company.week,
    type: "milestone",
    title: `${tech === "pickup" ? "Pickup" : "Delivery"} R&D Started!`,
    description: `${tier.label} development (${tier.weeks} weeks, up to ${tier.maxStars} stars). Investment: $${cost.toLocaleString()}.`,
  };

  return {
    success: true,
    state: {
      ...state,
      company: { ...company, cash: company.cash - cost },
      techProjects: [...state.techProjects, newProject],
      events: [...state.events, rdEvent],
    },
  };
}

// ─── CFO Hiring ────────────────────────────────────────────────

export function hireCfo(state: GameState): ActionResult {
  const { company } = state;
  if (company.hasCfo) return { success: false, error: "Already have a CFO.", state };
  if (company.cash < CFO_COST) return { success: false, error: `Need $${CFO_COST.toLocaleString()} to hire a CFO.`, state };

  const cfoEvent: GameEvent = {
    id: genId(),
    week: company.week,
    type: "milestone",
    title: "CFO Hired!",
    description: "A Chief Financial Officer joins the team. Required for taking the company public.",
  };

  return {
    success: true,
    state: {
      ...state,
      company: { ...company, cash: company.cash - CFO_COST, hasCfo: true },
      events: [...state.events, cfoEvent],
    },
  };
}
