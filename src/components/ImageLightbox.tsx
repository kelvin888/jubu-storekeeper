"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: { id: string; url: string; alt?: string }[];
  thumbnailClassName?: string;
  accentColor?: "indigo" | "emerald";
}

export function ImageLightbox({
  images,
  thumbnailClassName = "w-24 h-24",
  accentColor = "indigo",
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const ringColor = accentColor === "emerald"
    ? "hover:ring-emerald-400"
    : "hover:ring-indigo-400";

  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  function next() {
    setIndex((i) => (i + 1) % images.length);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <>
      {/* Thumbnails */}
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => { setIndex(i); setOpen(true); }}
            className={`${thumbnailClassName} rounded-lg overflow-hidden border border-gray-200 hover:ring-2 ${ringColor} transition flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt ?? `Photo ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {index + 1} / {images.length}
            </span>
          )}

          {/* Prev */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-[92vw] max-h-[88vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[index].url}
              alt={images[index].alt ?? `Photo ${index + 1}`}
              className="max-w-full max-h-[88vh] rounded-lg object-contain shadow-2xl"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition z-10"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
