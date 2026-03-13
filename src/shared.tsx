import { useState } from "react";
import { Star, Sparkles, RotateCcw } from "lucide-react";
import type { EventData } from "./types";
import { useGame } from "./gameContext";
import dayjs from "dayjs";

// ─── Formatting Helpers ────────────────────────────────────────

export function $(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
export function $w(dollars: number) {
  return `$${dollars.toLocaleString()}`;
}
export function profitColor(v: number) {
  return v >= 0 ? "text-emerald-400" : "text-red-400";
}

export function weekToDate(startDate: string, week: number): string {
  if (!startDate) return `Week ${week}`;
  const d = dayjs(startDate).add((week - 1) * 7, "day");
  return d.format("MMM D, YYYY");
}

export const BRAND_LOGOS: Record<string, string> = {
  coffee: "Coffee", bean: "Bean", cup: "Cup", leaf: "Leaf",
  star: "Star", crown: "Crown", mountain: "Mountain", sun: "Sun",
};

export function brandLogoEmoji(key: string): string {
  const map: Record<string, string> = {
    coffee: "\u2615", bean: "\u{1FAD8}", cup: "\u{1F964}", leaf: "\u{1F33F}",
    star: "\u2B50", crown: "\u{1F451}", mountain: "\u26F0\uFE0F", sun: "\u2600\uFE0F",
  };
  return map[key] ?? "\u2615";
}

// ─── Shared Components ──────────────────────────────────────────

export function MetricCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-amber-950/20 border border-amber-800/20 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-amber-400/60 text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

export function EventItem({ event, startDate }: { event: EventData; startDate?: string }) {
  const colors: Record<string, string> = {
    milestone: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    weekly: "text-amber-200/80 bg-amber-950/30 border-amber-800/15",
    event: "text-sky-300/80 bg-sky-900/20 border-sky-700/20",
  };
  return (
    <div className={`px-3 py-2.5 rounded-lg border ${colors[event.type] || colors.weekly}`}>
      <div className="flex items-center gap-2 mb-0.5">
        {event.type === "milestone" && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
        {event.type === "event" && <Star className="w-3.5 h-3.5 text-sky-400" />}
        <span className="font-semibold text-sm">{event.title}</span>
        <span className="text-xs opacity-40 ml-auto shrink-0">{startDate ? weekToDate(startDate, event.week) : `Wk ${event.week}`}</span>
      </div>
      <p className="text-xs opacity-60 leading-relaxed">{event.description}</p>
    </div>
  );
}

export function SectionCard({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-amber-950/20 border border-amber-800/20 rounded-xl p-4">
      <div className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}{title}
      </div>
      {children}
    </div>
  );
}

export function RatingBar({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-amber-400/60 text-xs w-20">{label}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-amber-800/30"}`} />
        ))}
      </div>
      <span className="text-amber-200/60 text-xs w-6 text-right">{rating.toFixed(1)}</span>
    </div>
  );
}

export function StarRating({ stars, max = 5 }: { stars: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? "text-amber-400 fill-amber-400" : "text-amber-800/30"}`} />
      ))}
    </div>
  );
}

export function ResetButton() {
  const { resetGame } = useGame();
  const [confirm, setConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (confirm) {
    return (
      <div className="flex gap-2">
        <button type="button" onClick={() => { setResetting(true); resetGame(); }} disabled={resetting}
          className="flex-1 py-2 bg-red-900/30 border border-red-800/30 text-red-400 rounded-lg text-xs cursor-default">
          {resetting ? "Resetting..." : "Yes, Reset"}
        </button>
        <button type="button" onClick={() => setConfirm(false)} className="flex-1 py-2 bg-amber-950/30 border border-amber-800/20 text-amber-300/60 rounded-lg text-xs cursor-default">Cancel</button>
      </div>
    );
  }
  return (
    <button type="button" onClick={() => setConfirm(true)} className="w-full py-2 text-amber-600/40 text-xs cursor-default flex items-center justify-center gap-1">
      <RotateCcw className="w-3.5 h-3.5" />Reset Game
    </button>
  );
}
