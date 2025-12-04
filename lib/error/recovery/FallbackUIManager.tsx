"use client";

import React, { ReactNode } from "react";
import { AlertCircle, BarChart3, Table, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * FallbackUIManager - Graceful degradation
 *
 * Component-specific fallbacks for all major UI elements:
 * - Chart errors → show data table
 * - Table errors → show card list
 * - Image errors → show branded placeholder
 * - Form errors → preserve entered data
 */

interface FallbackProps {
  error?: Error;
  onRetry?: () => void;
  componentName?: string;
}

export class FallbackUIManager {
  /**
   * Chart fallback - show simple data representation
   */
  static ChartFallback({ error, onRetry, componentName }: FallbackProps): ReactNode {
    return (
      <div className="border border-dashed border-muted-foreground/20 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-center space-y-4">
          <div className="bg-muted/50 p-3 rounded-full inline-flex">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Chart Unavailable</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {componentName || "This chart"} failed to load.
              {error && ` Error: ${error.message}`}
            </p>
          </div>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          )}
          <p className="text-xs text-muted-foreground">You can still export the raw data if needed.</p>
        </div>
      </div>
    );
  }

  /**
   * Table fallback - show simple list
   */
  static TableFallback({ error, onRetry, componentName }: FallbackProps): ReactNode {
    return (
      <div className="border border-dashed border-muted-foreground/20 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
        <div className="text-center space-y-4">
          <div className="bg-muted/50 p-3 rounded-full inline-flex">
            <Table className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Table Unavailable</h3>
            <p className="text-xs text-muted-foreground mt-1">{componentName || "This table"} failed to load.</p>
          </div>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              Reload Table
            </Button>
          )}
        </div>
      </div>
    );
  }

  /**
   * Image fallback with branded placeholder
   */
  static ImageFallback({ componentName }: FallbackProps): ReactNode {
    return (
      <div className="bg-muted/30 rounded-lg flex items-center justify-center w-full h-full min-h-[200px]">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Image unavailable</p>
        </div>
      </div>
    );
  }

  /**
   * Form fallback - preserve data
   */
  static FormFallback({ error, onRetry, componentName }: FallbackProps): ReactNode {
    return (
      <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-sm">Form Error</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {componentName || "This form"} encountered an error. Your data has been preserved.
              </p>
              {error && <p className="text-xs text-destructive mt-1">Error: {error.message}</p>}
            </div>
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Reload Form
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Your entered data is saved and will be restored when the form reloads.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Generic component fallback
   */
  static GenericFallback({ error, onRetry, componentName }: FallbackProps): ReactNode {
    return (
      <div className="border border-muted-foreground/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">{componentName || "Component"} unavailable</p>
              {error && process.env.NODE_ENV === "development" && (
                <p className="text-xs text-destructive mt-1">{error.message}</p>
              )}
            </div>
            {onRetry && (
              <Button size="sm" variant="ghost" onClick={onRetry}>
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Get appropriate fallback based on component type
   */
  static getFallbackForType(type: "chart" | "table" | "image" | "form" | "generic", props: FallbackProps): ReactNode {
    switch (type) {
      case "chart":
        return this.ChartFallback(props);
      case "table":
        return this.TableFallback(props);
      case "image":
        return this.ImageFallback(props);
      case "form":
        return this.FormFallback(props);
      default:
        return this.GenericFallback(props);
    }
  }
}
