/**
 * Advanced Image Optimizer
 * Production-grade image component with format selection and lazy loading
 */

"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  showPlaceholder?: boolean;
  priority?: boolean;
  quality?: number;
  onError?: () => void;
}

/**
 * Detect supported image formats
 */
function getSupportedFormats(): string[] {
  if (typeof window === "undefined") return ["webp", "jpeg"];

  const formats: string[] = [];

  // Check WebP support
  const webpCanvas = document.createElement("canvas");
  if (webpCanvas.getContext && webpCanvas.getContext("2d")) {
    if (webpCanvas.toDataURL("image/webp").indexOf("data:image/webp") === 0) {
      formats.push("webp");
    }
  }

  // Check AVIF support
  const avifImg = new window.Image();
  avifImg.src =
    "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
  avifImg.onload = () => {
    if (avifImg.width > 0) {
      formats.push("avif");
    }
  };

  formats.push("jpeg", "png");
  return formats;
}

/**
 * Generate blur data URL for placeholder
 */
function generateBlurDataURL(width: number, height: number): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#253900;stop-opacity:0.5" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `;

  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Optimized Image Component
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/images/placeholder.jpg",
  showPlaceholder = true,
  priority = false,
  quality = 85,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        quality={quality}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          ${props.className || ""}
          ${isLoading ? "opacity-0" : "opacity-100"}
          transition-opacity duration-300
        `}
      />

      {showPlaceholder && isLoading && (
        <div className="absolute inset-0 bg-linear-to-br from-background to-secondary/50 animate-pulse" />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

/**
 * Background Image with optimization
 */
export function OptimizedBackgroundImage({
  src,
  alt = "",
  children,
  className = "",
  priority = false,
  quality = 75,
}: {
  src: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
  priority?: boolean;
  quality?: number;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 -z-10">
        <OptimizedImage src={src} alt={alt} fill priority={priority} quality={quality} className="object-cover" />
      </div>
      {children}
    </div>
  );
}

/**
 * Responsive Image with multiple breakpoints
 */
export function ResponsiveImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  quality = 85,
  ...props
}: OptimizedImageProps & { sizes?: string }) {
  return <OptimizedImage src={src} alt={alt} sizes={sizes} priority={priority} quality={quality} {...props} />;
}

/**
 * Avatar with optimization and fallback
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  fallback,
}: {
  src?: string;
  alt: string;
  size?: number;
  fallback?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div
        className="rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
      onError={() => setImgError(true)}
    />
  );
}
