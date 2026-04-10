import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how" },
  { label: "Demo", href: "#demo" },
  { label: "Tech Stack", href: "#tech" },
];

function scrollTo(id: string) {
  const el = document.getElementById(id.replace("#", ""));
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export function Layout({ children }: LayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      {/* Sticky Nav */}
      <nav
        data-ocid="nav"
        className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-3.5 transition-smooth border-b ${
          scrolled
            ? "bg-card/95 backdrop-blur-xl border-border/60 shadow-lg"
            : "bg-card/80 backdrop-blur-md border-border/30"
        }`}
      >
        <button
          type="button"
          onClick={() => scrollTo("top")}
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          aria-label="PrakritiAI home"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-black text-white shadow-md group-hover:scale-105 transition-smooth">
            P
          </div>
          <span className="font-display font-bold text-base text-foreground">
            Prakriti
            <span className="gradient-hero" style={{ animationDuration: "6s" }}>
              AI
            </span>
          </span>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            data-ocid="nav-cta"
            size="sm"
            className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            onClick={() => scrollTo("demo")}
          >
            Try Demo →
          </Button>
          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span
                className={`block h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}
              />
              <span
                className={`block h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden sticky top-[57px] z-40 bg-card/97 backdrop-blur-xl border-b border-border/60 px-6 py-4 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link.href}
              onClick={() => {
                scrollTo(link.href);
                setMenuOpen(false);
              }}
              className="text-sm text-muted-foreground hover:text-foreground py-1.5 text-left transition-colors"
            >
              {link.label}
            </button>
          ))}
          <Button
            size="sm"
            className="mt-2 bg-primary text-primary-foreground"
            onClick={() => {
              scrollTo("demo");
              setMenuOpen(false);
            }}
          >
            Try Demo →
          </Button>
        </div>
      )}

      {/* Main Content */}
      <main id="top" className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border/40">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-black text-white">
                  P
                </div>
                <span className="font-display font-bold text-base">
                  Prakriti<span className="gradient-hero">AI</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An AI-powered Ayurvedic wellness platform combining intelligent
                analysis with traditional knowledge for personalized health
                insights.
              </p>
            </div>
            <div>
              <h5 className="text-xs font-bold tracking-widest text-accent uppercase mb-4">
                Navigation
              </h5>
              {NAV_LINKS.map((link) => (
                <button
                  type="button"
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="block text-sm text-muted-foreground hover:text-foreground mb-2.5 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div>
              <h5 className="text-xs font-bold tracking-widest text-accent uppercase mb-4">
                Research
              </h5>
              {[
                "Ayurvedic Doshas",
                "Face Shape Theory",
                "ML Methodology",
                "Project Report",
              ].map((item) => (
                <span
                  key={item}
                  className="block text-sm text-muted-foreground/60 mb-2.5 cursor-default"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-muted-foreground/50">
              © {year}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                caffeine.ai
              </a>
            </p>
            <span className="text-xs font-semibold gradient-hero">
              Designed for academic excellence
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
