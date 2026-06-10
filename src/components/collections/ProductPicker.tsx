"use client";

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

function getProductDescription(product: Product): string | undefined {
  return (
    product.translations.find((t) => t.language.code === "en")?.description ||
    product.translations.find((t) => t.language.code === "uz")?.description ||
    product.translations[0]?.description
  );
}

function formatPrice(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface ProductPickerProps {
  products: Product[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  collectionProductIds: Set<string>;
  addingIds: Set<string>;
  onAdd: (product: Product) => void;
}

export function ProductPicker({
  products,
  isLoading,
  search,
  onSearchChange,
  collectionProductIds,
  addingIds,
  onAdd,
}: ProductPickerProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-full min-h-[480px]">
      <div className="p-4 border-b border-zinc-800 shrink-0">
        <h2 className="text-sm font-semibold text-white mb-3">Add products</h2>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or description…"
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          {search.trim() ? "Search results" : "Showing first 50 products"}
        </p>
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
            Loading products…
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500 text-sm">
            <p>No products found</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {products.map((product) => {
              const inCollection = collectionProductIds.has(product.id);
              const isAdding = addingIds.has(product.id);
              const description = getProductDescription(product);

              return (
                <li
                  key={product.id}
                  className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-zinc-800/40 transition-colors"
                >
                  {product.files[0]?.url ? (
                    <img
                      src={product.files[0].url}
                      alt=""
                      className="w-9 h-9 rounded-md object-cover bg-zinc-800 shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-md bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
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
                    <p className="text-sm font-medium text-white truncate leading-tight">
                      {getProductDisplayName(product)}
                    </p>
                    {description && (
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5 leading-snug">
                        {description}
                      </p>
                    )}
                    <div className="mt-1">
                      {product.salePrice != null ? (
                        <span className="text-xs">
                          <span className="text-emerald-400 font-medium">{formatPrice(product.salePrice)}</span>
                          <span className="text-zinc-600 line-through ml-1.5">{formatPrice(product.price)}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAdd(product)}
                    disabled={inCollection || isAdding}
                    title={inCollection ? "Already in collection" : "Add to collection"}
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all mt-0.5 ${
                      inCollection
                        ? "bg-emerald-500/15 text-emerald-400 cursor-default"
                        : isAdding
                          ? "bg-zinc-700 text-zinc-400 cursor-wait"
                          : "bg-zinc-800 text-zinc-300 hover:bg-emerald-600 hover:text-white"
                    }`}
                  >
                    {inCollection ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isAdding ? (
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
