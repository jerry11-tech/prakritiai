import { Card, CardContent } from "@/components/ui/card";
import { useInView } from "../../hooks/useInView";

const FEATURES = [
  {
    icon: "👁️",
    title: "Face Shape Detection",
    desc: "Computer vision with landmark detection classifies oval, round, square, heart, and oblong face shapes with high precision.",
    accent: "primary",
  },
  {
    icon: "🌿",
    title: "Prakriti Classification",
    desc: "Rule-based system trained on Ayurvedic parameters classifies Vata, Pitta, or Kapha dominance from your lifestyle questionnaire.",
    accent: "accent",
  },
  {
    icon: "✨",
    title: "Condition Analysis",
    desc: "Detects dark circles, facial puffiness, and skin texture variations as visible Ayurvedic health indicators.",
    accent: "chart-3",
  },
  {
    icon: "🍲",
    title: "Ayurvedic Diet Plan",
    desc: "Personalized food recommendations for your dosha — what to eat, what to avoid, and seasonal dietary guidelines.",
    accent: "primary",
  },
  {
    icon: "🧘",
    title: "Lifestyle Insights",
    desc: "Holistic routines covering sleep, exercise types, herbs, and daily rituals perfectly aligned to your constitution.",
    accent: "accent",
  },
  {
    icon: "∞",
    title: "Hybrid AI Engine",
    desc: "Unique fusion of real-time computer vision + questionnaire analysis — far more accurate than either approach used alone.",
    accent: "chart-3",
    featured: true,
  },
];

export function Features() {
  const { ref, inView } = useInView();

  return (
    <section
      id="features"
      className="py-20 md:py-24 px-6 md:px-12 bg-background"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-4">
            <span className="w-4 h-0.5 bg-accent rounded-full" />
            Core Features
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight">
            Everything You Need to
            <br />
            Understand Your Constitution
          </h2>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((feat, i) => (
            <Card
              key={feat.title}
              data-ocid={`feature-card-${i}`}
              className={`border-border/40 hover:border-primary/50 transition-smooth hover:-translate-y-1 cursor-default ${feat.featured ? "border-accent/40 bg-accent/5" : "bg-card"} ${inView ? "animate-scaleIn" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <CardContent className="p-6">
                {feat.featured && (
                  <div className="text-xs font-bold tracking-widest text-accent uppercase mb-2">
                    ✨ Signature Feature
                  </div>
                )}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5 ${
                    feat.accent === "primary"
                      ? "bg-primary/15 border border-primary/30"
                      : feat.accent === "accent"
                        ? "bg-accent/12 border border-accent/25"
                        : "bg-chart-3/12 border border-chart-3/25"
                  }`}
                >
                  {feat.icon}
                </div>
                <h3 className="font-display font-bold text-base mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
