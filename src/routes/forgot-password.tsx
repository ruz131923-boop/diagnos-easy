import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Your Password — VitalSense" },
      {
        name: "description",
        content:
          "Recover access to your VitalSense account by verifying your username and setting a new password.",
      },
      { property: "og:title", content: "Reset Your Password — VitalSense" },
      {
        property: "og:description",
        content: "Securely recover access to your VitalSense prediction account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { accountExists, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        eyebrow="Account recovery"
        title="Forgot your password?"
        description="Verify your account, confirm the one-time code sent to your registered email, then choose a new password. For your safety we never reveal account details to anyone but the account owner."
      />
      <div className="mx-auto max-w-md px-5 py-16">
        <ol className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
          {["Verify", "Code", "New password"].map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex size-7 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors duration-300 ${
                  step > i
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <span className={step === i + 1 ? "font-medium text-foreground" : ""}>{label}</span>
            </li>
          ))}
        </ol>

        <div className="animate-rise rounded-2xl border border-border bg-card p-8 shadow-soft">
          {step === 1 ? (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!username.trim()) {
                  setError("Please enter your username.");
                  return;
                }
                if (!accountExists(username)) {
                  setError("We could not find an account with that username.");
                  return;
                }
                setError(null);
                setStep(2);
                toast.info("Recovery code sent", {
                  description: "Use code 123456 in this prototype.",
                });
              }}
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <KeyRound className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-semibold text-foreground">Verify your account</h2>
              <div className="space-y-2">
                <Label htmlFor="ru">Username</Label>
                <Input id="ru" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              {error ? (
                <p className="rounded-lg bg-heart-soft px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <Button type="submit" className="w-full">
                Send recovery code
              </Button>
            </form>
          ) : null}

          {step === 2 ? (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim() !== "123456") {
                  setError("That code is not valid. In this prototype the code is 123456.");
                  return;
                }
                setError(null);
                setStep(3);
              }}
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <MailCheck className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-semibold text-foreground">Enter the 6-digit code</h2>
              <p className="text-sm text-muted-foreground">
                A one-time code was sent to the email registered on this account.
              </p>
              <div className="space-y-2">
                <Label htmlFor="code">Recovery code</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                />
              </div>
              {error ? (
                <p className="rounded-lg bg-heart-soft px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <Button type="submit" className="w-full">
                Verify code
              </Button>
            </form>
          ) : null}

          {step === 3 ? (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (password.length < 8) {
                  setError("Passwords must be at least 8 characters long.");
                  return;
                }
                if (password !== confirm) {
                  setError("The two passwords do not match.");
                  return;
                }
                const result = resetPassword(username, password);
                if (!result.ok) {
                  setError(result.error ?? "Unable to reset password.");
                  return;
                }
                toast.success("Password updated", { description: "You can now log in." });
                navigate({ to: "/login" });
              }}
            >
              <h2 className="text-xl font-semibold text-foreground">Choose a new password</h2>
              <div className="space-y-2">
                <Label htmlFor="np">New password</Label>
                <Input
                  id="np"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp">Confirm new password</Label>
                <Input
                  id="cp"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {error ? (
                <p className="rounded-lg bg-heart-soft px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <Button type="submit" className="w-full">
                Update password
              </Button>
            </form>
          ) : null}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </>
  );
}