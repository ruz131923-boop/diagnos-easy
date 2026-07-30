const TERMS: { heading: string; body: string }[] = [
  {
    heading: "1. Acceptance of these terms",
    body: "By registering for or using VitalSense you confirm that you are at least 18 years old (or using the platform with the consent of a parent or guardian) and that you accept these Terms & Conditions in full. If you do not agree, please do not create an account.",
  },
  {
    heading: "2. Nature of the service",
    body: "VitalSense is a decision-support and educational tool. It applies machine learning models to the values you supply, or to values extracted from your uploaded reports by OCR, and returns a statistical estimate of risk. It does not perform a clinical examination and does not issue a diagnosis, prescription or treatment plan.",
  },
  {
    heading: "3. No substitute for professional care",
    body: "You agree not to rely on VitalSense output as the sole basis for any health decision. Never delay seeking, disregard, or discontinue professional medical advice because of a prediction shown here. In an emergency, contact your local emergency service immediately.",
  },
  {
    heading: "4. Consent to use your medical information",
    body: "You expressly consent to VitalSense collecting and processing your personal details, medical details (height, weight, blood group), disease-specific measurements, and any laboratory or diagnostic report you upload, for the sole purpose of generating disease risk predictions for you and displaying them in your account. Processing includes OCR text extraction, normalisation of values, and inference by the relevant machine learning model.",
  },
  {
    heading: "5. Limits on data use",
    body: "Your medical information will not be sold, rented, published, or shared with advertisers, insurers, employers or any other third party. Aggregated, fully anonymised and non-identifiable statistics may be used to evaluate and improve model accuracy. You may withdraw this consent at any time by deleting your account, which also removes your stored medical records.",
  },
  {
    heading: "6. Accuracy of the information you provide",
    body: "Predictions are only as reliable as the inputs. You are responsible for entering values accurately and for verifying every value extracted by OCR before running a prediction. VitalSense is not liable for outcomes arising from incorrect, incomplete or outdated inputs.",
  },
  {
    heading: "7. Account security",
    body: "You are responsible for keeping your username and password confidential and for all activity under your account. Choose a strong, unique password, do not share it, and notify us immediately if you suspect unauthorised access.",
  },
  {
    heading: "8. Acceptable use",
    body: "You may not attempt to reverse engineer the models, scrape the platform, upload another person's medical records without their written consent, upload malicious files, or use VitalSense to provide clinical services to third parties.",
  },
  {
    heading: "9. Intellectual property",
    body: "The VitalSense name, interface, documentation and trained models remain the property of the VitalSense research group. Your own data and reports remain yours.",
  },
  {
    heading: "10. Limitation of liability",
    body: "To the maximum extent permitted by law, VitalSense and its contributors are not liable for any indirect, incidental or consequential loss, including loss of health outcome, arising from use of the platform. The service is provided on an 'as is' and 'as available' basis.",
  },
  {
    heading: "11. Changes to these terms",
    body: "We may update these terms as the platform evolves. Material changes will be announced in the application, and continued use after the effective date constitutes acceptance of the revised terms.",
  },
  {
    heading: "12. Governing law and contact",
    body: "These terms are governed by the laws of Sri Lanka. Questions, consent withdrawals and data requests can be sent to privacy@vitalsense.health.",
  },
];

export function TermsText({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-4" : "space-y-7"}>
      {TERMS.map((clause) => (
        <article key={clause.heading}>
          <h3
            className={`font-semibold text-foreground ${compact ? "text-sm" : "text-lg"}`}
          >
            {clause.heading}
          </h3>
          <p
            className={`mt-1.5 leading-relaxed text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}
          >
            {clause.body}
          </p>
        </article>
      ))}
    </div>
  );
}