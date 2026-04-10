import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

const STATS = [
  ["95%", "Prakriti Accuracy"],
  ["3", "Doshas Analyzed"],
  ["Hybrid", "CV + ML Fusion"],
  ["50+", "Health Insights"],
] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 px-6 md:px-12 text-center bg-background">
      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div
          className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-accent/[0.08] blur-3xl"
          style={{ animation: "float 9s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-chart-3/[0.06] blur-3xl"
          style={{ animation: "float 7s ease-in-out infinite 1s" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI-Powered Ayurvedic Intelligence
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-5"
        >
          Know Your Face.
          <br />
          <span className="gradient-hero">Know Your Prakriti.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Intelligent facial analysis fused with lifestyle insights to reveal
          your Ayurvedic constitution and personalized wellness path — in
          seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex gap-3 justify-center flex-wrap mb-16"
        >
          <Button
            data-ocid="hero-cta-demo"
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg hover:shadow-primary/25 transition-smooth"
            onClick={() => scrollTo("demo")}
          >
            Analyze My Prakriti →
          </Button>
          <Button
            data-ocid="hero-cta-how"
            size="lg"
            variant="outline"
            className="border-accent/50 text-accent hover:bg-accent/10 font-bold px-8"
            onClick={() => scrollTo("how")}
          >
            See How It Works
          </Button>
        </motion.div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl max-w-2xl mx-auto"
        >
          <img
            src="/assets/generated/hero-prakriti.dim_1200x600.jpg"
            alt="PrakritiAI — Ayurvedic intelligence visualization"
            className="w-full h-auto object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          {/* Stats overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-around">
            {STATS.map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="font-display font-black text-xl gradient-hero">
                  {num}
                </div>
                <div className="text-xs text-foreground/60 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-10 text-xs text-muted-foreground/40 tracking-widest uppercase">
        Scroll to explore
      </div>
      <div
        className="text-primary/40 text-xl mt-1"
        style={{ animation: "float 2s ease-in-out infinite" }}
      >
        ⌄
      </div>
    </section>
  );
}
