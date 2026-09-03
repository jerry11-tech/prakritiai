import { useInView } from "../../hooks/useInView";

const STEPS = [
  {
    num: "01",
    icon: "📷",
    title: "Upload Photo",
    subtitle: "Photo Capture",
    desc: "Upload a frontal photo or run simulated facial feature capture.",
    color: "from-primary/60 to-primary",
  },
  {
    num: "02",
    icon: "📋",
    title: "Answer Questions",
    subtitle: "Questionnaire",
    desc: "Answer 12 structured lifestyle questions on body frame, skin, sleep, and energy.",
    color: "from-accent/60 to-accent",
  },
  {
    num: "03",
    icon: "🧠",
    title: "Analyze AI / ML",
    subtitle: "DoshaNet Model",
    desc: "Hybrid classifier engine fuses facial observations with questionnaire data.",
    color: "from-chart-3/60 to-chart-3",
  },
  {
    num: "04",
    icon: "📊",
    title: "Result Profile",
    subtitle: "Prakriti Report",
    desc: "Receive your Vata-Pitta-Kapha breakdown with dietary and lifestyle guidance.",
    color: "from-primary/80 to-accent",
  },
];

export function HowItWorks() {
  const { ref, inView } = useInView();

  return (
    <section id="how" className="py-20 md:py-28 px-6 md:px-12 bg-muted/20 border-b border-border/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-3">
            <span className="w-4 h-0.5 bg-accent rounded-full" />
            YOUR ANALYSIS IN 4 STEPS
            <span className="w-4 h-0.5 bg-accent rounded-full" />
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight">
            How PrakritiAI Works
          </h2>
        </div>

        <div
          ref={ref}
          className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
        >
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary via-accent to-chart-3 opacity-40 rounded-full" />

          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`bg-card border border-border/40 rounded-2xl p-6 text-center relative z-10 shadow-sm ${
                inView ? "animate-fadeUp" : "opacity-0"
              }`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="text-xs font-bold text-accent mb-2 tracking-wider">
                STEP {step.num}
              </div>
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-md`}
              >
                {step.icon}
              </div>
              <h3 className="font-display font-bold text-base mb-1 text-foreground">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
