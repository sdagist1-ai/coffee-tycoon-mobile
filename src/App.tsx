import "./index.css";
import { useState } from "react";
import {
  Coffee, RotateCcw, Building2, Globe, Landmark,
  LayoutDashboard, Store, BookOpen, Building, CreditCard, Cpu,
} from "lucide-react";
import type { CompanyData, Tab } from "./types";
import { useGame, GameProvider } from "./gameContext";
import { weekToDate, profitColor, BRAND_LOGOS } from "./shared";
import { DashboardTab } from "./tabs/DashboardTab";
import { StoresTab } from "./tabs/StoresTab";
import { MenuTab } from "./tabs/MenuTab";
import { CompanyTab } from "./tabs/CompanyTab";
import { FinanceTab } from "./tabs/FinanceTab";
import { TechTab } from "./tabs/TechTab";

// ─── Onboarding Start Screen ─────────────────────────────────

function StartScreen() {
  const { startGame } = useGame();
  const [step, setStep] = useState(1);
  const [ceoName, setCeoName] = useState("");
  const [brandLogo, setBrandLogo] = useState("coffee");
  const [companyName, setCompanyName] = useState("");
  const [difficulty, setDifficulty] = useState("simulation");
  const [homeCity, setHomeCity] = useState("seattle");
  const [bankName, setBankName] = useState("first_national");
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("downtown");

  const locs = [
    { key: "downtown", label: "Downtown", rent: 2100, traffic: "12k" },
    { key: "suburbs", label: "Suburbs", rent: 1050, traffic: "7k" },
    { key: "university", label: "University", rent: 1400, traffic: "10k" },
    { key: "waterfront", label: "Waterfront", rent: 2450, traffic: "11k" },
    { key: "business_district", label: "Business", rent: 2800, traffic: "13k" },
  ];

  const difficulties = [
    { key: "easy", label: "Easy", desc: "More starting cash, higher foot traffic, lower costs", cash: "$150k" },
    { key: "simulation", label: "Simulation", desc: "Balanced experience for strategic play", cash: "$100k" },
    { key: "tycoon", label: "Tycoon", desc: "Less cash, lower traffic, higher costs. For experts.", cash: "$75k" },
    { key: "admin", label: "Admin", desc: "Test mode: $5M, 5 stores, CFO, tech unlocked, week 30", cash: "$5M" },
  ];

  const banks = [
    { key: "first_national", label: "First National Bank", desc: "Reliable rates, moderate loan limits" },
    { key: "pacific_trust", label: "Pacific Trust", desc: "Lower rates, higher loan limits, stricter LOC" },
    { key: "metro_capital", label: "Metro Capital Bank", desc: "Higher rates but easier LOC qualification" },
    { key: "summit_financial", label: "Summit Financial", desc: "Best LOC rates, highest loan limits, strict LOC threshold" },
  ];

  const cityOptions = [
    { key: "seattle", label: "Seattle", desc: "Coffee-obsessed, high demand (+15% traffic)" },
    { key: "austin", label: "Austin", desc: "Fast-growing, loves cold brew, cheap rent" },
    { key: "chicago", label: "Chicago", desc: "Big market, food-forward customers" },
    { key: "san_francisco", label: "San Francisco", desc: "Tech-savvy, specialty drinks, pricey rent" },
    { key: "miami", label: "Miami", desc: "Beach vibes, iced everything, low rent" },
  ];

  const handleStart = () => startGame({ companyName, storeName, location, ceoName, brandLogo, difficulty, bankName, homeCity });
  const handleAdminStart = () => startGame({
    companyName: "Admin Coffee Co", storeName: "HQ Flagship", location: "downtown",
    ceoName: "Admin", brandLogo: "crown", difficulty: "admin",
    bankName: "pacific_trust", homeCity: "seattle",
  });

  const stepIndicator = (
    <div className="flex items-center justify-center gap-1.5 mb-6">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className={`w-2 h-2 rounded-full transition-all ${s === step ? "bg-amber-500 w-6" : s < step ? "bg-amber-600" : "bg-amber-800/30"}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-amber-500 mb-2" style={{ textShadow: "0 0 30px rgba(245,158,11,0.3)" }}>
            Coffee Tycoon
          </div>
          <p className="text-amber-200/60 text-sm">Build your coffee empire</p>
          <button type="button" onClick={handleAdminStart}
            className="mt-3 px-3 py-1 text-[10px] text-amber-400/50 border border-amber-800/20 rounded bg-amber-950/20 cursor-default hover:text-amber-300/70 hover:border-amber-700/30 transition-all">
            Quick Start (Admin Mode)
          </button>
        </div>

        {stepIndicator}

        <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-6 space-y-5">
          {step === 1 && (
            <>
              <div className="text-center text-amber-400 text-sm font-semibold mb-2">Who are you?</div>
              <div>
                <label className="block text-amber-400/80 text-xs font-semibold uppercase tracking-wider mb-2">CEO Name</label>
                <input type="text" value={ceoName} onChange={(e) => setCeoName(e.target.value)} placeholder="e.g. Alex Johnson"
                  className="w-full px-4 py-3 bg-amber-950/40 border border-amber-800/30 rounded-lg text-amber-100 placeholder:text-amber-700/50 focus:outline-none focus:border-amber-500/50 text-sm" />
              </div>
              <div>
                <label className="block text-amber-400/80 text-xs font-semibold uppercase tracking-wider mb-2">Brand Logo</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(BRAND_LOGOS).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => setBrandLogo(key)}
                      className={`px-3 py-2.5 rounded-lg text-center cursor-default transition-all ${brandLogo === key ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
                      <div className="text-lg mb-0.5">{key === "coffee" ? "\u2615" : key === "bean" ? "\u{1FAD8}" : key === "cup" ? "\u{1F964}" : key === "leaf" ? "\u{1F33F}" : key === "star" ? "\u2B50" : key === "crown" ? "\u{1F451}" : key === "mountain" ? "\u26F0\uFE0F" : "\u2600\uFE0F"}</div>
                      <div className="text-[10px]">{label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => setStep(2)} disabled={!ceoName.trim()}
                className="w-full py-3 bg-amber-600 text-amber-50 font-bold rounded-lg disabled:opacity-40 text-sm cursor-default">Next</button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center text-amber-400 text-sm font-semibold mb-2">Name Your Company</div>
              <div>
                <label className="block text-amber-400/80 text-xs font-semibold uppercase tracking-wider mb-2">Company Name</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Golden Bean Coffee Co"
                  className="w-full px-4 py-3 bg-amber-950/40 border border-amber-800/30 rounded-lg text-amber-100 placeholder:text-amber-700/50 focus:outline-none focus:border-amber-500/50 text-sm" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="px-4 py-3 bg-amber-950/30 border border-amber-800/20 text-amber-300/60 rounded-lg text-sm cursor-default">Back</button>
                <button type="button" onClick={() => setStep(3)} disabled={!companyName.trim()}
                  className="flex-1 py-3 bg-amber-600 text-amber-50 font-bold rounded-lg disabled:opacity-40 text-sm cursor-default">Next</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center text-amber-400 text-sm font-semibold mb-2">Select Play Mode</div>
              <div className="space-y-2">
                {difficulties.map((d) => (
                  <button key={d.key} type="button" onClick={() => setDifficulty(d.key)}
                    className={`w-full px-4 py-3 rounded-lg text-left cursor-default transition-all ${difficulty === d.key ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{d.label}</span>
                      <span className="text-[10px] opacity-60">{d.cash} start</span>
                    </div>
                    <div className="text-[11px] opacity-60 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(2)} className="px-4 py-3 bg-amber-950/30 border border-amber-800/20 text-amber-300/60 rounded-lg text-sm cursor-default">Back</button>
                <button type="button" onClick={() => setStep(4)} className="flex-1 py-3 bg-amber-600 text-amber-50 font-bold rounded-lg text-sm cursor-default">Next</button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="text-center text-amber-400 text-sm font-semibold mb-2">Choose Your Home City</div>
              <div className="space-y-2">
                {cityOptions.map((c) => (
                  <button key={c.key} type="button" onClick={() => setHomeCity(c.key)}
                    className={`w-full px-4 py-3 rounded-lg text-left cursor-default transition-all ${homeCity === c.key ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
                    <div className="font-bold text-xs flex items-center gap-2"><Globe className="w-3.5 h-3.5" />{c.label}</div>
                    <div className="text-[11px] opacity-60 mt-0.5">{c.desc}</div>
                  </button>
                ))}
              </div>
              <p className="text-amber-500/40 text-[10px] text-center">You can expand to other cities later as you grow</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(3)} className="px-4 py-3 bg-amber-950/30 border border-amber-800/20 text-amber-300/60 rounded-lg text-sm cursor-default">Back</button>
                <button type="button" onClick={() => setStep(5)} className="flex-1 py-3 bg-amber-600 text-amber-50 font-bold rounded-lg text-sm cursor-default">Next</button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div className="text-center text-amber-400 text-sm font-semibold mb-2">Choose Your Bank</div>
              <div className="space-y-2">
                {banks.map((b) => (
                  <button key={b.key} type="button" onClick={() => setBankName(b.key)}
                    className={`w-full px-4 py-3 rounded-lg text-left cursor-default transition-all ${bankName === b.key ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
                    <div className="font-bold text-xs flex items-center gap-2"><Landmark className="w-3.5 h-3.5" />{b.label}</div>
                    <div className="text-[11px] opacity-60 mt-0.5">{b.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(4)} className="px-4 py-3 bg-amber-950/30 border border-amber-800/20 text-amber-300/60 rounded-lg text-sm cursor-default">Back</button>
                <button type="button" onClick={() => setStep(6)} className="flex-1 py-3 bg-amber-600 text-amber-50 font-bold rounded-lg text-sm cursor-default">Next</button>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <div className="text-center text-amber-400 text-sm font-semibold mb-2">Open Your First Store</div>
              <div>
                <label className="block text-amber-400/80 text-xs font-semibold uppercase tracking-wider mb-2">Store Name</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g. The Flagship"
                  className="w-full px-4 py-3 bg-amber-950/40 border border-amber-800/30 rounded-lg text-amber-100 placeholder:text-amber-700/50 focus:outline-none focus:border-amber-500/50 text-sm" />
              </div>
              <div>
                <label className="block text-amber-400/80 text-xs font-semibold uppercase tracking-wider mb-2">Location</label>
                <div className="grid grid-cols-2 gap-2">
                  {locs.map((loc) => (
                    <button key={loc.key} type="button" onClick={() => setLocation(loc.key)}
                      className={`px-3 py-2.5 rounded-lg text-left text-sm transition-all cursor-default ${location === loc.key ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
                      <div className="font-semibold text-xs">{loc.label}</div>
                      <div className="text-[10px] opacity-60">${loc.rent}/wk | {loc.traffic} traffic</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(5)} className="px-4 py-3 bg-amber-950/30 border border-amber-800/20 text-amber-300/60 rounded-lg text-sm cursor-default">Back</button>
                <button type="button" onClick={handleStart} disabled={!storeName.trim()}
                  className="flex-1 py-3 bg-amber-600 text-amber-50 font-bold rounded-lg disabled:opacity-40 text-sm cursor-default">
                  Launch Your Empire
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Game Over Screen ──────────────────────────────────────────

function GameOverScreen({ company }: { company: CompanyData }) {
  const { resetGame } = useGame();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <Building2 className="w-16 h-16 text-red-400/60 mx-auto mb-4" />
        <div className="text-3xl font-bold text-red-300 mb-2">Bankrupt</div>
        <p className="text-amber-200/60 text-sm mb-2">{company.name} ran out of cash on {weekToDate(company.startDate, company.week)}.</p>
        <p className="text-amber-200/40 text-xs mb-6">Total revenue: ${company.totalRevenue.toLocaleString()} | {company.ipoValuation > 0 ? `IPO Valuation: $${company.ipoValuation.toLocaleString()}` : "Never went public"}</p>
        <button type="button" onClick={resetGame}
          className="px-6 py-3 bg-amber-600 text-amber-50 font-bold rounded-lg cursor-default flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" />Start New Game
        </button>
      </div>
    </div>
  );
}

// ─── Main Game Shell ───────────────────────────────────────────

function GameShell() {
  const { gameData } = useGame();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [cityFilter, setCityFilter] = useState<string | null>(null);

  if (!gameData) return null;
  const data = gameData;

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "dashboard", label: "Home", icon: LayoutDashboard },
    { key: "stores", label: "Stores", icon: Store },
    { key: "menu", label: "Menu", icon: BookOpen },
    { key: "company", label: "HQ", icon: Building },
    { key: "finance", label: "Finance", icon: CreditCard },
    { key: "tech", label: "R&D", icon: Cpu },
  ];

  return (
    <div className="pb-safe flex flex-col min-h-screen">
      <div className="pt-safe-or-4 px-4 pb-3 border-b border-amber-800/20 shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-500" />
                <h1 className="text-lg font-bold text-amber-100">{data.company.name}</h1>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-amber-400/50 text-xs">{weekToDate(data.company.startDate, data.company.week)}</span>
                <span className="px-2 py-0.5 bg-amber-600/20 text-amber-400 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                  {data.company.phase}
                </span>
                <span className="text-amber-100 text-xs font-semibold">${data.company.cash.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${profitColor(data.company.weeklyProfit)}`}>
                {data.company.weeklyProfit >= 0 ? "+" : ""}${data.company.weeklyProfit.toLocaleString()}
              </div>
              <div className="text-amber-500/40 text-[10px]">weekly profit</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {tab === "dashboard" && <DashboardTab data={data} onCityClick={(city) => { setCityFilter(city); setTab("stores"); }} />}
          {tab === "stores" && <StoresTab data={data} cityFilter={cityFilter} onClearFilter={() => setCityFilter(null)} />}
          {tab === "menu" && <MenuTab data={data} />}
          {tab === "company" && <CompanyTab data={data} />}
          {tab === "finance" && <FinanceTab data={data} />}
          {tab === "tech" && <TechTab data={data} />}
        </div>
      </div>

      <div className="shrink-0 border-t border-amber-800/20 bg-amber-950/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 cursor-default transition-colors ${tab === t.key ? "text-amber-400" : "text-amber-600/40"}`}>
              <t.icon className="w-4 h-4" />
              <span className="text-[9px] font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App Root ──────────────────────────────────────────────────

function GameApp() {
  const { gameData, isLoading } = useGame();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full mb-3" />
          <div className="text-amber-400/60 text-sm">Brewing your game...</div>
        </div>
      </div>
    );
  }
  if (!gameData) return <StartScreen />;
  if (gameData.company.gameOver) return <GameOverScreen company={gameData.company} />;
  return <GameShell />;
}

export default function App() {
  return (
    <GameProvider>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", background: "linear-gradient(180deg, #1a0e0a 0%, #2d1810 100%)", minHeight: "100vh" }}>
        <GameApp />
      </div>
    </GameProvider>
  );
}
