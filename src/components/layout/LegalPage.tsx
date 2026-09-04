"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLanguageStore, useTranslatedText } from "@/lib/i18n/store";
import { dynamicContent } from "@/data/content";

interface LegalSection {
  headingKey: string;
  bodyKey: string;
}

function LegalSection({ headingKey, bodyKey }: LegalSection) {
  const heading = useTranslatedText(dynamicContent[headingKey]);
  const body = useTranslatedText(dynamicContent[bodyKey]);
  const lines = body.split("\n");
  return (
    <div>
      <h2 className="font-serif text-xl text-foreground mb-2">{heading}</h2>
      <p>
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    </div>
  );
}

export default function LegalPage({
  titleKey,
  sections,
}: {
  titleKey: string;
  sections: LegalSection[];
}) {
  const t = useLanguageStore((s) => s.t);

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <AnimatedSection>
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-8">
              {t(titleKey)}
            </h1>

            <div className="prose prose-warm max-w-none space-y-6 text-muted leading-relaxed">
              {sections.map(({ headingKey, bodyKey }) => (
                <LegalSection key={headingKey} headingKey={headingKey} bodyKey={bodyKey} />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </>
  );
}