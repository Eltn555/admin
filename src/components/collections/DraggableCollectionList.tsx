"use client";

import { useRef, useState } from "react";
import { ProductCollection } from "@/types/collection";
import { Product } from "@/types/product";

function getProductDisplayName(product: Product): string {
  return (
    product.translations.find((t) => t.language.code === "en")?.name ||
    product.translations.find((t) => t.language.code === "uz")?.name ||
    product.translations[0]?.name ||
    product.slug ||
    product.id.slice(0, 8)
  );
}

function formatPrice(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface DraggableCollectionListProps {
  entries: ProductCollection[];
  isLoading: boolean;
  isReordering: boolean;
  collectionLabel: string;
  deletingId: string | null;
  isDeletingLoading: boolean;
  onReorder: (reordered: ProductCollection[]) => void;
  onDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
}

export function DraggableCollectionList({
  entries,
  isLoading,
  isReordering,
  collectionLabel,
  deletingId,
  isDeletingLoading,
  onReorder,
  onDelete,
  onCancelDelete,
  onConfirmDelete,
}: DraggableCollectionListProps) {
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
    setDraggingIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (dragIndex.current === null || dragIndex.current === index) return;
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    const from = dragIndex.current;
    const to = dragOverIndex;

    if (from !== null && to !== null && from !== to) {
      const reordered = [...entries];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      onReorder(reordered.map((entry, index) => ({ ...entry, position: index })));
    }

    dragIndex.current = null;
    setDragOverIndex(null);
    setDraggingIndex(null);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-full min-h-[480px]">
      <div className="p-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{collectionLabel}</h2>
          <span className="text-xs text-zinc-500">{entries.length} products</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Drag items to reorder positions</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-zinc-400 gap-2 text-sm">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading collection…
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500 text-sm px-4 text-center">
            <p className="font-medium text-zinc-400">No products yet</p>
            <p className="mt-1">Use the search panel to add products to this collection</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {entries.map((entry, index) => (
              <li
                key={entry.id}
                draggable={!isReordering && deletingId !== entry.id}
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 px-3 py-2.5 transition-all ${
                  draggingIndex === index ? "opacity-40" : ""
                } ${dragOverIndex === index && draggingIndex !== index ? "bg-emerald-500/10 border-y border-emerald-500/30" : "hover:bg-zinc-800/40"}`}
              >
                <button
                  type="button"
                  className="shrink-0 p-1 text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing"
                  tabIndex={-1}
                  aria-hidden
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6-11a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                  </svg>
                </button>

                <span className="shrink-0 w-6 text-center text-xs font-mono text-zinc-500">
                  {entry.position}
                </span>

                {entry.product.files[0]?.url ? (
                  <img
                    src={entry.product.files[0].url}
                    alt=""
                    className="w-9 h-9 rounded-md object-cover bg-zinc-800 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-md bg-zinc-800 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {getProductDisplayName(entry.product)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {entry.product.salePrice != null ? (
                      <>
                        <span className="text-emerald-400">{formatPrice(entry.product.salePrice)}</span>
                        <span className="line-through ml-1.5">{formatPrice(entry.product.price)}</span>
                      </>
                    ) : (
                      formatPrice(entry.product.price)
                    )}
                  </p>
                </div>

                {deletingId === entry.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onConfirmDelete(entry.id)}
                      disabled={isDeletingLoading}
                      className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                    >
                      {isDeletingLoading ? "…" : "Remove"}
                    </button>
                    <button
                      type="button"
                      onClick={onCancelDelete}
                      disabled={isDeletingLoading}
                      className="px-2 py-1 text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id)}
                    disabled={isReordering}
                    className="shrink-0 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-40"
                    title="Remove from collection"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isReordering && (
        <div className="px-4 py-2 border-t border-zinc-800 text-xs text-zinc-500 text-center">
          Saving new order…
        </div>
      )}
    </div>
  );
}
