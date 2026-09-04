"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Heart, Home, Store, Info } from "lucide-react";
import { navigation } from "@/data/navigation";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useLanguageStore } from "@/lib/i18n/store";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const t = useLanguageStore((s) => s.t);
  const pathname = usePathname();

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

  const bottomNav = [
    { href: "/", labelKey: "nav.home", icon: Home },
    { href: "/catalog", labelKey: "nav.catalog", icon: Store },
    { href: "/about", labelKey: "nav.about", icon: Info },
  ];

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
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            {/* Mobile menu button — icon + label for discoverability */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center gap-1.5 p-2 -ml-2 min-h-11 text-foreground hover:text-gold transition-colors rounded-lg"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden min-[380px]:inline text-xs font-medium tracking-wide text-foreground/70">
                {t("nav.menu")}
              </span>
            </button>

            {/* Logo */}
            <Link href="/" className="flex flex-col items-center group shrink-0">
              <div className="flex items-center gap-1.5">
                <CrownIcon className="w-5 h-5 sm:w-7 sm:h-7 text-foreground" />
                <span className="font-serif text-lg sm:text-2xl font-semibold tracking-[0.12em] sm:tracking-[0.15em] text-foreground">
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
                className="relative p-2.5 -mr-1 text-foreground hover:text-gold transition-colors rounded-full hover:bg-warm-beige/40"
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
              {/* Cart — hidden on mobile, lives in the bottom nav */}
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

      {/* Mobile bottom navigation — primary nav on phones (discoverable, thumb-friendly) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-warm-beige/60 shadow-[0_-4px_20px_rgba(45,42,38,0.06)] pb-safe"
        aria-label="Primary"
      >
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {bottomNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-colors ${
                  active ? "text-gold" : "text-foreground/55 hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium tracking-wide">
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
          {/* Cart */}
          <Link
            href="/cart"
            className={`relative flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-colors ${
              pathname === "/cart" ? "text-gold" : "text-foreground/55 hover:text-foreground"
            }`}
          >
            <span className="relative">
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-2.5 bg-gold text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span className="text-[10px] font-medium tracking-wide">
              {t("nav.cart")}
            </span>
          </Link>
        </div>
      </nav>

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20" />
    </>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L14.5 8L20 6L17 12H7L4 6L9.5 8L12 2Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M6 14H18V16C18 17.1 17.1 18 16 18H8C6.9 18 6 17.1 6 16V14Z" fill="currentColor" opacity="0.85" />
    </svg>
  );
}