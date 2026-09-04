"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShoppingBag, ArrowRight, ArrowLeft, Droplets, Sparkles } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/lib/store/cart";
import { useLanguageStore } from "@/lib/i18n/store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const t = useLanguageStore((s) => s.t);
  const { items, removeItem, updateQuantity } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-8">
            {t("cart.title")}
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 mx-auto text-warm-beige mb-6" />
              <p className="text-lg text-muted mb-6">{t("cart.empty")}</p>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold hover:bg-gold-light text-foreground font-medium rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowRight className="w-4 h-4" />
                {t("cart.continueShopping")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 sm:gap-6 p-4 sm:p-5 bg-white rounded-2xl border border-warm-beige/30"
                    >
                      {/* Product image */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-cream-dark rounded-xl overflow-hidden relative"
                      >
                        {item.product.images[0] ? (
                          <Image
                            src={item.product.images[0].src}
                            alt={item.product.images[0].alt}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {item.product.category === "soaps" ? <Droplets className="w-8 h-8 text-gold/40" /> : <Sparkles className="w-8 h-8 text-gold/40" />}
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] text-gold tracking-[0.2em] uppercase mb-0.5">
                              {t(item.product.subtitleKey)}
                            </p>
                            <h3 className="font-serif text-base sm:text-lg text-foreground leading-tight">
                              {t(item.product.nameKey)}
                            </h3>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeItem(item.product.id)}
                            className="p-1.5 text-muted hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-warm-beige rounded-full bg-cream">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-2 text-muted hover:text-foreground transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </motion.button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-2 text-muted hover:text-foreground transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                          <span className="font-semibold text-foreground">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors mt-4 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  {t("cart.continueShopping")}
                </Link>
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-white rounded-2xl border border-warm-beige/30 p-6 space-y-4">
                  <h3 className="font-serif text-lg text-foreground">{t("checkout.orderSummary")}</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted">
                      <span>{t("cart.subtotal")}</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>{t("cart.shipping")}</span>
                      <span className="text-xs">{t("cart.shippingCalculated")}</span>
                    </div>
                  </div>

                  <div className="border-t border-warm-beige/50 pt-4">
                    <div className="flex justify-between font-semibold text-lg text-foreground">
                      <span>{t("cart.total")}</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gold hover:bg-gold-light text-foreground font-medium rounded-full transition-all hover:shadow-lg hover:shadow-gold/20 text-sm"
                  >
                    {t("cart.checkout")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
