import { Category, FilterGroup } from "../lib/types";
import { products } from "./products";

// Categories — add new ones here only, no code changes needed elsewhere
export const categories: Category[] = [
  { id: "soaps", name: "Soaps", nameKey: "filter.soaps", slug: "soaps", comingSoon: false },
  { id: "lotions", name: "Lotions", nameKey: "filter.lotions", slug: "lotions", comingSoon: true },
  { id: "lipCare", name: "Lip Care", nameKey: "filter.lipCare", slug: "lip-care", comingSoon: true },
  { id: "hairOils", name: "Hair Oils", nameKey: "filter.hairOils", slug: "hair-oils", comingSoon: true },
];

export const skinTypes = [
  { id: "all", label: "All Skin Types", labelKey: "filter.allSkinTypes" },
  { id: "dry", label: "Dry Skin", labelKey: "filter.drySkin" },
  { id: "oily", label: "Oily Skin", labelKey: "filter.oilySkin" },
  { id: "sensitive", label: "Sensitive Skin", labelKey: "filter.sensitiveSkin" },
  { id: "normal", label: "Normal Skin", labelKey: "filter.normalSkin" },
  { id: "combination", label: "Combination Skin", labelKey: "filter.combinationSkin" },
];

export const keyIngredients = [
  "Honey",
  "Goat's Milk",
  "Activated Charcoal",
  "Tea Tree Oil",
  "Shea Butter",
  "Colloidal Oatmeal",
  "Kaolin Clay",
  "Eucalyptus",
];

export function getFilterGroups(): FilterGroup[] {
  const categoryCounts = categories.map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category === cat.id).length,
  }));

  const ingredientSet = new Set<string>();
  products.forEach((p) => p.keyIngredients.forEach((i) => ingredientSet.add(i)));
  const ingredientFilters = Array.from(ingredientSet).map((ing) => ({
    id: ing.toLowerCase().replace(/[' ]+/g, "-"),
    label: ing,
    labelKey: ing,
    count: products.filter((p) => p.keyIngredients.includes(ing)).length,
  }));

  return [
    {
      id: "category",
      label: "Category",
      labelKey: "catalog.filterCategory",
      options: categoryCounts.map((c) => ({
        id: c.id,
        label: c.name,
        labelKey: c.nameKey,
        count: c.count,
        comingSoon: c.comingSoon,
      })),
    },
    {
      id: "skinType",
      label: "Skin Type",
      labelKey: "catalog.filterSkinType",
      options: skinTypes.map((s) => ({
        id: s.id,
        label: s.label,
        labelKey: s.labelKey,
      })),
    },
    {
      id: "ingredient",
      label: "Key Ingredient",
      labelKey: "catalog.filterIngredient",
      options: ingredientFilters,
    },
  ];
}
