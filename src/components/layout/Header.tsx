"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Heart } from "lucide-react";
import { navigation } from "@/data/navigation";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useLanguageStore } from "@/lib/i18n/store";
import CrownIcon from "@/components/ui/CrownIcon";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const t = useLanguageStore((s) => s.t);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-warm-beige/50"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-1 sm:gap-4">
            {/* Mobile menu button — inviting pill with a visible label and an
                icon that morphs between hamburger and close while open */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="lg:hidden flex items-center gap-1.5 pl-2.5 pr-3 py-2.5 min-h-11 rounded-full bg-cream-dark/70 border border-warm-beige/60 backdrop-blur-sm text-foreground hover:border-gold/50 hover:text-gold hover:bg-cream-dark active:scale-95 transition-all duration-200"
            >
              <span className="relative w-5 h-5 flex items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? "close" : "open"}
                    initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="flex"
                  >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="hidden min-[340px]:inline text-xs font-medium tracking-wide text-foreground/80">
                {t("nav.menu")}
              </span>
            </button>

            {/* Logo */}
            <Link href="/" className="flex flex-col items-center group shrink-0">
              <div className="flex items-center gap-1.5">
                <CrownIcon className="w-5 h-5 sm:w-7 sm:h-7 text-foreground" />
                <span className="font-serif text-[17px] sm:text-2xl font-semibold tracking-[0.1em] sm:tracking-[0.15em] text-foreground">
                  CLEOPATRA
                </span>
              </div>
              <span className="text-[8px] sm:text-[10px] tracking-[0.3em] text-muted uppercase mt-[-2px]">
                Timeless Beauty
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm tracking-wide text-foreground/80 hover:text-gold transition-colors relative group"
                >
                  {t(item.labelKey)}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              <LanguageSwitcher />
              <Link
                href="/wishlist"
                className="relative p-2 sm:p-2.5 -mr-1 text-foreground hover:text-gold transition-colors rounded-full hover:bg-warm-beige/40"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              {/* Cart — desktop only in the top bar; mobile users reach it from the menu drawer */}
              <Link
                href="/cart"
                className="hidden lg:relative lg:flex items-center p-2.5 text-foreground hover:text-gold transition-colors rounded-full hover:bg-warm-beige/40"
                aria-label="Shopping cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-in drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-[70] shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-warm-beige/50">
                <div className="flex items-center gap-1.5">
                  <CrownIcon className="w-5 h-5 text-foreground" />
                  <span className="font-serif text-lg font-semibold tracking-[0.15em]">
                    CLEOPATRA
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2.5 text-muted hover:text-foreground transition-colors rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col p-6 gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-3.5 px-4 text-base text-foreground/80 hover:text-gold hover:bg-cream-dark rounded-lg transition-all"
                  >
                    {t(item.labelKey)}
                  </Link>
                ))}
                <Link
                  href="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="py-3.5 px-4 text-base text-foreground/80 hover:text-gold hover:bg-cream-dark rounded-lg transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t("nav.cart")}
                  {itemCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-gold text-white text-[10px] font-bold rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="py-3.5 px-4 text-base text-foreground/80 hover:text-gold hover:bg-cream-dark rounded-lg transition-all flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  {t("nav.wishlist")}
                  {wishlistCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-warm-beige/50">
                <LanguageSwitcher mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20" />
    </>
  );
}