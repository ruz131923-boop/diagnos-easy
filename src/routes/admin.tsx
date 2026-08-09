import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity as ActivityIcon,
  AlertTriangle,
  Download,
  Eraser,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACTIVITY_LABEL, clearActivity, useActivity, type ActivityEvent } from "@/lib/activity";
import { useAuth, type StoredUser } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administrator Dashboard — VitalSense" },
      {
        name: "description",
        content:
          "Administrator control centre for VitalSense: member accounts, activity records, usage and performance graphs, and account removal tools.",
      },
      { property: "og:title", content: "Administrator Dashboard — VitalSense" },
      {
        property: "og:description",
        content: "Monitor member activity, compare usage graphs and remove fake accounts.",
      },
    ],
  }),
  component: AdminPage,
});

const CHART_COLORS = ["#2f6f8f", "#c97b3c", "#c0483f", "#4f8a5b", "#7a5c46"];

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function lastDays(count: number) {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function bmiOf(heightCm: string, weightKg: string) {
  const h = Number.parseFloat(heightCm) / 100;
  const w = Number.parseFloat(weightKg);
  if (!h || !w) return 0;
  return Number((w / (h * h)).toFixed(1));
}

/** Simple checks that mark an account as possibly fake or unauthorised. */
function suspicionReasons(u: StoredUser, predictions: number) {
  const reasons: string[] = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(u.email)) reasons.push("Email address looks invalid");
  if (!/^\d{10}$/.test(u.contactNumber)) reasons.push("Contact number is not 10 digits");
  if (!u.fullName || u.fullName.trim().split(/\s+/).length < 2) reasons.push("Full name incomplete");
  const bmi = bmiOf(u.heightCm, u.weightKg);
  if (bmi && (bmi < 10 || bmi > 60)) reasons.push("Height and weight are not realistic");
  if (!u.dateOfBirth) reasons.push("No date of birth given");
  if (predictions === 0) reasons.push("No prediction activity yet");
  return reasons;
}

function AdminPage() {
  const { isAdmin, adminUsername, accounts, adminLogout, adminDeleteAccount, refreshAccounts } =
    useAuth();
  const navigate = useNavigate();
  const { events, refresh } = useActivity();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const predictionEvents = useMemo(
    () => events.filter((e) => e.type === "prediction"),
    [events],
  );

  const perUser = useMemo(() => {
    return accounts.map((a) => {
      const mine = events.filter((e) => e.username.toLowerCase() === a.username.toLowerCase());
      const preds = mine.filter((e) => e.type === "prediction");
      const avg = preds.length
        ? Math.round(preds.reduce((s, e) => s + (e.score ?? 0), 0) / preds.length)
        : 0;
      return {
        user: a,
        events: mine.length,
        predictions: preds.length,
        scans: mine.filter((e) => e.type === "report-scan").length,
        logins: mine.filter((e) => e.type === "login").length,
        avgRisk: avg,
        lastSeen: mine[0]?.at ?? "",
        reasons: suspicionReasons(a, preds.length),
      };
    });
  }, [accounts, events]);

  const byScreening = useMemo(() => {
    const map = new Map<string, number>();
    predictionEvents.forEach((e) => {
      const key = e.detail ?? "Prediction";
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return [...map.entries()].map(([name, runs]) => ({ name, runs }));
  }, [predictionEvents]);

  const daily = useMemo(() => {
    const days = lastDays(7);
    return days.map((d) => ({
      day: new Date(d).toLocaleDateString(undefined, { weekday: "short" }),
      predictions: events.filter((e) => e.type === "prediction" && dayKey(e.at) === d).length,
      logins: events.filter((e) => e.type === "login" && dayKey(e.at) === d).length,
      scans: events.filter((e) => e.type === "report-scan" && dayKey(e.at) === d).length,
    }));
  }, [events]);

  const riskSplit = useMemo(() => {
    const low = predictionEvents.filter((e) => (e.score ?? 0) < 34).length;
    const moderate = predictionEvents.filter(
      (e) => (e.score ?? 0) >= 34 && (e.score ?? 0) < 67,
    ).length;
    const high = predictionEvents.filter((e) => (e.score ?? 0) >= 67).length;
    return [
      { name: "Low risk", value: low },
      { name: "Moderate risk", value: moderate },
      { name: "Elevated risk", value: high },
    ].filter((s) => s.value > 0);
  }, [predictionEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesType = typeFilter === "all" || e.type === typeFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        e.username.toLowerCase().includes(q) ||
        (e.detail ?? "").toLowerCase().includes(q) ||
        ACTIVITY_LABEL[e.type].toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [events, typeFilter, query]);

  const exportCsv = () => {
    const rows: string[][] = [
      ["When", "Username", "Action", "Details", "Risk score"],
      ...filteredEvents.map((e: ActivityEvent) => [
        new Date(e.at).toLocaleString(),
        e.username,
        ACTIVITY_LABEL[e.type],
        e.detail ?? "",
        e.score !== undefined ? String(e.score) : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "vitalsense-activity.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <>
        <PageHeader
          eyebrow="Restricted area"
          title="Administrator access only"
          description="This dashboard is protected. Sign in with the administrator username and password to continue."
        />
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <span className="animate-pulse-soft mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            No member account can open this page. Only the administrator can view member activity,
            usage graphs and account controls.
          </p>
          <Link to="/admin-login">
            <Button className="mt-6">Go to administrator login</Button>
          </Link>
        </div>
      </>
    );
  }

  const stats = [
    { label: "Registered accounts", value: accounts.length, icon: Users },
    { label: "Recorded actions", value: events.length, icon: ActivityIcon },
    { label: "Predictions run", value: predictionEvents.length, icon: ActivityIcon },
    {
      label: "Accounts needing a check",
      value: perUser.filter((r) => r.reasons.length > 0).length,
      icon: AlertTriangle,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Administrator area"
        title={`Admin control centre — ${adminUsername}`}
        description="Full privileges: view every member action, compare usage and performance graphs, and remove fake or unauthorised accounts."
      />

      <div className="mx-auto max-w-6xl space-y-10 px-5 py-16">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              refreshAccounts();
              refresh();
            }}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh data
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="size-4" aria-hidden="true" />
            Export activity (CSV)
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              adminLogout();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Log out of admin
          </Button>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="animate-rise rounded-2xl border border-border bg-card p-6 shadow-soft"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <s.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-3xl font-semibold text-foreground">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground">Predictions by screening</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Which prediction service members use most.
            </p>
            <div className="mt-6 h-64">
              {byScreening.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byScreening}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} height={50} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="runs" name="Runs" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground">Usage over the last 7 days</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Logins, report scans and predictions per day.
            </p>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="logins" stroke={CHART_COLORS[0]} strokeWidth={2} />
                  <Line type="monotone" dataKey="scans" stroke={CHART_COLORS[1]} strokeWidth={2} />
                  <Line
                    type="monotone"
                    dataKey="predictions"
                    stroke={CHART_COLORS[3]}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground">Risk levels predicted</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              How model results are spread across low, moderate and elevated risk.
            </p>
            <div className="mt-6 h-64">
              {riskSplit.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskSplit} dataKey="value" nameKey="name" outerRadius={90} label>
                      {riskSplit.map((slice, i) => (
                        <Cell key={slice.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground">Activity per member</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Compare how actively each member uses the platform.
            </p>
            <div className="mt-6 h-64">
              {perUser.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perUser.map((r) => ({ name: r.user.username, ...r }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="predictions" name="Predictions" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="scans" name="Report scans" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="logins" name="Logins" fill={CHART_COLORS[3]} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-foreground">Member accounts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every account stored on this platform, with its usage figures and any warning signs.
          </p>
          {perUser.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No accounts registered yet.</p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[52rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="py-3 pr-4">Member</th>
                    <th className="py-3 pr-4">Contact</th>
                    <th className="py-3 pr-4">BMI</th>
                    <th className="py-3 pr-4">Predictions</th>
                    <th className="py-3 pr-4">Average risk</th>
                    <th className="py-3 pr-4">Last action</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {perUser.map((row) => (
                    <tr key={row.user.username} className="border-b border-border/70 align-top">
                      <td className="py-3 pr-4">
                        <span className="block font-medium text-foreground">
                          {row.user.fullName || row.user.username}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          @{row.user.username} · {row.user.gender || "—"} ·{" "}
                          {row.user.dateOfBirth || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">
                        <span className="block">{row.user.email}</span>
                        <span className="block">{row.user.contactNumber}</span>
                      </td>
                      <td className="py-3 pr-4">{bmiOf(row.user.heightCm, row.user.weightKg) || "—"}</td>
                      <td className="py-3 pr-4">{row.predictions}</td>
                      <td className="py-3 pr-4">{row.predictions ? `${row.avgRisk}%` : "—"}</td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">
                        {row.lastSeen ? new Date(row.lastSeen).toLocaleString() : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {row.reasons.length ? (
                          <span className="inline-flex flex-col gap-1">
                            <span className="rounded-full bg-heart-soft px-2 py-0.5 text-[11px] font-medium text-destructive">
                              Needs a check
                            </span>
                            <span className="text-[11px] leading-snug text-muted-foreground">
                              {row.reasons.join(" · ")}
                            </span>
                          </span>
                        ) : (
                          <span className="rounded-full bg-parkinsons-soft px-2 py-0.5 text-[11px] font-medium text-success">
                            Looks genuine
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {pendingDelete === row.user.username ? (
                          <span className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                adminDeleteAccount(row.user.username);
                                setPendingDelete(null);
                              }}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                              Confirm removal
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPendingDelete(null)}
                            >
                              Cancel
                            </Button>
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPendingDelete(row.user.username)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">All user activity</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Every sign-in, report scan, prediction and account change, newest first.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search member or action"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-56"
                aria-label="Search activity"
              />
              <select
                aria-label="Filter by action"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="all">All actions</option>
                {Object.entries(ACTIVITY_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <Button variant="ghost" onClick={() => clearActivity()}>
                <Eraser className="size-4" aria-hidden="true" />
                Clear log
              </Button>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No activity recorded for this filter yet.
            </p>
          ) : (
            <div className="mt-5 max-h-[28rem] overflow-auto">
              <table className="w-full min-w-[38rem] text-left text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="py-3 pr-4">When</th>
                    <th className="py-3 pr-4">Member</th>
                    <th className="py-3 pr-4">Action</th>
                    <th className="py-3 pr-4">Details</th>
                    <th className="py-3">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((e) => (
                    <tr key={e.id} className="border-b border-border/70">
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                        {new Date(e.at).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 font-medium text-foreground">@{e.username}</td>
                      <td className="py-2.5 pr-4">{ACTIVITY_LABEL[e.type]}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{e.detail ?? "—"}</td>
                      <td className="py-2.5">{e.score !== undefined ? `${e.score}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-secondary/50 p-6">
          <h2 className="text-lg font-semibold text-foreground">Administrator privileges</h2>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {[
              "View every registered account and its full profile details.",
              "See all user activity: sign-ins, report scans, predictions and deletions.",
              "Compare usage and performance with graphs by day, member and screening.",
              "Remove fake or unauthorised accounts, which also clears their activity.",
              "Export the activity records as a spreadsheet file for reporting.",
              "Clear the activity log when records are no longer needed.",
            ].map((line) => (
              <li key={line} className="flex gap-2 rounded-xl border border-border bg-card p-4">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
      No data yet — figures appear as members use the platform.
    </div>
  );
}
