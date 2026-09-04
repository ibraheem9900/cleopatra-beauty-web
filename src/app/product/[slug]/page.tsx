"use client";

import { useState, use, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
  Droplets,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ProductCard from "@/components/ui/ProductCard";
import { getProductBySlug, products } from "@/data/products";
import { useCartStore } from "@/lib/store/cart";
import { useLanguageStore } from "@/lib/i18n/store";
import { formatPrice } from "@/lib/utils";
import { trackAddToCart, trackProductView } from "@/lib/analytics";

type Tab = "inci" | "scent" | "usage";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  return <ProductDetail slug={resolvedParams.slug} />;
}

function ProductDetail({ slug }: { slug: string }) {
  const t = useLanguageStore((s) => s.t);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("inci");
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const product = getProductBySlug(slug);

  // Analytics: record every product page view (real data for the admin dashboard)
  useEffect(() => {
    if (product) trackProductView(product.id);
  }, [product?.id]);

  if (!product) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-cream min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-3xl text-foreground mb-4">Product Not Found</h1>
            <Link href="/catalog" className="text-gold hover:text-gold-dark transition-colors">
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    trackAddToCart(product.id);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  const tabs: { id: Tab; label: string; labelKey: string }[] = [
    { id: "inci", label: "Ingredients (INCI)", labelKey: "product.ingredients" },
    { id: "scent", label: "Scent Profile", labelKey: "product.scentProfile" },
    { id: "usage", label: "How to Use", labelKey: "product.usage" },
  ];

  const related = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  const currentImage = product.images[selectedImage];

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Breadcrumb */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t("product.backToShop")}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            {/* Image Gallery */}
            <AnimatedSection direction="left">
              <div className="space-y-4">
                {/* Main image with zoom */}
                <div
                  className="relative aspect-square bg-cream-dark rounded-2xl overflow-hidden border border-warm-beige/30 cursor-crosshair group"
                  onClick={() => setZoomOpen(true)}
                >
                  {currentImage ? (
                    <Image
                      src={currentImage.src}
                      alt={currentImage.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-center p-8">
                      {product.category === "soaps" ? <Droplets className="w-16 h-16 sm:w-24 sm:h-24 text-gold/30 mb-4" /> : <Sparkles className="w-16 h-16 sm:w-24 sm:h-24 text-gold/30 mb-4" />}
                      <p className="font-serif text-2xl text-warm-brown">{product.subtitle}</p>
                    </div>
                  )}
                  {/* Highlight badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
                    {product.highlightTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-foreground/80 rounded-full uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Zoom hint */}
                  <div className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <ZoomIn className="w-4 h-4 text-muted" />
                  </div>
                  {/* Mobile swipe arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-foreground/70 hover:text-foreground lg:hidden z-10"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-foreground/70 hover:text-foreground lg:hidden z-10"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail strip */}
                {product.images.length > 1 && (
                  <div className="flex gap-3">
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`relative flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImage === i
                            ? "border-gold shadow-md"
                            : "border-transparent hover:border-warm-beige"
                        }`}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedSection>

            {/* Product Info */}
            <AnimatedSection direction="right" className="lg:py-4">
              <div className="space-y-6">
                {/* Subtitle & name */}
                <div>
                  <p className="text-xs tracking-[0.25em] uppercase text-gold font-medium mb-2">
                    {t(product.subtitleKey)}
                  </p>
                  <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-tight mb-2">
                    {t(product.nameKey)}
                  </h1>
                  <p className="text-sm text-muted italic">{product.tagline}</p>
                </div>

                {/* Price & stock */}
                <div className="flex items-baseline gap-4">
                  <span className="text-2xl sm:text-3xl font-semibold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-botanical font-medium">
                    {product.stock === "in-stock" && (<><CheckCircle2 className="w-3.5 h-3.5" />{t("product.inStock")}</>)}
                    {product.stock === "low-stock" && (<><AlertTriangle className="w-3.5 h-3.5 text-amber-500" />{t("product.lowStock")}</>)}
                    {product.stock === "out-of-stock" && t("product.outOfStock")}
                    {product.stock === "pre-order" && t("product.preOrder")}
                  </span>
                </div>

                {/* Description */}
                <p className="text-muted leading-relaxed">{t(product.descriptionKey)}</p>

                {/* Highlight tags */}
                <div className="flex flex-wrap gap-2">
                  {product.highlightTags.map((tag) => (
                    <motion.span
                      key={tag}
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/5 border border-gold/20 rounded-full text-xs text-foreground/80 font-medium cursor-default"
                    >
                      <Sparkle className="w-3 h-3 text-gold" />
                      {tag}
                    </motion.span>
                  ))}
                </div>

                {/* Skin types */}
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-2">Suitable for</p>
                  <div className="flex flex-wrap gap-2">
                    {product.skinTypes.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-cream-dark rounded-full text-xs text-foreground/70 capitalize"
                      >
                        {type === "all" ? "All Skin Types" : `${type} Skin`}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <div className="flex items-center border border-warm-beige rounded-full bg-white">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 text-muted hover:text-foreground transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 text-muted hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <motion.button
                    onClick={handleAddToCart}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    className={`flex-1 flex items-center justify-center gap-2.5 px-8 py-3.5 font-medium rounded-full text-sm transition-all duration-300 ${
                      addedToCart
                        ? "bg-botanical text-white"
                        : "bg-gold hover:bg-gold-light text-foreground hover:shadow-lg hover:shadow-gold/20"
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {addedToCart ? (
                        <motion.span
                          key="added"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Added!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="add"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          {t("product.addToCart")}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>

                {/* Weight */}
                {product.weight && (
                  <p className="text-xs text-muted">
                    {t("product.weight")}: {product.weight}
                  </p>
                )}

                {/* Tabs */}
                <div className="pt-4 border-t border-warm-beige/50">
                  <div className="flex flex-wrap gap-1 bg-cream-dark rounded-xl p-1 mb-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-0 py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                          activeTab === tab.id
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        {t(tab.labelKey)}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeTab === "inci" && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3">INCI List</h3>
                          <p className="text-xs text-muted leading-relaxed bg-cream-dark p-4 rounded-xl">
                            {t(product.inci)}
                          </p>
                          <p className="text-[10px] text-muted/60 mt-2">
                            EU Regulation (EC) No 1223/2009 compliant labeling
                          </p>
                        </div>
                      )}
                      {activeTab === "scent" && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3">
                            {t("product.scentProfile")}
                          </h3>
                          <p className="text-sm text-muted leading-relaxed">
                            {t(product.scentProfile)}
                          </p>
                        </div>
                      )}
                      {activeTab === "usage" && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3">
                            {t("product.usage")}
                          </h3>
                          <p className="text-sm text-muted leading-relaxed">
                            {t(product.usageInstructions)}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <section className="mt-16 sm:mt-24 pb-8">
              <AnimatedSection className="text-center mb-10">
                <h2 className="font-serif text-2xl sm:text-3xl text-foreground">
                  {t("product.relatedProducts")}
                </h2>
              </AnimatedSection>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomOpen && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center cursor-zoom-out"
            onClick={() => { setZoomOpen(false); setIsZoomed(false); }}
          >
            <button
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10"
              onClick={() => { setZoomOpen(false); setIsZoomed(false); }}
            >
              <X className="w-6 h-6" />
            </button>
            <div
              className="relative w-full h-full max-w-5xl max-h-[90vh] mx-4"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                className="object-contain transition-transform duration-200"
                style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: "scale(2)" } : undefined}
                sizes="100vw"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L14 8.5L20.5 10L14 12L12 18.5L10 12L3.5 10L10 8.5L12 2Z" />
    </svg>
  );
}
