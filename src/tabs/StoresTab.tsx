import { useState } from "react";
import {
  Star, MapPin, ChevronRight, Plus, Wrench, Paintbrush,
  UserPlus, UserMinus, ShieldCheck, Globe, Users,
} from "lucide-react";
import { useGame } from "../gameContext";
import type { GameData } from "../types";
import { RatingBar, profitColor } from "../shared";

export function StoresTab({ data, cityFilter, onClearFilter }: { data: GameData; cityFilter: string | null; onClearFilter: () => void }) {
  const { performAction } = useGame();
  const [showNewStore, setShowNewStore] = useState(false);
  const [buildStep, setBuildStep] = useState(1); // 1 = city+location, 2 = equipment+interior
  const [expandedStore, setExpandedStore] = useState<number | null>(null);
  const [newLoc, setNewLoc] = useState("suburbs");
  const [newCity, setNewCity] = useState(data.company.homeCity);
  const [newEquip, setNewEquip] = useState(2);
  const [newDecor, setNewDecor] = useState(2);
  const canOpenStore = data.company.phase !== "startup";

  const hasStoresInCity = (cityKey: string) => data.stores.some((s) => s.city === cityKey);

  // Calculate build cost for new store
  const selectedLoc = data.locations.find((l) => l.key === newLoc);
  const selectedCity = data.cities.find((c) => c.key === newCity);
  const isHome = newCity === data.company.homeCity;
  const alreadyInCity = hasStoresInCity(newCity);
  const baseCost = 25000;
  let equipCost = 0;
  for (let i = 2; i <= newEquip; i++) equipCost += data.equipmentCosts[i] ?? 0;
  let decorCost = 0;
  for (let i = 2; i <= newDecor; i++) decorCost += data.decorCosts[i] ?? 0;
  const rentMult = selectedCity?.rentMult ?? 1;
  const securityDeposit = Math.round((selectedLoc?.rent ?? 1050) * rentMult * 2);
  const expansionCost = !isHome && !alreadyInCity && selectedCity ? selectedCity.unlockCost + 15000 : 0;
  const totalBuildCost = baseCost + equipCost + decorCost + securityDeposit + expansionCost;

  const equipLabels = ["", "", "Standard", "Pro", "Premium", "Elite"];
  const decorLabels = ["", "", "Simple", "Modern", "Upscale", "Luxury"];

  const filteredStores = cityFilter ? data.stores.filter((s) => s.city === cityFilter) : data.stores;
  const filterCityLabel = cityFilter ? data.cities.find((c) => c.key === cityFilter)?.label ?? cityFilter : null;

  return (
    <div className="space-y-4">
      {/* City filter chip */}
      {cityFilter && (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-600/20 border border-amber-500/30 rounded-full text-amber-200 text-xs font-semibold flex items-center gap-1.5">
            <Globe className="w-3 h-3" />{filterCityLabel}
          </span>
          <button type="button" onClick={onClearFilter} className="text-amber-400/50 text-[10px] underline cursor-default">Show all cities</button>
        </div>
      )}
      {filteredStores.map((store) => {
        const isExpanded = expandedStore === store.id;
        const avgRating = (store.priceRating + store.productRating + store.serviceRating + store.atmosphereRating) / 4;
        return (
          <div key={store.id} className="bg-amber-950/20 border border-amber-800/20 rounded-xl overflow-hidden">
            {/* Store Header — always visible, clickable */}
            <button type="button" onClick={() => setExpandedStore(isExpanded ? null : store.id)}
              className="w-full p-4 text-left cursor-default">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-amber-100 text-sm font-bold">{store.name}</div>
                  <div className="text-amber-400/50 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{store.cityLabel} - {store.locationLabel}</div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <div className={`text-xs font-semibold ${profitColor(store.weeklyProfit)}`}>
                      {store.weeklyProfit >= 0 ? "+" : ""}${store.weeklyProfit.toLocaleString()}/wk
                    </div>
                    <div className="text-amber-500/40 text-[10px]">${store.weeklyRevenue.toLocaleString()} rev</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-amber-400/40 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>
              </div>
              {/* Quick stats row */}
              <div className="flex items-center gap-3 mt-2 text-[10px]">
                <span className="text-amber-400/50">Equip {store.equipmentLevel}/5</span>
                <span className="text-amber-400/50">Decor {store.decorLevel}/5</span>
                <span className="text-amber-400/50">Staff {store.baristas}{store.hasManager ? "+M" : ""}</span>
                <span className="text-amber-400/50 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />{avgRating.toFixed(1)}
                </span>
              </div>
            </button>

            {/* Expanded Detail View */}
            {isExpanded && (
              <div className="border-t border-amber-800/15 p-4 space-y-4">
                {/* Customer Reviews */}
                <div>
                  <div className="text-amber-400/70 text-[10px] uppercase tracking-wider mb-2 font-semibold">Customer Reviews</div>
                  <div className="flex items-start gap-4 mb-3">
                    <div>
                      <div className="text-amber-100 text-2xl font-bold">{avgRating.toFixed(1)}</div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-amber-800/30"}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <RatingBar rating={store.priceRating} label="Price" />
                      <RatingBar rating={store.productRating} label="Product" />
                      <RatingBar rating={store.serviceRating} label="Service" />
                      <RatingBar rating={store.atmosphereRating} label="Atmosphere" />
                    </div>
                  </div>
                  {/* Feedback cards */}
                  {store.customerFeedback.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {store.customerFeedback.map((fb, i) => (
                        <div key={i} className="flex-shrink-0 w-48 bg-amber-950/40 border border-amber-800/15 rounded-lg p-2.5">
                          <div className="flex items-center gap-0.5 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-2.5 h-2.5 ${s <= fb.stars ? "text-amber-400 fill-amber-400" : "text-amber-800/30"}`} />
                            ))}
                          </div>
                          <div className="text-amber-200/70 text-[10px] leading-tight">{fb.text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Income Statement */}
                <div>
                  <div className="text-amber-400/70 text-[10px] uppercase tracking-wider mb-2 font-semibold">Store Income Statement</div>
                  <div className="space-y-1 text-xs">
                    <div className="text-amber-400/50 text-[10px] uppercase tracking-wider">Revenue</div>
                    <div className="flex justify-between"><span className="text-amber-400/40">Sales ({store.weeklyCustomers} customers)</span><span className="text-emerald-400/70">${store.weeklyRevenue.toLocaleString()}</span></div>
                    <div className="text-amber-400/50 text-[10px] uppercase tracking-wider mt-2">Expenses</div>
                    <div className="flex justify-between"><span className="text-amber-400/40">Cost of Goods</span><span className="text-red-400/70">-${store.weeklyCogs.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-amber-400/40">Labor ({store.baristas} baristas{store.hasManager ? " + mgr" : ""})</span><span className="text-red-400/70">-${store.weeklyLabor.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-amber-400/40">Rent</span><span className="text-red-400/70">-${store.weeklyRent.toLocaleString()}</span></div>
                    <div className="flex justify-between border-t border-amber-800/15 pt-1 mt-1">
                      <span className="text-amber-400/60 font-semibold">Net Income</span>
                      <span className={`font-bold ${profitColor(store.weeklyProfit)}`}>{store.weeklyProfit >= 0 ? "+" : ""}${store.weeklyProfit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Upgrade Actions */}
                <div>
                  <div className="text-amber-400/70 text-[10px] uppercase tracking-wider mb-2 font-semibold">Manage</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button type="button" disabled={store.equipmentLevel >= 5 || data.company.cash < (data.equipmentCosts[store.equipmentLevel + 1] ?? 99999)}
                      onClick={() => performAction({ action: "upgrade_equipment", storeId: store.id })}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-950/30 border border-amber-800/20 rounded-lg text-xs text-amber-200/80 disabled:opacity-30 cursor-default">
                      <Wrench className="w-3 h-3 text-amber-400" />
                      Equip {store.equipmentLevel < 5 && <span className="text-amber-500/50 text-[10px]">${(data.equipmentCosts[store.equipmentLevel + 1] ?? 0).toLocaleString()}</span>}
                    </button>
                    <button type="button" disabled={store.decorLevel >= 5 || data.company.cash < (data.decorCosts[store.decorLevel + 1] ?? 99999)}
                      onClick={() => performAction({ action: "upgrade_decor", storeId: store.id })}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-950/30 border border-amber-800/20 rounded-lg text-xs text-amber-200/80 disabled:opacity-30 cursor-default">
                      <Paintbrush className="w-3 h-3 text-amber-400" />
                      Decor {store.decorLevel < 5 && <span className="text-amber-500/50 text-[10px]">${(data.decorCosts[store.decorLevel + 1] ?? 0).toLocaleString()}</span>}
                    </button>
                    <button type="button" disabled={store.baristas >= 8 || data.company.cash < 300}
                      onClick={() => performAction({ action: "hire_barista", storeId: store.id })}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-950/30 border border-amber-800/20 rounded-lg text-xs text-amber-200/80 disabled:opacity-30 cursor-default">
                      <UserPlus className="w-3 h-3 text-amber-400" />Barista <span className="text-amber-500/50 text-[10px]">$300</span>
                    </button>
                    <button type="button" disabled={store.baristas <= 1}
                      onClick={() => performAction({ action: "fire_barista", storeId: store.id })}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-950/30 border border-amber-800/20 rounded-lg text-xs text-amber-200/80 disabled:opacity-30 cursor-default">
                      <UserMinus className="w-3 h-3 text-amber-400" />Fire Barista
                    </button>
                    {!store.hasManager && (
                      <button type="button" disabled={data.company.cash < 1000}
                        onClick={() => performAction({ action: "hire_manager", storeId: store.id })}
                        className="col-span-2 flex items-center gap-1.5 px-3 py-2 bg-amber-950/30 border border-amber-800/20 rounded-lg text-xs text-amber-200/80 disabled:opacity-30 cursor-default">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />Hire Manager <span className="text-amber-500/50 text-[10px]">$1,000 + $1,500/wk</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Build New Store */}
      {canOpenStore && (
        <div className="bg-amber-950/20 border border-amber-800/20 border-dashed rounded-xl p-4">
          {showNewStore ? (
            <div className="space-y-4">
              <div className="text-amber-100 text-sm font-bold text-center">Build New Store</div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${buildStep === 1 ? "bg-amber-500 text-amber-950" : "bg-amber-800/30 text-amber-400/60"}`}>1</div>
                <div className="w-6 h-px bg-amber-800/30" />
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${buildStep === 2 ? "bg-amber-500 text-amber-950" : "bg-amber-800/30 text-amber-400/60"}`}>2</div>
              </div>
              <p className="text-amber-400/50 text-[10px] text-center">
                {buildStep === 1 ? "Choose a city and store type for your new location." : "Select equipment and interior tiers to outfit your store."}
              </p>

              {buildStep === 1 && (
                <>
                  {/* City Selection */}
                  <div className="text-amber-400/80 text-xs font-semibold uppercase tracking-wider">City</div>
                  <div className="grid grid-cols-2 gap-2">
                    {data.cities.map((city) => {
                      const cityIsHome = city.key === data.company.homeCity;
                      const cityAlreadyIn = hasStoresInCity(city.key);
                      const cityExpansionCost = !cityIsHome && !cityAlreadyIn ? city.unlockCost + 15000 : 0;
                      return (
                        <button key={city.key} type="button" onClick={() => setNewCity(city.key)}
                          className={`px-3 py-2 rounded-lg text-left text-xs cursor-default ${newCity === city.key ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
                          <div className="font-semibold flex items-center gap-1">{city.label} {cityIsHome && <span className="text-[8px] text-amber-400/60">HOME</span>}</div>
                          <div className="text-[10px] opacity-60">{city.description}</div>
                          {cityExpansionCost > 0 && <div className="text-[9px] text-amber-400/40 mt-0.5">Expansion: +${cityExpansionCost.toLocaleString()}</div>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Store Type / Location Selection — only available this week */}
                  <div className="flex items-center justify-between">
                    <div className="text-amber-400/80 text-xs font-semibold uppercase tracking-wider">Available This Week</div>
                    <span className="text-amber-500/30 text-[9px]">{data.availableLocations.length} of {data.locations.length} types</span>
                  </div>
                  <div className="space-y-2">
                    {data.locations.filter((loc) => data.availableLocations.includes(loc.key)).map((loc) => {
                      const locRentWithCity = Math.round(loc.rent * rentMult);
                      const locTrafficWithCity = Math.round(loc.traffic * (selectedCity?.trafficMult ?? 1));
                      const locDeposit = Math.round(loc.rent * rentMult * 2);
                      return (
                        <button key={loc.key} type="button" onClick={() => setNewLoc(loc.key)}
                          className={`w-full px-3 py-3 rounded-lg text-left cursor-default ${newLoc === loc.key ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold">{loc.label}</div>
                            <div className="text-[10px] text-amber-400/50">${locRentWithCity.toLocaleString()}/wk rent</div>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="text-[10px] opacity-60 flex items-center gap-1">
                              <Users className="w-3 h-3" />{(locTrafficWithCity / 1000).toFixed(1)}k foot traffic/wk
                            </div>
                            <div className="text-[10px] opacity-60">
                              Deposit: ${locDeposit.toLocaleString()}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {data.locations.filter((loc) => !data.availableLocations.includes(loc.key)).length > 0 && (
                      <div className="text-amber-500/25 text-[10px] text-center py-1">
                        Other store types may become available next week
                      </div>
                    )}
                  </div>

                  {/* Next Step Button */}
                  <button type="button"
                    onClick={() => { if (!data.availableLocations.includes(newLoc) && data.availableLocations[0]) setNewLoc(data.availableLocations[0]); setBuildStep(2); }}
                    disabled={!data.availableLocations.includes(newLoc)}
                    className="w-full py-3 bg-amber-600 text-amber-50 font-bold rounded-lg text-sm cursor-default disabled:opacity-40">
                    Next: Choose Equipment & Interior
                  </button>
                  <button type="button" onClick={() => { setShowNewStore(false); setBuildStep(1); }} className="w-full py-2 bg-amber-950/30 border border-amber-800/20 text-amber-300/60 rounded-lg text-xs cursor-default">Cancel</button>
                </>
              )}

              {buildStep === 2 && (
                <>
                  {/* Summary of selections from step 1 */}
                  <div className="bg-amber-950/30 border border-amber-800/15 rounded-lg p-2.5 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-amber-400/60">Location:</span>{" "}
                      <span className="text-amber-100 font-semibold">{selectedCity?.label} - {selectedLoc?.label}</span>
                    </div>
                    <button type="button" onClick={() => setBuildStep(1)} className="text-[10px] text-amber-400/50 underline cursor-default">Change</button>
                  </div>

                  {/* Equipment Level — starts at level 2 */}
                  <div className="text-amber-400/80 text-xs font-semibold uppercase tracking-wider">Equipment</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[2, 3, 4, 5].map((lvl) => {
                      let lvlCost = 0;
                      for (let i = 2; i <= lvl; i++) lvlCost += data.equipmentCosts[i] ?? 0;
                      return (
                        <button key={lvl} type="button" onClick={() => setNewEquip(lvl)}
                          className={`px-2 py-2.5 rounded-lg text-center cursor-default ${newEquip === lvl ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
                          <div className="text-xs font-bold">{equipLabels[lvl]}</div>
                          <div className="text-[8px] text-amber-400/50 mt-0.5">${(lvlCost / 1000).toFixed(0)}k</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Decor Level — starts at level 2 */}
                  <div className="text-amber-400/80 text-xs font-semibold uppercase tracking-wider">Interior</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[2, 3, 4, 5].map((lvl) => {
                      let lvlCost = 0;
                      for (let i = 2; i <= lvl; i++) lvlCost += data.decorCosts[i] ?? 0;
                      return (
                        <button key={lvl} type="button" onClick={() => setNewDecor(lvl)}
                          className={`px-2 py-2.5 rounded-lg text-center cursor-default ${newDecor === lvl ? "bg-sky-600/30 border border-sky-500/50 text-sky-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
                          <div className="text-xs font-bold">{decorLabels[lvl]}</div>
                          <div className="text-[8px] text-sky-400/50 mt-0.5">${(lvlCost / 1000).toFixed(0)}k</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Cost Summary */}
                  <div className="bg-amber-950/30 border border-amber-800/15 rounded-lg p-3">
                    <div className="text-amber-400/70 text-[10px] uppercase tracking-wider mb-2 font-semibold">Cost Summary</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-amber-400/40">Base Construction</span><span className="text-amber-200/70">${baseCost.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-amber-400/40">Equipment ({equipLabels[newEquip]})</span><span className="text-amber-200/70">${equipCost.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-amber-400/40">Interior ({decorLabels[newDecor]})</span><span className="text-amber-200/70">${decorCost.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-amber-400/40">Security Deposit</span><span className="text-amber-200/70">${securityDeposit.toLocaleString()}</span></div>
                      {expansionCost > 0 && <div className="flex justify-between"><span className="text-amber-400/40">City Expansion</span><span className="text-amber-200/70">${expansionCost.toLocaleString()}</span></div>}
                      <div className="flex justify-between border-t border-amber-800/15 pt-1.5 mt-1.5">
                        <span className="text-amber-400/80 font-bold">Total Cost</span>
                        <span className="text-amber-100 font-bold text-base">${totalBuildCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Build Button */}
                  <button type="button"
                    onClick={() => { performAction({ action: "open_store", stringValue: `${newLoc}:${newCity}:${newEquip}:${newDecor}` }); setShowNewStore(false); setBuildStep(1); }}
                    disabled={data.company.cash < totalBuildCost}
                    className="w-full py-3 bg-emerald-600 text-emerald-50 font-bold rounded-lg disabled:opacity-40 text-sm cursor-default">
                    Start Construction — ${totalBuildCost.toLocaleString()}
                  </button>
                  <div className="text-center text-[10px] text-amber-500/40">Available Cash: ${data.company.cash.toLocaleString()}</div>
                  <button type="button" onClick={() => setBuildStep(1)} className="w-full py-2 bg-amber-950/30 border border-amber-800/20 text-amber-300/60 rounded-lg text-xs cursor-default">Back</button>
                </>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => { setShowNewStore(true); setBuildStep(1); setNewEquip(2); setNewDecor(2); if (data.availableLocations[0]) setNewLoc(data.availableLocations[0]); }} className="w-full flex items-center justify-center gap-2 py-2 text-amber-400/60 text-sm cursor-default"><Plus className="w-4 h-4" />Build New Store</button>
          )}
        </div>
      )}
      {!canOpenStore && <div className="text-amber-500/30 text-xs text-center py-4">Reach Growth phase to open more stores</div>}
    </div>
  );
}
