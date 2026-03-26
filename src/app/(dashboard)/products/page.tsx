"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Product, ProductsResponse } from "@/types/product";
import { Category, CategoriesResponse } from "@/types/category";
import { ProductService } from "@/service/products";
import { CategoryService } from "@/service/categories";
import { ProductModal } from "@/components/products/ProductModal";
import { BulkUploadModal } from "@/components/products/BulkUploadModal";

function getProductDisplayName(product: Product): string {
  return (
    product.translations.find((t) => t.language.code === "en")?.name ||
    product.translations.find((t) => t.language.code === "uz")?.name ||
    product.translations[0]?.name ||
    product.id.slice(0, 8)
  );
}

/**
 * Format price to 2 decimal places
 * @param value - Price value 1000000 -> 1 000 000
 * @returns Formatted price 1 000 000
 */
function formatPrice(value: number): string {
  const formattedValue = value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function ProductsPage() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ProductService.getProducts({ page, pageSize: 20 });
      setData(res);
    } catch (error) {
      const message =
        error instanceof AxiosError ? error.response?.data?.message ?? error.message : "Something went wrong";
      toast.error("Failed to load products", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  // Load categories once for the modal's category selector
  useEffect(() => {
    CategoryService.getCategories({ pageSize: 100, page: 1 })
      .then((res: CategoriesResponse) => setCategories(res.results))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreate = () => {
    setEditingProduct(undefined);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeletingLoading(true);
    try {
      await ProductService.deleteProduct(id);
      toast.success("Product deleted");
      setDeletingId(null);
      fetchProducts();
    } catch (error) {
      const message =
        error instanceof AxiosError ? error.response?.data?.message ?? error.message : "Something went wrong";
      toast.error("Failed to delete product", { description: message });
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setEditingProduct(undefined);
    fetchProducts();
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Products</h1>
          <p className="text-zinc-400">
            {data
              ? `${data.totalCount} ${data.totalCount === 1 ? "product" : "products"} total`
              : "Manage your product catalog"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setBulkModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Bulk Upload
          </Button>
          <Button onClick={openCreate}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Product
          </Button>
        </div>
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
            Loading products…
          </div>
        ) : !data?.results.length ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="font-medium text-zinc-400">No products yet</p>
            <p className="text-sm mt-1">Click &quot;New Product&quot; to add your first one</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {data.results.map((product) => (
                    <tr key={product.id} className="hover:bg-zinc-800/40 transition-colors group">
                      {/* Product name */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {getProductDisplayName(product)}
                          </p>
                          <p className="text-xs text-zinc-600 mt-0.5 font-mono">
                            {product.slug}
                          </p>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        {product.salePrice != null ? (
                          <div>
                            <p className="text-sm font-semibold text-emerald-400">
                              {formatPrice(product.salePrice)} UZS
                            </p>
                            <p className="text-xs text-zinc-500 line-through mt-0.5">
                              {formatPrice(product.price)} UZS
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-white">
                            {formatPrice(product.price)} UZS
                          </p>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            product.stock > 0
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.stock > 0 ? "bg-blue-400" : "bg-red-400"
                            }`}
                          />
                          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            product.isActive
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-zinc-700/60 text-zinc-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.isActive ? "bg-emerald-400" : "bg-zinc-500"
                            }`}
                          />
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Categories */}
                      <td className="px-6 py-4">
                        {product.categories.length === 0 ? (
                          <span className="text-zinc-600 italic text-sm">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {product.categories.slice(0, 2).map((cat) => (
                              <span
                                key={cat.id}
                                className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-md font-mono"
                              >
                                {cat.slug}
                              </span>
                            ))}
                            {product.categories.length > 2 && (
                              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-xs rounded-md">
                                +{product.categories.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(product)}
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

                          {deletingId === product.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(product.id)}
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
                              onClick={() => setDeletingId(product.id)}
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

      {/* Bulk upload modal */}
      {bulkModalOpen && (
        <BulkUploadModal
          onClose={() => setBulkModalOpen(false)}
          onSuccess={fetchProducts}
        />
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(undefined);
          }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
