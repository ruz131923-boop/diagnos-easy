import { createFileRoute } from "@tanstack/react-router";

import { DiseasePage } from "@/components/disease-page";
import { BREAST_FIELDS, predictBreast } from "@/lib/prediction";
import breastImage from "@/assets/breast.jpg";

export const Route = createFileRoute("/breast-cancer")({
  head: () => ({
    meta: [
      { title: "Breast Cancer Prediction — VitalSense" },
      {
        name: "description",
        content:
          "Classify fine-needle aspirate cell nuclei measurements as benign or malignant using a support vector classifier.",
      },
      { property: "og:title", content: "Breast Cancer Prediction — VitalSense" },
      {
        property: "og:description",
        content: "Enter cytology measurements for an explainable benign vs. malignant tendency score.",
      },
    ],
  }),
  component: BreastCancerPage,
});

function BreastCancerPage() {
  return (
    <DiseasePage
      eyebrow="Oncological screening"
      title="Breast Cancer Prediction"
      intro="This model works from the cell nucleus measurements recorded on a fine-needle aspirate cytology report. It compares your values with the Wisconsin diagnostic breast cancer dataset to indicate whether the morphology leans benign or malignant."
      image={breastImage}
      imageAlt="Abstract illustration of cell microscopy with an awareness ribbon"
      accentClass="text-breast"
      facts={[
        { label: "Input method", value: "Cytology measurements" },
        { label: "Model", value: "Support vector classifier" },
        { label: "Validation accuracy", value: "≈ 96% on held-out data" },
      ]}
      about={[
        {
          heading: "What the model looks at",
          body: "Mean radius, texture, perimeter, area, smoothness, compactness, concavity and number of concave points of the cell nuclei, together with family history and whether a lump has been felt.",
        },
        {
          heading: "Where the numbers come from",
          body: "Your pathology or cytology report lists these morphology values. Because the measurement scale varies between laboratories, enter them exactly as printed rather than converting them.",
        },
        {
          heading: "Diagnosis needs histopathology",
          body: "Only a biopsy reviewed by a pathologist can confirm malignancy. A borderline or high result here means the case deserves imaging and specialist review, nothing more and nothing less.",
        },
      ]}
      symptoms={[
        "A new lump or thickening in the breast or armpit",
        "Change in breast size, shape or contour",
        "Skin dimpling, puckering or redness",
        "Nipple inversion, or discharge that is not milk",
        "Persistent pain in one specific area",
      ]}
      modelNote="All ten values come from your cytology report and clinical history. Enter them as printed, then run the classifier."
      fields={BREAST_FIELDS}
      predict={predictBreast}
    />
  );
}