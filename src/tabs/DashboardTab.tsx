import { useState } from "react";
import {
  DollarSign, TrendingUp, Star, Store, Play, ChevronRight,
  Globe, Search, Eye, Calendar,
} from "lucide-react";
import { useGame } from "../gameContext";
import type { GameData } from "../types";
import { MetricCard, EventItem, weekToDate, $w, profitColor } from "../shared";

export function DashboardTab({ data, onCityClick }: { data: GameData; onCityClick: (city: string) => void }) {
  const { advanceWeek, performAction } = useGame();
  const [showAllEvents, setShowAllEvents] = useState(false);

  const { company, stores: storeList, events, competitors: comps } = data;
  const visibleEvents = showAllEvents ? events : events.slice(0, 5);

  // Group stores by city for performance overview (store-level profit: revenue - COGS - labor - rent)
  const storesByCity: Record<string, { cityLabel: string; stores: typeof storeList; totalProfit: number; totalRevenue: number; totalCustomers: number }> = {};
  for (const s of storeList) {
    if (!storesByCity[s.city]) {
      storesByCity[s.city] = { cityLabel: s.cityLabel, stores: [], totalProfit: 0, totalRevenue: 0, totalCustomers: 0 };
    }
    const entry = storesByCity[s.city]!;
    entry.stores.push(s);
    entry.totalProfit += s.weeklyProfit;
    entry.totalRevenue += s.weeklyRevenue;
    entry.totalCustomers += s.weeklyCustomers;
  }

  return (
    <div className="space-y-5">

      {/* Date display */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-amber-400/60" />
          <span className="text-amber-100 text-sm font-bold">{weekToDate(company.startDate, company.week)}</span>
        </div>
        <span className="text-amber-500/40 text-[10px]">Week {company.week}</span>
      </div>

      <button type="button" onClick={() => advanceWeek()} disabled={false}
        className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-amber-50 font-bold rounded-lg disabled:opacity-50 cursor-default flex items-center justify-center gap-2">
        <Play className="w-4 h-4" />Advance to {weekToDate(company.startDate, company.week + 1)}
      </button>

      <div className="grid grid-cols-2 gap-2.5">
        <MetricCard icon={DollarSign} label="Cash" value={$w(company.cash)} color="text-amber-100" />
        <MetricCard icon={TrendingUp} label="Weekly Profit" value={`${company.weeklyProfit >= 0 ? "+" : ""}${$w(company.weeklyProfit)}`} color={profitColor(company.weeklyProfit)} />
        <MetricCard icon={Store} label="Stores" value={storeList.length.toString()} color="text-sky-300" />
        <MetricCard icon={Star} label="Reputation" value={`${company.reputation}/100`} color="text-amber-400" />
      </div>

      {/* Store Performance by City */}
      {storeList.length > 0 && (
        <div className="space-y-2">
          <div className="text-amber-400/60 text-[10px] uppercase tracking-wider">Performance by Location</div>
          {Object.entries(storesByCity).map(([cityKey, cityData]) => (
            <button key={cityKey} type="button" onClick={() => onCityClick(cityKey)}
              className="w-full bg-amber-950/20 border border-amber-800/15 rounded-lg p-3 text-left cursor-default hover:border-amber-700/30 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-amber-400/60" />
                  <span className="text-amber-100 text-sm font-bold">{cityData.cityLabel}</span>
                  <span className="text-amber-500/40 text-[10px]">{cityData.stores.length} store{cityData.stores.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-bold ${profitColor(cityData.totalProfit)}`}>
                    {cityData.totalProfit >= 0 ? "+" : ""}${cityData.totalProfit.toLocaleString()}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400/30" />
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-amber-400/40">
                <span>Rev: ${cityData.totalRevenue.toLocaleString()}/wk</span>
                <span>{cityData.totalCustomers.toLocaleString()} customers/wk</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {comps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-amber-400/60 text-xs font-semibold uppercase tracking-wider">Competitors</div>
            {company.difficulty === "tycoon" && <span className="text-red-400/50 text-[9px]">Aggressive Market</span>}
            {company.difficulty === "easy" && <span className="text-emerald-400/50 text-[9px]">Relaxed Market</span>}
          </div>
          <div className="space-y-1.5">
            {comps.map((c) => {
              // Intel costs scale with difficulty
              const intelMult = company.difficulty === "tycoon" ? 2.0 : company.difficulty === "easy" ? 0.5 : 1.0;
              const standardCost = Math.round(5000 * intelMult);
              const deepCost = Math.round(15000 * intelMult);
              return (
                <div key={c.id} className="px-3 py-2 bg-amber-950/15 border border-amber-800/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-amber-200/80 text-xs font-semibold">{c.name}</div>
                      <div className="text-amber-500/40 text-[10px]">{c.cityLabel} {c.isPublic && <span className="text-emerald-400/60">PUBLIC</span>}</div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      {c.intelLevel >= 1 ? (
                        <>
                          <span className="text-amber-400/50">Rep {c.reputation}</span>
                          <span className="text-amber-400/50">Stores: {c.storeCount}</span>
                        </>
                      ) : (
                        <span className="text-amber-500/30 italic">Unknown</span>
                      )}
                    </div>
                  </div>
                  {c.intelLevel >= 2 && (
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-amber-400/40">
                      <span>Est. Revenue: ${c.estimatedRevenue.toLocaleString()}/wk</span>
                      <span>Strength: {c.strength}</span>
                    </div>
                  )}
                  {c.intelLevel < 2 && (
                    <div className="mt-1 flex gap-1">
                      {c.intelLevel < 1 && (
                        <button type="button" onClick={() => performAction({ action: "buy_intel", value: c.id, stringValue: "standard" })}
                          disabled={false}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-950/30 border border-amber-800/20 rounded text-[9px] text-amber-300/60 cursor-default">
                          <Search className="w-2.5 h-2.5" />Intel ${(standardCost / 1000).toFixed(1)}k
                        </button>
                      )}
                      {c.intelLevel < 2 && (
                        <button type="button" onClick={() => performAction({ action: "buy_intel", value: c.id, stringValue: "deep" })}
                          disabled={false}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-950/30 border border-amber-800/20 rounded text-[9px] text-amber-300/60 cursor-default">
                          <Eye className="w-2.5 h-2.5" />Deep Intel ${(deepCost / 1000).toFixed(1)}k
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="text-amber-400/60 text-xs font-semibold uppercase tracking-wider mb-2">Recent Events</div>
        <div className="space-y-1.5">
          {events.length === 0 ? (
            <div className="text-amber-500/30 text-xs text-center py-4">No events yet. End your first week!</div>
          ) : visibleEvents.map((e) => <EventItem key={e.id} event={e} startDate={company.startDate} />)}
        </div>
        {events.length > 5 && (
          <button type="button" onClick={() => setShowAllEvents(!showAllEvents)}
            className="w-full mt-2 py-1.5 text-amber-400/50 text-[10px] cursor-default">
            {showAllEvents ? "Show less" : `Show all ${events.length} events`}
          </button>
        )}
      </div>
    </div>
  );
}
