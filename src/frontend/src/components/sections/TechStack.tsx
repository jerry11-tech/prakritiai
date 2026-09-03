import { Card, CardContent } from "@/components/ui/card";
import { useInView } from "../../hooks/useInView";

const PIPELINE_STEPS = [
  "Computer Vision",
  "Feature Extraction",
  "Machine Learning",
  "Dosha Classification",
  "Prakriti Profile",
  "Personalized Results",
];

const TECH_BADGES = [
  { name: "React 19", role: "Frontend UI" },
  { name: "TypeScript", role: "Type Safety" },
  { name: "Tailwind CSS", role: "Design System" },
  { name: "Vite", role: "Bundler & Server" },
  { name: "DoshaNet MLP", role: "Pure TS ML Model" },
  { name: "Radix UI", role: "Primitives" },
  { name: "Motion", role: "Animations" },
  { name: "Zustand", role: "State Management" },
];

export function TechStack() {
  const { ref, inView } = useInView();

  return (
    <section id="tech" className="py-20 md:py-28 px-6 md:px-12 bg-background border-b border-border/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-3">
            <span className="w-4 h-0.5 bg-accent rounded-full" />
            SCIENCE × SOFTWARE
            <span className="w-4 h-0.5 bg-accent rounded-full" />
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight">
            How The Intelligence Pipeline Operates
          </h2>
        </div>

        {/* Pipeline Diagram */}
        <div ref={ref} className="bg-card border border-border/40 rounded-2xl p-8 mb-12 text-center max-w-2xl mx-auto shadow-sm">
          <div className="space-y-2">
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={step} className="flex flex-col items-center">
                <div className="bg-primary/10 border border-primary/30 text-primary font-bold text-xs sm:text-sm px-5 py-2 rounded-xl w-64 shadow-xs">
                  {step}
                </div>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div className="text-accent text-sm my-1">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tech Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TECH_BADGES.map((t, i) => (
            <Card
              key={t.name}
              className={`text-center border-border/40 hover:border-primary/50 transition-all cursor-default bg-card ${
                inView ? "animate-scaleIn" : "opacity-0"
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <CardContent className="p-4">
                <div className="font-display font-bold text-sm text-foreground mb-1">
                  {t.name}
                </div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
