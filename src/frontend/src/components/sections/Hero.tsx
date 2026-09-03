import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 px-6 md:px-12 bg-background border-b border-border/30">
      {/* Floating background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div
          className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-accent/[0.08] blur-3xl"
          style={{ animation: "float 9s ease-in-out infinite 2s" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column - Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              AI-Powered Prakriti Analysis
            </div>

            {/* Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight mb-5 text-foreground">
              Discover Your <br />
              <span className="gradient-hero">Ayurvedic Prakriti.</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              Understand your unique Vata, Pitta & Kapha constitution through
              intelligent facial feature analysis and lifestyle questions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 items-center mb-10">
              <Button
                data-ocid="hero-cta-demo"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-7 shadow-lg hover:shadow-primary/25 transition-all"
                onClick={() => scrollTo("demo")}
              >
                Start Free Analysis →
              </Button>
              <Button
                data-ocid="hero-cta-how"
                size="lg"
                variant="outline"
                className="border-border/60 text-foreground hover:bg-muted/40 font-bold px-7"
                onClick={() => scrollTo("demo")}
              >
                Explore Demo
              </Button>
            </div>

            {/* Highlights list */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/40 text-xs text-muted-foreground">
              <div>
                <span className="font-bold text-foreground block text-sm">85.1%</span>
                ML Accuracy
              </div>
              <div>
                <span className="font-bold text-foreground block text-sm">3 Doshas</span>
                Vata / Pitta / Kapha
              </div>
              <div>
                <span className="font-bold text-foreground block text-sm">Offline</span>
                Client-Side ML
              </div>
            </div>
          </motion.div>

          {/* Right Column - Prakriti Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="bg-card border border-primary/25 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-5">
                <span className="text-xs font-bold tracking-widest text-accent uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Prakriti Preview
                </span>
                <span className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
                  Live Classifier
                </span>
              </div>

              {/* Face Analysis Graphic Circle */}
              <div className="bg-muted/20 border border-border/40 rounded-xl p-6 text-center mb-5 relative group">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/40 flex items-center justify-center text-4xl mb-3 shadow-inner relative">
                  ◯
                  <span className="absolute -bottom-1 text-[10px] font-bold bg-background border border-primary/30 px-2 py-0.5 rounded-full text-primary">
                    FACE
                  </span>
                </div>
                <div className="text-xs font-bold text-foreground">
                  Face Analysis Complete
                </div>
                <div className="text-[11px] text-muted-foreground">
                  8 Observations Analyzed
                </div>
              </div>

              {/* Dosha Breakdown Preview */}
              <div className="space-y-3 bg-muted/10 border border-border/30 rounded-xl p-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-accent">Vata (Dominant)</span>
                    <span>45%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-accent w-[45%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-primary">Pitta</span>
                    <span>35%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary w-[35%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-chart-3">Kapha</span>
                    <span>20%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-chart-3 w-[20%]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
