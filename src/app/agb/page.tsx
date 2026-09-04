import LegalPage from "@/components/layout/LegalPage";

export default function AgbPage() {
  return (
    <LegalPage
      titleKey="legal.agb.title"
      sections={[
        { headingKey: "legal.agb.scope", bodyKey: "legal.agb.scopeBody" },
        { headingKey: "legal.agb.contract", bodyKey: "legal.agb.contractBody" },
        { headingKey: "legal.agb.prices", bodyKey: "legal.agb.pricesBody" },
        { headingKey: "legal.agb.returns", bodyKey: "legal.agb.returnsBody" },
      ]}
    />
  );
}