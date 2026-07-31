import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { TermsText } from "@/components/terms-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth, type StoredUser } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Your Account — VitalSense" },
      {
        name: "description",
        content:
          "Register with your personal, medical and account details to unlock VitalSense disease risk predictions.",
      },
      { property: "og:title", content: "Create Your Account — VitalSense" },
      {
        property: "og:description",
        content: "One registration unlocks all four VitalSense prediction services.",
      },
    ],
  }),
  component: RegisterPage,
});

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Female", "Male", "Prefer not to say"];

const empty: StoredUser = {
  fullName: "",
  nameWithInitials: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  contactNumber: "",
  heightCm: "",
  weightKg: "",
  bloodGroup: "",
  username: "",
  password: "",
};

function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="animate-rise rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8"
      style={{ animationDelay: `${step * 90}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          {step}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  options,
  hint,
  min,
  max,
  maxLength,
  reveal,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  options?: string[];
  hint?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  reveal?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && reveal && show ? "text" : type;

  const handleChange = (raw: string) => {
    if (type === "number") {
      // positive numbers only
      onChange(raw.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"));
      return;
    }
    if (type === "tel") {
      onChange(raw.replace(/[^0-9]/g, "").slice(0, 10));
      return;
    }
    onChange(raw);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {options ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors duration-300 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <Input
            id={id}
            type={inputType}
            value={value}
            placeholder={placeholder}
            min={type === "number" ? (min ?? 0) : undefined}
            max={type === "number" ? max : undefined}
            maxLength={maxLength}
            inputMode={type === "number" || type === "tel" ? "numeric" : undefined}
            className={isPassword && reveal ? "pr-10" : undefined}
            onKeyDown={(e) => {
              if ((type === "number" || type === "tel") && (e.key === "-" || e.key === "+" || e.key === "e"))
                e.preventDefault();
            }}
            onChange={(e) => handleChange(e.target.value)}
          />
          {isPassword && reveal ? (
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          ) : null}
        </div>
      )}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function RegisterPage() {
  const { register, user, hasAccount, ready } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<StoredUser>(empty);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMedical, setAgreeMedical] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof StoredUser) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const ageFromDob = (dob: string) => {
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return NaN;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
    return age;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: [keyof StoredUser, string][] = [
      ["fullName", "Full name"],
      ["nameWithInitials", "Name with initials"],
      ["dateOfBirth", "Date of birth"],
      ["gender", "Gender"],
      ["email", "Email address"],
      ["contactNumber", "Contact number"],
      ["heightCm", "Height"],
      ["weightKg", "Weight"],
      ["bloodGroup", "Blood group"],
      ["username", "Username"],
      ["password", "Password"],
    ];
    const missing = required.find(([key]) => !form[key].trim());
    if (missing) {
      setError(`${missing[1]} is required.`);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(form.contactNumber)) {
      setError("Contact number must be exactly 10 digits, with no spaces or symbols.");
      return;
    }
    const age = ageFromDob(form.dateOfBirth);
    if (!Number.isFinite(age) || age < 1 || age > 120) {
      setError("Please enter a real date of birth (age must be between 1 and 120 years).");
      return;
    }
    const height = Number(form.heightCm);
    if (!Number.isFinite(height) || height < 50 || height > 250) {
      setError("Height must be a positive value between 50 cm and 250 cm.");
      return;
    }
    const weight = Number(form.weightKg);
    if (!Number.isFinite(weight) || weight < 10 || weight > 300) {
      setError("Weight must be a positive value between 10 kg and 300 kg.");
      return;
    }
    if (form.username.trim().length < 4) {
      setError("Usernames must be at least 4 characters long.");
      return;
    }
    if (
      form.password.length < 8 ||
      !/[A-Za-z]/.test(form.password) ||
      !/\d/.test(form.password) ||
      !/[^A-Za-z0-9]/.test(form.password)
    ) {
      setError(
        "Password must be at least 8 characters and include at least one letter, one number and one special character (for example ! @ # $).",
      );
      return;
    }
    if (form.password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }
    if (!agreeTerms || !agreeMedical) {
      setError("Please accept both the terms and the medical data consent to continue.");
      return;
    }
    const result = register({ ...form, username: form.username.trim() });
    if (!result.ok) {
      setError(result.error ?? "Registration failed.");
      return;
    }
    setError(null);
    toast.success("Account created", { description: "All prediction services are now unlocked." });
    navigate({ to: "/dashboard" });
  };

  return (
    <>
      {ready && (user || hasAccount) ? (
        <>
          <PageHeader
            eyebrow="Registration"
            title={user ? "You are already registered" : "This device already has an account"}
            description="Our terms allow only one account per person, so there is no need to register again."
          />
          <div className="mx-auto max-w-xl px-5 py-20">
            <div className="animate-rise rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                {user ? (
                  <UserCheck className="size-6" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="size-6" aria-hidden="true" />
                )}
              </span>
              <h2 className="mt-5 text-xl font-semibold text-foreground">
                {user
                  ? `You are logged in as ${user.nameWithInitials || user.username}`
                  : "An account already exists"}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                {user
                  ? "Your account is active, so all prediction tools are already unlocked. Go to your dashboard to start a prediction."
                  : "You have registered before. Please log in with your username and password. If you forgot your password, you can reset it."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {user ? (
                  <Link to="/dashboard">
                    <Button>Go to my dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button>Log in</Button>
                    </Link>
                    <Link to="/forgot-password">
                      <Button variant="outline">Forgot password</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <RegisterForm />
      )}
    </>
  );

  function RegisterForm() {
    return (
      <>
      <PageHeader
        eyebrow="Registration"
        title="Create your VitalSense account"
        description="One account gives you all four prediction services. Test values for each disease are asked for later, on each prediction page."
      />

      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6 px-5 py-16">
        <Section
          step={1}
          title="Personal details"
          description="Used to personalise your reports and to adjust the results for your age."
        >
          <Field id="fullName" label="Full name" value={form.fullName} onChange={set("fullName")} placeholder="Amara Nadeesha Perera" />
          <Field
            id="nameWithInitials"
            label="Name with initials"
            value={form.nameWithInitials}
            onChange={set("nameWithInitials")}
            placeholder="A. N. Perera"
          />
          <Field id="dateOfBirth" label="Date of birth" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
          <Field id="gender" label="Gender" value={form.gender} onChange={set("gender")} options={GENDERS} />
          <Field id="email" label="Email address" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
          <Field
            id="contactNumber"
            label="Contact number"
            type="tel"
            value={form.contactNumber}
            onChange={set("contactNumber")}
            placeholder="0712345678"
            maxLength={10}
            hint="Exactly 10 digits, numbers only."
          />
        </Section>

        <Section
          step={2}
          title="Medical details"
          description="Your basic body measurements. We use your height and weight to work out your BMI."
        >
          <Field
            id="heightCm"
            label="Height (cm)"
            type="number"
            value={form.heightCm}
            onChange={set("heightCm")}
            placeholder="168"
            min={50}
            max={250}
            hint="Enter a value between 50 cm and 250 cm."
          />
          <Field
            id="weightKg"
            label="Weight (kg)"
            type="number"
            value={form.weightKg}
            onChange={set("weightKg")}
            placeholder="64"
            min={10}
            max={300}
            hint="Enter a value between 10 kg and 300 kg."
          />
          <Field id="bloodGroup" label="Blood group" value={form.bloodGroup} onChange={set("bloodGroup")} options={BLOOD_GROUPS} />
        </Section>

        <Section
          step={3}
          title="Account details"
          description="Your username and password are all you need to log in."
        >
          <Field id="username" label="Username" value={form.username} onChange={set("username")} placeholder="anperera" />
          <div className="hidden sm:block" aria-hidden="true" />
          <Field
            id="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={set("password")}
            reveal
            hint="At least 8 characters with one letter, one number and one special character (! @ # $ …)."
          />
          <Field
            id="confirmPassword"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            reveal
          />
        </Section>

        <section
          className="animate-rise rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8"
          style={{ animationDelay: "360ms" }}
        >
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              4
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Terms and consent</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Please read the terms below before creating your account.
              </p>
            </div>
          </div>

          <ScrollArea className="mt-6 h-64 rounded-xl border border-border bg-secondary/40 p-5">
            <TermsText compact />
          </ScrollArea>

          <div className="mt-6 space-y-4">
            <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <Checkbox
                checked={agreeTerms}
                onCheckedChange={(v) => setAgreeTerms(v === true)}
                className="mt-0.5"
                aria-label="Agree to terms and conditions"
              />
              <span>
                I have read and agree to the{" "}
                <Link to="/terms" className="font-medium text-primary hover:underline">
                  Terms &amp; Conditions
                </Link>
                ,{" "}
                <Link to="/privacy-policy" className="font-medium text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link to="/cookie-policy" className="font-medium text-primary hover:underline">
                  Cookie Policy
                </Link>
                .
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <Checkbox
                checked={agreeMedical}
                onCheckedChange={(v) => setAgreeMedical(v === true)}
                className="mt-0.5"
                aria-label="Consent to medical data processing"
              />
              <span>
                I consent to VitalSense processing my medical details, uploaded reports and extracted
                values for the sole purpose of generating disease risk predictions for me, and I
                understand results are not a medical diagnosis.
              </span>
            </label>
          </div>

          {error ? (
            <p className="animate-soft-fade mt-6 rounded-lg bg-heart-soft px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg">
              Create account
            </Button>
            <p className="text-sm text-muted-foreground">
              Already registered?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </section>
      </form>
      </>
    );
  }
}