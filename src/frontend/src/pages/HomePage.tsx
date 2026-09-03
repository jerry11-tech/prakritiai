import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PrakritiBadge } from "@/components/prakriti/PrakritiBadge";
import { PrakritiDistribution } from "@/components/prakriti/PrakritiDistribution";
import { ArrowRight, Leaf, Shield, Eye, Search, CheckCircle, Activity, Lock } from "lucide-react";

export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-card/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
              🌿
            </div>
            <div>
              <span className="font-display font-extrabold text-base text-foreground block leading-tight">
                Prakriti <span className="text-primary font-bold">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium block">
                Understand. Balance. Thrive.
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#insights" className="text-muted-foreground hover:text-foreground transition-colors">Research & Metrics</a>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/login">
              <Button size="sm" variant="outline" className="text-xs font-semibold border-border">
                👤 User Sign In
              </Button>
            </Link>
            <Link to="/expert/login">
              <Button size="sm" variant="outline" className="text-xs font-semibold border-primary/30 text-primary">
                🛡️ Expert Portal
              </Button>
            </Link>
            <Link to="/admin">
              <Button size="sm" className="text-xs font-bold bg-primary text-primary-foreground">
                ⚙️ Admin
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary uppercase mb-4 bg-secondary border border-primary/20 px-3 py-1 rounded-full">
              <Leaf className="h-3.5 w-3.5" />
              AYURVEDIC SCIENCE × MACHINE LEARNING
            </div>

            <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground mb-4">
              Understand Your <br />
              <span className="text-primary">Prakriti Constitution</span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              A clinical research platform combining facial computer vision, structured questionnaire analysis, and blind multi-expert validation for Vata, Pitta & Kapha profiling.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-6">
              <Link to="/analysis">
                <Button size="lg" className="w-full sm:w-auto px-8 py-3 text-xs font-bold bg-primary text-primary-foreground shadow-sm">
                  Start Prakriti Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/expert/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 py-3 text-xs font-semibold border-border">
                  🛡️ Practitioner Workspace
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground font-medium pt-4 border-t border-border/40">
              <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> RBAC Enforced</div>
              <div className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-primary" /> 96.7% Test Accuracy</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-primary" /> Fleiss' Kappa 0.70</div>
            </div>
          </div>

          {/* Prakriti Visual Preview Card */}
          <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">CLINICAL DEMO RESULT</span>
                <h3 className="font-display font-bold text-lg text-foreground">Tri-Dosha Constitutional Balance</h3>
              </div>
              <PrakritiBadge type="Vata" label="Vata Dominant" size="sm" />
            </div>

            <PrakritiDistribution scores={{ Vata: 45, Pitta: 35, Kapha: 20 }} />

            <div className="p-4 bg-muted/20 border border-border/40 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-foreground block">Key Clinical Observations</span>
              <p className="text-muted-foreground leading-relaxed">
                Dominant Vata expression with active Pitta digestion. Recommend warm, grounding nutrition, gentle Hatha movement, and oil therapy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-20 border-t border-border/40">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase block mb-2">ANCIENT FOUNDATION × MODERN DATA</span>
          <h2 className="font-display font-extrabold text-3xl text-foreground mb-3">The Science Behind Prakriti AI</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In Ayurvedic medicine, every individual possesses a unique birth constitution (Prakriti) governed by three primary physiological forces: Vata (Air/Space), Pitta (Fire/Water), and Kapha (Earth/Water).
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-vata-soft/60 rounded-2xl p-6 space-y-3 shadow-card">
            <PrakritiBadge type="Vata" label="Vata · Air & Space" size="lg" />
            <h3 className="font-display font-bold text-base text-foreground">Air · Space · Movement</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Governs body movement, nervous system activity, respiration, and circulation. Expressed through light frame, dry skin, and quick creative thinking.
            </p>
          </div>

          <div className="bg-card border border-pitta-soft/60 rounded-2xl p-6 space-y-3 shadow-card">
            <PrakritiBadge type="Pitta" label="Pitta · Fire & Water" size="lg" />
            <h3 className="font-display font-bold text-base text-foreground">Fire · Water · Metabolism</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Governs digestion, body temperature, metabolic transformation, and intellect. Expressed through medium athletic frame, warm skin, and sharp focus.
            </p>
          </div>

          <div className="bg-card border border-kapha-soft/60 rounded-2xl p-6 space-y-3 shadow-card">
            <PrakritiBadge type="Kapha" label="Kapha · Earth & Water" size="lg" />
            <h3 className="font-display font-bold text-base text-foreground">Earth · Water · Structure</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Governs physical structure, joint lubrication, immunity, and stamina. Expressed through broad sturdy frame, smooth oily skin, and calm stability.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 border-t border-border/40">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase block mb-2">SYSTEM CAPABILITIES</span>
          <h2 className="font-display font-extrabold text-3xl text-foreground">Research-Grade Platform Features</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Eye, title: "Facial Computer Vision", desc: "Optional frontal photo luminance and saturation analysis. Strictly gated with 0 fake observations generated when not provided." },
            { icon: Search, title: "12-Feature Questionnaire", desc: "Standardized clinical questions mapping physical, metabolic, and psychological Prakriti indicators." },
            { icon: Activity, title: "DoshaNet ML Pipeline", desc: "Trained neural network and SVM classifiers evaluated using Stratified 5-Fold Cross Validation." },
            { icon: Shield, title: "Blind Expert Verification", desc: "Specialized Vata, Pitta, and Kapha practitioners independently verify predictions without seeing AI labels." },
            { icon: Lock, title: "3-Level RBAC Security", desc: "Backend-enforced access control separating Admin (Level 3), Expert (Level 2), and User (Level 1)." },
            { icon: Leaf, title: "5-Sheet Excel Engine", desc: "Real-time automated synchronization with Prakriti_Verified_Data.xlsx for audit tracking and export." },
          ].map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="bg-card border border-border/60 rounded-2xl p-6 space-y-3 shadow-card">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-base text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section id="insights" className="mx-auto max-w-7xl px-6 py-20 border-t border-border/40">
        <div className="bg-card border border-border/60 rounded-3xl p-10 md:p-16 text-center shadow-card space-y-6">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary uppercase bg-secondary px-3.5 py-1 rounded-full border border-primary/20">
            🌿 READY FOR YOUR CLINICAL PROFILING?
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground">
            Discover Your Constitutional Balance
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Complete the 12-question assessment to receive your tri-dosha scores, facial observations, and tailored Ayurvedic lifestyle plan.
          </p>
          <div>
            <Link to="/analysis">
              <Button size="lg" className="px-8 py-3 text-xs font-bold bg-primary text-primary-foreground shadow-sm">
                Start Free Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
