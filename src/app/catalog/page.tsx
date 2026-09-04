"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SlidersHorizontal, X, Grid3X3, List, Search, Send, Check, Clock } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { products } from "@/data/products";
import { getFilterGroups } from "@/data/categories";
import { useLanguageStore } from "@/lib/i18n/store";

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const t = useLanguageStore((s) => s.t);
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSkinType, setSelectedSkinType] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [csEmail, setCsEmail] = useState("");
  const [csSubmitted, setCsSubmitted] = useState(false);

  const filterGroups = getFilterGroups();

  const isComingSoonCategory = selectedCategory &&
    filterGroups[0]?.options.some(o => o.id === selectedCategory && o.comingSoon);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          t(p.nameKey).toLowerCase().includes(q) ||
          t(p.descriptionKey).toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (selectedSkinType && selectedSkinType !== "all") {
      result = result.filter((p) => p.skinTypes.includes(selectedSkinType));
    }
    if (selectedIngredient) {
      result = result.filter((p) =>
        p.keyIngredients.some(
          (i) => i.toLowerCase().replace(/[' ]+/g, "-") === selectedIngredient
        )
      );
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => t(a.nameKey).localeCompare(t(b.nameKey)));
        break;
    }

    return result;
  }, [selectedCategory, selectedSkinType, selectedIngredient, sortBy, searchQuery, t]);

  const hasFilters = selectedCategory || selectedSkinType || selectedIngredient || searchQuery;

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSkinType("");
    setSelectedIngredient("");
    setSearchQuery("");
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream min-h-screen">
        {/* Page Header */}
        <section className="pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-cream-dark to-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground mb-3">
                {t("catalog.title")}
              </h1>
              <p className="text-muted max-w-lg mx-auto">
                {t("catalog.subtitle")}
              </p>
            </AnimatedSection>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 min-h-11 bg-white border border-warm-beige rounded-lg text-sm text-foreground hover:border-gold/50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t("catalog.filter")}
              </button>

              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("common.search")}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-beige rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-muted/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Active filter count */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  {t("catalog.clearFilters")}
                </button>
              )}

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 bg-white border border-warm-beige rounded-lg text-sm text-foreground focus:outline-none focus:border-gold/50 cursor-pointer"
              >
                <option value="default">{t("catalog.sortDefault")}</option>
                <option value="price-low">{t("catalog.sortPriceLow")}</option>
                <option value="price-high">{t("catalog.sortPriceHigh")}</option>
                <option value="name">{t("catalog.sortName")}</option>
              </select>

              {/* View mode */}
              <div className="hidden sm:flex items-center gap-1 bg-white border border-warm-beige rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" ? "bg-gold/10 text-gold" : "text-muted hover:text-foreground"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" ? "bg-gold/10 text-gold" : "text-muted hover:text-foreground"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop sidebar filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {filterGroups.map((group) => (
                  <div key={group.id}>
                    <h3 className="text-sm font-semibold text-foreground mb-3 tracking-wide">
                      {t(group.labelKey)}
                    </h3>
                    <div className="space-y-1.5">
                      {group.options.map((option) => {
                        const isSelected =
                          (group.id === "category" && selectedCategory === option.id) ||
                          (group.id === "skinType" && selectedSkinType === option.id) ||
                          (group.id === "ingredient" && selectedIngredient === option.id);

                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              if (group.id === "category" && !option.comingSoon) setSelectedCategory(isSelected ? "" : option.id);
                              if (group.id === "skinType") setSelectedSkinType(isSelected ? "" : option.id);
                              if (group.id === "ingredient") setSelectedIngredient(isSelected ? "" : option.id);
                            }}
                            disabled={option.comingSoon}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                              option.comingSoon
                                ? "text-foreground/40 cursor-not-allowed"
                                : isSelected
                                  ? "bg-gold/10 text-gold font-medium"
                                  : "text-foreground/70 hover:bg-warm-beige/30 hover:text-foreground"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              {option.labelKey ? t(option.labelKey) : option.label}
                              {option.comingSoon && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[0.55rem] tracking-wide uppercase bg-gold/10 text-gold/70 rounded-full font-medium whitespace-nowrap">
                                  <Clock className="w-2.5 h-2.5" />
                                  {t("filter.comingSoon")}
                                </span>
                              )}
                            </span>
                            {option.count !== undefined && !option.comingSoon && (
                              <span className="text-xs text-muted">({option.count})</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {isComingSoonCategory ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                    <Clock className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-2">{t("filter.comingSoon")}</h3>
                  <p className="text-muted text-sm mb-6 max-w-md mx-auto">
                    {t("comingSoon.subtitle")}
                  </p>
                  {csSubmitted ? (
                    <div className="flex items-center justify-center gap-2 text-botanical">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">{t("comingSoon.success")}</span>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); if (csEmail) { fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: csEmail, source: "catalog" }) }).catch(() => {}); setCsSubmitted(true); setCsEmail(""); } }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                      <input
                        type="email" value={csEmail} onChange={(e) => setCsEmail(e.target.value)}
                        placeholder={t("comingSoon.emailPlaceholder")} required
                        className="flex-1 px-5 py-3 bg-white border border-warm-beige rounded-full text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-muted/60"
                      />
                      <button type="submit" className="px-6 py-3 bg-gold hover:bg-gold-light text-foreground font-medium rounded-full text-sm transition-colors flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        {t("comingSoon.subscribe")}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
              <>
              <p className="text-sm text-muted mb-6">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              </p>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted text-lg mb-4">{t("catalog.noProducts")}</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-gold/10 text-gold rounded-full text-sm font-medium hover:bg-gold/20 transition-colors"
                  >
                    {t("catalog.clearFilters")}
                  </button>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  )                  )}
                </div>
              )}
              </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-[70] shadow-2xl overflow-y-auto"
              data-lenis-prevent
            >
              <div className="flex items-center justify-between p-6 border-b border-warm-beige/50">
                <h3 className="font-serif text-xl text-foreground">{t("catalog.filter")}</h3>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-2 text-muted hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {filterGroups.map((group) => (
                  <div key={group.id}>
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      {t(group.labelKey)}
                    </h4>
                    <div className="space-y-1.5">
                      {group.options.map((option) => {
                        const isSelected =
                          (group.id === "category" && selectedCategory === option.id) ||
                          (group.id === "skinType" && selectedSkinType === option.id) ||
                          (group.id === "ingredient" && selectedIngredient === option.id);

                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              if (group.id === "category" && !option.comingSoon) setSelectedCategory(isSelected ? "" : option.id);
                              if (group.id === "skinType") setSelectedSkinType(isSelected ? "" : option.id);
                              if (group.id === "ingredient") setSelectedIngredient(isSelected ? "" : option.id);
                            }}
                            disabled={option.comingSoon}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                              option.comingSoon
                                ? "text-foreground/40 cursor-not-allowed"
                                : isSelected
                                  ? "bg-gold/10 text-gold font-medium"
                                  : "text-foreground/70 hover:bg-warm-beige/30"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              {option.labelKey ? t(option.labelKey) : option.label}
                              {option.comingSoon && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[0.55rem] tracking-wide uppercase bg-gold/10 text-gold/70 rounded-full font-medium whitespace-nowrap">
                                  <Clock className="w-2.5 h-2.5" />
                                  {t("filter.comingSoon")}
                                </span>
                              )}
                            </span>
                            {option.count !== undefined && !option.comingSoon && (
                              <span className="text-xs text-muted">({option.count})</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
