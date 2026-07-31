import { createFileRoute } from "@tanstack/react-router";

import { DiseasePage } from "@/components/disease-page";
import { PARKINSONS_FIELDS, predictParkinsons } from "@/lib/prediction";
import parkinsonsImage from "@/assets/parkinsons.jpg";

export const Route = createFileRoute("/parkinsons")({
  head: () => ({
    meta: [
      { title: "Parkinson's Disease Prediction — VitalSense" },
      {
        name: "description",
        content:
          "Screen for Parkinson's disease using sustained-vowel voice features such as jitter, shimmer and harmonic-to-noise ratio alongside motor symptom questions.",
      },
      { property: "og:title", content: "Parkinson's Disease Prediction — VitalSense" },
      {
        property: "og:description",
        content: "Voice-feature and motor-symptom screening with an explainable neurological risk score.",
      },
    ],
  }),
  component: ParkinsonsPage,
});

function ParkinsonsPage() {
  return (
    <DiseasePage
      eyebrow="Neurological screening"
      title="Parkinson's Disease Prediction"
      intro="Subtle voice changes often appear before tremor becomes obvious. This model combines acoustic measurements from a sustained-vowel recording with a short motor symptom questionnaire to estimate neurological risk."
      image={parkinsonsImage}
      imageAlt="Illustration of a brain with a neural network and tremor waveform"
      accentClass="text-parkinsons"
      facts={[
        { label: "Input method", value: "Voice features + symptom form" },
        { label: "Model", value: "XGBoost classifier" },
        { label: "Validation accuracy", value: "≈ 91% on held-out data" },
      ]}
      about={[
        {
          heading: "What the model looks at",
          body: "Average vocal fundamental frequency, jitter, shimmer, harmonic-to-noise ratio and RPDE from your voice analysis report, plus tremor, rigidity, bradykinesia and handwriting change.",
        },
        {
          heading: "How the voice metrics are produced",
          body: "A doctor or speech analysis tool records a sustained vowel and reports these acoustic features. Enter them exactly as given; the model expects jitter as a percentage and shimmer in decibels.",
        },
        {
          heading: "Why early screening matters",
          body: "Parkinson's progresses gradually, and physiotherapy plus medical management started early has a lasting effect on mobility and independence.",
        },
      ]}
      symptoms={[
        "Resting tremor, usually starting in one hand",
        "Slower movement and shorter, shuffling steps",
        "Muscle stiffness and reduced arm swing",
        "Softer, more monotone speech",
        "Smaller, cramped handwriting and reduced facial expression",
      ]}
      modelNote="Enter the acoustic values from your voice analysis report and answer the motor screening questions honestly — the symptom answers carry real weight in the model."
      fields={PARKINSONS_FIELDS}
      predict={predictParkinsons}
    />
  );
}