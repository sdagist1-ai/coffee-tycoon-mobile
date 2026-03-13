// ─── Game Context ──────────────────────────────────────────────
// Replaces server SDK calls. UI talks to this, which talks to the local game engine.

import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from "react";
import { type GameState, createNewGame, advanceWeek as engineAdvanceWeek, performAction as enginePerformAction, applyForLoan as engineApplyForLoan, applyForLoc as engineApplyForLoc, drawFromLoc as engineDrawFromLoc, repayLoc as engineRepayLoc, buyStock as engineBuyStock, sellStock as engineSellStock, investInTechRd as engineInvestInTechRd, hireCfo as engineHireCfo, getLoanOffers as engineGetLoanOffers, getAvailableLocations } from "./engine/gameEngine";
import { saveGameData, loadGameData, clearGameData } from "./engine/storage";
import { EQUIPMENT_COSTS, DECOR_COSTS, BEAN_TIERS, MARKETING_TIERS, LOCATIONS, CITIES, BANKS, STOCK_COMPANIES } from "./engine/constants";
import type { GameData, ActionParams } from "./types";

interface GameContextType {
  gameData: GameData | null;
  isLoading: boolean;
  startGame: (params: { companyName: string; storeName: string; location: string; ceoName: string; brandLogo: string; difficulty: string; bankName: string; homeCity: string }) => void;
  advanceWeek: () => void;
  performAction: (params: ActionParams) => void;
  resetGame: () => void;
  applyForLoan: (amount: number) => void;
  applyForLoc: () => void;
  drawFromLoc: (amount: number) => void;
  repayLoc: (amount: number) => void;
  buyStock: (companyName: string, shares: number) => void;
  sellStock: (investmentId: number, shares: number) => void;
  investInTechRd: (tech: string, speedTier: string) => void;
  hireCfo: () => void;
  loanOffers: { offers: { label: string; amount: number; rate: number; maturity: number; weeklyPayment: number }[] } | null;
}

const GameContext = createContext<GameContextType | null>(null);

// Convert internal GameState to the GameData format the UI expects
function toGameData(state: GameState): GameData {
  const availableLocations = getAvailableLocations(state.company.week);
  return {
    hasGame: true,
    company: {
      ...state.company,
      loanBalance: state.loans.reduce((s, l) => s + l.remainingBalance, 0),
    },
    stores: state.stores.map((s) => ({
      ...s,
      locationLabel: LOCATIONS.find((l) => l.key === s.location)?.label ?? s.location,
      cityLabel: CITIES.find((c) => c.key === s.city)?.label ?? s.city,
      customerFeedback: s.customerFeedback ?? [],
      weeklyProfit: s.weeklyRevenue - s.weeklyCogs - s.weeklyLabor - s.weeklyRent,
    })),
    menu: state.menu,
    competitors: state.competitors.map((c) => ({
      ...c,
      cityLabel: CITIES.find((ct) => ct.key === c.city)?.label ?? c.city,
    })),
    events: state.events.slice(-20).reverse(),
    locations: LOCATIONS.map((l) => ({ key: l.key, label: l.label, rent: l.rent, traffic: l.traffic })),
    beanTiers: BEAN_TIERS.map((b) => ({ tier: b.tier, label: b.label, costPerStore: b.costPerStore })),
    marketingTiers: MARKETING_TIERS.map((m) => ({ tier: m.tier, label: m.label, weeklyCost: m.weeklyCost })),
    equipmentCosts: EQUIPMENT_COSTS,
    decorCosts: DECOR_COSTS,
    investments: state.investments,
    loans: state.loans.map((l) => ({ ...l, bankName: state.company.bankName })),
    banks: BANKS.map((b) => ({ key: b.key, label: b.label, loanRate: b.loanRate, locRate: b.locRate })),
    stockCompanies: STOCK_COMPANIES,
    techProjectsData: state.techProjects,
    quarterlyReportsData: state.quarterlyReports.slice(-4).reverse(),
    cities: CITIES,
    availableLocations,
    marketOccupancy: state.marketOccupancy,
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved game on mount
  useEffect(() => {
    const saved = loadGameData<GameState>();
    if (saved) {
      console.log("[game] Loaded saved game, week", saved.company.week);
      setState(saved);
    }
    setIsLoading(false);
  }, []);

  // Auto-save whenever state changes
  useEffect(() => {
    if (state) {
      saveGameData(state);
    }
  }, [state]);

  const updateState = useCallback((newState: GameState) => {
    setState(newState);
  }, []);

  const startGame = useCallback((params: { companyName: string; storeName: string; location: string; ceoName: string; brandLogo: string; difficulty: string; bankName: string; homeCity: string }) => {
    const newState = createNewGame(params);
    updateState(newState);
  }, [updateState]);

  const advanceWeek = useCallback(() => {
    if (!state) return;
    updateState(engineAdvanceWeek(state));
  }, [state, updateState]);

  const performAction = useCallback((params: ActionParams) => {
    if (!state) return;
    const result = enginePerformAction(state, params.action, {
      storeId: params.storeId,
      itemId: params.itemId,
      value: params.value,
      stringValue: params.stringValue,
    });
    if (result.success) updateState(result.state);
  }, [state, updateState]);

  const resetGame = useCallback(() => {
    clearGameData();
    setState(null);
  }, []);

  const applyForLoan = useCallback((amount: number) => {
    if (!state) return;
    const result = engineApplyForLoan(state, amount);
    if (result.success) updateState(result.state);
  }, [state, updateState]);

  const applyForLoc = useCallback(() => {
    if (!state) return;
    const result = engineApplyForLoc(state);
    if (result.success) updateState(result.state);
  }, [state, updateState]);

  const drawFromLoc = useCallback((amount: number) => {
    if (!state) return;
    const result = engineDrawFromLoc(state, amount);
    if (result.success) updateState(result.state);
  }, [state, updateState]);

  const repayLoc = useCallback((amount: number) => {
    if (!state) return;
    const result = engineRepayLoc(state, amount);
    if (result.success) updateState(result.state);
  }, [state, updateState]);

  const buyStock = useCallback((companyName: string, shares: number) => {
    if (!state) return;
    const result = engineBuyStock(state, companyName, shares);
    if (result.success) updateState(result.state);
  }, [state, updateState]);

  const sellStock = useCallback((investmentId: number, shares: number) => {
    if (!state) return;
    const result = engineSellStock(state, investmentId, shares);
    if (result.success) updateState(result.state);
  }, [state, updateState]);

  const investInTechRd = useCallback((tech: string, speedTier: string) => {
    if (!state) return;
    const result = engineInvestInTechRd(state, tech, speedTier);
    if (result.success) updateState(result.state);
  }, [state, updateState]);

  const hireCfo = useCallback(() => {
    if (!state) return;
    const result = engineHireCfo(state);
    if (result.success) updateState(result.state);
  }, [state, updateState]);

  const loanOffers = state ? engineGetLoanOffers(state) : null;

  const gameData = state ? toGameData(state) : null;

  return (
    <GameContext.Provider value={{
      gameData, isLoading,
      startGame, advanceWeek, performAction, resetGame,
      applyForLoan, applyForLoc, drawFromLoc, repayLoc,
      buyStock, sellStock, investInTechRd, hireCfo, loanOffers,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
