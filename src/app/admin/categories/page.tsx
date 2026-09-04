"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Plus, Edit3, Trash2, GripVertical, X, Save, FolderTree, Droplets, Sparkles, Flower2, Leaf } from "lucide-react";
import { useAdminStore } from "@/lib/store/admin";
import { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useAdminStore();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleReorder = (newOrder: Category[]) => {
    reorderCategories(newOrder.map((c) => c.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-gray-900 mb-1">Categories</h1>
          <p className="text-sm text-gray-500">{categories.length} categories — drag to reorder</p>
        </div>
        <button
          onClick={() => { setEditingCategory(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-white font-medium rounded-xl text-sm transition-all hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Reorderable Category List */}
      <Reorder.Group axis="y" values={categories} onReorder={handleReorder} className="space-y-3">
        {categories.map((category) => (
          <Reorder.Item key={category.id} value={category}>
            <motion.div
              layout
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-5 h-5 text-gray-300 flex-shrink-0" />
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {category.icon || "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                <p className="text-xs text-gray-500">/{category.slug} • ID: {category.id}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditingCategory(category); setShowForm(true); }}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(category.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {categories.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderTree className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No categories yet. Add your first category.</p>
        </div>
      )}

      {/* Delete Confirmation */}
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
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="font-serif text-lg text-gray-900 mb-2">Delete Category</h3>
              <p className="text-sm text-gray-500 mb-6">
                Products in this category won&apos;t be deleted. They&apos;ll need to be reassigned.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                <button
                  onClick={() => { deleteCategory(deleteConfirm); setDeleteConfirm(null); }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <CategoryForm
            category={editingCategory}
            onClose={() => { setShowForm(false); setEditingCategory(null); }}
            onSave={(data) => {
              if (editingCategory) {
                updateCategory(editingCategory.id, data);
              } else {
                addCategory({
                  ...data,
                  id: data.slug || `cat-${Date.now()}`,
                  nameKey: `filter.${data.slug}`,
                } as Category);
              }
              setShowForm(false);
              setEditingCategory(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryForm({
  category,
  onClose,
  onSave,
}: {
  category: Category | null;
  onClose: () => void;
  onSave: (data: Partial<Category>) => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [icon, setIcon] = useState(category?.icon || "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full shadow-xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-lg text-gray-900">{category ? "Edit Category" : "Add Category"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), icon });
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category Name *</label>
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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
            <select
              value={icon} onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
            >
              <option value="Droplets">Droplets</option>
              <option value="Sparkles">Sparkles</option>
              <option value="Flower2">Flower</option>
              <option value="Leaf">Leaf</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-light text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg"
            >
              <Save className="w-4 h-4" />
              {category ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
