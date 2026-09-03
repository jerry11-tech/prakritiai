import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, CheckCircle } from "lucide-react";

export function ExpertRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("Vata");
  const [professionalDetails, setProfessionalDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { registerExpert } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerExpert(name, email, password, specialization, professionalDetails);
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="bg-card border border-border/40 rounded-3xl p-8 md:p-10">
          <Link to="/expert/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Expert Login
          </Link>

          <h1 className="font-display font-extrabold text-3xl mb-2">Expert Registration</h1>
          <p className="text-sm text-muted-foreground mb-6">Apply to join the PrakritiAI verified practitioner network.</p>

          {submitted ? (
            <div className="p-6 bg-accent/15 border border-accent/40 rounded-2xl text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-accent mx-auto" />
              <h3 className="font-display font-bold text-xl">Registration Submitted</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your application has been received and is pending administrator review.
                Once approved, you will be able to log in and review {specialization} tests.
              </p>
              <Link to="/expert/login">
                <Button className="w-full">Return to Expert Login</Button>
              </Link>
            </div>
          ) : (
            <>
              {error && <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">{error}</div>}

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold tracking-widest text-accent uppercase mb-2">Full Name & Title</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:border-primary outline-none" placeholder="Dr. Ananya Sharma, BAMS, MD" />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest text-accent uppercase mb-2">Professional Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:border-primary outline-none" placeholder="dr.sharma@ayurveda.org" />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest text-accent uppercase mb-2">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:border-primary outline-none" placeholder="Create a password" />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest text-accent uppercase mb-2">Dosha Specialization *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Vata", "Pitta", "Kapha"].map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={`p-3 rounded-xl border text-sm font-bold text-center transition-all ${
                          specialization === s
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-card border-border/50 text-muted-foreground hover:border-primary/40"
                        }`}
                        onClick={() => setSpecialization(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    You will only receive test results matching your selected specialization for review.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest text-accent uppercase mb-2">Professional Details / Affiliation</label>
                  <textarea rows={3} value={professionalDetails} onChange={(e) => setProfessionalDetails(e.target.value)} className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:border-primary outline-none resize-none" placeholder="Qualifications, clinic location, registration number..." />
                </div>

                <Button type="submit" disabled={loading} className="w-full py-3 font-semibold">
                  {loading ? "Submitting..." : "Submit Registration for Approval"}
                </Button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}