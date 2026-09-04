"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Check, Heart, Droplets, Sparkles, Leaf, Flower2 } from "lucide-react";
import { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useLanguageStore } from "@/lib/i18n/store";
import { formatPrice } from "@/lib/utils";
import { trackAddToCart } from "@/lib/analytics";
import { useState } from "react";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const t = useLanguageStore((s) => s.t);
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, items: wishlistItems } = useWishlistStore();
  const isWished = wishlistItems.some((i) => i.id === product.id);
  const shouldReduceMotion = useReducedMotion();
  const [addedFeedback, setAddedFeedback] = useState(false);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    trackAddToCart(product.id);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1200);
  };

  const primaryImage = product.images[0];

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link href={`/product/${product.slug}`} className="block group">
        <motion.div
          whileHover={shouldReduceMotion ? {} : { y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card rounded-2xl overflow-hidden shadow-sm border border-warm-beige/30 hover:shadow-xl hover:shadow-warm-beige/40 transition-shadow duration-300"
        >
          {/* Image */}
          <div className="relative aspect-square bg-cream-dark overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.src}
                alt={primaryImage.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading={index < 3 ? "eager" : "lazy"}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {product.category === "soaps" ? <Droplets className="w-12 h-12 text-gold/40" /> : product.category === "lotions" ? <Sparkles className="w-12 h-12 text-gold/40" /> : product.category === "lipCare" ? <Flower2 className="w-12 h-12 text-gold/40" /> : <Leaf className="w-12 h-12 text-gold/40" />}
              </div>
            )}
            {/* Wishlist heart */}
            <motion.button
              onClick={handleToggleWishlist}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full transition-colors hover:bg-white"
              aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isWished ? "fill-red-500 text-red-500" : "text-muted/60 hover:text-red-400"
                }`}
              />
            </motion.button>
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.highlightTags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-medium text-foreground/80 rounded-full uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 sm:p-5">
            <p className="text-[10px] text-gold tracking-[0.2em] uppercase font-medium mb-1">
              {t(product.subtitleKey)}
            </p>
            <h3 className="font-serif text-base sm:text-lg text-foreground leading-tight mb-2 group-hover:text-gold transition-colors duration-300">
              {t(product.nameKey)}
            </h3>
            <p className="text-sm text-muted line-clamp-2 mb-3 leading-relaxed">
              {t(product.descriptionKey)}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">
                {formatPrice(product.price)}
              </span>
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2.5 rounded-full transition-all duration-200 ${
                  addedFeedback
                    ? "bg-botanical text-white"
                    : "bg-gold/10 hover:bg-gold hover:text-white text-gold"
                }`}
                aria-label={`Add ${product.name} to cart`}
              >
                {addedFeedback ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
