"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
};

export function ProductImageGallery({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-secondary">
        <ShoppingBag className="h-20 w-20 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      {/* Main image */}
      <div className="relative aspect-[4/5] w-full max-h-[70svh] overflow-hidden rounded-2xl bg-secondary sm:aspect-square">
        <Image
          src={images[selectedIndex].url}
          alt={images[selectedIndex].alt}
          fill
          className="object-contain sm:object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((image, i) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                i === selectedIndex
                  ? "border-foreground"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
