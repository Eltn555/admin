"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Category, CategoriesResponse } from "@/types/category";
import { CategoryService } from "@/service/categories";
import { CategoryModal } from "@/components/categories/CategoryModal";

function getCategoryDisplayName(category: Category): string {
  return (
    category.translations.find((t) => t.language.code === "en")?.name ||
    category.translations.find((t) => t.language.code === "uz")?.name ||
    category.translations[0]?.name ||
    category.slug ||
    category.id.slice(0, 8)
  );
}

export default function CategoriesPage() {
  const [data, setData] = useState<CategoriesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await CategoryService.getCategories({ page, pageSize: 20 });
      setData(res);
    } catch (error) {
      const message = error instanceof AxiosError ? error.response?.data?.message ?? error.message : "Something went wrong";
      toast.error("Failed to load categories", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditingCategory(undefined);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeletingLoading(true);
    try {
      await CategoryService.deleteCategory(id);
      toast.success("Category deleted");
      setDeletingId(null);
      fetchCategories();
    } catch (error) {
      const message = error instanceof AxiosError ? error.response?.data?.message ?? error.message : "Something went wrong";
      toast.error("Failed to delete category", { description: message });
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setEditingCategory(undefined);
    fetchCategories();
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Categories</h1>
          <p className="text-zinc-400">
            {data
              ? `${data.totalCount} ${data.totalCount === 1 ? "category" : "categories"} total`
              : "Manage your product categories"}
          </p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Category
        </Button>
      </div>

      {/* Table card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-32 text-zinc-400 gap-3">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading categories…
          </div>
        ) : !data?.results.length ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="font-medium text-zinc-400">No categories yet</p>
            <p className="text-sm mt-1">Click &quot;New Category&quot; to create your first one</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Pos
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Children
                    </th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {data.results.map((category) => (
                    <tr key={category.id} className="hover:bg-zinc-800/40 transition-colors group">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {getCategoryDisplayName(category)}
                          </p>
                          <p className="text-xs text-zinc-600 mt-0.5 font-mono">
                            {category.id.slice(0, 8)}…
                          </p>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-400 font-mono">
                          {category.slug || <span className="text-zinc-600 italic">—</span>}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            category.isActive
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-zinc-700/60 text-zinc-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              category.isActive ? "bg-emerald-400" : "bg-zinc-500"
                            }`}
                          />
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Position */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-400">{category.position}</span>
                      </td>

                      {/* Parent */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-400 font-mono">
                          {category.parent?.slug || <span className="text-zinc-600 italic">—</span>}
                        </span>
                      </td>

                      {/* Children count */}
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm ${
                            category._count.children > 0 ? "text-zinc-300 font-medium" : "text-zinc-600"
                          }`}
                        >
                          {category._count.children}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(category)}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          {deletingId === category.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(category.id)}
                                disabled={isDeletingLoading}
                                className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all disabled:opacity-50"
                              >
                                {isDeletingLoading ? "…" : "Confirm"}
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                disabled={isDeletingLoading}
                                className="px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(category.id)}
                              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                <p className="text-sm text-zinc-500">
                  Page {data.page} of {data.totalPages} &middot; {data.totalCount} total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <CategoryModal
          category={editingCategory}
          categories={data?.results ?? []}
          onClose={() => {
            setModalOpen(false);
            setEditingCategory(undefined);
          }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
