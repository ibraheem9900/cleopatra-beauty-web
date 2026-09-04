"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, ArrowRight, Trash2, Droplets, Sparkles, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { useLanguageStore } from "@/lib/i18n/store";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

export default function WishlistPage() {
  const t = useLanguageStore((s) => s.t);
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAddToCart = (productId: string) => {
    const product = items.find((i) => i.id === productId);
    if (product) {
      addItem(product);
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 1500);
    }
  };

  const handleAddAllToCart = () => {
    items.forEach((item) => addItem(item));
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-1 flex items-center gap-3">
                  <Heart className="w-8 h-8 text-red-400 fill-red-400" />
                  {t("wishlist.title")}
                </h1>
                <p className="text-sm text-muted">
                  {items.length} {items.length === 1 ? "item" : "items"} saved
                </p>
              </div>
              {items.length > 0 && (
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddAllToCart}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-foreground font-medium rounded-full text-sm transition-all hover:shadow-lg hover:shadow-gold/20"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {t("wishlist.addAllToCart")}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={clearWishlist}
                    className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 font-medium rounded-full text-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("wishlist.clearAll")}
                  </motion.button>
                </div>
              )}
            </div>
          </AnimatedSection>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 mx-auto text-warm-beige mb-6" />
              <p className="text-lg text-muted mb-2">{t("wishlist.empty")}</p>
              <p className="text-sm text-muted/70 mb-6">{t("wishlist.emptySubtitle")}</p>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold hover:bg-gold-light text-foreground font-medium rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {t("wishlist.browseShop")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-warm-beige/30 overflow-hidden"
                  >
                    <div className="flex gap-4 sm:gap-6 p-4 sm:p-5">
                      {/* Product image */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-cream-dark rounded-xl overflow-hidden relative"
                      >
                        {product.images[0] ? (
                          <Image
                            src={product.images[0].src}
                            alt={product.images[0].alt}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            sizes="128px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {product.category === "soaps" ? <Droplets className="w-10 h-10 text-gold/40" /> : <Sparkles className="w-10 h-10 text-gold/40" />}
                          </div>
                        )}
                      </Link>

                      {/* Product info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] text-gold tracking-[0.2em] uppercase font-medium mb-0.5">
                            {t(product.subtitleKey)}
                          </p>
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-serif text-base sm:text-lg text-foreground leading-tight hover:text-gold transition-colors block"
                          >
                            {t(product.nameKey)}
                          </Link>
                          <p className="text-sm text-muted line-clamp-1 mt-1 hidden sm:block">
                            {t(product.descriptionKey)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 sm:mt-0">
                          <span className="text-lg font-semibold text-foreground">
                            {formatPrice(product.price)}
                          </span>
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => handleAddToCart(product.id)}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.95 }}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                                addedId === product.id
                                  ? "bg-botanical text-white"
                                  : "bg-gold/10 hover:bg-gold hover:text-white text-gold"
                              }`}
                            >
                              {addedId === product.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  {t("wishlist.added")}
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  {t("wishlist.addToCart")}
                                </>
                              )}
                            </motion.button>
                            <motion.button
                              onClick={() => removeItem(product.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.85 }}
                              className="p-2 text-muted hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                              aria-label={`Remove ${product.name} from wishlist`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Continue shopping */}
              <AnimatedSection className="pt-4">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors group"
                >
                  <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  {t("wishlist.continueShopping")}
                </Link>
              </AnimatedSection>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
