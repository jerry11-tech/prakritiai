import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { PrakritiBadge } from "@/components/prakriti/PrakritiBadge";
import { ArrowLeft } from "lucide-react";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser(name, email, password);
      navigate({ to: "/analysis" });
    } catch (e: any) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 border border-border/60 rounded-3xl overflow-hidden shadow-card bg-card">
        {/* Left Panel */}
        <div className="bg-secondary/40 p-8 md:p-12 border-r border-border/40 flex flex-col justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <span className="text-xl">🌿</span>
              <span className="font-display font-extrabold text-xl text-foreground">
                Prakriti <span className="text-primary">AI</span>
              </span>
            </Link>

            <h2 className="font-display font-bold text-2xl text-foreground mb-3 leading-snug">
              Begin your personalized Ayurvedic journey.
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Create an account to complete your constitutional questionnaire, receive AI-driven assessment insights, and track your health progress.
            </p>

            <div className="flex flex-wrap gap-2">
              <PrakritiBadge type="Vata" label="Air & Space" />
              <PrakritiBadge type="Pitta" label="Fire & Water" />
              <PrakritiBadge type="Kapha" label="Earth & Water" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/40 text-[11px] text-muted-foreground">
            Level 1 Standard User Account · Privacy Protected
          </div>
        </div>

        {/* Right Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
            <h1 className="font-display font-extrabold text-2xl text-foreground">Create User Account</h1>
            <p className="text-xs text-muted-foreground mt-1">Register for free to start your analysis.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. / Mr. / Ms. Full Name"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

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
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full py-2.5 text-xs font-bold bg-primary text-primary-foreground">
              {loading ? "Creating Account..." : "Complete Registration"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/40 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
