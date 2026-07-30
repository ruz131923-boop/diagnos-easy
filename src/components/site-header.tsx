import { Link, useNavigate } from "@tanstack/react-router";
import { Activity, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { DISEASES, SITE_NAME } from "@/lib/site";

const navLinkClass =
  "text-sm text-muted-foreground transition-colors duration-300 hover:text-primary";

export function SiteHeader() {
  const { user, logout, ready } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link to="/" className="group flex items-center gap-2.5" aria-label={`${SITE_NAME} home`}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-105">
            <Activity className="size-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-tight text-foreground">
              {SITE_NAME}
            </span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Disease Prediction
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {DISEASES.map((d) => (
            <Link
              key={d.key}
              to={d.path}
              className={navLinkClass}
              activeProps={{ className: "text-sm font-medium text-primary" }}
            >
              {d.name}
            </Link>
          ))}
          <Link
            to="/how-it-works"
            className={navLinkClass}
            activeProps={{ className: "text-sm font-medium text-primary" }}
          >
            How It Works
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {ready && user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  {user.nameWithInitials || user.username}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open ? (
        <div className="animate-rise border-t border-border bg-card px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {DISEASES.map((d) => (
              <Link key={d.key} to={d.path} className={navLinkClass} onClick={() => setOpen(false)}>
                {d.name}
              </Link>
            ))}
            <Link to="/how-it-works" className={navLinkClass} onClick={() => setOpen(false)}>
              How It Works
            </Link>
            <div className="mt-2 flex gap-2">
              {ready && user ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate({ to: "/" });
                    }}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="flex-1">
                    <Button size="sm" className="w-full">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}