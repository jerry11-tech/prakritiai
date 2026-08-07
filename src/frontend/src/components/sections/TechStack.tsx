import { Card, CardContent } from "@/components/ui/card";
import { useInView } from "../../hooks/useInView";

const TECH = [
  { icon: "⚛️", name: "React 18 + TS", role: "Frontend Interface" },
  { icon: "⚡", name: "Vite", role: "Build & Dev Server" },
  { icon: "🎨", name: "Tailwind CSS", role: "Design System" },
  { icon: "🧩", name: "Radix UI", role: "Accessible Components" },
  { icon: "🌀", name: "Motion", role: "Smooth Animations" },
  { icon: "📦", name: "TanStack Query", role: "Server State" },
  { icon: "🧬", name: "Dosha Algorithm", role: "Prakriti Scoring Engine" },
  {
    icon: "🔗",
    name: "Hybrid Pipeline",
    role: "CV + ML Fusion",
    featured: true,
  },
];

export function TechStack() {
  const { ref, inView } = useInView();

  return (
    <section id="tech" className="py-20 md:py-24 px-6 md:px-12 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-4">
            <span className="w-4 h-0.5 bg-accent rounded-full" />
            Technology Stack
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight">
            Built With Precision
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TECH.map((t, i) => (
            <Card
              key={t.name}
              className={`text-center border-border/40 hover:border-primary/50 transition-smooth hover:-translate-y-1 cursor-default ${t.featured ? "border-accent/40 bg-accent/5" : "bg-card"} ${inView ? "animate-scaleIn" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <CardContent className="p-5">
                <div className="text-3xl mb-3">{t.icon}</div>
                <div className="font-display font-bold text-sm mb-1">
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
