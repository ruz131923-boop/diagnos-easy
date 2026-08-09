import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Administrator Login — VitalSense" },
      {
        name: "description",
        content:
          "Secure administrator sign-in for VitalSense: review member activity, usage graphs and remove fake accounts.",
      },
      { property: "og:title", content: "Administrator Login — VitalSense" },
      {
        property: "og:description",
        content: "Restricted area. Only the VitalSense administrator can sign in here.",
      },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { adminLogin, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both the administrator username and password.");
      return;
    }
    const result = adminLogin(username, password);
    if (!result.ok) {
      setError(result.error ?? "Sign in failed.");
      return;
    }
    setError(null);
    navigate({ to: "/admin" });
  };

  return (
    <>
      <PageHeader
        eyebrow="Restricted area"
        title="Administrator login"
        description="This area is only for the VitalSense administrator. Member accounts cannot sign in here."
      />

      <div className="mx-auto max-w-md px-5 py-16">
        {isAdmin ? (
          <div className="animate-rise rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
            <p className="text-sm text-muted-foreground">
              You are already signed in as the administrator.
            </p>
            <Button className="mt-4" onClick={() => navigate({ to: "/admin" })}>
              Open the admin dashboard
            </Button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="animate-rise space-y-5 rounded-2xl border border-border bg-card p-8 shadow-soft"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>

            <div className="space-y-2">
              <Label htmlFor="adminUsername">Administrator username</Label>
              <Input
                id="adminUsername"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password</Label>
              <div className="relative">
                <Input
                  id="adminPassword"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors duration-300 hover:text-primary"
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
              Log in as administrator
            </Button>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Prototype credentials for testing: username <strong>admin</strong>, password{" "}
              <strong>Vital@Admin1</strong>. When the back end is connected, these are verified on
              the server instead of in the browser.
            </p>
          </form>
        )}
      </div>
    </>
  );
}
