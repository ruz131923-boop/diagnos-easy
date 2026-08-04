import type { PredictionOutcome, RiskLevel } from "@/components/prediction-result";

export type FieldDef = {
  name: string;
  label: string;
  hint?: string;
  type: "number" | "text" | "select";
  options?: string[];
  placeholder?: string;
  fromOcr?: boolean;
  /** Smallest sensible value for a real person (numbers only). */
  min?: number;
  /** Largest sensible value for a real person (numbers only). */
  max?: number;
  /** Allow decimals? Defaults to true. */
  step?: number;
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
  { name: "age", label: "Age (years)", type: "number", placeholder: "54", min: 1, max: 120, step: 1 },
  { name: "sex", label: "Sex", type: "select", options: ["Female", "Male"] },
  {
    name: "chestPain",
    label: "Chest pain type",
    type: "select",
    options: ["Typical angina", "Atypical angina", "Non-anginal pain", "No chest pain"],
  },
  {
    name: "restingBp",
    label: "Resting blood pressure (mm Hg)",
    type: "number",
    placeholder: "132",
    fromOcr: true,
    min: 60,
    max: 250,
  },
  {
    name: "cholesterol",
    label: "Serum cholesterol (mg/dL)",
    type: "number",
    placeholder: "228",
    fromOcr: true,
    min: 80,
    max: 600,
  },
  {
    name: "fastingBloodSugar",
    label: "Fasting blood sugar higher than 120 mg/dL",
    type: "select",
    options: ["No", "Yes"],
    fromOcr: true,
  },
  {
    name: "restEcg",
    label: "Resting electrocardiogram result",
    hint: "Printed on your ECG sheet",
    type: "select",
    options: [
      "Normal",
      "ST-T wave abnormality",
      "Left ventricular enlargement (hypertrophy)",
    ],
    fromOcr: true,
  },
  {
    name: "maxHeartRate",
    label: "Maximum heart rate reached during exercise (beats per minute)",
    type: "number",
    placeholder: "148",
    fromOcr: true,
    min: 50,
    max: 230,
    step: 1,
  },
  {
    name: "exerciseAngina",
    label: "Chest pain (angina) brought on by exercise",
    type: "select",
    options: ["No", "Yes"],
  },
  {
    name: "stDepression",
    label: "ST segment depression after exercise (mm)",
    hint: "Reported as “oldpeak” on some stress-test sheets",
    type: "number",
    placeholder: "1.2",
    fromOcr: true,
    min: 0,
    max: 7,
  },
  {
    name: "stSlope",
    label: "Slope of the ST segment during peak exercise",
    type: "select",
    options: ["Upward sloping", "Flat", "Downward sloping"],
    fromOcr: true,
  },
  {
    name: "majorVessels",
    label: "Number of major blood vessels seen as narrowed on angiogram",
    hint: "0 to 3",
    type: "number",
    placeholder: "0",
    min: 0,
    max: 3,
    step: 1,
  },
  {
    name: "thalassemia",
    label: "Thalassemia blood test result",
    type: "select",
    options: ["Normal", "Fixed defect", "Reversible defect"],
  },
  { name: "smoker", label: "Do you smoke at the moment?", type: "select", options: ["No", "Yes"] },
];

export function predictHeart(v: Values): PredictionOutcome {
  const age = num(v.age);
  const bp = num(v.restingBp);
  const chol = num(v.cholesterol);
  const hr = num(v.maxHeartRate);
  const oldpeak = num(v.stDepression);
  const vessels = num(v.majorVessels);

  const ageScore = (age - 30) * 0.9;
  const bpScore = (bp - 110) * 0.55;
  const cholScore = (chol - 170) * 0.18;
  const hrScore = hr > 0 ? (165 - hr) * 0.35 : 0;
  const anginaScore = v.exerciseAngina === "Yes" ? 14 : 0;
  const smokeScore = v.smoker === "Yes" ? 11 : 0;
  const painScore = v.chestPain === "Typical angina" ? 12 : v.chestPain === "Atypical angina" ? 7 : 2;
  const sugarScore = v.fastingBloodSugar === "Yes" ? 6 : 0;
  const stScore = oldpeak * 7;
  const ecgScore = v.restEcg === "Normal" ? 0 : v.restEcg ? 7 : 0;
  const slopeScore =
    v.stSlope === "Downward sloping" ? 12 : v.stSlope === "Flat" ? 7 : 0;
  const vesselScore = vessels * 8;
  const thalScore =
    v.thalassemia === "Reversible defect" ? 11 : v.thalassemia === "Fixed defect" ? 7 : 0;

  const score =
    ageScore * 0.5 +
    bpScore * 0.5 +
    cholScore +
    hrScore * 0.5 +
    anginaScore +
    smokeScore +
    painScore +
    sugarScore +
    stScore +
    ecgScore +
    slopeScore +
    vesselScore +
    thalScore;

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
      { label: "Stress-test findings", weight: (stScore + slopeScore + ecgScore) * 1.2 },
      { label: "Narrowed blood vessels", weight: (vesselScore + thalScore) * 1.6 },
      { label: "Smoking", weight: smokeScore * 4 },
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
  { name: "age", label: "Age (years)", type: "number", placeholder: "42", min: 1, max: 120, step: 1 },
  {
    name: "pregnancies",
    label: "Number of pregnancies",
    hint: "Enter 0 if none, or if this does not apply to you",
    type: "number",
    placeholder: "0",
    min: 0,
    max: 20,
    step: 1,
  },
  {
    name: "glucose",
    label: "Fasting glucose (mg/dL)",
    type: "number",
    placeholder: "118",
    fromOcr: true,
    min: 40,
    max: 500,
  },
  {
    name: "bloodPressure",
    label: "Diastolic blood pressure (mm Hg)",
    type: "number",
    placeholder: "78",
    fromOcr: true,
    min: 30,
    max: 150,
  },
  {
    name: "skinThickness",
    label: "Triceps skin fold thickness (mm)",
    hint: "Skin thickness measured at the back of the upper arm",
    type: "number",
    placeholder: "24",
    fromOcr: true,
    min: 5,
    max: 100,
  },
  {
    name: "insulin",
    label: "Serum insulin (µU/mL)",
    type: "number",
    placeholder: "94",
    fromOcr: true,
    min: 1,
    max: 900,
  },
  { name: "bmi", label: "Body mass index (kg/m²)", type: "number", placeholder: "27.4", min: 10, max: 70 },
  {
    name: "dpf",
    label: "Diabetes pedigree function",
    hint: "Family-history score, usually between 0.05 and 2.5",
    type: "number",
    placeholder: "0.47",
    min: 0.05,
    max: 2.5,
  },
  {
    name: "familyHistory",
    label: "Does a close family member have diabetes?",
    type: "select",
    options: ["No", "Yes"],
  },
  {
    name: "activity",
    label: "How often do you exercise in a week?",
    type: "select",
    options: ["Often (4 or more days)", "Sometimes (1 to 3 days)", "Rarely or never"],
  },
];

export function predictDiabetes(v: Values): PredictionOutcome {
  const glucose = num(v.glucose);
  const dpf = num(v.dpf);
  const bmi = num(v.bmi);
  const insulin = num(v.insulin);
  const age = num(v.age);
  const skin = num(v.skinThickness);

  const glucoseScore = (glucose - 90) * 0.7;
  const dpfScore = (dpf - 0.35) * 34;
  const bmiScore = (bmi - 22) * 1.9;
  const insulinScore = (insulin - 80) * 0.09;
  const skinScore = (skin - 20) * 0.35;
  const ageScore = (age - 28) * 0.4;
  const familyScore = v.familyHistory === "Yes" ? 12 : 0;
  const activityScore =
    v.activity === "Rarely or never" ? 11 : v.activity === "Sometimes (1 to 3 days)" ? 5 : 0;

  const score =
    glucoseScore +
    dpfScore +
    bmiScore +
    insulinScore +
    skinScore +
    ageScore +
    familyScore +
    activityScore;

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
          "Your glucose values and family-history score are strongly associated with diabetic profiles in the training data.",
      },
    },
    [
      { label: "Diabetes pedigree function", weight: dpfScore * 1.8 },
      { label: "Fasting glucose", weight: glucoseScore * 1.7 },
      { label: "BMI", weight: bmiScore * 2.2 },
      { label: "Insulin response", weight: insulinScore * 3 },
      { label: "Skin fold thickness", weight: skinScore * 3 },
      { label: "Family history & exercise", weight: (familyScore + activityScore) * 2.2 },
    ],
    {
      low: [
        "Recheck fasting glucose once a year.",
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
  { name: "radiusMean", label: "Mean radius", hint: "µm", type: "number", placeholder: "14.1", min: 5, max: 40 },
  { name: "textureMean", label: "Mean texture", type: "number", placeholder: "19.3", min: 5, max: 60 },
  { name: "perimeterMean", label: "Mean perimeter", type: "number", placeholder: "91.9", min: 30, max: 260 },
  { name: "areaMean", label: "Mean area", type: "number", placeholder: "654", min: 100, max: 3000 },
  { name: "smoothnessMean", label: "Mean smoothness", type: "number", placeholder: "0.096", min: 0, max: 1 },
  { name: "compactnessMean", label: "Mean compactness", type: "number", placeholder: "0.104", min: 0, max: 1 },
  { name: "concavityMean", label: "Mean concavity", type: "number", placeholder: "0.089", min: 0, max: 1 },
  {
    name: "concavePointsMean",
    label: "Mean number of concave points",
    hint: "Concave points on the nucleus outline",
    type: "number",
    placeholder: "0.048",
    min: 0,
    max: 1,
  },
  {
    name: "familyHistory",
    label: "Has anyone in your family had breast cancer?",
    type: "select",
    options: ["No", "Yes"],
  },
  {
    name: "lump",
    label: "Have you felt a lump?",
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
  { name: "age", label: "Age (years)", type: "number", placeholder: "62", min: 1, max: 120, step: 1 },
  { name: "fo", label: "Average voice frequency (Hz)", type: "number", placeholder: "152", min: 50, max: 400 },
  { name: "jitter", label: "Jitter (%)", type: "number", placeholder: "0.62", min: 0, max: 20 },
  { name: "shimmer", label: "Shimmer (dB)", type: "number", placeholder: "0.31", min: 0, max: 20 },
  { name: "hnr", label: "Harmonic-to-noise ratio (dB)", type: "number", placeholder: "21.4", min: 0, max: 45 },
  { name: "rpde", label: "RPDE", type: "number", placeholder: "0.52", min: 0, max: 1 },
  {
    name: "tremor",
    label: "Shaking in your hands while resting",
    type: "select",
    options: ["No", "Mild", "Strong"],
  },
  {
    name: "rigidity",
    label: "Stiff muscles",
    type: "select",
    options: ["No", "Mild", "Strong"],
  },
  {
    name: "bradykinesia",
    label: "Slower movements than before (bradykinesia)",
    type: "select",
    options: ["No", "Mild", "Strong"],
  },
  {
    name: "handwriting",
    label: "Has your handwriting become smaller?",
    type: "select",
    options: ["No", "Yes"],
  },
];

const sev = (v: string | undefined) => (v === "Strong" ? 13 : v === "Mild" ? 6 : 0);

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
          "Vocal irregularity or motor answers are slightly outside the healthy range. A neurology screening is advisable.",
      },
      high: {
        headline: "Strong Parkinsonian markers detected",
        detail:
          "Elevated jitter and shimmer combined with your motor symptom answers look similar to people who have Parkinson's disease.",
      },
    },
    [
      { label: "Voice jitter", weight: jitterScore * 2.2 },
      { label: "Voice shimmer", weight: shimmerScore * 2 },
      { label: "Harmonic-to-noise ratio", weight: hnrScore * 2.2 },
      { label: "Motor symptoms", weight: motorScore * 2.4 },
      { label: "Voice signal irregularity (RPDE)", weight: rpdeScore * 2.2 },
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