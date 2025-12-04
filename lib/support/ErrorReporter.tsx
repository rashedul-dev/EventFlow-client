"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

/**
 * ErrorReporter - User error reporting
 *
 * Features:
 * - Screenshot capture on error (with user permission)
 * - Automatic error context collection
 * - User description field for additional details
 * - Support ticket generation with error details
 * - Estimated resolution time display
 */

export interface ErrorReport {
  errorId?: string;
  errorMessage?: string;
  userDescription: string;
  screenshot?: string;
  context: {
    url: string;
    userAgent: string;
    timestamp: string;
    [key: string]: any;
  };
}

export class ErrorReporter {
  /**
   * Capture screenshot (if supported)
   */
  static async captureScreenshot(): Promise<string | null> {
    try {
      // Check if screen capture API is available
      if (!("mediaDevices" in navigator) || !("getDisplayMedia" in navigator.mediaDevices)) {
        console.warn("Screen capture not supported");
        return null;
      }

      // Request permission to capture screen
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { mediaSource: "screen" },
      });

      // Create video element
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Capture frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      // Stop stream
      stream.getTracks().forEach((track) => track.stop());

      // Convert to base64
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
      return null;
    }
  }

  /**
   * Collect error context
   */
  static collectContext(additionalContext?: Record<string, any>): ErrorReport["context"] {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      ...additionalContext,
    };
  }

  /**
   * Submit error report
   */
  static async submitReport(report: ErrorReport): Promise<{ success: boolean; ticketId?: string }> {
    try {
      const response = await fetch("/api/support/report-error", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, ticketId: data.ticketId };
      } else {
        throw new Error(data.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Failed to submit error report:", error);
      return { success: false };
    }
  }

  /**
   * Get estimated resolution time
   */
  static getEstimatedResolutionTime(errorType: string): string {
    const estimates: Record<string, string> = {
      critical: "2-4 hours",
      high: "4-8 hours",
      medium: "1-2 business days",
      low: "2-5 business days",
      default: "1-3 business days",
    };

    return estimates[errorType] || estimates.default;
  }
}

/**
 * Error report dialog component
 */
export interface ErrorReportDialogProps {
  errorId?: string;
  errorMessage?: string;
  onClose?: () => void;
}

export function ErrorReportDialog({ errorId, errorMessage, onClose }: ErrorReportDialogProps) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includeScreenshot, setIncludeScreenshot] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshot = null;

      if (includeScreenshot) {
        screenshot = await ErrorReporter.captureScreenshot();
      }

      const report: ErrorReport = {
        errorId,
        errorMessage,
        userDescription: description,
        screenshot: screenshot || undefined,
        context: ErrorReporter.collectContext(),
      };

      const result = await ErrorReporter.submitReport(report);

      if (result.success) {
        toast.success("Report Submitted", {
          description: `Ticket ID: ${result.ticketId}. We'll get back to you soon!`,
        });

        if (onClose) onClose();
      } else {
        toast.error("Failed to submit report. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while submitting your report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Report Error</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Help us fix this issue by providing details about what happened
        </p>
      </div>

      {errorId && (
        <div className="bg-muted/50 p-2 rounded text-xs">
          <strong>Error ID:</strong> {errorId}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">
          What happened? <span className="text-destructive">*</span>
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe what you were doing when the error occurred..."
          rows={4}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="screenshot"
          checked={includeScreenshot}
          onChange={(e) => setIncludeScreenshot(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="screenshot" className="text-sm">
          Include screenshot (optional)
        </label>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>

        {onClose && (
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Expected response time: {ErrorReporter.getEstimatedResolutionTime("medium")}
      </p>
    </div>
  );
}
