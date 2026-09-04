"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Send, Globe2, Mail, MapPin, Phone, Heart } from "lucide-react";
import { footerShopLinks, footerInfoLinks, footerLegalLinks } from "@/data/navigation";
import { useLanguageStore } from "@/lib/i18n/store";

export default function Footer() {
  const t = useLanguageStore((s) => s.t);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      }).catch(() => {});
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-foreground text-cream">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-serif text-2xl sm:text-3xl mb-2">{t("footer.newsletter.title")}</h3>
            <p className="text-cream/60 mb-6 text-sm">{t("footer.newsletter.subtitle")}</p>
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 text-botanical-light"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{t("footer.newsletter.success")}</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer.newsletter.placeholder")}
                  required
                  className="flex-1 min-w-0 px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-sm text-cream placeholder-cream/40 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                />
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-3 min-w-12 justify-center bg-gold hover:bg-gold-light text-foreground font-medium rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("footer.newsletter.subscribe")}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Shop */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-gold">{t("footer.shop")}</h4>
            <ul className="space-y-2.5">
              {footerShopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/60 hover:text-gold transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-gold">{t("footer.information")}</h4>
            <ul className="space-y-2.5">
              {footerInfoLinks.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/60 hover:text-gold transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-gold">{t("footer.legal")}</h4>
            <ul className="space-y-2.5">
              {footerLegalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/60 hover:text-gold transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-gold">{t("footer.contact")}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-cream/60">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold/70" />
                <span>Cleopatra Cosmetics<br />Berlin, Germany</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-cream/60">
                <Mail className="w-4 h-4 flex-shrink-0 text-gold/70" />
                <a href="mailto:hello@cleopatra-beauty.de" className="hover:text-gold transition-colors">
                  hello@cleopatra-beauty.de
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-cream/60">
                <Phone className="w-4 h-4 flex-shrink-0 text-gold/70" />
                <span>+49 30 1234 5678</span>
              </li>
            </ul>
            {/* Social */}
            <div className="mt-6">
              <p className="text-xs text-cream/40 uppercase tracking-wider mb-3">
                {t("footer.followUs")}
              </p>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center text-cream/60 hover:bg-gold/20 hover:text-gold transition-all"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center text-cream/60 hover:bg-gold/20 hover:text-gold transition-all"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.738-.9 10.125-5.865 10.125-11.854z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Shipping icons */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-cream/40">
            <span className="px-3 py-1.5 bg-white/5 rounded-md">Visa</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-md">Mastercard</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-md">Apple Pay</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-md">Google Pay</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-md">Klarna</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-md">SOFORT</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-md">iDEAL</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-cream/40 mt-3">
            <span className="px-3 py-1.5 bg-white/5 rounded-md">Omniva</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-md">DPD</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-md">SmartPost</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/40">
            <p>{t("footer.copyright")}</p>
            <p className="flex items-center gap-1">
              <Heart className="w-3 h-3 inline fill-cream/40 text-cream/40" /> {t("footer.craftedBy")}
            </p>
          </div>
        </div>
      </div>

      {/* Spacer so the mobile bottom nav never covers footer content */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </footer>
  );
}
