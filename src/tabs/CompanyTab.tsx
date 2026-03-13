import {
  Megaphone, Building, Award, Briefcase, Rocket, Users,
  PieChart, BarChart3,
} from "lucide-react";
import { useGame } from "../gameContext";
import type { GameData } from "../types";
import { SectionCard, ResetButton, weekToDate, profitColor } from "../shared";

export function CompanyTab({ data }: { data: GameData }) {
  const { performAction, hireCfo } = useGame();
  const { company } = data;

  // Calculate total assets
  const totalDebt = data.loans.reduce((s, l) => s + l.remainingBalance, 0) + company.locBalance;
  const investmentValue = data.investments.reduce((s, i) => s + i.currentPrice * i.shares, 0);
  const storeAssets = data.stores.length * 25000; // rough store value
  const totalAssets = company.cash + investmentValue + storeAssets;

  return (
    <div className="space-y-5">
      {/* Quarterly Reports - at top */}
      {data.quarterlyReportsData.length > 0 && (
        <SectionCard title="Quarterly Earnings" icon={BarChart3}>
          <div className="space-y-3">
            {data.quarterlyReportsData.slice(0, 4).map((q) => {
              const profitPct = q.revenue > 0 ? ((q.profit / q.revenue) * 100).toFixed(0) : "0";
              return (
                <div key={q.quarter} className="bg-amber-950/30 border border-amber-800/15 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-400 text-xs font-bold">Q{q.quarter}</span>
                    <span className="text-amber-400/40 text-[10px]">
                      {weekToDate(company.startDate, q.startWeek)} - {weekToDate(company.startDate, q.endWeek)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-amber-400/50">Revenue</div>
                      <div className="text-emerald-400 text-xs font-bold">${q.revenue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-400/50">Profit</div>
                      <div className={`text-xs font-bold ${profitColor(q.profit)}`}>${q.profit.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-400/50">Margin</div>
                      <div className={`text-xs font-bold ${profitColor(q.profit)}`}>{profitPct}%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-amber-400/40">
                    <span>Stores: {q.storeCount}</span>
                    <span>Rep: {q.startReputation} → {q.endReputation}</span>
                    <span>Cash: ${q.endCash.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
      {data.quarterlyReportsData.length === 0 && (
        <div className="bg-amber-950/15 border border-amber-800/10 rounded-lg p-3 text-center">
          <div className="text-amber-500/30 text-xs">First quarterly report after 13 weeks</div>
        </div>
      )}

      {/* Marketing */}
      <SectionCard title="Marketing" icon={Megaphone}>
        <div className="grid grid-cols-2 gap-2">
          {data.marketingTiers.map((mt) => (
            <button key={mt.tier} type="button" onClick={() => performAction({ action: "set_marketing", value: mt.tier })} disabled={false}
              className={`px-3 py-2.5 rounded-lg text-left cursor-default ${company.marketingTier === mt.tier ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
              <div className="font-semibold text-xs">{mt.label}</div>
              <div className="text-[10px] opacity-60">{mt.weeklyCost > 0 ? `$${mt.weeklyCost.toLocaleString()}/wk` : "Free"}</div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Corporate Office */}
      <SectionCard title="Corporate Office" icon={Building}>
        {company.hasOffice ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <Award className="w-4 h-4" /><span className="font-semibold">HQ Active</span>
            <span className="text-emerald-400/50 text-xs">+1 rep/wk | $2,000/wk</span>
          </div>
        ) : company.phase === "startup" ? (
          <div className="text-amber-500/40 text-xs">Reach Growth phase to unlock</div>
        ) : (
          <button type="button" onClick={() => performAction({ action: "buy_office" })} disabled={company.cash < 50000}
            className="w-full py-2.5 bg-amber-600 text-amber-50 font-bold rounded-lg disabled:opacity-40 text-sm cursor-default">
            Buy Corporate Office ($50,000)
          </button>
        )}
      </SectionCard>

      {/* CFO */}
      <SectionCard title="Chief Financial Officer" icon={Briefcase}>
        {company.hasCfo ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <Users className="w-4 h-4" /><span className="font-semibold">CFO on Staff</span>
            <span className="text-emerald-400/50 text-xs">$3,000/wk | Required for IPO</span>
          </div>
        ) : (
          <>
            <p className="text-amber-500/60 text-xs mb-2">A CFO is required to take your company public. They handle financial strategy and IPO underwriting.</p>
            <button type="button" onClick={() => hireCfo()} disabled={company.cash < 25000}
              className="w-full py-2.5 bg-amber-600 text-amber-50 font-bold rounded-lg disabled:opacity-40 text-sm cursor-default">
              Hire CFO ($25,000 + $3,000/wk)
            </button>
          </>
        )}
      </SectionCard>

      {/* IPO */}
      {company.ipoValuation > 0 ? (
        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-500/30 rounded-xl p-4">
          <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Rocket className="w-3.5 h-3.5" />Public Company
          </div>
          <div className="text-emerald-100 text-lg font-bold">${company.ipoValuation.toLocaleString()}</div>
          <p className="text-emerald-400/50 text-xs">IPO valuation. The empire continues!</p>
        </div>
      ) : company.hasCfo ? (
        <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-500/30 rounded-xl p-4">
          <div className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Rocket className="w-3.5 h-3.5" />Go Public (IPO)
          </div>
          <p className="text-amber-200/60 text-xs mb-3">
            Your CFO and bank will underwrite the IPO (3% fee). You'll raise capital equal to 20% of your valuation. The game continues after IPO.
          </p>
          <button type="button" onClick={() => performAction({ action: "launch_ipo" })} disabled={!company.bankName}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-bold rounded-lg disabled:opacity-40 text-sm cursor-default">
            Launch IPO
          </button>
        </div>
      ) : null}

      {/* Balance Sheet */}
      {company.hasOffice && (
        <SectionCard title="Balance Sheet" icon={PieChart}>
          <div className="space-y-2 text-xs">
            <div className="text-amber-400/60 text-[10px] uppercase tracking-wider">Assets</div>
            <div className="flex justify-between"><span className="text-amber-400/40">Cash</span><span className="text-amber-200/70">${company.cash.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-amber-400/40">Investments</span><span className="text-amber-200/70">${investmentValue.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-amber-400/40">Store Assets ({data.stores.length})</span><span className="text-amber-200/70">${storeAssets.toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-amber-800/10 pt-1"><span className="text-amber-400/60 font-semibold">Total Assets</span><span className="text-amber-100 font-semibold">${totalAssets.toLocaleString()}</span></div>

            <div className="text-amber-400/60 text-[10px] uppercase tracking-wider mt-3">Liabilities</div>
            <div className="flex justify-between"><span className="text-amber-400/40">Loan Balance</span><span className="text-red-400/70">${totalDebt > 0 ? totalDebt.toLocaleString() : "0"}</span></div>
            <div className="flex justify-between"><span className="text-amber-400/40">LOC Balance</span><span className="text-red-400/70">${company.locBalance.toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-amber-800/10 pt-1">
              <span className="text-amber-400/60 font-semibold">Equity</span>
              <span className={`font-semibold ${profitColor(totalAssets - totalDebt)}`}>${(totalAssets - totalDebt).toLocaleString()}</span>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Cash Flow Statement */}
      {company.hasOffice && company.week > 1 && (
        <SectionCard title="Weekly Cash Flow" icon={BarChart3}>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-amber-400/40">Revenue</span><span className="text-emerald-400/70">+${company.weeklyRevenue.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-amber-400/40">Cost of Goods</span><span className="text-red-400/70">-${company.weeklyCogs.toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-amber-800/10 pt-1">
              <span className="text-amber-400/50">Gross Profit</span>
              <span className={profitColor(company.weeklyRevenue - company.weeklyCogs)}>${(company.weeklyRevenue - company.weeklyCogs).toLocaleString()}</span>
            </div>
            <div className="flex justify-between mt-1"><span className="text-amber-400/40">Labor</span><span className="text-red-400/70">-${company.weeklyLabor.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-amber-400/40">Rent</span><span className="text-red-400/70">-${company.weeklyRent.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-amber-400/40">Marketing</span><span className="text-red-400/70">-${company.weeklyMarketing.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-amber-400/40">Other (beans, office, CFO, loans)</span><span className="text-red-400/70">-${company.weeklyOther.toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-amber-800/10 pt-1">
              <span className="text-amber-400/60 font-semibold">Net Income</span>
              <span className={`font-semibold ${profitColor(company.weeklyProfit)}`}>{company.weeklyProfit >= 0 ? "+" : ""}${company.weeklyProfit.toLocaleString()}</span>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Lifetime Stats */}
      <div className="bg-amber-950/15 border border-amber-800/10 rounded-lg p-3">
        <div className="text-amber-400/50 text-[10px] uppercase tracking-wider mb-2">Lifetime</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-amber-400/40">Total Revenue</span><span className="text-amber-200/70">${company.totalRevenue.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-amber-400/40">Total Expenses</span><span className="text-amber-200/70">${company.totalExpenses.toLocaleString()}</span></div>
          <div className="flex justify-between border-t border-amber-800/10 pt-1">
            <span className="text-amber-400/40 font-semibold">Net Profit</span>
            <span className={`font-semibold ${profitColor(company.totalRevenue - company.totalExpenses)}`}>${(company.totalRevenue - company.totalExpenses).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <ResetButton />
    </div>
  );
}
