import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — VitalSense" },
      {
        name: "description",
        content:
          "Log in to VitalSense to access heart, diabetes, breast cancer and Parkinson's disease risk predictions.",
      },
      { property: "og:title", content: "Log In — VitalSense" },
      {
        property: "og:description",
        content: "Secure member access to your VitalSense prediction workspace.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, user, hasAccount, ready } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in: no need to see the log in form again.
  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  return (
    <div className="bg-[image:var(--gradient-calm)]">
      <div className="mx-auto flex max-w-md flex-col px-5 py-20">
        <div className="animate-rise rounded-2xl border border-border bg-card p-8 shadow-soft">
          <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Log in with your username and password to continue your screening.
          </p>

          <form
            className="mt-7 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!username.trim() || !password) {
                setError("Please enter both your username and password.");
                return;
              }
              const result = login(username, password);
              if (!result.ok) {
                setError(result.error ?? "Unable to log in.");
                return;
              }
              setError(null);
              toast.success("Logged in", { description: "Your prediction tools are unlocked." });
              navigate({ to: "/dashboard" });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your.username"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="animate-soft-fade rounded-lg bg-heart-soft px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full">
              Log in
            </Button>
          </form>

          {ready && !user && !hasAccount ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </p>
          ) : null}
        </div>

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          This is a front-end prototype: accounts are stored only in your own browser and no medical
          data is transmitted anywhere.
        </p>
      </div>
    </div>
  );
}