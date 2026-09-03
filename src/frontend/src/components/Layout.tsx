import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "@tanstack/react-router";
import { PrakritiBadge } from "./prakriti/PrakritiBadge";
import { Leaf, LogOut, Sun, Moon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how" },
  { label: "Demo", href: "#demo" },
  { label: "Expert Portal", href: "#expert" },
  { label: "Research", href: "#research" },
];

function scrollTo(id: string) {
  const el = document.getElementById(id.replace("#", ""));
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  const year = new Date().getFullYear();

  const toggleTheme = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("prakriti_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("prakriti_theme", "light");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("prakriti_theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body transition-colors duration-200">
      {/* Sticky Nav */}
      <nav
        className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-3.5 transition-all border-b ${
          scrolled
            ? "bg-card/95 backdrop-blur-md border-border/70 shadow-sm"
            : "bg-card/80 backdrop-blur-xs border-border/40"
        }`}
      >
        <button
          type="button"
          onClick={() => scrollTo("top")}
          className="flex items-center gap-2.5 group focus:outline-none rounded-lg"
          aria-label="PrakritiAI home"
        >
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
            🌿
          </div>
          <div className="text-left">
            <span className="font-display font-extrabold text-base text-foreground block leading-tight">
              Prakriti <span className="text-primary">AI</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium block">
              Understand. Balance. Thrive.
            </span>
          </div>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <Button size="icon" variant="ghost" onClick={toggleTheme} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Toggle Light/Dark Mode">
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <div className="flex items-center gap-2.5">
              {user.role === "ADMIN" && (
                <Link to="/admin">
                  <Button size="sm" variant="outline" className="text-xs font-semibold border-primary/40 text-primary">
                    ⚙️ Admin Console
                  </Button>
                </Link>
              )}
              {(user.role === "EXPERT" || user.role === "ADMIN") && (
                <Link to="/expert/dashboard">
                  <Button size="sm" variant="outline" className="text-xs font-semibold border-accent text-accent">
                    🛡️ Expert Portal
                  </Button>
                </Link>
              )}
              <span className="text-xs text-muted-foreground font-medium hidden lg:inline">
                {user.email}
              </span>
              <Button size="sm" variant="ghost" onClick={logout} className="text-xs h-8 text-muted-foreground">
                <LogOut className="h-3.5 w-3.5 mr-1" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button size="sm" variant="outline" className="text-xs font-semibold">👤 User Sign In</Button>
              </Link>
              <Link to="/expert/login">
                <Button size="sm" variant="outline" className="text-xs font-semibold border-primary/40 text-primary">🛡️ Expert Portal</Button>
              </Link>
              <Link to="/admin">
                <Button size="sm" className="text-xs font-semibold bg-primary text-primary-foreground">⚙️ Admin</Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main id="top" className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border/40 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🌿</span>
              <span className="font-display font-extrabold text-base text-foreground">
                Prakriti <span className="text-primary">AI</span>
              </span>
            </div>
            <p className="leading-relaxed">
              Research-grade Ayurvedic constitution analysis system integrating Machine Learning with blind multi-expert ground-truth verification.
            </p>
          </div>

          <div>
            <span className="font-bold text-foreground block mb-3 uppercase tracking-wider text-[11px]">CONSTITUTION TYPES</span>
            <div className="flex flex-wrap gap-2">
              <PrakritiBadge type="Vata" label="Vata · Air & Space" />
              <PrakritiBadge type="Pitta" label="Pitta · Fire & Water" />
              <PrakritiBadge type="Kapha" label="Kapha · Earth & Water" />
            </div>
          </div>

          <div>
            <span className="font-bold text-foreground block mb-3 uppercase tracking-wider text-[11px]">RBAC ACCESS LEVELS</span>
            <div className="space-y-1 text-[11px]">
              <div><strong>Level 3 ADMIN</strong>: Platform & User Management</div>
              <div><strong>Level 2 EXPERT</strong>: Domain Specialization Case Review</div>
              <div><strong>Level 1 USER</strong>: Self Assessment & Wellness Report</div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 py-4 text-center text-[11px]">
          © {year} Prakriti AI · Designed for Academic & Clinical Research Excellence
        </div>
      </footer>
    </div>
  );
}
