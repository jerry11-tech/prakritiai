import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { PrakritiBadge } from "@/components/prakriti/PrakritiBadge";
import { ArrowLeft, Shield } from "lucide-react";

export function ExpertLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, "EXPERT");
      navigate({ to: "/expert/dashboard" });
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 border border-border/60 rounded-3xl overflow-hidden shadow-card bg-card">
        {/* Left Branding */}
        <div className="bg-secondary/40 p-8 md:p-12 border-r border-border/40 flex flex-col justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <span className="text-xl">🌿</span>
              <span className="font-display font-extrabold text-xl text-foreground">
                Prakriti <span className="text-primary">AI</span>
              </span>
            </Link>

            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">LEVEL 2 PRACTITIONER WORKSPACE</span>
            </div>

            <h2 className="font-display font-bold text-2xl text-foreground mb-3 leading-snug">
              Clinical Assessment & Ground-Truth Verification
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Review assigned case studies matching your registered Ayurvedic specialization (Vata, Pitta, or Kapha) and validate AI predictions.
            </p>

            <div className="space-y-2">
              <PrakritiBadge type="Vata" label="Vata Specialist: vata.expert@ayurveda.org" />
              <PrakritiBadge type="Pitta" label="Pitta Specialist: pitta.expert@ayurveda.org" />
              <PrakritiBadge type="Kapha" label="Kapha Specialist: kapha.expert@ayurveda.org" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/40 text-[11px] text-muted-foreground">
            Password for pre-seeded experts: <strong className="text-foreground">expert123</strong>
          </div>
        </div>

        {/* Right Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
            <h1 className="font-display font-extrabold text-2xl text-foreground">Practitioner Portal Login</h1>
            <p className="text-xs text-muted-foreground mt-1">Sign in with your approved expert credentials.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Expert Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vata.expert@ayurveda.org"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full py-2.5 text-xs font-bold bg-primary text-primary-foreground">
              {loading ? "Signing In..." : "Access Expert Workspace"}
            </Button>
          </form>

          {/* Quick Auto Fill Helpers */}
          <div className="mt-6 pt-4 border-t border-border/40 text-center text-xs text-muted-foreground space-y-2">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Quick Auto-Fill Practitioner</p>
            <div className="flex justify-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setEmail("vata.expert@ayurveda.org");
                  setPassword("expert123");
                }}
                className="text-[10px] bg-vata-light text-vata-text border border-vata-soft px-2 py-1 rounded-md font-bold"
              >
                Vata Expert
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("pitta.expert@ayurveda.org");
                  setPassword("expert123");
                }}
                className="text-[10px] bg-pitta-light text-pitta-text border border-pitta-soft px-2 py-1 rounded-md font-bold"
              >
                Pitta Expert
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("kapha.expert@ayurveda.org");
                  setPassword("expert123");
                }}
                className="text-[10px] bg-kapha-light text-kapha-text border border-kapha-soft px-2 py-1 rounded-md font-bold"
              >
                Kapha Expert
              </button>
            </div>
            <div className="pt-2 text-center">
              <Link to="/expert/register" className="text-xs text-primary font-semibold hover:underline">
                Apply for Practitioner Access →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
