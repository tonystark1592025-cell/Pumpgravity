'use client';

import { useState, useEffect } from "react";
import { Upload, Eye } from "lucide-react";

interface AdminImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  showFallback?: boolean;
}

export function AdminImagePreview({ src, alt, className, showFallback = true }: AdminImagePreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  // Reset states when src changes
  useEffect(() => {
    if (src !== currentSrc) {
      setImageLoaded(false);
      setImageError(false);
      setCurrentSrc(src);
    }
  }, [src, currentSrc]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      {src && (
        <img
          src={src}
          alt={alt}
          className={`${className || "w-full h-40 object-cover"} ${
            imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-200`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      {/* Show fallback when no src, error, or loading */}
      {showFallback && (!src || imageError || !imageLoaded) && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-white text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm opacity-75">
              {!src ? 'No image selected' : imageError ? 'Image not available' : 'Loading...'}
            </p>
          </div>
        </div>
      )}
      
      {/* Hover overlay only when image is loaded */}
      {imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
}