/**
 * Image Lazy Loader
 * Custom lazy loading with Intersection Observer
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Image, { ImageProps } from "next/image";

interface LazyImageProps extends Omit<ImageProps, "loading"> {
  threshold?: number;
  rootMargin?: string;
  priority?: boolean;
}

/**
 * Custom lazy loading with Intersection Observer
 */
export function LazyImage({
  src,
  alt,
  threshold = 0.1,
  rootMargin = "50px",
  priority = false,
  ...props
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(priority);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isInView) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority, threshold, rootMargin, isInView]);

  return (
    <div ref={imgRef} className="relative">
      {isInView ? (
        <Image
          {...props}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setHasLoaded(true)}
          className={`
            ${props.className || ""}
            ${hasLoaded ? "opacity-100" : "opacity-0"}
            transition-opacity duration-300
          `}
        />
      ) : (
        <div
          className="bg-muted animate-pulse"
          style={{
            width: props.width,
            height: props.height,
            aspectRatio: `${props.width} / ${props.height}`,
          }}
        />
      )}
    </div>
  );
}

/**
 * Container-based lazy loading for galleries
 */
export function LazyImageGallery({
  images,
  columns = 3,
  gap = 4,
}: {
  images: Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
  }>;
  columns?: number;
  gap?: number;
}) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 4}px`,
      }}
    >
      {images.map((image, index) => (
        <LazyImage
          key={index}
          {...image}
          priority={index < columns} // Priority load first row
          className="w-full h-auto rounded-lg"
        />
      ))}
    </div>
  );
}

/**
 * Progressive image loader with blur-up
 */
export function ProgressiveImage({ src, placeholderSrc, alt, ...props }: ImageProps & { placeholderSrc?: string }) {
  const [imageSrc, setImageSrc] = useState(placeholderSrc || src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new window.Image();
    img.src = src as string;

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
  }, [src]);

  return (
    <div className="relative overflow-hidden">
      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        className={`
          ${props.className || ""}
          ${isLoading ? "blur-sm scale-110" : "blur-0 scale-100"}
          transition-all duration-500
        `}
      />
    </div>
  );
}
