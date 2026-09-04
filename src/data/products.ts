import { Product } from "../lib/types";

export const products: Product[] = [
  {
    id: "royal-milk-soap",
    slug: "royal-milk-soap",
    name: "Royal Milk Soap",
    nameKey: "product.royalMilk.name",
    subtitle: "Royal Milk",
    subtitleKey: "product.royalMilk.subtitle",
    tagline: "Timeless Beauty",
    taglineKey: "site.title",
    category: "soaps",
    price: 12.90,
    currency: "EUR",
    images: [
      { src: "/images/royal-milk-front.jpg", alt: "Royal Milk Soap - Front view", altKey: "product.royalMilk.name" },
      { src: "/images/royal-milk-lifestyle.jpg", alt: "Royal Milk Soap - With milk bottle", altKey: "product.royalMilk.name" },
      { src: "/images/royal-milk-promo.png", alt: "Royal Milk Soap - Lifestyle", altKey: "product.royalMilk.name" },
    ],
    inci: "product.royalMilk.inci",
    scentProfile: "product.royalMilk.scent",
    scentProfileKey: "product.royalMilk.scent",
    usageInstructions: "product.royalMilk.usage",
    usageInstructionsKey: "product.royalMilk.usage",
    highlightTags: ["Hydrating", "Nourishing", "Daily Use"],
    highlightTagsKey: [],
    skinTypes: ["all", "dry", "normal", "sensitive"],
    keyIngredients: ["Goat's Milk", "Honey", "Kaolin Clay"],
    description: "product.royalMilk.description",
    descriptionKey: "product.royalMilk.description",
    stock: "in-stock",
    weight: "100g",
  },
  {
    id: "black-pearl-charcoal-soap",
    slug: "black-pearl-charcoal-soap",
    name: "Black Pearl Charcoal Soap",
    nameKey: "product.blackPearl.name",
    subtitle: "Black Pearl",
    subtitleKey: "product.blackPearl.subtitle",
    tagline: "Timeless Beauty",
    taglineKey: "site.title",
    category: "soaps",
    price: 11.90,
    currency: "EUR",
    images: [
      { src: "/images/black-pearl-front.jpg", alt: "Black Pearl Charcoal Soap - Front view", altKey: "product.blackPearl.name" },
      { src: "/images/black-pearl-lifestyle.jpg", alt: "Black Pearl Charcoal Soap - Dark background", altKey: "product.blackPearl.name" },
    ],
    inci: "product.blackPearl.inci",
    scentProfile: "product.blackPearl.scent",
    scentProfileKey: "product.blackPearl.scent",
    usageInstructions: "product.blackPearl.usage",
    usageInstructionsKey: "product.blackPearl.usage",
    highlightTags: ["Purifying", "Detoxifying", "Refreshing"],
    highlightTagsKey: [],
    skinTypes: ["oily", "combination", "normal"],
    keyIngredients: ["Activated Charcoal", "Tea Tree Oil", "Eucalyptus"],
    description: "product.blackPearl.description",
    descriptionKey: "product.blackPearl.description",
    stock: "in-stock",
    weight: "100g",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products;
}
