import { useInView } from "../../hooks/useInView";

export function About() {
  const { ref, inView } = useInView();

  return (
    <section id="about" className="py-20 md:py-28 px-6 md:px-12 bg-muted/20 border-b border-border/30">
      <div ref={ref} className="max-w-5xl mx-auto text-center">
        {/* Subtitle / Badge */}
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-3">
          <span className="w-4 h-0.5 bg-accent rounded-full" />
          ANCIENT × MODERN
          <span className="w-4 h-0.5 bg-accent rounded-full" />
        </div>

        <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight mb-4">
          Ancient Wisdom. Modern Intelligence.
        </h2>

        <p className="text-muted-foreground max-w-2xl mx-auto text-base mb-12 leading-relaxed">
          Traditional Ayurvedic constitution concepts meet state-of-the-art computer vision and machine learning technology.
        </p>

        {/* 2-Card Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
          {/* Ayurveda Card */}
          <div className="md:col-span-5 bg-card border border-accent/30 rounded-2xl p-7 text-left shadow-md hover:shadow-lg transition-all">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center text-xl font-bold mb-4">
              🌿
            </div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              AYURVEDA
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              5,000-year-old constitutional science of body humor balance.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-foreground font-semibold">
                <span className="w-2 h-2 rounded-full bg-accent" /> Vata (Air & Space)
              </li>
              <li className="flex items-center gap-2 text-foreground font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary" /> Pitta (Fire & Water)
              </li>
              <li className="flex items-center gap-2 text-foreground font-semibold">
                <span className="w-2 h-2 rounded-full bg-chart-3" /> Kapha (Earth & Water)
              </li>
            </ul>
          </div>

          {/* Multiplication Symbol */}
          <div className="md:col-span-1 text-2xl font-bold text-accent">
            ×
          </div>

          {/* Technology Card */}
          <div className="md:col-span-5 bg-card border border-primary/30 rounded-2xl p-7 text-left shadow-md hover:shadow-lg transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center text-xl font-bold mb-4">
              🧠
            </div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              TECHNOLOGY
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Pure client-side machine learning neural network classification engine.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-foreground font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary" /> Computer Vision
              </li>
              <li className="flex items-center gap-2 text-foreground font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary" /> Machine Learning (DoshaNet)
              </li>
              <li className="flex items-center gap-2 text-foreground font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary" /> Hybrid Data Analysis
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-xs text-muted-foreground italic">
          Traditional concepts meet modern technology to deliver instant, personalized insights.
        </div>
      </div>
    </section>
  );
}
