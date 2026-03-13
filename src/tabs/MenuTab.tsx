import { useState } from "react";
import { ChevronRight, ChefHat } from "lucide-react";
import { useGame } from "../gameContext";
import type { GameData } from "../types";
import { SectionCard, $ } from "../shared";

export function MenuTab({ data }: { data: GameData }) {
  const { performAction } = useGame();
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState("");
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
            <button key={bt.tier} type="button" onClick={() => performAction({ action: "set_bean_tier", value: bt.tier })} disabled={false}
              className={`px-3 py-2.5 rounded-lg text-center cursor-default ${data.company.beanTier === bt.tier ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
              <div className="font-semibold text-xs">{bt.label}</div>
              <div className="text-[10px] opacity-60">${bt.costPerStore}/store/wk</div>
            </button>
          ))}
        </div>
      </SectionCard>

      {categories.map((cat) => {
        const items = data.menu.filter((m) => m.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <div className="text-amber-400/60 text-xs font-semibold uppercase tracking-wider mb-2">{categoryLabels[cat] || cat}</div>
            <div className="space-y-1.5">
              {items.map((item) => (
                <div key={item.id} className={`flex items-center gap-3 px-3 py-2.5 bg-amber-950/20 border border-amber-800/15 rounded-lg ${!item.enabled ? "opacity-40" : ""}`}>
                  <button type="button" onClick={() => performAction({ action: "toggle_item", itemId: item.id })} disabled={false}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-default ${item.enabled ? "bg-amber-500 border-amber-500" : "border-amber-700/50"}`}>
                    {item.enabled && <span className="text-[10px] text-amber-950 font-bold">&#10003;</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-amber-200/80 text-xs font-semibold">{item.name}</div>
                    <div className="text-amber-500/40 text-[10px]">Cost: {$(item.cost)}</div>
                  </div>
                  {editingPrice === item.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400/60 text-xs">$</span>
                      <input type="text" value={priceInput} onChange={(e) => setPriceInput(e.target.value)}
                        className="w-14 px-2 py-1 bg-amber-950/60 border border-amber-500/50 rounded text-amber-100 text-xs text-right" autoFocus />
                      <button type="button" onClick={() => {
                        const cents = Math.round(parseFloat(priceInput) * 100);
                        if (cents >= 100 && cents <= 1500) performAction({ action: "set_price", itemId: item.id, value: cents });
                        setEditingPrice(null);
                      }} className="text-amber-400 text-xs px-1 cursor-default">OK</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setEditingPrice(item.id); setPriceInput((item.price / 100).toFixed(2)); }}
                      className="text-amber-100 text-sm font-bold cursor-default">
                      {$(item.price)} <ChevronRight className="w-3 h-3 inline opacity-40" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {showAddItem ? (
        <div className="bg-amber-950/20 border border-amber-800/20 rounded-xl p-4 space-y-3">
          <div className="text-amber-400/80 text-xs font-semibold uppercase tracking-wider">New Menu Item (R&D: $3,000)</div>
          <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item name"
            className="w-full px-3 py-2 bg-amber-950/40 border border-amber-800/30 rounded-lg text-amber-100 placeholder:text-amber-700/50 text-sm" />
          <div className="grid grid-cols-4 gap-1.5">
            {[{ v: 1, l: "Espresso" }, { v: 2, l: "Cold" }, { v: 3, l: "Specialty" }, { v: 4, l: "Food" }].map((c) => (
              <button key={c.v} type="button" onClick={() => setNewItemCategory(c.v)}
                className={`px-2 py-1.5 rounded text-[10px] cursor-default ${newItemCategory === c.v ? "bg-amber-600/30 border border-amber-500/50 text-amber-100" : "bg-amber-950/30 border border-amber-800/20 text-amber-300/60"}`}>
                {c.l}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { performAction({ action: "add_menu_item", stringValue: newItemName, value: newItemCategory }); setShowAddItem(false); setNewItemName(""); }}
              disabled={!newItemName.trim() || data.company.cash < 3000}
              className="flex-1 py-2 bg-amber-600 text-amber-50 font-bold rounded-lg disabled:opacity-40 text-xs cursor-default">Add Item</button>
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
