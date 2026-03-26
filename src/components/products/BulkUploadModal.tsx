"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { BulkUploadResponse, BulkUploadResult } from "@/types/product";
import { ProductService } from "@/service/products";

interface BulkUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function formatPrice(value: number): string {
  return value.toLocaleString("en-US");
}

export function BulkUploadModal({ onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [results, setResults] = useState<BulkUploadResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleDownloadSample = async () => {
    setIsDownloading(true);
    try {
      await ProductService.downloadBulkSample();
    } catch (error) {
      const message = error instanceof AxiosError ? error.response?.data?.message ?? error.message : "Download failed";
      toast.error("Failed to download sample", { description: message });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    setIsUploading(true);
    try {
      const res = await ProductService.bulkUpload(file);
      setResults(res);
      onSuccess();
    } catch (error) {
      const message = error instanceof AxiosError ? error.response?.data?.message ?? error.message : "Upload failed";
      toast.error("Bulk upload failed", { description: message });
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResults(null);
  };

  const actionBadge = (result: BulkUploadResult) => {
    if (!result.success) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/10 text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Failed
        </span>
      );
    }
    if (result.action === "created") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Created
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        Updated
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isUploading ? onClose : undefined} />

      <div
        className={`relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] transition-all duration-200 ${
          results ? "w-full max-w-5xl" : "w-full max-w-xl"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {results ? "Upload Complete" : "Bulk Product Upload"}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {results
                ? `${results.total} rows processed`
                : "Download the sample file, fill it in, then upload"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-40"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Results view ───────────────────────────────────── */}
        {results ? (
          <>
            {/* Summary */}
            <div className="px-6 pt-5 pb-4 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total", value: results.total, color: "text-white", bg: "bg-zinc-800" },
                  { label: "Success", value: results.totalSuccess, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "Created", value: results.createdProducts, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Updated", value: results.updatedProducts, color: "text-purple-400", bg: "bg-purple-500/10" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl px-4 py-3`}>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              {results.totalFailed > 0 && (
                <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-400">
                    <span className="font-semibold">{results.totalFailed} rows failed.</span> Check the table below for details.
                  </p>
                </div>
              )}
            </div>

            {/* Results table */}
            <div className="overflow-auto flex-1 border-t border-zinc-800">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-zinc-900 z-10">
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-10">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {results.results.map((r) => (
                    <tr
                      key={r.row}
                      className={`transition-colors ${r.success ? "hover:bg-zinc-800/30" : "bg-red-500/5 hover:bg-red-500/10"}`}
                    >
                      <td className="px-4 py-3 text-zinc-600 font-mono text-xs">{r.row}</td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium truncate max-w-[220px]">{r.name}</p>
                        {!r.success && (
                          <p className="text-xs text-red-400 mt-0.5 truncate max-w-[220px]">{r.message}</p>
                        )}
                        <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[220px]">{r.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{r.categoryName}</td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{formatPrice(r.price)}</p>
                        {r.salePrice != null && (
                          <p className="text-xs text-emerald-400">{formatPrice(r.salePrice)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">{actionBadge(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-zinc-800 shrink-0">
              <Button variant="secondary" className="flex-1" onClick={reset}>
                Upload Another
              </Button>
              <Button className="flex-1" onClick={onClose}>
                Done
              </Button>
            </div>
          </>
        ) : (
          /* ── Upload form ─────────────────────────────────── */
          <div className="flex flex-col min-h-0">
            <div className="px-6 py-5 space-y-5">
              {/* Step 1 */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Step 1 — Download sample
                </p>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-xl text-sm font-medium text-zinc-300 hover:text-white transition-all duration-200 disabled:opacity-50"
                >
                  {isDownloading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                  {isDownloading ? "Downloading…" : "Download Sample (.xlsx)"}
                </button>
              </div>

              {/* Step 2 */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Step 2 — Upload filled file
                </p>

                {/* Drop zone */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  className={`flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed rounded-xl cursor-pointer select-none outline-none transition-all duration-200 ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-500/5"
                      : file
                        ? "border-zinc-600 bg-zinc-800/50"
                        : "border-zinc-700 bg-zinc-800/30 hover:border-zinc-500 hover:bg-zinc-800/60"
                  }`}
                >
                  {file ? (
                    <>
                      <div className="p-3 bg-emerald-500/15 rounded-xl">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white">{file.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {(file.size / 1024).toFixed(1)} KB &middot; click to change
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`p-3 rounded-xl ${isDragging ? "bg-emerald-500/20" : "bg-zinc-700/50"}`}>
                        <svg
                          className={`w-6 h-6 ${isDragging ? "text-emerald-400" : "text-zinc-400"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-medium ${isDragging ? "text-emerald-400" : "text-zinc-300"}`}>
                          {isDragging ? "Drop file here" : "Click or drag & drop"}
                        </p>
                        <p className="text-xs text-zinc-600 mt-0.5">CSV or XLSX</p>
                      </div>
                    </>
                  )}

                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-zinc-800">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleUpload}
                isLoading={isUploading}
                disabled={!file}
              >
                Upload
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
