import { useState } from "react";
import { Star, Cpu, Package, Truck } from "lucide-react";
import { useGame } from "../gameContext";
import type { GameData, TechProjectData } from "../types";
import { SectionCard, StarRating, $w } from "../shared";

function TechCard({
  icon: Icon, title, description, cost, stars, isActive, isLocked, lockReason,
  inProgress, onStart, data,
}: {
  icon: React.ElementType; title: string; description: string; cost: number;
  stars: number; isActive: boolean; isLocked: boolean; lockReason?: string;
  inProgress: TechProjectData | undefined; onStart: (tier: string) => void; data: GameData;
}) {
  const [showTiers, setShowTiers] = useState(false);
  const tiers = [
    { key: "fast", label: "Fast", weeks: 5, stars: 3, desc: "Quick but lower quality" },
    { key: "great", label: "Great", weeks: 15, stars: 4, desc: "Balanced time and quality" },
    { key: "amazing", label: "Amazing", weeks: 20, stars: 5, desc: "Premium quality, takes time" },
  ];

  return (
    <div className={`p-3 rounded-lg border mb-3 ${isActive ? "bg-emerald-900/20 border-emerald-700/30" : isLocked ? "bg-amber-950/30 border-amber-800/10 opacity-50" : "bg-amber-950/30 border-amber-800/20"}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-amber-400" />
        <span className="text-amber-100 text-sm font-bold">{title}</span>
        {isActive && <div className="ml-auto"><StarRating stars={stars} /></div>}
      </div>
      <p className="text-amber-200/50 text-xs mb-2">{description}</p>

      {inProgress && (
        <div className="mb-2">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-amber-400/60">In Development ({inProgress.speedTier})</span>
            <span className="text-amber-400/60">{inProgress.weeksRemaining} weeks left</span>
          </div>
          <div className="h-2 bg-amber-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${((inProgress.weeksTotal - inProgress.weeksRemaining) / inProgress.weeksTotal) * 100}%` }} />
          </div>
          <div className="text-[10px] text-amber-400/40 mt-1">Will complete at {inProgress.maxStars} stars</div>
        </div>
      )}

      {isActive && stars > 0 && (
        <div className="mb-2">
          <div className="text-[10px] text-amber-400/50">Rating degrades over time. Rebuild to restore quality.</div>
        </div>
      )}

      {!inProgress && !isLocked && (
        showTiers ? (
          <div className="space-y-1.5">
            <div className="text-amber-400/60 text-[10px] uppercase tracking-wider">Select Development Speed</div>
            {tiers.map((t) => (
              <button key={t.key} type="button" onClick={() => { onStart(t.key); setShowTiers(false); }}
                disabled={data.company.cash < cost}
                className="w-full flex items-center justify-between px-3 py-2 bg-amber-950/40 border border-amber-800/20 rounded-lg text-xs cursor-default disabled:opacity-30">
                <div>
                  <span className="text-amber-100 font-semibold">{t.label}</span>
                  <span className="text-amber-500/50 ml-2">{t.weeks} weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating stars={t.stars} />
                </div>
              </button>
            ))}
            <div className="text-center">
              <button type="button" onClick={() => setShowTiers(false)} className="text-amber-500/40 text-[10px] cursor-default">Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowTiers(true)} disabled={data.company.cash < cost}
            className="w-full py-2 bg-amber-600 text-amber-50 font-bold rounded-lg disabled:opacity-40 text-xs cursor-default">
            {isActive ? `Rebuild (${$w(cost)})` : `Research (${$w(cost)})`}
          </button>
        )
      )}
      {isLocked && lockReason && <p className="text-amber-500/40 text-[10px]">{lockReason}</p>}
    </div>
  );
}

export function TechTab({ data }: { data: GameData }) {
  const { investInTechRd } = useGame();
  const { company } = data;

  const pickupProject = data.techProjectsData.find((p) => p.tech === "pickup" && p.weeksRemaining > 0);
  const deliveryProject = data.techProjectsData.find((p) => p.tech === "delivery" && p.weeksRemaining > 0);

  return (
    <div className="space-y-5">
      <SectionCard title="Tech R&D" icon={Cpu}>
        <p className="text-amber-200/60 text-xs mb-4">
          Invest in technology to boost store revenue. Choose development speed — faster means lower quality stars. Stars degrade over time, so you'll need to rebuild periodically.
        </p>

        <TechCard
          icon={Package} title="Mobile Pickup" cost={25000}
          description="Customers order ahead and pick up in-store. Revenue boost scales with star rating."
          stars={company.pickupStars} isActive={company.hasPickup}
          isLocked={false} inProgress={pickupProject}
          onStart={(tier) => investInTechRd("pickup", tier)}
          data={data}
        />

        <TechCard
          icon={Truck} title="Delivery Service" cost={50000}
          description="Full delivery for all stores. Higher revenue boost. Requires Pickup first."
          stars={company.deliveryStars} isActive={company.hasDelivery}
          isLocked={!company.hasPickup && !company.hasDelivery}
          lockReason="Unlock Pickup first"
          inProgress={deliveryProject}
          onStart={(tier) => investInTechRd("delivery", tier)}
          data={data}
        />
      </SectionCard>
    </div>
  );
}
