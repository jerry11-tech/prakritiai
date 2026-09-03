import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { PrakritiBadge } from "@/components/prakriti/PrakritiBadge";
import { ArrowLeft, Eye, EyeOff, Shield } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, "USER");
      if (email.trim().toLowerCase() === "admin@prakritiai.org") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/analysis" });
      }
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 border border-border/60 rounded-3xl overflow-hidden shadow-card bg-card">
        {/* Left Branding Panel */}
        <div className="bg-secondary/40 p-8 md:p-12 border-r border-border/40 flex flex-col justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <span className="text-xl">🌿</span>
              <span className="font-display font-extrabold text-xl text-foreground">
                Prakriti <span className="text-primary">AI</span>
              </span>
            </Link>

            <h2 className="font-display font-bold text-2xl text-foreground mb-3 leading-snug">
              Understand your unique Ayurvedic constitution.
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Sign in to manage your Prakriti profile, complete ML questionnaire assessments, and access personalized wellness recommendations.
            </p>

            <div className="flex flex-wrap gap-2">
              <PrakritiBadge type="Vata" label="Vata" />
              <PrakritiBadge type="Pitta" label="Pitta" />
              <PrakritiBadge type="Kapha" label="Kapha" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/40 text-[11px] text-muted-foreground">
            Healthcare & Research Platform · Secure Session Auth
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
            <h1 className="font-display font-extrabold text-2xl text-foreground">User Sign In</h1>
            <p className="text-xs text-muted-foreground mt-1">Enter your account credentials to continue.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-2.5 text-xs font-bold bg-primary text-primary-foreground">
              {loading ? "Signing In..." : "Sign In to Account"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/40 space-y-3 text-center text-xs text-muted-foreground">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
            </p>

            <div className="flex justify-center gap-2 pt-2">
              <Link to="/expert/login">
                <Button size="sm" variant="outline" className="text-[11px] border-border text-muted-foreground hover:text-foreground">
                  🛡️ Expert Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
