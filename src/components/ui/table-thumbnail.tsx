interface TableThumbnailProps {
  src?: string;
  alt?: string;
}

export function TableThumbnail({ src, alt = "" }: TableThumbnailProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="w-15 h-15 rounded-lg object-cover bg-zinc-800 shrink-0"
      />
    );
  }

  return (
    <div className="w-15 h-15 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}
