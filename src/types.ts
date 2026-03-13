// ─── Data Types ──────────────────────────────────────────────────

export interface CompanyData {
  name: string; week: number; cash: number; totalRevenue: number; totalExpenses: number;
  reputation: number; phase: string; beanTier: number; marketingTier: number;
  hasOffice: boolean; weeklyProfit: number; ipoValuation: number; gameOver: boolean;
  ceoName: string; brandLogo: string; difficulty: string; bankName: string;
  loanBalance: number; locLimit: number; locBalance: number;
  hasCfo: boolean; hasPickup: boolean; hasDelivery: boolean; techRdProgress: number;
  pickupStars: number; deliveryStars: number; pickupBuiltWeek: number; deliveryBuiltWeek: number;
  weeklyRevenue: number; weeklyExpenses: number; weeklyCogs: number;
  weeklyLabor: number; weeklyRent: number; weeklyMarketing: number; weeklyOther: number;
  startDate: string; creditScore: number; homeCity: string;
}
export interface TechProjectData { id: number; tech: string; speedTier: string; weeksTotal: number; weeksRemaining: number; maxStars: number; }
export interface StoreData {
  id: number; name: string; location: string; locationLabel: string; weeklyRent: number;
  footTraffic: number; equipmentLevel: number; decorLevel: number; baristas: number;
  hasManager: boolean; weeklyRevenue: number; weeklyCustomers: number; satisfaction: number;
  city: string; cityLabel: string;
  priceRating: number; productRating: number; serviceRating: number; atmosphereRating: number;
  weeklyCogs: number; weeklyLabor: number; weeklyProfit: number;
  customerFeedback: { stars: number; text: string }[];
}
export interface MenuItemData { id: number; name: string; category: string; price: number; cost: number; enabled: boolean; }
export interface CompetitorData { id: number; name: string; location: string; strength: number; reputation: number; isPublic: boolean; marketCap: number; sector: string; city: string; cityLabel: string; storeCount: number; estimatedRevenue: number; intelLevel: number; }
export interface EventData { id: number; week: number; type: string; title: string; description: string; }
export interface LocationData { key: string; label: string; rent: number; traffic: number; }
export interface BeanTierData { tier: number; label: string; costPerStore: number; }
export interface MarketingTierData { tier: number; label: string; weeklyCost: number; }
export interface InvestmentData { id: number; sector: string; companyName: string; shares: number; purchasePrice: number; currentPrice: number; }
export interface LoanData { id: number; bankName: string; type: string; principal: number; remainingBalance: number; weeklyPayment: number; interestRate: number; }
export interface BankData { key: string; label: string; loanRate: number; locRate: number; }
export interface StockCompanyData { sector: string; name: string; basePrice: number; }
export interface QuarterlyReportData { quarter: number; startWeek: number; endWeek: number; revenue: number; expenses: number; profit: number; startCash: number; endCash: number; startReputation: number; endReputation: number; storeCount: number; }
export interface CityData { key: string; label: string; unlockCost: number; rentMult: number; trafficMult: number; demandBias: string; description: string; icon: string; }

export interface GameData {
  hasGame: true;
  company: CompanyData;
  stores: StoreData[];
  menu: MenuItemData[];
  competitors: CompetitorData[];
  events: EventData[];
  locations: LocationData[];
  beanTiers: BeanTierData[];
  marketingTiers: MarketingTierData[];
  equipmentCosts: number[];
  decorCosts: number[];
  investments: InvestmentData[];
  loans: LoanData[];
  banks: BankData[];
  stockCompanies: StockCompanyData[];
  techProjectsData: TechProjectData[];
  quarterlyReportsData: QuarterlyReportData[];
  cities: CityData[];
  availableLocations: string[];
  marketOccupancy: Record<string, number>;
}

export type ActionParams = { action: string; storeId?: number; itemId?: number; value?: number; stringValue?: string; };
export type Tab = "dashboard" | "stores" | "menu" | "company" | "finance" | "tech";
