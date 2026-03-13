import { useState } from "react";
import { ChefHat, Minus, Plus } from "lucide-react";
import { useGame } from "../gameContext";
import type { GameData, MenuItemData } from "../types";
import { SectionCard, $ } from "../shared";

// Max margin cap at 94%
const MAX_MARGIN = 0.94;

function MarginRing({ margin }: { margin: number }) {
  const pct = Math.min(margin * 100, 100);
  const color = pct >= 70 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-red-400";
  const strokeColor = pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#f87171";
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={radius} fill="none" stroke="#44403c" strokeWidth="4" opacity="0.3" />
        <circle cx="26" cy="26" r={radius} fill="none" stroke={strokeColor} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xs font-bold ${color}`}>{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

function MenuItemCard({ item, performAction }: { item: MenuItemData; performAction: (params: { action: string; itemId?: number; value?: number; stringValue?: string }) => void }) {
  const priceDollars = item.price / 100;
  const costDollars = item.cost / 100;
  const rawMargin = costDollars > 0 ? (priceDollars - costDollars) / priceDollars : 0;
  const margin = Math.min(rawMargin, MAX_MARGIN);

  // Calculate max price based on 94% margin cap: price = cost / (1 - 0.94)
  // Round down to nearest 25-cent step so slider can reach full right
  const maxPriceCents = Math.ceil((costDollars / (1 - MAX_MARGIN)) * 100 / 25) * 25;
  const maxPrice = maxPriceCents / 100;
  const minPrice = 1.00; // $1.00 minimum

  const adjustPrice = (delta: number) => {
    const newPrice = Math.round((priceDollars + delta) * 100);
    const maxCents = Math.round(maxPrice * 100);
    const minCents = Math.round(minPrice * 100);
    if (newPrice >= minCents && newPrice <= maxCents) {
      performAction({ action: "set_price", itemId: item.id, value: newPrice });
    }
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCents = parseInt(e.target.value);
    performAction({ action: "set_price", itemId: item.id, value: newCents });
  };

  return (
    <div className={`bg-amber-950/20 border border-amber-800/15 rounded-xl p-3 space-y-3 ${!item.enabled ? "opacity-40" : ""}`}>
      {/* Top row: name, toggle, cost */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => performAction({ action: "toggle_item", itemId: item.id })}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 cursor-default ${item.enabled ? "bg-amber-500 border-amber-500" : "border-amber-700/50"}`}>
          {item.enabled && <span className="text-xs text-amber-950 font-bold">&#10003;</span>}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-amber-200 text-sm font-bold">{item.name}</div>
          <div className="text-amber-500/50 text-xs">Unit cost {$(item.cost)}</div>
        </div>
      </div>

      {/* Margin ring + price controls */}
      <div className="flex items-center gap-3">
        <MarginRing margin={margin} />
        <div className="flex-1 space-y-2">
          {/* +/- buttons with price display */}
          <div className="flex items-center justify-center gap-1">
            <button type="button" onClick={() => adjustPrice(-0.25)}
              disabled={priceDollars <= minPrice}
              className="w-9 h-9 flex items-center justify-center bg-amber-950/40 border border-amber-800/30 rounded-lg text-amber-400 disabled:opacity-30 cursor-default">
              <Minus className="w-4 h-4" />
            </button>
            <div className="px-4 py-1.5 bg-amber-950/40 border border-amber-800/30 rounded-lg min-w-[80px] text-center">
              <span className="text-amber-100 text-base font-bold">{$(item.price)}</span>
            </div>
            <button type="button" onClick={() => adjustPrice(0.25)}
              disabled={priceDollars >= maxPrice}
              className="w-9 h-9 flex items-center justify-center bg-amber-950/40 border border-amber-800/30 rounded-lg text-amber-400 disabled:opacity-30 cursor-default">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Slider */}
          <input type="range"
            min={Math.round(minPrice * 100)}
            max={maxPriceCents}
            step={25}
            value={Math.min(item.price, maxPriceCents)}
            onChange={handleSlider}
            className="w-full h-1.5 appearance-none bg-amber-800/30 rounded-full accent-amber-500 cursor-default"
          />
          <div className="flex justify-between text-[10px] text-amber-500/40">
            <span>${minPrice.toFixed(2)}</span>
            <span>${maxPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MenuTab({ data }: { data: GameData }) {
  const { performAction } = useGame();
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState(1);

  const categories = ["espresso", "cold", "specialty", "food"];
  const categoryLabels: Record<string, string> = { espresso: "Espresso", cold: "Cold Drinks", specialty: "Specialty", food: "Food" };

  return (
    <div className="space-y-5">
      <SectionCard title="Bean Sourcing">
        <div className="grid grid-cols-3 gap-2">
          {data.beanTiers.map((bt) => (
            <button key={bt.tier} type="button" onClick={() => performAction({ action: "set_bean_tier", value: bt.tier })}
              className={`px-3 py-2.5 rounded-lg text-center cursor-default ${data.company.beanTier === bt.tier ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
              <div className="font-semibold text-xs">{bt.label}</div>
              <div className="text-xs opacity-60">${bt.costPerStore}/store/wk</div>
            </button>
          ))}
        </div>
      </SectionCard>

      {categories.map((cat) => {
        const items = data.menu.filter((m) => m.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <div className="text-amber-400/60 text-sm font-semibold uppercase tracking-wider mb-2">{categoryLabels[cat] || cat}</div>
            <div className="space-y-2">
              {items.map((item) => (
                <MenuItemCard key={item.id} item={item} performAction={performAction} />
              ))}
            </div>
          </div>
        );
      })}

      {showAddItem ? (
        <div className="bg-amber-950/20 border border-amber-800/20 rounded-xl p-4 space-y-3">
          <div className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider">New Menu Item (R&D: $3,000)</div>
          <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item name"
            className="w-full px-3 py-2 bg-amber-950/40 border border-amber-800/30 rounded-lg text-amber-100 placeholder:text-amber-700/50 text-sm" />
          <div className="grid grid-cols-4 gap-1.5">
            {[{ v: 1, l: "Espresso" }, { v: 2, l: "Cold" }, { v: 3, l: "Specialty" }, { v: 4, l: "Food" }].map((c) => (
              <button key={c.v} type="button" onClick={() => setNewItemCategory(c.v)}
                className={`px-2 py-1.5 rounded text-xs cursor-default ${newItemCategory === c.v ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
                {c.l}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { performAction({ action: "add_menu_item", stringValue: newItemName, value: newItemCategory }); setShowAddItem(false); setNewItemName(""); }}
              disabled={!newItemName.trim() || data.company.cash < 3000}
              className="flex-1 py-2 bg-amber-600 text-amber-50 font-bold rounded-lg disabled:opacity-40 text-sm cursor-default">Add Item</button>
            <button type="button" onClick={() => setShowAddItem(false)} className="px-4 py-2 bg-amber-950/30 border border-amber-800/20 text-amber-300/60 rounded-lg text-xs cursor-default">Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowAddItem(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-amber-950/20 border border-amber-800/20 border-dashed rounded-xl text-amber-400/60 text-sm cursor-default">
          <ChefHat className="w-4 h-4" />Develop New Item ($3,000 R&D)
        </button>
      )}
    </div>
  );
}