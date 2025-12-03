/**
 * Image CDN Service
 * Cloud-based image optimization with Cloudinary/Imgix patterns
 */

interface ImageTransformation {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg" | "png" | "auto";
  crop?: "fill" | "fit" | "scale" | "crop";
  gravity?: "auto" | "center" | "face" | "faces";
  blur?: number;
  brightness?: number;
  contrast?: number;
}

interface CDNConfig {
  baseUrl: string;
  cloudName?: string;
  preset?: string;
}

class ImageCDNService {
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
  }

  /**
   * Build optimized image URL
   */
  buildUrl(imagePath: string, transformations: ImageTransformation = {}): string {
    // For Next.js Image optimization API
    if (this.config.baseUrl.includes("/_next/image")) {
      const params = new URLSearchParams();

      if (transformations.width) params.append("w", transformations.width.toString());
      if (transformations.quality) params.append("q", transformations.quality.toString());
      params.append("url", imagePath);

      return `${this.config.baseUrl}?${params.toString()}`;
    }

    // For Cloudinary-style transformations
    const transformString = this.buildTransformString(transformations);
    return `${this.config.baseUrl}/${transformString}/${imagePath}`;
  }

  /**
   * Build transformation string (Cloudinary-style)
   */
  private buildTransformString(transformations: ImageTransformation): string {
    const parts: string[] = [];

    if (transformations.width) parts.push(`w_${transformations.width}`);
    if (transformations.height) parts.push(`h_${transformations.height}`);
    if (transformations.quality) parts.push(`q_${transformations.quality}`);
    if (transformations.format) parts.push(`f_${transformations.format}`);
    if (transformations.crop) parts.push(`c_${transformations.crop}`);
    if (transformations.gravity) parts.push(`g_${transformations.gravity}`);
    if (transformations.blur) parts.push(`e_blur:${transformations.blur}`);
    if (transformations.brightness) parts.push(`e_brightness:${transformations.brightness}`);
    if (transformations.contrast) parts.push(`e_contrast:${transformations.contrast}`);

    return parts.join(",");
  }

  /**
   * Generate responsive srcset
   */
  buildSrcSet(imagePath: string, widths: number[], transformations: Omit<ImageTransformation, "width"> = {}): string {
    return widths
      .map((width) => {
        const url = this.buildUrl(imagePath, { ...transformations, width });
        return `${url} ${width}w`;
      })
      .join(", ");
  }

  /**
   * Generate thumbnail URL
   */
  getThumbnail(imagePath: string, size: number = 200, quality: number = 80): string {
    return this.buildUrl(imagePath, {
      width: size,
      height: size,
      crop: "fill",
      gravity: "auto",
      quality,
      format: "auto",
    });
  }

  /**
   * Generate blur placeholder
   */
  getBlurPlaceholder(imagePath: string): string {
    return this.buildUrl(imagePath, {
      width: 40,
      quality: 30,
      blur: 20,
      format: "webp",
    });
  }

  /**
   * Optimize for different device types
   */
  getDeviceOptimized(imagePath: string, deviceType: "mobile" | "tablet" | "desktop"): string {
    const deviceSizes = {
      mobile: { width: 640, quality: 75 },
      tablet: { width: 1024, quality: 80 },
      desktop: { width: 1920, quality: 85 },
    };

    const { width, quality } = deviceSizes[deviceType];
    return this.buildUrl(imagePath, { width, quality, format: "auto" });
  }
}

// Default CDN service (Next.js Image Optimization)
export const defaultCDN = new ImageCDNService({
  baseUrl: "/_next/image",
});

/**
 * Create custom CDN service
 */
export function createCDNService(config: CDNConfig): ImageCDNService {
  return new ImageCDNService(config);
}

/**
 * Cache headers for optimized images
 */
export const IMAGE_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=31536000, immutable",
  "CDN-Cache-Control": "public, max-age=31536000",
  "Cloudflare-CDN-Cache-Control": "public, max-age=31536000",
};

/**
 * Common responsive breakpoints
 */
export const RESPONSIVE_WIDTHS = [320, 640, 768, 1024, 1280, 1536, 1920];

/**
 * Image quality presets
 */
export const QUALITY_PRESETS = {
  low: 50,
  medium: 75,
  high: 85,
  max: 95,
};

export { ImageCDNService };
