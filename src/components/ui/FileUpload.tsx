"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { UploadedFile, UploadFileParams } from "@/types/file";
import { FileService } from "@/service/files";

interface FileUploadProps {
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  /** false = single image (e.g. category), true = multiple (e.g. product) */
  multiple?: boolean;
  /** Pass for update flow: entityType, entityId, type — omit for create (PENDING) */
  params?: UploadFileParams;
  accept?: string;
  label?: string;
  className?: string;
}

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function FileUpload({
  value,
  onChange,
  multiple = false,
  params,
  accept = "image/*",
  label,
  className = "",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (files: File[]): boolean => {
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed", { description: file.name });
        return false;
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`File too large`, { description: `${file.name} exceeds ${MAX_SIZE_MB}MB` });
        return false;
      }
    }
    return true;
  };

  const upload = async (fileList: FileList | File[]) => {
    const all = Array.from(fileList);
    const toUpload = multiple ? all : [all[0]];
    if (!toUpload[0]) return;
    if (!validate(toUpload)) return;

    setIsUploading(true);
    try {
      const results = await Promise.all(
        toUpload.map((f) => FileService.uploadFile(f, params))
      );
      onChange(multiple ? [...value, ...results] : results);
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data?.message ?? error.message)
          : "Upload failed";
      toast.error("Failed to upload", { description: message });
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => onChange(value.filter((f) => f.id !== id));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) upload(e.target.files);
  };

  // Single: hide dropzone once a file exists; Multiple: always show dropzone
  const showDropzone = multiple || value.length === 0;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-zinc-300 mb-2">{label}</label>
      )}

      {/* ── Single image preview ─────────────────────────────────── */}
      {!multiple && value.length > 0 && (
        <div className="relative group rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value[0].url}
            alt={value[0].name}
            className="w-full h-48 object-cover"
          />
          {/* hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
          {/* remove button */}
          <button
            type="button"
            onClick={() => removeFile(value[0].id)}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Remove image"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* filename bar */}
          <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-xs text-white/80 truncate">{value[0].name}</p>
          </div>
        </div>
      )}

      {/* ── Multiple images grid ─────────────────────────────────── */}
      {multiple && value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {value.map((file) => (
            <div
              key={file.id}
              className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                title="Remove"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Drop zone ────────────────────────────────────────────── */}
      {showDropzone && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isUploading && inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && !isUploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed
            transition-all duration-200 select-none outline-none
            ${multiple && value.length > 0 ? "py-5" : "py-10"}
            ${isUploading
              ? "border-zinc-600 bg-zinc-800/40 cursor-wait"
              : isDragging
                ? "border-emerald-500 bg-emerald-500/5 cursor-copy"
                : "border-zinc-700 bg-zinc-800/30 hover:border-zinc-500 hover:bg-zinc-800/60 cursor-pointer"
            }
          `}
        >
          {isUploading ? (
            <>
              <svg
                className="animate-spin h-6 w-6 text-emerald-500"
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
              <p className="text-sm text-zinc-400">Uploading…</p>
            </>
          ) : (
            <>
              <div
                className={`p-2.5 rounded-xl transition-colors ${
                  isDragging ? "bg-emerald-500/20" : "bg-zinc-700/50"
                }`}
              >
                <svg
                  className={`w-5 h-5 transition-colors ${
                    isDragging ? "text-emerald-400" : "text-zinc-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${isDragging ? "text-emerald-400" : "text-zinc-300"}`}>
                  {isDragging
                    ? "Drop to upload"
                    : multiple && value.length > 0
                      ? "Add more images"
                      : "Click or drag & drop"}
                </p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  PNG, JPG, WEBP · up to {MAX_SIZE_MB}MB
                </p>
              </div>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}
    </div>
  );
}
