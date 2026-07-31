import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

/**
 * Front-end only access gate: guest visitors see the informational preview,
 * registered members see the prediction tools.
 */
export function AuthGate({ feature, children }: { feature: string; children: ReactNode }) {
  const { ready, user, hasAccount } = useAuth();

  if (!ready) {
    return (
      <div className="animate-soft-fade rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Checking your session…
      </div>
    );
  }

  if (user) return <>{children}</>;

  return (
    <div className="animate-rise overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
        <span className="animate-pulse-soft flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Lock className="size-6" aria-hidden="true" />
        </span>
        <h2 className="text-xl font-semibold text-foreground">Members only</h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {feature} is available to members only. {hasAccount
            ? "You already have an account, so just log in to unlock report scanning and risk predictions."
            : "Create a free account to unlock report uploads, report scanning and risk predictions."}{" "}
          Your medical details stay private and are never shared with anyone else.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link to="/login">
            <Button>Log in</Button>
          </Link>
          {hasAccount ? null : (
            <Link to="/register">
              <Button variant="outline">Create an account</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}