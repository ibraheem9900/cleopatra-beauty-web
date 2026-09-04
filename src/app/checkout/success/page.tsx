"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguageStore } from "@/lib/i18n/store";

function SuccessContent() {
  const t = useLanguageStore((s) => s.t);
  const params = useSearchParams();
  const orderNumber = params.get("order") || "";

  return (
    <main className="flex-1 bg-cream min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center px-4 py-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-botanical/10 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-botanical" />
        </motion.div>
        <h1 className="font-serif text-3xl text-foreground mb-3">
          {t("checkout.orderConfirmation")}
        </h1>
        <p className="text-muted mb-2">{t("checkout.orderNumber")}</p>
        <p className="font-mono text-lg text-gold font-semibold mb-8">{orderNumber}</p>
        <p className="text-sm text-muted mb-8">
          A confirmation email has been sent. You can track your order from the admin panel.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold hover:bg-gold-light text-foreground font-medium rounded-full transition-all"
        >
          {t("checkout.continue")}
        </Link>
      </motion.div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<main className="flex-1 bg-cream min-h-screen" />}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}