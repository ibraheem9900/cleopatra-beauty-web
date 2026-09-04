"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Leaf, Heart, Recycle, Award } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLanguageStore } from "@/lib/i18n/store";

export default function AboutPage() {
  const t = useLanguageStore((s) => s.t);

  const values = [
    { icon: Leaf, titleKey: "about.values.purity", descKey: "about.values.purityDesc" },
    { icon: Heart, titleKey: "about.values.craft", descKey: "about.values.craftDesc" },
    { icon: Recycle, titleKey: "about.values.sustainable", descKey: "about.values.sustainableDesc" },
    { icon: Award, titleKey: "about.values.german", descKey: "about.values.germanDesc" },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream min-h-screen">
        {/* Hero */}
        <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-cream-dark to-cream relative overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-botanical/5 rounded-full blur-3xl" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <AnimatedSection className="text-center max-w-2xl mx-auto">
              <span className="inline-block px-4 py-1.5 bg-gold/10 text-gold text-xs tracking-[0.2em] uppercase font-medium rounded-full mb-6">
                {t("about.pageTitle")}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 leading-tight">
                {t("about.story.title")}
              </h1>
              <p className="text-muted text-base sm:text-lg leading-relaxed">
                {t("about.pageSubtitle")}
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 sm:py-24 bg-cream">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <AnimatedSection>
                <p className="text-lg sm:text-xl text-foreground/90 leading-relaxed font-light">
                  {t("about.story.p1")}
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <p className="text-base sm:text-lg text-muted leading-relaxed">
                  {t("about.story.p2")}
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <p className="text-base sm:text-lg text-muted leading-relaxed">
                  {t("about.story.p3")}
                </p>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-cream to-cream-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground">
                Our Values
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {values.map((value, i) => (
                <AnimatedSection key={value.titleKey} delay={i * 0.1} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/10 flex items-center justify-center">
                    <value.icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground mb-2">
                    {t(value.titleKey)}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {t(value.descKey)}
                  </p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
