import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Trash2 } from "lucide-react";
import { useState } from "react";

import { AuthGate } from "@/components/auth-gate";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { DISEASES } from "@/lib/site";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — VitalSense" },
      {
        name: "description",
        content:
          "Your VitalSense profile summary and quick access to the heart, diabetes, breast cancer and Parkinson's prediction tools.",
      },
      { property: "og:title", content: "My Dashboard — VitalSense" },
      {
        property: "og:description",
        content: "Member workspace for your saved details and prediction services.",
      },
    ],
  }),
  component: DashboardPage,
});

function bmiOf(heightCm: string, weightKg: string) {
  const h = Number.parseFloat(heightCm) / 100;
  const w = Number.parseFloat(weightKg);
  if (!h || !w) return "—";
  return (w / (h * h)).toFixed(1);
}

function DashboardPage() {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Member area"
        title={user ? `Welcome back, ${user.nameWithInitials || user.username}` : "Your dashboard"}
        description="Your registered profile and the four prediction workspaces, all in one place."
      />

      <div className="mx-auto max-w-6xl px-5 py-16">
        <AuthGate feature="Your personal dashboard">
          {user ? (
            <div className="space-y-8">
              <section className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
                  <h2 className="text-lg font-semibold text-foreground">Registered profile</h2>
                  <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    {[
                      ["Full name", user.fullName],
                      ["Name with initials", user.nameWithInitials],
                      ["Date of birth", user.dateOfBirth],
                      ["Gender", user.gender],
                      ["Email", user.email],
                      ["Contact number", user.contactNumber],
                      ["Blood group", user.bloodGroup],
                      ["Username", user.username],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between gap-4 border-b border-border pb-2 text-sm"
                      >
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="text-right font-medium text-foreground">{value || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/50 p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                    Body metrics
                  </h2>
                  <p className="mt-6 font-display text-4xl font-semibold text-foreground">
                    {bmiOf(user.heightCm, user.weightKg)}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Body mass index
                  </p>
                  <dl className="mt-6 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Height</dt>
                      <dd className="font-medium text-foreground">{user.heightCm} cm</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Weight</dt>
                      <dd className="font-medium text-foreground">{user.weightKg} kg</dd>
                    </div>
                  </dl>
                  <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                    BMI feeds directly into the diabetes model and is used as a supporting factor for
                    cardiovascular risk.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">Start a prediction</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {DISEASES.map((disease, i) => (
                    <Link
                      key={disease.key}
                      to={disease.path}
                      className="card-lift animate-rise group rounded-2xl border border-border bg-card p-6 shadow-soft"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <h3 className={`text-lg font-semibold ${disease.accent}`}>{disease.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {disease.short}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Open
                        <ArrowRight
                          className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              <p className="rounded-xl border border-border bg-card p-5 text-xs leading-relaxed text-muted-foreground">
                Prediction history will appear here once the machine learning back end is connected.
                In this front-end prototype, results are shown immediately after each run and are not
                stored.
              </p>

              <section className="rounded-2xl border border-destructive/30 bg-heart-soft/40 p-6">
                <h2 className="text-lg font-semibold text-foreground">Delete my account</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  This removes your saved profile from this device for good. You will be signed out,
                  and you can then register again with fresh details.
                </p>
                {confirming ? (
                  <div className="animate-rise mt-4 flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        deleteAccount();
                        navigate({ to: "/register" });
                      }}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Yes, delete it permanently
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
                      Keep my account
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => setConfirming(true)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete my account
                  </Button>
                )}
              </section>
            </div>
          ) : null}
        </AuthGate>
      </div>
    </>
  );
}