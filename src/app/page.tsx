"use client";

import { useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HandHeart,
  Leaf,
  Recycle,
  MapPin,
  ArrowRight,
  Sparkles,
  Send,
  Check,
  Droplets,
  Flower2,
  Clock,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ProductCard from "@/components/ui/ProductCard";
import { getFeaturedProducts } from "@/data/products";
import { useLanguageStore, useTranslatedText } from "@/lib/i18n/store";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustBadges />
        <FeaturedProducts products={featured} />
        <ComingSoonBanner />
        <AboutIntro />
      </main>
      <Footer />
    </>
  );
}

function HeroSection() {
  const t = useLanguageStore((s) => s.t);
  const eyebrow = useTranslatedText("Timeless Beauty Rituals");
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden sm:h-[85vh] sm:min-h-[560px] sm:max-h-[900px]"
    >
      {/* Hero background image — full width with parallax */}
      <motion.div
        style={shouldReduceMotion ? {} : { y, opacity }}
        className="absolute inset-0"
      >
        <motion.div style={shouldReduceMotion ? {} : { scale: imageScale }} className="absolute inset-0">
          <Image
            src="/images/hero.png"
            alt="Cleopatra beauty products collection"
            fill
            className="object-cover object-right sm:object-center"
            priority
            sizes="100vw"
            quality={90}
          />
        </motion.div>
        {/* Readability overlay — near-solid cream behind the text on mobile,
            softer gradient on desktop where the image has empty space on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/90 sm:from-cream/90 sm:via-cream/60 to-transparent" />
        {/* Top scrim under the fixed header on mobile */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cream to-transparent sm:hidden" />
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-cream to-transparent" />
      </motion.div>

      {/* Content — content-driven height on mobile, vertically centered on desktop */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl lg:max-w-2xl pt-24 pb-14 sm:pt-0 sm:pb-0 sm:h-[85vh] sm:min-h-[560px] sm:max-h-[900px] sm:flex sm:flex-col sm:justify-center">
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="w-8 h-[1px] bg-gold" />
                <span className="text-[0.6rem] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase text-gold font-medium">
                  {eyebrow}
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-[clamp(1.75rem,8.5vw,2.5rem)] sm:text-3xl md:text-5xl lg:text-7xl font-bold leading-[1.15] text-foreground mb-3 sm:mb-6 break-words [text-shadow:0_1px_2px_rgba(253,251,247,0.8)] sm:[text-shadow:none]"
            >
              {(() => {
                const tagline = t("hero.tagline");
                const commaIndex = tagline.indexOf(",");
                if (commaIndex !== -1) {
                  return (
                    <>
                      {tagline.slice(0, commaIndex + 1)}
                      <br />
                      <span className="text-gold-dark sm:text-gold">{tagline.slice(commaIndex + 1).trim()}</span>
                    </>
                  );
                }
                return <span className="text-gold">{tagline}</span>;
              })()}
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-[0.95rem] sm:text-base md:text-lg text-muted leading-relaxed mb-6 sm:mb-8 max-w-lg [text-shadow:0_1px_2px_rgba(253,251,247,0.8)] sm:[text-shadow:none]"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 min-h-12 sm:min-h-0 bg-gold hover:bg-gold-light text-foreground font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] group"
              >
                {t("hero.shopNow")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 min-h-12 sm:min-h-0 border border-foreground/25 hover:border-gold bg-cream/60 backdrop-blur-sm text-foreground/90 hover:text-gold font-medium rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {t("hero.cta")}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBadges() {
  const t = useLanguageStore((s) => s.t);
  const badges = [
    { icon: HandHeart, label: t("trust.handcrafted") },
    { icon: Leaf, label: t("trust.natural") },
    { icon: Recycle, label: t("trust.eco") },
    { icon: MapPin, label: t("trust.germany") },
  ];

  return (
    <section className="py-12 sm:py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {badges.map((badge, i) => (
            <AnimatedSection key={badge.label} delay={i * 0.1} className="text-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-14 h-14 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center transition-shadow hover:shadow-md hover:shadow-gold/10"
              >
                <badge.icon className="w-6 h-6 text-gold" />
              </motion.div>
              <p className="text-sm font-medium text-foreground tracking-wide">
                {badge.label}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts({ products }: { products: ReturnType<typeof getFeaturedProducts> }) {
  const t = useLanguageStore((s) => s.t);

  return (
    <section className="py-16 sm:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-[1px] bg-gold" />
            <Sparkles className="w-4 h-4 text-gold" />
            <div className="w-12 h-[1px] bg-gold" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-3">
            {t("featured.title")}
          </h2>
          <p className="text-muted max-w-lg mx-auto leading-relaxed">
            {t("featured.subtitle")}
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <AnimatedSection className="text-center mt-12">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-8 py-4 border border-gold/30 hover:border-gold text-foreground hover:text-gold font-medium rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
          >
            {t("featured.viewAll")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}

function ComingSoonBanner() {
  const t = useLanguageStore((s) => s.t);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "coming-soon" }),
      }).catch(() => {});
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-cream-dark to-warm-beige/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-gold/10 text-gold text-xs tracking-[0.2em] uppercase font-medium rounded-full mb-6">
            {t("comingSoon.title")}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
            {t("comingSoon.subtitle")}
          </h2>

          {/* Coming soon products */}
          <div className="flex flex-wrap justify-center gap-4 my-8">
            {(["lotions", "lipbalms", "hairoils"] as const).map((key) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur-sm rounded-full border border-warm-beige/50 cursor-default"
              >
                <span className="text-gold/70">
                  {key === "lotions" ? <Droplets className="w-5 h-5" /> : key === "lipbalms" ? <Flower2 className="w-5 h-5" /> : <Leaf className="w-5 h-5" />}
                </span>
                <span className="text-sm text-foreground/80 font-medium">
                  {t(`comingSoon.products.${key}`)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Email signup */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
                className="w-10 h-10 rounded-full bg-botanical/10 flex items-center justify-center"
              >
                <Check className="w-5 h-5 text-botanical" />
              </motion.div>
              <p className="text-botanical font-medium">{t("comingSoon.success")}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("comingSoon.emailPlaceholder")}
                required
                className="flex-1 px-5 py-3.5 bg-white border border-warm-beige rounded-full text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-muted/60"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3.5 bg-gold hover:bg-gold-light text-foreground font-medium rounded-full text-sm transition-colors flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-gold/20"
              >
                <Send className="w-4 h-4" />
                {t("comingSoon.subscribe")}
              </motion.button>
            </form>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
}

function AboutIntro() {
  const t = useLanguageStore((s) => s.t);
  const readStory = useTranslatedText("Read our full story");

  return (
    <section className="py-16 sm:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-[1px] bg-gold" />
              <Leaf className="w-4 h-4 text-botanical" />
              <div className="w-12 h-[1px] bg-gold" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-6">
              {t("about.intro.title")}
            </h2>
            <p className="text-muted leading-relaxed text-base sm:text-lg mb-8">
              {t("about.intro.text")}
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-dark font-medium text-sm tracking-wide group transition-colors"
            >
              {readStory}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
