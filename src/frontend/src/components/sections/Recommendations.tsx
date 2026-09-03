import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { RECOMMENDATIONS } from "../../data/recommendations";
import { useInView } from "../../hooks/useInView";
import type { PrimaryDosha, PrakrutiType } from "../../types/prakruti";

const DOSHAS_CONFIG: Record<PrimaryDosha, { color: string; badge: string }> = {
  Vata: {
    color: "text-primary",
    badge: "border-primary/50 text-primary bg-primary/10",
  },
  Pitta: {
    color: "text-accent",
    badge: "border-accent/50 text-accent bg-accent/10",
  },
  Kapha: {
    color: "text-chart-3",
    badge: "border-chart-3/50 text-chart-3 bg-chart-3/10",
  },
};

const DOSHAS: PrimaryDosha[] = ["Vata", "Pitta", "Kapha"];

export function RecommendationsSection() {
  const { ref, inView } = useInView();
  const [active, setActive] = useState<PrimaryDosha>("Vata");
  const rec = RECOMMENDATIONS[active];

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 bg-muted/20 border-b border-border/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-3">
            <span className="w-4 h-0.5 bg-accent rounded-full" />
            GUIDANCE FOR YOUR PROFILE
            <span className="w-4 h-0.5 bg-accent rounded-full" />
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight">
            Personalized Ayurvedic Guidance
          </h2>
        </div>

        <div ref={ref} className={inView ? "animate-fadeUp" : "opacity-0"}>
          {/* Dosha tabs */}
          <div className="flex gap-3 justify-center mb-8" role="tablist">
            {DOSHAS.map((d) => (
              <button
                type="button"
                key={d}
                role="tab"
                aria-selected={active === d}
                data-ocid={`dosha-tab-${d.toLowerCase()}`}
                onClick={() => setActive(d)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold border transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active === d
                    ? `${DOSHAS_CONFIG[d].badge} border-current shadow-md`
                    : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Overview */}
            <Card className="bg-card border-border/40 col-span-1 md:col-span-2 lg:col-span-1">
              <CardContent className="p-5">
                <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3">
                  Overview
                </div>
                <div
                  className={`font-display font-black text-xl mb-1 ${DOSHAS_CONFIG[active].color}`}
                >
                  {rec.tagline}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {rec.description}
                </p>
                <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">
                  Common Issues
                </div>
                {rec.problems.map((p) => (
                  <div key={p} className="flex items-start gap-2 mb-1.5">
                    <span className="text-destructive text-xs mt-0.5">⚡</span>
                    <span className="text-xs text-foreground/70">{p}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Diet */}
            <Card className="bg-card border-border/40">
              <CardContent className="p-5">
                <div className="text-xs font-bold tracking-widest uppercase text-accent mb-3">
                  🍃 Diet Plan
                </div>
                {rec.diet.map((item) => (
                  <div key={item} className="flex items-start gap-2 mb-2">
                    <span className="text-accent text-xs mt-0.5">✓</span>
                    <span className="text-xs text-foreground/75 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Lifestyle */}
            <Card className="bg-card border-border/40">
              <CardContent className="p-5">
                <div className="text-xs font-bold tracking-widest uppercase text-primary mb-3">
                  🧘 Lifestyle
                </div>
                {rec.lifestyle.map((item) => (
                  <div key={item} className="flex items-start gap-2 mb-2">
                    <span className="text-primary text-xs mt-0.5">✓</span>
                    <span className="text-xs text-foreground/75 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Herbs + Avoid */}
            <Card className="bg-card border-border/40">
              <CardContent className="p-5">
                <div className="text-xs font-bold tracking-widest uppercase text-chart-3 mb-3">
                  🌱 Herbs
                </div>
                {rec.herbs.map((h) => (
                  <div key={h} className="flex items-start gap-2 mb-2">
                    <span className="text-chart-3 text-xs mt-0.5">◆</span>
                    <span className="text-xs text-foreground/75 leading-snug">
                      {h}
                    </span>
                  </div>
                ))}
                <div className="text-xs font-bold tracking-widest uppercase text-destructive mt-4 mb-2">
                  ⚠ Avoid
                </div>
                {rec.avoid.map((a) => (
                  <div key={a} className="flex items-start gap-2 mb-2">
                    <span className="text-destructive text-xs mt-0.5">✗</span>
                    <span className="text-xs text-foreground/70 leading-snug">
                      {a}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
