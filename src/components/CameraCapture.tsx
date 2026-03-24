"use client";

import { useRef } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  label?: string;
}

export function CameraCapture({ images, onChange, max = 3, label }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange([...images, reader.result as string]);
    };
    reader.readAsDataURL(file);
    // Reset so the same photo can be re-captured if needed
    e.target.value = "";
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-gray-700">{label}</p>
      )}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div
              key={i}
              className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Remove photo"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < max && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 h-11 border-dashed border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-700 w-full sm:w-auto"
          >
            <Camera className="w-4 h-4" />
            {images.length === 0 ? "Take Photo" : "Add Another Photo"}
            <span className="text-xs text-gray-400 ml-1">
              ({images.length}/{max})
            </span>
          </Button>
        </>
      )}
    </div>
  );
}
