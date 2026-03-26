"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/FileUpload";
import { Category, CreateCategoryDto, LanguageCode } from "@/types/category";
import { CategoryService } from "@/service/categories";
import { UploadedFile } from "@/types/file";

const LANGUAGES = [
  { code: LanguageCode.ENGLISH, label: "EN", name: "English" },
  { code: LanguageCode.UZBEK, label: "UZ", name: "Uzbek" },
  { code: LanguageCode.RUSSIAN, label: "RU", name: "Russian" },
];

interface TranslationState {
  name: string;
  description: string;
}

interface CategoryModalProps {
  category?: Category;
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

export function CategoryModal({ category, categories, onClose, onSuccess }: CategoryModalProps) {
  const isEdit = !!category;

  const [activeTab, setActiveTab] = useState<LanguageCode>(LanguageCode.ENGLISH);
  const [isLoading, setIsLoading] = useState(false);

  const [translations, setTranslations] = useState<Record<string, TranslationState>>(() => {
    const init: Record<string, TranslationState> = {};
    LANGUAGES.forEach(({ code }) => {
      const existing = category?.translations.find((t) => t.language.code === code);
      init[code] = {
        name: existing?.name ?? "",
        description: existing?.description ?? "",
      };
    });
    return init;
  });

  const [slug, setSlug] = useState(category?.slug ?? "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [position, setPosition] = useState(String(category?.position ?? 0));
  const [parentId, setParentId] = useState(category?.parentId ?? "");
  const [files, setFiles] = useState<UploadedFile[]>(category?.files ?? []);

  const updateTranslation = (lang: string, field: "name" | "description", value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
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

    const dto: CreateCategoryDto = {
      translations: filledTranslations,
      slug: slug.trim() || undefined,
      isActive,
      position: parseInt(position) || 0,
      parentId: parentId || undefined,
      fileId: files[0]?.id || undefined,
    };

    setIsLoading(true);
    try {
      if (isEdit) {
        await CategoryService.updateCategory(category.id, dto);
        toast.success("Category updated successfully");
      } else {
        await CategoryService.createCategory(dto);
        toast.success("Category created successfully");
      }
      onSuccess();
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ?? error.message
          : "Something went wrong";
      toast.error(isEdit ? "Failed to update category" : "Failed to create category", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parentOptions = categories.filter((c) => c.id !== category?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isEdit ? "Edit Category" : "New Category"}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isEdit ? `Editing "${getCategoryDisplayName(category)}"` : "Fill in at least one language"}
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
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === code ? "bg-white/60" : "bg-emerald-500"}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                <Input
                  label={`Name (${LANGUAGES.find((l) => l.code === activeTab)?.name})`}
                  placeholder="Category name"
                  value={translations[activeTab]?.name ?? ""}
                  onChange={(e) => updateTranslation(activeTab, "name", e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description ({LANGUAGES.find((l) => l.code === activeTab)?.name}) — optional
                  </label>
                  <textarea
                    placeholder="Short description of this category"
                    value={translations[activeTab]?.description ?? ""}
                    onChange={(e) => updateTranslation(activeTab, "description", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Other Fields */}
            <div className="border-t border-zinc-800 pt-5 space-y-4">
              <Input
                label="Slug (optional)"
                placeholder="auto-generated if empty"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Position"
                  type="number"
                  min="0"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Parent Category
                  </label>
                  <div className="relative">
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full appearance-none px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 pr-10"
                    >
                      <option value="">None (root)</option>
                      {parentOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {getCategoryDisplayName(c)}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between py-3 px-4 bg-zinc-800 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">Active</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Show this category publicly</p>
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

              {/* Image upload — single image for category */}
              <FileUpload
                label="Category Image"
                value={files}
                onChange={setFiles}
                multiple={false}
                params={isEdit ? { entityType: "CATEGORY", entityId: category.id, type: "CATEGORY" } : undefined}
              />
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
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
