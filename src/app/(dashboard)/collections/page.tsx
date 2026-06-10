"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  COLLECTION_LABELS,
  COLLECTION_TYPES,
  CollectionType,
  ProductCollection,
} from "@/types/collection";
import { Product } from "@/types/product";
import { CollectionService } from "@/service/collections";
import { ProductService } from "@/service/products";
import { ProductPicker } from "@/components/collections/ProductPicker";
import { DraggableCollectionList } from "@/components/collections/DraggableCollectionList";

export default function CollectionsPage() {
  const [activeCollection, setActiveCollection] = useState<CollectionType>(CollectionType.MAIN);
  const [entries, setEntries] = useState<ProductCollection[]>([]);
  const [isCollectionLoading, setIsCollectionLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCollection = useCallback(async () => {
    setIsCollectionLoading(true);
    try {
      const res = await CollectionService.getCollections({
        collection: activeCollection,
        page: 1,
        pageSize: 100,
      });
      setEntries(res.results);
    } catch (error) {
      const message =
        error instanceof AxiosError ? error.response?.data?.message ?? error.message : "Something went wrong";
      toast.error("Failed to load collection", { description: message });
    } finally {
      setIsCollectionLoading(false);
    }
  }, [activeCollection]);

  const fetchProducts = useCallback(async () => {
    setIsProductsLoading(true);
    try {
      const res = await ProductService.getProducts({
        page: 1,
        pageSize: 50,
        isActive: true,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      setProducts(res.results);
    } catch (error) {
      const message =
        error instanceof AxiosError ? error.response?.data?.message ?? error.message : "Something went wrong";
      toast.error("Failed to load products", { description: message });
    } finally {
      setIsProductsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const collectionProductIds = useMemo(
    () => new Set(entries.map((entry) => entry.productId)),
    [entries]
  );

  const handleAddProduct = async (product: Product) => {
    if (collectionProductIds.has(product.id)) return;

    setAddingIds((prev) => new Set(prev).add(product.id));
    try {
      const created = await CollectionService.createCollection({
        collection: activeCollection,
        productId: product.id,
        position: entries.length,
      });
      setEntries((prev) => [...prev, created].sort((a, b) => a.position - b.position));
      toast.success("Product added to collection");
    } catch (error) {
      const message =
        error instanceof AxiosError ? error.response?.data?.message ?? error.message : "Something went wrong";
      toast.error("Failed to add product", { description: message });
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const handleReorder = async (reordered: ProductCollection[]) => {
    const previous = entries;
    const withPositions = reordered.map((entry, index) => ({ ...entry, position: index }));
    setEntries(withPositions);
    setIsReordering(true);

    try {
      const changed = withPositions.some((entry, index) => {
        const old = previous.find((e) => e.id === entry.id);
        return old?.position !== index;
      });

      await Promise.all(
        withPositions.map((entry, index) => {
          const old = previous.find((e) => e.id === entry.id);
          if (old?.position === index) return Promise.resolve();
          return CollectionService.updateCollection(entry.id, { position: index });
        })
      );

      if (changed) {
        toast.success("Order updated");
      }
    } catch (error) {
      setEntries(previous);
      const message =
        error instanceof AxiosError ? error.response?.data?.message ?? error.message : "Something went wrong";
      toast.error("Failed to update order", { description: message });
    } finally {
      setIsReordering(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async (id: string) => {
    setIsDeletingLoading(true);
    try {
      await CollectionService.deleteCollection(id);
      setEntries((prev) => {
        const filtered = prev.filter((entry) => entry.id !== id);
        return filtered.map((entry, index) => ({ ...entry, position: index }));
      });
      toast.success("Product removed from collection");
      setDeletingId(null);
      await fetchCollection();
    } catch (error) {
      const message =
        error instanceof AxiosError ? error.response?.data?.message ?? error.message : "Something went wrong";
      toast.error("Failed to remove product", { description: message });
    } finally {
      setIsDeletingLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Collections</h1>
        <p className="text-zinc-400">
          {entries.length} {entries.length === 1 ? "product" : "products"} in{" "}
          {COLLECTION_LABELS[activeCollection]}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {COLLECTION_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveCollection(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeCollection === type
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
            }`}
          >
            {COLLECTION_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
      <DraggableCollectionList
          entries={entries}
          isLoading={isCollectionLoading}
          isReordering={isReordering}
          collectionLabel={COLLECTION_LABELS[activeCollection]}
          deletingId={deletingId}
          isDeletingLoading={isDeletingLoading}
          onReorder={handleReorder}
          onDelete={handleDelete}
          onCancelDelete={() => setDeletingId(null)}
          onConfirmDelete={handleConfirmDelete}
        />

        <ProductPicker
          products={products}
          isLoading={isProductsLoading}
          search={search}
          onSearchChange={setSearch}
          collectionProductIds={collectionProductIds}
          addingIds={addingIds}
          onAdd={handleAddProduct}
        />
      </div>
    </div>
  );
}
