import { Badge } from "@/components/ui/badge";
import { useInView } from "../../hooks/useInView";

const PILLS = [
  "Face Shape",
  "Dark Circles",
  "Puffy Face",
  "Skin Texture",
  "Vata Dosha",
  "Pitta Dosha",
  "Kapha Dosha",
  "Diet Plan",
  "Lifestyle",
  "Herbs",
];

export function About() {
  const { ref, inView } = useInView();

  return (
    <section id="about" className="py-20 md:py-24 px-6 md:px-12 bg-muted/20">
      <div
        ref={ref}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center"
      >
        {/* Left: text */}
        <div className={inView ? "animate-fadeUp" : "opacity-0"}>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-4">
            <span className="w-4 h-0.5 bg-accent rounded-full" />
            About the Project
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight mb-5">
            Where Ancient Wisdom
            <br />
            Meets Modern AI
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            This system bridges 5,000 years of Ayurvedic science with
            state-of-the-art computer vision and machine learning. By analyzing
            your facial structure and lifestyle patterns, it classifies your
            unique Prakriti with clinical precision.
          </p>
          <div className="border-l-2 border-primary/50 bg-primary/6 rounded-r-xl pl-4 py-3 text-sm text-primary/80 italic leading-relaxed">
            A hybrid approach combining CV-based facial analysis + questionnaire
            analysis for superior accuracy that neither method achieves alone.
          </div>
        </div>

        {/* Right: visual card */}
        <div
          className={`${inView ? "animate-scaleIn" : "opacity-0"} bg-card border border-border/50 rounded-2xl p-8 text-center`}
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 flex items-center justify-center text-4xl animate-float">
              🧬
            </div>
            <div
              className="absolute inset-[-8px] rounded-full border border-dashed border-primary/20"
              style={{ animation: "spin 12s linear infinite" }}
            />
          </div>
          <div className="font-display font-bold text-foreground mb-1">
            Constitutional Analysis
          </div>
          <div className="text-sm text-muted-foreground mb-6">
            Holistic · Intelligent · Personalized
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {PILLS.map((tag, i) => (
              <Badge
                key={tag}
                variant="outline"
                className={`text-xs ${
                  i % 3 === 0
                    ? "border-primary/40 text-primary"
                    : i % 3 === 1
                      ? "border-accent/40 text-accent"
                      : "border-chart-3/40 text-chart-3"
                }`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
