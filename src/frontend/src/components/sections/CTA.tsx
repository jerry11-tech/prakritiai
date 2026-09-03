import { Button } from "@/components/ui/button";

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export function CTA() {
  return (
    <section className="py-20 px-6 md:px-12 bg-muted/20 border-b border-border/30">
      <div className="max-w-4xl mx-auto text-center bg-card border border-primary/30 rounded-3xl p-10 md:p-14 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
        <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight mb-4 text-foreground">
          Understand Your Prakriti.
        </h2>
        <p className="text-base text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          Start with a simple, instant facial and questionnaire analysis.
        </p>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg hover:shadow-primary/25 transition-all"
          onClick={() => scrollTo("demo")}
        >
          Start Free Analysis →
        </Button>
      </div>
    </section>
  );
}