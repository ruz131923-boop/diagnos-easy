export const SITE_NAME = "VitalSense";
export const SITE_TAGLINE = "Early insight for heart, metabolic, oncological and neurological risk.";

export type DiseaseKey = "heart" | "diabetes" | "breast-cancer" | "parkinsons";

export type DiseaseMeta = {
  key: DiseaseKey;
  path: "/heart-disease" | "/diabetes" | "/breast-cancer" | "/parkinsons";
  name: string;
  short: string;
  method: string;
  accent: string;
  soft: string;
};

export const DISEASES: DiseaseMeta[] = [
  {
    key: "heart",
    path: "/heart-disease",
    name: "Heart Disease",
    short:
      "Cardiovascular risk estimated from lipid panels, blood pressure and resting ECG features.",
    method: "Report OCR + clinical form · Gradient boosting model",
    accent: "text-heart",
    soft: "bg-heart-soft",
  },
  {
    key: "diabetes",
    path: "/diabetes",
    name: "Diabetes",
    short: "Type 2 diabetes likelihood from glucose, HbA1c, BMI and family history signals.",
    method: "Report OCR + clinical form · Random forest model",
    accent: "text-diabetes",
    soft: "bg-diabetes-soft",
  },
  {
    key: "breast-cancer",
    path: "/breast-cancer",
    name: "Breast Cancer",
    short:
      "Benign vs. malignant tendency from fine-needle aspirate cell nuclei measurements you enter.",
    method: "Cytology measurements · Support vector classifier",
    accent: "text-breast",
    soft: "bg-breast-soft",
  },
  {
    key: "parkinsons",
    path: "/parkinsons",
    name: "Parkinson's Disease",
    short: "Neurological risk from sustained-vowel voice features and motor symptom screening.",
    method: "Voice feature analysis · XGBoost model",
    accent: "text-parkinsons",
    soft: "bg-parkinsons-soft",
  },
];

export const FOOTER_LINKS: { heading: string; links: { label: string; to: string }[] }[] = [
  {
    heading: "Predictions",
    links: [
      { label: "Heart Disease", to: "/heart-disease" },
      { label: "Diabetes", to: "/diabetes" },
      { label: "Breast Cancer", to: "/breast-cancer" },
      { label: "Parkinson's Disease", to: "/parkinsons" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "Home", to: "/" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "My Dashboard", to: "/dashboard" },
      { label: "About Us", to: "/about" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Register", to: "/register" },
      { label: "Log In", to: "/login" },
      { label: "Forgot Password", to: "/forgot-password" },
      { label: "Contact", to: "/about" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Cookie Policy", to: "/cookie-policy" },
    ],
  },
];