import { createFileRoute } from "@tanstack/react-router";

import { DiseasePage } from "@/components/disease-page";
import { DIABETES_FIELDS, predictDiabetes } from "@/lib/prediction";
import diabetesImage from "@/assets/diabetes.jpg";

export const Route = createFileRoute("/diabetes")({
  head: () => ({
    meta: [
      { title: "Diabetes Risk Prediction — VitalSense" },
      {
        name: "description",
        content:
          "Check your type 2 diabetes likelihood from fasting glucose, HbA1c, BMI and insulin values, read automatically from your lab report.",
      },
      { property: "og:title", content: "Diabetes Risk Prediction — VitalSense" },
      {
        property: "og:description",
        content: "OCR-assisted diabetes and pre-diabetes screening with an explainable risk score.",
      },
    ],
  }),
  component: DiabetesPage,
});

function DiabetesPage() {
  return (
    <DiseasePage
      eyebrow="Metabolic screening"
      title="Diabetes Risk Prediction"
      intro="Type 2 diabetes is preceded by years of measurable change. This model reads your fasting glucose, HbA1c and insulin values, adds body composition and family history, and estimates how closely your profile matches diabetic and pre-diabetic groups."
      image={diabetesImage}
      imageAlt="Illustration of a glucose meter and blood drop"
      accentClass="text-diabetes"
      facts={[
        { label: "Input method", value: "Report OCR + clinical form" },
        { label: "Model", value: "Random forest classifier" },
        { label: "Validation accuracy", value: "≈ 84% on held-out data" },
      ]}
      about={[
        {
          heading: "What the model looks at",
          body: "Fasting glucose, HbA1c, serum insulin, diastolic blood pressure, BMI, age, pregnancies, family history and weekly physical activity — a superset of the classic Pima Indians diabetes feature set.",
        },
        {
          heading: "Why the pre-diabetes band matters",
          body: "A moderate result usually means impaired glucose tolerance rather than diabetes. This is the stage where diet, weight and activity changes reverse the trend most reliably, so it is worth acting on early.",
        },
        {
          heading: "Keeping results comparable",
          body: "Use fasting values taken after at least 8 hours without food, and keep the same units each time so your history stays comparable across visits.",
        },
      ]}
      symptoms={[
        "Excessive thirst and a dry mouth",
        "Passing urine far more often, especially at night",
        "Unexplained weight loss despite normal appetite",
        "Slow-healing cuts or repeated infections",
        "Blurred vision, tingling or numbness in the feet",
      ]}
      modelNote="Scan your blood report first to fill the OCR fields, then complete lifestyle and history questions before running the model."
      ocr={{
        title: "Scan your blood sugar report",
        hint: "Fasting glucose, HbA1c, serum insulin and diastolic blood pressure are extracted from the report and dropped into the form for review.",
        sampleFields: [
          { label: "Fasting glucose", value: "126" },
          { label: "HbA1c", value: "6.1" },
          { label: "Serum insulin", value: "102" },
          { label: "Diastolic BP", value: "82" },
        ],
        mapToValues: {
          "Fasting glucose": "glucose",
          HbA1c: "hba1c",
          "Serum insulin": "insulin",
          "Diastolic BP": "bloodPressure",
        },
      }}
      fields={DIABETES_FIELDS}
      predict={predictDiabetes}
    />
  );
}