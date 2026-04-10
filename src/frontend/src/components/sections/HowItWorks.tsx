import { useInView } from "../../hooks/useInView";

const STEPS = [
  {
    num: "01",
    title: "Upload or Capture",
    desc: "Upload a frontal photo or use simulated facial capture for instant analysis.",
    color: "from-primary/60 to-primary",
  },
  {
    num: "02",
    title: "Answer Questionnaire",
    desc: "Complete 12 lifestyle questions on sleep, digestion, energy, and temperament.",
    color: "from-accent/60 to-accent",
  },
  {
    num: "03",
    title: "AI Analyzes",
    desc: "Hybrid model processes facial landmarks and lifestyle data simultaneously.",
    color: "from-chart-3/60 to-chart-3",
  },
  {
    num: "04",
    title: "Receive Insights",
    desc: "Get your full Prakriti report with personalized Ayurvedic recommendations.",
    color: "from-chart-4/60 to-chart-4",
  },
];

export function HowItWorks() {
  const { ref, inView } = useInView();

  return (
    <section id="how" className="py-20 md:py-24 px-6 md:px-12 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-4">
            <span className="w-4 h-0.5 bg-accent rounded-full" />
            How It Works
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight">
            Four Steps to Your
            <br />
            Wellness Blueprint
          </h2>
        </div>

        <div
          ref={ref}
          className="relative grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          {/* Connector line */}
          <div className="hidden md:block absolute top-7 left-[14%] right-[14%] h-0.5 bg-gradient-to-r from-primary via-accent to-chart-3 opacity-40 rounded-full" />
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`text-center ${inView ? "animate-fadeUp" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-display font-black text-lg mx-auto mb-5 relative z-10 shadow-lg`}
              >
                {step.num}
              </div>
              <h4 className="font-display font-bold text-base mb-2">
                {step.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
