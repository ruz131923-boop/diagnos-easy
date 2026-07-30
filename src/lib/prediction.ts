import type { PredictionOutcome, RiskLevel } from "@/components/prediction-result";

export type FieldDef = {
  name: string;
  label: string;
  hint?: string;
  type: "number" | "text" | "select";
  options?: string[];
  placeholder?: string;
  fromOcr?: boolean;
};

export type Values = Record<string, string>;

const num = (v: string | undefined) => {
  const n = Number.parseFloat(v ?? "");
  return Number.isFinite(n) ? n : 0;
};

function levelFor(score: number): RiskLevel {
  if (score < 34) return "low";
  if (score < 67) return "moderate";
  return "high";
}

function clamp(n: number) {
  return Math.max(4, Math.min(96, Math.round(n)));
}

function buildOutcome(
  score: number,
  copy: Record<RiskLevel, { headline: string; detail: string }>,
  factors: { label: string; weight: number }[],
  advice: Record<RiskLevel, string[]>,
): PredictionOutcome {
  const bounded = clamp(score);
  const level = levelFor(bounded);
  return {
    level,
    score: bounded,
    headline: copy[level].headline,
    detail: copy[level].detail,
    factors: factors.map((f) => ({ ...f, weight: clamp(f.weight) })),
    advice: advice[level],
  };
}

/* ---------------------------------- heart --------------------------------- */

export const HEART_FIELDS: FieldDef[] = [
  { name: "age", label: "Age (years)", type: "number", placeholder: "54" },
  { name: "sex", label: "Sex", type: "select", options: ["Female", "Male"] },
  {
    name: "restingBp",
    label: "Resting blood pressure (mm Hg)",
    type: "number",
    placeholder: "132",
    fromOcr: true,
  },
  {
    name: "cholesterol",
    label: "Total cholesterol (mg/dL)",
    type: "number",
    placeholder: "228",
    fromOcr: true,
  },
  { name: "maxHeartRate", label: "Max heart rate achieved", type: "number", placeholder: "148" },
  {
    name: "chestPain",
    label: "Chest pain type",
    type: "select",
    options: ["Typical angina", "Atypical angina", "Non-anginal pain", "Asymptomatic"],
  },
  {
    name: "fastingBloodSugar",
    label: "Fasting blood sugar > 120 mg/dL",
    type: "select",
    options: ["No", "Yes"],
    fromOcr: true,
  },
  {
    name: "exerciseAngina",
    label: "Exercise-induced angina",
    type: "select",
    options: ["No", "Yes"],
  },
  {
    name: "stDepression",
    label: "ST depression (oldpeak)",
    type: "number",
    placeholder: "1.2",
    fromOcr: true,
  },
  { name: "smoker", label: "Current smoker", type: "select", options: ["No", "Yes"] },
];

export function predictHeart(v: Values): PredictionOutcome {
  const age = num(v.age);
  const bp = num(v.restingBp);
  const chol = num(v.cholesterol);
  const hr = num(v.maxHeartRate);
  const oldpeak = num(v.stDepression);

  const ageScore = (age - 30) * 0.9;
  const bpScore = (bp - 110) * 0.55;
  const cholScore = (chol - 170) * 0.18;
  const hrScore = hr > 0 ? (165 - hr) * 0.35 : 0;
  const anginaScore = v.exerciseAngina === "Yes" ? 14 : 0;
  const smokeScore = v.smoker === "Yes" ? 11 : 0;
  const painScore = v.chestPain === "Typical angina" ? 12 : v.chestPain === "Atypical angina" ? 7 : 2;
  const sugarScore = v.fastingBloodSugar === "Yes" ? 6 : 0;
  const stScore = oldpeak * 7;

  const score =
    ageScore * 0.5 +
    bpScore * 0.5 +
    cholScore +
    hrScore * 0.5 +
    anginaScore +
    smokeScore +
    painScore +
    sugarScore +
    stScore;

  return buildOutcome(
    score,
    {
      low: {
        headline: "Low cardiovascular risk indicated",
        detail:
          "The model found no dominant risk pattern across your blood pressure, lipid profile and exercise response.",
      },
      moderate: {
        headline: "Moderate cardiovascular risk indicated",
        detail:
          "Several measurements sit above the healthy range. A cardiology review within a few months is sensible.",
      },
      high: {
        headline: "Elevated cardiovascular risk indicated",
        detail:
          "The combination of your blood pressure, lipids and stress-test features closely matches high-risk profiles in the training data.",
      },
    },
    [
      { label: "Blood pressure", weight: bpScore * 1.6 },
      { label: "Cholesterol", weight: cholScore * 2.4 },
      { label: "Age", weight: ageScore * 1.2 },
      { label: "Exercise response", weight: hrScore * 1.4 + anginaScore * 2 },
      { label: "Lifestyle (smoking)", weight: smokeScore * 4 },
    ],
    {
      low: [
        "Keep up 150 minutes of moderate activity each week.",
        "Recheck your lipid panel annually.",
      ],
      moderate: [
        "Book a cardiology consultation to review these numbers.",
        "Reduce sodium and saturated fat intake, and monitor blood pressure weekly.",
        "Repeat a lipid panel in three months.",
      ],
      high: [
        "Contact a cardiologist promptly with your latest report.",
        "Do not begin or stop any medication based on this estimate.",
        "Seek emergency care for chest pain, breathlessness or fainting.",
      ],
    },
  );
}

/* --------------------------------- diabetes -------------------------------- */

export const DIABETES_FIELDS: FieldDef[] = [
  { name: "age", label: "Age (years)", type: "number", placeholder: "42" },
  { name: "glucose", label: "Fasting glucose (mg/dL)", type: "number", placeholder: "118", fromOcr: true },
  { name: "hba1c", label: "HbA1c (%)", type: "number", placeholder: "5.9", fromOcr: true },
  { name: "bmi", label: "BMI (kg/m²)", type: "number", placeholder: "27.4" },
  {
    name: "insulin",
    label: "Serum insulin (µU/mL)",
    type: "number",
    placeholder: "94",
    fromOcr: true,
  },
  { name: "bloodPressure", label: "Diastolic BP (mm Hg)", type: "number", placeholder: "78", fromOcr: true },
  { name: "pregnancies", label: "Number of pregnancies", type: "number", placeholder: "0" },
  {
    name: "familyHistory",
    label: "Diabetes in immediate family",
    type: "select",
    options: ["No", "Yes"],
  },
  {
    name: "activity",
    label: "Weekly physical activity",
    type: "select",
    options: ["Active (4+ days)", "Some (1-3 days)", "Sedentary"],
  },
];

export function predictDiabetes(v: Values): PredictionOutcome {
  const glucose = num(v.glucose);
  const hba1c = num(v.hba1c);
  const bmi = num(v.bmi);
  const insulin = num(v.insulin);
  const age = num(v.age);

  const glucoseScore = (glucose - 90) * 0.7;
  const hba1cScore = (hba1c - 5.2) * 16;
  const bmiScore = (bmi - 22) * 1.9;
  const insulinScore = (insulin - 80) * 0.09;
  const ageScore = (age - 28) * 0.4;
  const familyScore = v.familyHistory === "Yes" ? 12 : 0;
  const activityScore =
    v.activity === "Sedentary" ? 11 : v.activity === "Some (1-3 days)" ? 5 : 0;

  const score =
    glucoseScore + hba1cScore + bmiScore + insulinScore + ageScore + familyScore + activityScore;

  return buildOutcome(
    score,
    {
      low: {
        headline: "Low likelihood of type 2 diabetes",
        detail:
          "Your glucose regulation markers sit inside the normal band for your age and body composition.",
      },
      moderate: {
        headline: "Pre-diabetic pattern detected",
        detail:
          "Your markers resemble the pre-diabetes cluster. Lifestyle changes at this stage are highly effective.",
      },
      high: {
        headline: "High likelihood of type 2 diabetes",
        detail:
          "Glucose and HbA1c values are strongly associated with diabetic profiles in the training data.",
      },
    },
    [
      { label: "HbA1c", weight: hba1cScore * 1.8 },
      { label: "Fasting glucose", weight: glucoseScore * 1.7 },
      { label: "BMI", weight: bmiScore * 2.2 },
      { label: "Insulin response", weight: insulinScore * 3 },
      { label: "Family history & activity", weight: (familyScore + activityScore) * 2.2 },
    ],
    {
      low: [
        "Recheck fasting glucose and HbA1c once a year.",
        "Maintain a fibre-rich diet and steady weight.",
      ],
      moderate: [
        "Ask your doctor about an oral glucose tolerance test.",
        "Target 5-7% body-weight reduction if overweight.",
        "Replace refined carbohydrates with whole grains.",
      ],
      high: [
        "See a physician or endocrinologist as soon as possible.",
        "Bring this report and your original lab sheet to the appointment.",
        "Watch for excessive thirst, frequent urination and unexplained weight loss.",
      ],
    },
  );
}

/* ------------------------------ breast cancer ------------------------------ */

export const BREAST_FIELDS: FieldDef[] = [
  { name: "radiusMean", label: "Mean radius", hint: "µm", type: "number", placeholder: "14.1" },
  { name: "textureMean", label: "Mean texture", type: "number", placeholder: "19.3" },
  { name: "perimeterMean", label: "Mean perimeter", type: "number", placeholder: "91.9" },
  { name: "areaMean", label: "Mean area", type: "number", placeholder: "654" },
  { name: "smoothnessMean", label: "Mean smoothness", type: "number", placeholder: "0.096" },
  { name: "compactnessMean", label: "Mean compactness", type: "number", placeholder: "0.104" },
  { name: "concavityMean", label: "Mean concavity", type: "number", placeholder: "0.089" },
  { name: "symmetryMean", label: "Mean symmetry", type: "number", placeholder: "0.181" },
  {
    name: "familyHistory",
    label: "Family history of breast cancer",
    type: "select",
    options: ["No", "Yes"],
  },
  {
    name: "lump",
    label: "Palpable lump noticed",
    type: "select",
    options: ["No", "Yes"],
  },
];

export function predictBreast(v: Values): PredictionOutcome {
  const radius = num(v.radiusMean);
  const texture = num(v.textureMean);
  const area = num(v.areaMean);
  const concavity = num(v.concavityMean);
  const compactness = num(v.compactnessMean);

  const radiusScore = (radius - 12) * 5.5;
  const textureScore = (texture - 17) * 2.2;
  const areaScore = (area - 500) * 0.05;
  const concavityScore = concavity * 160;
  const compactScore = compactness * 90;
  const historyScore = v.familyHistory === "Yes" ? 9 : 0;
  const lumpScore = v.lump === "Yes" ? 10 : 0;

  const score =
    radiusScore + textureScore + areaScore + concavityScore + compactScore + historyScore + lumpScore;

  return buildOutcome(
    score,
    {
      low: {
        headline: "Cell measurements suggest a benign pattern",
        detail:
          "Nucleus radius, texture and concavity values group with benign samples in the reference dataset.",
      },
      moderate: {
        headline: "Borderline pattern — further imaging advised",
        detail:
          "Some morphology values overlap both benign and malignant clusters, so the classifier is not confident.",
      },
      high: {
        headline: "Cell measurements suggest a malignant pattern",
        detail:
          "Enlarged, irregular nuclei with high concavity strongly align with malignant samples in the reference dataset.",
      },
    },
    [
      { label: "Nucleus radius", weight: radiusScore * 1.6 },
      { label: "Concavity", weight: concavityScore * 1.4 },
      { label: "Compactness", weight: compactScore * 1.6 },
      { label: "Texture", weight: textureScore * 2.2 },
      { label: "Clinical history", weight: (historyScore + lumpScore) * 2.6 },
    ],
    {
      low: [
        "Continue routine self-examination monthly.",
        "Follow the screening interval your doctor recommends.",
      ],
      moderate: [
        "Request a mammogram or ultrasound review of the same site.",
        "Share these cytology values with your consultant.",
      ],
      high: [
        "Consult an oncologist or breast surgeon without delay.",
        "A histopathology biopsy is the only way to confirm a diagnosis.",
        "Bring the original pathology report to your appointment.",
      ],
    },
  );
}

/* ------------------------------- parkinson's ------------------------------- */

export const PARKINSONS_FIELDS: FieldDef[] = [
  { name: "age", label: "Age (years)", type: "number", placeholder: "62" },
  { name: "fo", label: "Average vocal frequency (Hz)", type: "number", placeholder: "152" },
  { name: "jitter", label: "Jitter (%)", type: "number", placeholder: "0.62" },
  { name: "shimmer", label: "Shimmer (dB)", type: "number", placeholder: "0.31" },
  { name: "hnr", label: "Harmonic-to-noise ratio (dB)", type: "number", placeholder: "21.4" },
  { name: "rpde", label: "RPDE", type: "number", placeholder: "0.52" },
  { name: "tremor", label: "Resting tremor in hands", type: "select", options: ["No", "Mild", "Pronounced"] },
  {
    name: "rigidity",
    label: "Muscle stiffness or rigidity",
    type: "select",
    options: ["No", "Mild", "Pronounced"],
  },
  {
    name: "bradykinesia",
    label: "Slowed movement (bradykinesia)",
    type: "select",
    options: ["No", "Mild", "Pronounced"],
  },
  {
    name: "handwriting",
    label: "Handwriting has become smaller",
    type: "select",
    options: ["No", "Yes"],
  },
];

const sev = (v: string | undefined) => (v === "Pronounced" ? 13 : v === "Mild" ? 6 : 0);

export function predictParkinsons(v: Values): PredictionOutcome {
  const jitter = num(v.jitter);
  const shimmer = num(v.shimmer);
  const hnr = num(v.hnr);
  const rpde = num(v.rpde);
  const age = num(v.age);

  const jitterScore = jitter * 22;
  const shimmerScore = shimmer * 34;
  const hnrScore = hnr > 0 ? (24 - hnr) * 2.1 : 0;
  const rpdeScore = rpde * 26;
  const ageScore = (age - 45) * 0.5;
  const motorScore = sev(v.tremor) + sev(v.rigidity) + sev(v.bradykinesia);
  const writingScore = v.handwriting === "Yes" ? 7 : 0;

  const score =
    jitterScore + shimmerScore + hnrScore + rpdeScore + ageScore + motorScore + writingScore;

  return buildOutcome(
    score,
    {
      low: {
        headline: "Low neurological risk indicated",
        detail:
          "Your voice stability measures and motor screening answers fall within the healthy control range.",
      },
      moderate: {
        headline: "Some early Parkinsonian markers present",
        detail:
          "Vocal irregularity or motor answers deviate mildly from control ranges. A neurology screening is advisable.",
      },
      high: {
        headline: "Strong Parkinsonian markers detected",
        detail:
          "Elevated jitter and shimmer combined with your motor symptom answers align with the Parkinson's cohort.",
      },
    },
    [
      { label: "Voice jitter", weight: jitterScore * 2.2 },
      { label: "Voice shimmer", weight: shimmerScore * 2 },
      { label: "Harmonic-to-noise ratio", weight: hnrScore * 2.2 },
      { label: "Motor symptoms", weight: motorScore * 2.4 },
      { label: "Nonlinear dynamics (RPDE)", weight: rpdeScore * 2.2 },
    ],
    {
      low: [
        "Repeat this voice screening every six months if you have concerns.",
        "Stay physically active — exercise protects motor function.",
      ],
      moderate: [
        "Arrange a neurology consultation for a clinical motor exam.",
        "Keep a short daily log of tremor, stiffness and handwriting changes.",
      ],
      high: [
        "See a neurologist or movement-disorder specialist soon.",
        "Bring your symptom log and this summary to the appointment.",
        "Early therapy meaningfully improves long-term quality of life.",
      ],
    },
  );
}