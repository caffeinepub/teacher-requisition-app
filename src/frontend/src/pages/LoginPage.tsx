import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type { SessionData } from "../hooks/useSession";

interface Props {
  onLogin: (session: SessionData) => void;
}

export function LoginPage({ onLogin }: Props) {
  const { actor } = useActor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    if (!actor) {
      setError("System not ready. Please refresh.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const result = await (actor as any).login(email.trim(), password);
      if ("ok" in result) {
        const { sessionId, name, role } = result.ok;
        onLogin({ sessionId, name, role });
        toast.success(`Welcome back, ${name}!`);
      } else {
        setError(result.err || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-5">
        <div
          className="bg-white rounded-2xl shadow-card border border-border overflow-hidden"
          data-ocid="login.panel"
        >
          <div className="sidebar-gradient p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">SchoolReq</h1>
                <p className="text-white/70 text-sm">
                  MSB Institute &mdash; Requisition System
                </p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Streamline your school&apos;s resource requisition process.
              Submit, track, and manage requests with ease.
            </p>
          </div>

          <div className="p-6">
            <h2 className="text-base font-bold text-foreground mb-1">
              Sign In
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              Enter your credentials to access the system.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="email"
                    type="email"
                    data-ocid="login.email.input"
                    placeholder="you@msbinstitute.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-xs font-semibold">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Lock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type="password"
                    data-ocid="login.password.input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <p
                  className="text-xs text-destructive bg-destructive/5 rounded-lg px-3 py-2"
                  data-ocid="login.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full sidebar-gradient text-white hover:opacity-90 transition-opacity font-semibold"
                disabled={isLoading}
                data-ocid="login.primary_button"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-xs p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Access Roles
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "\u{1F4CB}", label: "Teachers", desc: "Submit & track" },
              { icon: "\u2705", label: "Authority", desc: "Approve & reject" },
              {
                icon: "\u{1F4E6}",
                label: "Admin Staff",
                desc: "Fulfill requests",
              },
            ].map((r) => (
              <div
                key={r.label}
                className="text-center p-2 rounded-lg bg-muted/30"
              >
                <div className="text-lg mb-1">{r.icon}</div>
                <p className="text-[10px] font-semibold text-foreground">
                  {r.label}
                </p>
                <p className="text-[9px] text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
