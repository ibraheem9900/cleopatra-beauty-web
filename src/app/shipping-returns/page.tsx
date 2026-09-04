import LegalPage from "@/components/layout/LegalPage";

export default function ShippingReturnsPage() {
  return (
    <LegalPage
      titleKey="legal.shipping.title"
      sections={[
        { headingKey: "legal.shipping.delivery", bodyKey: "legal.shipping.deliveryBody" },
        { headingKey: "legal.shipping.costs", bodyKey: "legal.shipping.costsBody" },
        { headingKey: "legal.shipping.returns", bodyKey: "legal.shipping.returnsBody" },
      ]}
    />
  );
}