import { Card, CardContent } from "@/components/ui/card";
import { useInView } from "../../hooks/useInView";

const FEATURES = [
  {
    icon: "📷",
    title: "Facial Analysis",
    desc: "Analyze facial characteristics, shape, dark circles, and puffiness automatically using computer vision simulation.",
    accent: "primary",
  },
  {
    icon: "📋",
    title: "Smart Questions",
    desc: "Structured, paginated questionnaire covering lifestyle, sleep, digestion, and physical traits.",
    accent: "accent",
  },
  {
    icon: "🧬",
    title: "Dosha Analysis",
    desc: "Complete Vata, Pitta, and Kapha constitution profile derived from a hybrid neural network classifier.",
    accent: "chart-3",
  },
  {
    icon: "📊",
    title: "Visual Results",
    desc: "Understand your profile easily with animated percentage breakdown bars and confidence metrics.",
    accent: "primary",
  },
  {
    icon: "🌿",
    title: "Personalized Guidance",
    desc: "Tailored lifestyle, nutrition, herbs, and daily rhythm guidance customized for your dominant dosha.",
    accent: "accent",
  },
  {
    icon: "🔐",
    title: "Privacy First",
    desc: "Runs 100% in your browser. Responsible data handling — no external ML servers or cloud uploads required.",
    accent: "chart-3",
  },
];

export function Features() {
  const { ref, inView } = useInView();

  return (
    <section
      id="features"
      className="py-20 md:py-28 px-6 md:px-12 bg-background border-b border-border/30"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-3">
            <span className="w-4 h-0.5 bg-accent rounded-full" />
            WHAT PRAKRITIAI OFFERS
            <span className="w-4 h-0.5 bg-accent rounded-full" />
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight">
            Comprehensive Prakriti Analysis Features
          </h2>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feat, i) => (
            <Card
              key={feat.title}
              data-ocid={`feature-card-${i}`}
              className={`border-border/40 hover:border-primary/50 transition-all hover:-translate-y-1 bg-card ${
                inView ? "animate-scaleIn" : "opacity-0"
              }`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${
                    feat.accent === "primary"
                      ? "bg-primary/15 border border-primary/30"
                      : feat.accent === "accent"
                        ? "bg-accent/15 border border-accent/30"
                        : "bg-chart-3/15 border border-chart-3/30"
                  }`}
                >
                  {feat.icon}
                </div>
                <h3 className="font-display font-bold text-lg mb-2 text-foreground">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
