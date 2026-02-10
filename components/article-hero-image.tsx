'use client';

import { ImageWithFallback } from "@/components/image-with-fallback"

export function ArticleHeroImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden mb-8 bg-gradient-to-br from-blue-500 to-purple-600">
      <ImageWithFallback
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}