import { useState } from "react";
import {
  Landmark, BarChart3, ArrowUpRight, ArrowDownRight, Shield,
} from "lucide-react";
import { useGame } from "../gameContext";
import type { GameData } from "../types";
import { SectionCard, profitColor } from "../shared";

export function FinanceTab({ data }: { data: GameData }) {
  const game = useGame();
  const { company } = data;
  const [loanAmount, setLoanAmount] = useState("");
  const [locDrawAmount, setLocDrawAmount] = useState("");
  const [locRepayAmount, setLocRepayAmount] = useState("");
  const [buyCompany, setBuyCompany] = useState("");
  const [buyShares, setBuyShares] = useState("");
  const [sellInvId, setSellInvId] = useState<number | null>(null);
  const [sellShares, setSellShares] = useState("");

  const sectors = ["finance", "energy", "technology", "biotech", "entertainment"];
  const sectorLabels: Record<string, string> = { finance: "Finance", energy: "Energy", technology: "Technology", biotech: "Biotech", entertainment: "Entertainment" };

  const bankLabel = data.banks.find((b) => b.key === company.bankName)?.label || company.bankName;

  const loanOffers = game.loanOffers;

  // Credit score color
  const creditColor = company.creditScore >= 750 ? "text-emerald-400" : company.creditScore >= 700 ? "text-sky-400" : company.creditScore >= 650 ? "text-amber-400" : "text-red-400";
  const creditLabel = company.creditScore >= 750 ? "Excellent" : company.creditScore >= 700 ? "Good" : company.creditScore >= 650 ? "Fair" : company.creditScore >= 550 ? "Poor" : "Very Poor";

  return (
    <div className="space-y-5">
      {/* Credit Score */}
      <SectionCard title="Business Credit Score" icon={Shield}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className={`text-2xl font-bold ${creditColor}`}>{company.creditScore}</div>
            <div className={`text-xs ${creditColor}`}>{creditLabel}</div>
          </div>
          <div className="text-right text-[10px] text-amber-400/40">
            <div>Range: 300-850</div>
            <div>Higher = better rates & limits</div>
          </div>
        </div>
        <div className="h-2 bg-amber-900/30 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${company.creditScore >= 750 ? "bg-emerald-500" : company.creditScore >= 650 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${((company.creditScore - 300) / 550) * 100}%` }} />
        </div>
      </SectionCard>

      {/* Banking */}
      <SectionCard title={`Banking - ${bankLabel}`} icon={Landmark}>
        {/* Active Loans */}
        {data.loans.length > 0 && (
          <div className="mb-3">
            <div className="text-amber-400/50 text-[10px] uppercase tracking-wider mb-1">Active Loans</div>
            {data.loans.map((loan) => (
              <div key={loan.id} className="flex justify-between text-xs py-1 border-b border-amber-800/10 last:border-0">
                <span className="text-amber-200/70">{loan.type === "business_loan" ? "Business Loan" : "LOC"}</span>
                <span className="text-amber-200/70">${loan.remainingBalance.toLocaleString()} left (${loan.weeklyPayment}/wk)</span>
              </div>
            ))}
          </div>
        )}

        {/* Loan Offers (3 options) */}
        <div className="space-y-2">
          <div className="text-amber-400/50 text-[10px] uppercase tracking-wider">Available Loan Offers</div>
          {loanOffers && "offers" in loanOffers && loanOffers.offers ? (
            <div className="space-y-2">
              {loanOffers.offers.map((offer: { label: string; amount: number; rate: number; maturity: number; weeklyPayment: number }) => (
                <div key={offer.label} className="bg-amber-950/30 border border-amber-800/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-amber-200/80 text-xs font-bold">{offer.label}</span>
                    <span className="text-amber-100 text-sm font-bold">${offer.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-amber-400/50 mb-2">
                    <span>Rate: {(offer.rate / 100).toFixed(1)}%</span>
                    <span>Maturity: {offer.maturity} wks</span>
                    <span>Payment: ${offer.weeklyPayment.toLocaleString()}/wk</span>
                  </div>
                  <button type="button" onClick={() => { game.applyForLoan(offer.amount, offer.maturity); setLoanAmount(""); }}
                    disabled={company.cash < 0}
                    className="w-full py-1.5 bg-amber-600/80 text-amber-50 font-bold rounded text-[10px] disabled:opacity-40 cursor-default">
                    Apply
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              <input type="text" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="Custom amount ($10k+)"
                className="flex-1 px-3 py-2 bg-amber-950/40 border border-amber-800/30 rounded-lg text-amber-100 text-xs" />
              <button type="button" onClick={() => { const amt = parseInt(loanAmount); if (amt > 0) { game.applyForLoan(amt); setLoanAmount(""); } }}
                disabled={!loanAmount}
                className="px-4 py-2 bg-amber-600 text-amber-50 font-bold rounded-lg disabled:opacity-40 text-xs cursor-default">
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Line of Credit */}
        <div className="space-y-2 mt-3">
          <div className="text-amber-400/50 text-[10px] uppercase tracking-wider">Line of Credit</div>
          {company.locLimit > 0 ? (
            <>
              <div className="text-xs text-amber-200/60">
                Limit: ${company.locLimit.toLocaleString()} | Used: ${company.locBalance.toLocaleString()} | Available: ${(company.locLimit - company.locBalance).toLocaleString()}
              </div>
              <div className="flex gap-2">
                <input type="text" value={locDrawAmount} onChange={(e) => setLocDrawAmount(e.target.value)} placeholder="Draw amount"
                  className="flex-1 px-3 py-2 bg-amber-950/40 border border-amber-800/30 rounded-lg text-amber-100 text-xs" />
                <button type="button" onClick={() => { const amt = parseInt(locDrawAmount); if (amt > 0) { game.drawFromLoc(amt); setLocDrawAmount(""); } }}
                  disabled={false} className="px-3 py-2 bg-amber-600 text-amber-50 font-bold rounded-lg disabled:opacity-40 text-xs cursor-default">Draw</button>
              </div>
              {company.locBalance > 0 && (
                <div className="flex gap-2">
                  <input type="text" value={locRepayAmount} onChange={(e) => setLocRepayAmount(e.target.value)} placeholder="Repay amount"
                    className="flex-1 px-3 py-2 bg-amber-950/40 border border-amber-800/30 rounded-lg text-amber-100 text-xs" />
                  <button type="button" onClick={() => { const amt = parseInt(locRepayAmount); if (amt > 0) { game.repayLoc(amt); setLocRepayAmount(""); } }}
                    disabled={false} className="px-3 py-2 bg-emerald-700 text-emerald-50 font-bold rounded-lg disabled:opacity-40 text-xs cursor-default">Repay</button>
                </div>
              )}
            </>
          ) : (
            <button type="button" onClick={() => game.applyForLoc()} disabled={false}
              className="w-full py-2 bg-amber-950/30 border border-amber-800/20 text-amber-300/60 rounded-lg text-xs cursor-default">
              Apply for Line of Credit
            </button>
          )}
        </div>
      </SectionCard>

      {/* Stock Market */}
      <SectionCard title="Stock Market" icon={BarChart3}>
        {/* Current Holdings */}
        {data.investments.length > 0 && (
          <div className="mb-3">
            <div className="text-amber-400/50 text-[10px] uppercase tracking-wider mb-1">Your Portfolio</div>
            {data.investments.map((inv) => {
              const gain = (inv.currentPrice - inv.purchasePrice) * inv.shares;
              return (
                <div key={inv.id} className="flex items-center justify-between py-1.5 border-b border-amber-800/10 last:border-0">
                  <div>
                    <div className="text-amber-200/80 text-xs font-semibold">{inv.companyName}</div>
                    <div className="text-amber-500/40 text-[10px]">{inv.shares} shares @ ${inv.purchasePrice}</div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="text-amber-100 text-xs">${inv.currentPrice}/sh</div>
                      <div className={`text-[10px] flex items-center gap-0.5 ${profitColor(gain)}`}>
                        {gain >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        ${Math.abs(gain).toLocaleString()}
                      </div>
                    </div>
                    {sellInvId === inv.id ? (
                      <div className="flex items-center gap-1">
                        <input type="text" value={sellShares} onChange={(e) => setSellShares(e.target.value)} placeholder="#"
                          className="w-10 px-1 py-1 bg-amber-950/60 border border-amber-500/50 rounded text-amber-100 text-[10px] text-center" />
                        <button type="button" onClick={() => { const s = parseInt(sellShares); if (s > 0) { game.sellStock(inv.id, s); setSellInvId(null); setSellShares(""); } }}
                          className="text-red-400 text-[10px] cursor-default">Sell</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => { setSellInvId(inv.id); setSellShares(String(inv.shares)); }}
                        className="text-amber-400/50 text-[10px] cursor-default">Sell</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Buy Stocks by Sector */}
        {sectors.map((sector) => {
          const companies = data.stockCompanies.filter((s) => s.sector === sector);
          if (companies.length === 0) return null;
          return (
            <div key={sector} className="mb-3">
              <div className="text-amber-400/50 text-[10px] uppercase tracking-wider mb-1">{sectorLabels[sector]}</div>
              {companies.map((sc) => {
                const priceVar = 1 + (Math.sin(company.week * 0.3 + sc.name.length) * 0.2);
                const price = Math.round(sc.basePrice * priceVar);
                return (
                  <div key={sc.name} className="flex items-center justify-between py-1.5 border-b border-amber-800/10 last:border-0">
                    <div className="text-amber-200/80 text-xs">{sc.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-100 text-xs font-semibold">${price}</span>
                      {buyCompany === sc.name ? (
                        <div className="flex items-center gap-1">
                          <input type="text" value={buyShares} onChange={(e) => setBuyShares(e.target.value)} placeholder="#"
                            className="w-10 px-1 py-1 bg-amber-950/60 border border-amber-500/50 rounded text-amber-100 text-[10px] text-center" />
                          <button type="button" onClick={() => { const s = parseInt(buyShares); if (s > 0) { game.buyStock(sc.name, s); setBuyCompany(""); setBuyShares(""); } }}
                            className="text-emerald-400 text-[10px] cursor-default">Buy</button>
                          <button type="button" onClick={() => setBuyCompany("")} className="text-amber-500/40 text-[10px] cursor-default">X</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => { setBuyCompany(sc.name); setBuyShares("10"); }}
                          className="text-emerald-400/60 text-[10px] cursor-default">Buy</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </SectionCard>
    </div>
  );
}
