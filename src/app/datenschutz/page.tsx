import LegalPage from "@/components/layout/LegalPage";

export default function DatenschutzPage() {
  return (
    <LegalPage
      titleKey="legal.datenschutz.title"
      sections={[
        { headingKey: "legal.datenschutz.responsible", bodyKey: "legal.datenschutz.intro" },
        { headingKey: "legal.datenschutz.responsible", bodyKey: "legal.datenschutz.responsibleBody" },
        { headingKey: "legal.datenschutz.collect", bodyKey: "legal.datenschutz.collectBody" },
        { headingKey: "legal.datenschutz.purpose", bodyKey: "legal.datenschutz.purposeBody" },
        { headingKey: "legal.datenschutz.rights", bodyKey: "legal.datenschutz.rightsBody" },
      ]}
    />
  );
}