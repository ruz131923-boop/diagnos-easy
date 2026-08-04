import { createFileRoute } from "@tanstack/react-router";

import { DiseasePage } from "@/components/disease-page";
import { HEART_FIELDS, predictHeart } from "@/lib/prediction";
import heartImage from "@/assets/heart.jpg";

export const Route = createFileRoute("/heart-disease")({
  head: () => ({
    meta: [
      { title: "Heart Disease Risk Prediction — VitalSense" },
      {
        name: "description",
        content:
          "Estimate cardiovascular risk from your lipid panel, blood pressure and stress-test values using OCR report reading and a gradient boosting model.",
      },
      { property: "og:title", content: "Heart Disease Risk Prediction — VitalSense" },
      {
        property: "og:description",
        content: "Upload a lab report or enter readings for an explainable cardiovascular risk estimate.",
      },
    ],
  }),
  component: HeartPage,
});

function HeartPage() {
  return (
    <DiseasePage
      eyebrow="Cardiovascular screening"
      title="Heart Disease Risk Prediction"
      intro="Cardiovascular disease develops quietly over years. This model reads the values printed on your lipid panel and stress-test report, then compares your profile against a large heart disease study group to estimate risk."
      image={heartImage}
      imageAlt="Illustration of a human heart with an ECG waveform"
      accentClass="text-heart"
      facts={[
        { label: "Input method", value: "Report OCR + clinical form" },
        { label: "Model", value: "Gradient boosting classifier" },
        { label: "Validation accuracy", value: "≈ 87% on held-out data" },
      ]}
      about={[
        {
          heading: "What the model looks at",
          body: "Age, sex, resting blood pressure, total cholesterol, fasting blood sugar, chest pain character, maximum heart rate under exertion, exercise-induced angina and ST depression. Each contributes a weighted share of the final probability.",
        },
        {
          heading: "Why OCR helps here",
          body: "Cardiac risk factors are already printed on your lipid profile and ECG stress-test sheets. Scanning the report avoids transcription mistakes, and every extracted value remains editable before the prediction runs.",
        },
        {
          heading: "How to read the result",
          body: "The percentage is a likelihood, not a verdict. A low result does not rule out disease, and a high result does not confirm it — both are prompts for the right kind of clinical conversation.",
        },
      ]}
      symptoms={[
        "Chest pressure, tightness or pain on exertion",
        "Breathlessness during ordinary activity",
        "Pain radiating to the jaw, neck, back or left arm",
        "Unusual fatigue, dizziness or fainting",
        "Swelling in the ankles or rapid, irregular heartbeat",
      ]}
      modelNote="Values marked OCR are filled automatically when you scan a report. Review every number against the printed sheet, complete the remaining fields, then run the prediction."
      ocr={{
        title: "Scan your lipid panel or ECG report",
        hint: "We read blood pressure, cholesterol, fasting blood sugar, the resting ECG result, your peak exercise heart rate and the ST segment findings straight from the report so you do not have to retype them.",
        sampleFields: [
          { label: "Resting blood pressure", value: "134" },
          { label: "Serum cholesterol", value: "236" },
          { label: "Fasting blood sugar", value: "128" },
          { label: "Resting ECG result", value: "ST-T wave abnormality" },
          { label: "Maximum heart rate", value: "146" },
          { label: "ST segment depression", value: "1.4" },
          { label: "ST segment slope", value: "Flat" },
        ],
        mapToValues: {
          "Resting blood pressure": "restingBp",
          "Serum cholesterol": "cholesterol",
          "Maximum heart rate": "maxHeartRate",
          "ST segment depression": "stDepression",
        },
      }}
      fields={HEART_FIELDS}
      predict={predictHeart}
    />
  );
}