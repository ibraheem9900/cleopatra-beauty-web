"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, Plus, Edit3, Trash2, Eye, EyeOff, X, ChevronDown, Save } from "lucide-react";
import { useAdminStore } from "@/lib/store/admin";
import { useLanguageStore } from "@/lib/i18n/store";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/lib/types";

const highlightTagOptions = [
  "Hydrating", "Nourishing", "Purifying", "Detoxifying", "Refreshing",
  "Softening", "Soothing", "Comforting", "Sulfate-Free", "Cold-Processed",
  "Anti-Aging", "Moisturizing", "Exfoliating", "Calming", "Invigorating",
];

const skinTypeOptions = ["all", "dry", "oily", "sensitive", "normal", "combination"];

export default function AdminProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, toggleProductVisibility } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    const matchesStatus = !filterStatus || p.stock === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "in-stock": "bg-green-100 text-green-700",
      "low-stock": "bg-amber-100 text-amber-700",
      "out-of-stock": "bg-red-100 text-red-700",
      "pre-order": "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full capitalize ${colors[status] || ""}`}>
        {status.replace("-", " ")}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-gray-900 mb-1">Products</h1>
          <p className="text-sm text-gray-500">{products.length} products total</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setShowAddForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-white font-medium rounded-xl text-sm transition-all hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
          <option value="pre-order">Pre-Order</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cream-dark rounded-lg overflow-hidden relative flex-shrink-0">
                        {product.images[0] ? (
                          <Image src={product.images[0].src} alt={product.images[0].alt} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 capitalize">{product.category}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3.5">{statusBadge(product.stock)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleProductVisibility(product.id, product.stock === "in-stock" ? "out-of-stock" : "in-stock")}
                        className="p-2 text-gray-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
                        title={product.stock === "in-stock" ? "Set out of stock" : "Set in stock"}
                      >
                        {product.stock === "in-stock" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { setEditingProduct(product); setShowAddForm(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No products found.</p>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="font-serif text-lg text-gray-900 mb-2">Delete Product</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { deleteProduct(deleteConfirm); setDeleteConfirm(null); }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Product Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <ProductForm
            product={editingProduct}
            categories={categories}
            onClose={() => { setShowAddForm(false); setEditingProduct(null); }}
            onSave={(data) => {
              if (editingProduct) {
                updateProduct(editingProduct.id, data);
              } else {
                addProduct({
                  ...data,
                  id: data.slug || `product-${Date.now()}`,
                  tagline: "Timeless Beauty",
                  taglineKey: "site.title",
                  inci: data.inci || "",
                  scentProfile: data.scentProfile || "",
                  scentProfileKey: "",
                  usageInstructions: data.usageInstructions || "",
                  usageInstructionsKey: "",
                } as Product);
              }
              setShowAddForm(false);
              setEditingProduct(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: Product | null;
  categories: { id: string; name: string }[];
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}) {
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [category, setCategory] = useState(product?.category || "soaps");
  const [price, setPrice] = useState(product?.price.toString() || "0");
  const [description, setDescription] = useState(product?.descriptionKey || "");
  const [stock, setStock] = useState<Product["stock"]>(product?.stock || "in-stock");
  const [weight, setWeight] = useState(product?.weight || "");
  const [highlightTags, setHighlightTags] = useState<string[]>(product?.highlightTags || []);
  const [skinTypes, setSkinTypes] = useState<string[]>(product?.skinTypes || []);
  const [keyIngredients, setKeyIngredients] = useState(product?.keyIngredients?.join(", ") || "");
  const [imageSrcs, setImageSrcs] = useState(product?.images?.map((i) => i.src).join("\n") || "");
  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const images = imageSrcs.split("\n").filter(Boolean).map((src, i) => ({
      src: src.trim(),
      alt: `${name} - Image ${i + 1}`,
      altKey: "",
    }));
    onSave({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      price: parseFloat(price) || 0,
      currency: "EUR",
      description,
      descriptionKey: description,
      nameKey: name,
      subtitle: name.split(" ").slice(0, 2).join(" "),
      subtitleKey: "",
      stock,
      weight: weight || undefined,
      highlightTags,
      highlightTagsKey: [],
      skinTypes,
      keyIngredients: keyIngredients.split(",").map((s) => s.trim()).filter(Boolean),
      images,
      inci: "",
      scentProfile: "",
      scentProfileKey: "",
      usageInstructions: "",
      usageInstructionsKey: "",
    });
  };

  const toggleTag = (tag: string) => {
    setHighlightTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleSkinType = (type: string) => {
    setSkinTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-[80] p-4 pt-8 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full shadow-xl mb-8"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-lg text-gray-900">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
              <input
                type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated from name"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold cursor-pointer">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Price (EUR) *</label>
              <input
                type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={stock} onChange={(e) => setStock(e.target.value as Product["stock"])}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold cursor-pointer">
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="pre-order">Pre-Order</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description Key / Text</label>
              <input
                type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Weight</label>
              <input
                type="text" value={weight} onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 100g"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Key Ingredients (comma-separated)</label>
            <input
              type="text" value={keyIngredients} onChange={(e) => setKeyIngredients(e.target.value)}
              placeholder="e.g. Goat's Milk, Honey, Kaolin Clay"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
            />
          </div>

          {/* Highlight Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Highlight Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {highlightTagOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    highlightTags.includes(tag)
                      ? "bg-gold text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                placeholder="Custom tag..."
                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gold transition-all"
              />
              <button
                type="button"
                onClick={() => { if (newTag.trim()) { setHighlightTags([...highlightTags, newTag.trim()]); setNewTag(""); } }}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Skin Types */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Skin Types</label>
            <div className="flex flex-wrap gap-1.5">
              {skinTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleSkinType(type)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    skinTypes.includes(type)
                      ? "bg-gold text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Image URLs (one per line)</label>
            <textarea
              value={imageSrcs} onChange={(e) => setImageSrcs(e.target.value)}
              rows={3}
              placeholder="/images/product-front.jpg&#10;/images/product-lifestyle.jpg"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all font-mono text-xs"
            />
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-light text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg"
          >
            <Save className="w-4 h-4" />
            {product ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
