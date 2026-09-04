import LegalPage from "@/components/layout/LegalPage";

export default function ImpressumPage() {
  return (
    <LegalPage
      titleKey="legal.impressum.title"
      sections={[
        { headingKey: "legal.impressum.tmg", bodyKey: "legal.impressum.tmgBody" },
        { headingKey: "legal.impressum.contact", bodyKey: "legal.impressum.contactBody" },
        { headingKey: "legal.impressum.vat", bodyKey: "legal.impressum.vatBody" },
        { headingKey: "legal.impressum.dispute", bodyKey: "legal.impressum.disputeBody" },
        { headingKey: "legal.impressum.liability", bodyKey: "legal.impressum.liabilityBody" },
      ]}
    />
  );
}