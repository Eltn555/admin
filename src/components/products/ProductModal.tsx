"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category } from "@/types/category";
import { CreateProductDto, Product } from "@/types/product";
import { ProductService } from "@/service/products";
import { LanguageCode } from "@/types/category";

const LANGUAGES = [
  { code: LanguageCode.ENGLISH, label: "EN", name: "English" },
  { code: LanguageCode.UZBEK, label: "UZ", name: "Uzbek" },
  { code: LanguageCode.RUSSIAN, label: "RU", name: "Russian" },
];

interface TranslationState {
  name: string;
  description: string;
}

interface ProductModalProps {
  product?: Product;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

function getCategoryDisplayName(category: Category): string {
  return (
    category.translations.find((t) => t.language.code === "en")?.name ||
    category.translations.find((t) => t.language.code === "uz")?.name ||
    category.translations[0]?.name ||
    category.slug ||
    category.id.slice(0, 8)
  );
}

export function ProductModal({ product, categories, onClose, onSuccess }: ProductModalProps) {
  const isEdit = !!product;
  const [activeTab, setActiveTab] = useState<LanguageCode>(LanguageCode.ENGLISH);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [translations, setTranslations] = useState<Record<string, TranslationState>>(() => {
    const init: Record<string, TranslationState> = {};
    LANGUAGES.forEach(({ code }) => {
      const existing = product?.translations.find((t) => t.language.code === code);
      init[code] = {
        name: existing?.name ?? "",
        description: existing?.description ?? "",
      };
    });
    return init;
  });

  const [slug, setSlug] = useState(product?.slug ?? "");
  const [price, setPrice] = useState(product?.price != null ? String(product.price) : "");
  const [salePrice, setSalePrice] = useState(product?.salePrice != null ? String(product.salePrice) : "");
  const [stock, setStock] = useState(product?.stock != null ? String(product.stock) : "0");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.categories.map((c) => c.id) ?? []
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateTranslation = (lang: string, field: "name" | "description", value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filledTranslations = LANGUAGES.filter(({ code }) =>
      translations[code]?.name.trim()
    ).map(({ code }) => ({
      languageCode: code,
      name: translations[code].name.trim(),
      description: translations[code].description.trim() || undefined,
    }));

    if (filledTranslations.length === 0) {
      toast.error("At least one translation name is required");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const dto: CreateProductDto = {
      translations: filledTranslations,
      slug: slug.trim() || undefined,
      price: parsedPrice,
      salePrice: salePrice.trim() ? parseFloat(salePrice) : undefined,
      stock: parseInt(stock) || 0,
      isActive,
      categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
    };

    setIsLoading(true);
    try {
      if (isEdit) {
        await ProductService.updateProduct(product.id, dto);
        toast.success("Product updated successfully");
      } else {
        await ProductService.createProduct(dto);
        toast.success("Product created successfully");
      }
      onSuccess();
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ?? error.message
          : "Something went wrong";
      toast.error(isEdit ? "Failed to update product" : "Failed to create product", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategories = categories.filter((c) => selectedCategoryIds.includes(c.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEdit ? "Edit Product" : "New Product"}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isEdit ? `Editing "${translations[LanguageCode.ENGLISH]?.name || product.id.slice(0, 8)}"` : "Fill in at least one language"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="px-6 py-5 space-y-5 overflow-y-auto">
            {/* Language Tabs */}
            <div>
              <div className="flex gap-1 mb-4 bg-zinc-800 p-1 rounded-xl">
                {LANGUAGES.map(({ code, label }) => {
                  const hasFilled = !!translations[code]?.name;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setActiveTab(code as LanguageCode)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        activeTab === code
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {label}
                      {hasFilled && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            activeTab === code ? "bg-white/60" : "bg-emerald-500"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                <Input
                  label={`Name (${LANGUAGES.find((l) => l.code === activeTab)?.name})`}
                  placeholder="Product name"
                  value={translations[activeTab]?.name ?? ""}
                  onChange={(e) => updateTranslation(activeTab, "name", e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description ({LANGUAGES.find((l) => l.code === activeTab)?.name}) — optional
                  </label>
                  <textarea
                    placeholder="Product description"
                    value={translations[activeTab]?.description ?? ""}
                    onChange={(e) => updateTranslation(activeTab, "description", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="border-t border-zinc-800 pt-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Price *"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <Input
                  label="Sale Price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="optional"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                />
                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>

              <Input
                label="Slug (optional)"
                placeholder="auto-generated if empty"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              {/* Category Multi-select */}
              {categories.length > 0 && (
                <div ref={dropdownRef} className="relative">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Categories
                  </label>
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                  >
                    <span className={selectedCategoryIds.length ? "text-white text-sm" : "text-zinc-500 text-sm"}>
                      {selectedCategoryIds.length
                        ? `${selectedCategoryIds.length} ${selectedCategoryIds.length === 1 ? "category" : "categories"} selected`
                        : "Select categories…"}
                    </span>
                    <svg
                      className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${categoryDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {categoryDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
                      <div className="max-h-48 overflow-y-auto p-1">
                        {categories.map((category) => {
                          const isSelected = selectedCategoryIds.includes(category.id);
                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => toggleCategory(category.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                isSelected
                                  ? "bg-emerald-600/20 text-emerald-300"
                                  : "text-zinc-300 hover:bg-zinc-700"
                              }`}
                            >
                              <span
                                className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-emerald-600 border-emerald-600"
                                    : "border-zinc-600"
                                }`}
                              >
                                {isSelected && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                              {getCategoryDisplayName(category)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected chips */}
                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedCategories.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-emerald-600/15 text-emerald-400 text-xs rounded-lg border border-emerald-700/30"
                        >
                          {getCategoryDisplayName(cat)}
                          <button
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className="ml-0.5 text-emerald-500 hover:text-white transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center justify-between py-3 px-4 bg-zinc-800 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">Active</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Show this product publicly</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-800 ${
                    isActive ? "bg-emerald-600" : "bg-zinc-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      isActive ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-zinc-800 shrink-0">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              {isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
