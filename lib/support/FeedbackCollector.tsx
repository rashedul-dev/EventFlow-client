"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

/**
 * FeedbackCollector - Proactive feedback
 *
 * Features:
 * - "Was this helpful?" after error resolution
 * - Suggestion collection for error-prone flows
 * - User satisfaction tracking for error handling
 * - Feature request integration
 */

export interface Feedback {
  type: "helpful" | "not-helpful" | "suggestion" | "feature-request";
  rating?: number;
  message?: string;
  context: {
    url: string;
    errorId?: string;
    featureName?: string;
    timestamp: string;
  };
}

export class FeedbackCollector {
  /**
   * Submit feedback
   */
  static async submitFeedback(feedback: Feedback): Promise<boolean> {
    try {
      const response = await fetch("/api/support/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      return false;
    }
  }

  /**
   * Track error resolution satisfaction
   */
  static async trackResolutionSatisfaction(errorId: string, wasHelpful: boolean, message?: string): Promise<void> {
    const feedback: Feedback = {
      type: wasHelpful ? "helpful" : "not-helpful",
      rating: wasHelpful ? 5 : 1,
      message,
      context: {
        url: window.location.href,
        errorId,
        timestamp: new Date().toISOString(),
      },
    };

    const success = await this.submitFeedback(feedback);

    if (success) {
      toast.success("Thank you for your feedback!");
    }
  }

  /**
   * Collect improvement suggestion
   */
  static async collectSuggestion(featureName: string, suggestion: string): Promise<boolean> {
    const feedback: Feedback = {
      type: "suggestion",
      message: suggestion,
      context: {
        url: window.location.href,
        featureName,
        timestamp: new Date().toISOString(),
      },
    };

    const success = await this.submitFeedback(feedback);

    if (success) {
      toast.success("Suggestion submitted. Thank you!");
    }

    return success;
  }
}

/**
 * Was this helpful component
 */
export interface WasThisHelpfulProps {
  errorId?: string;
  onFeedback?: (helpful: boolean) => void;
}

export function WasThisHelpful({ errorId, onFeedback }: WasThisHelpfulProps) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");

  const handleFeedback = async (helpful: boolean) => {
    setSelected(helpful);
    setShowMessage(true);

    if (onFeedback) {
      onFeedback(helpful);
    }

    if (helpful) {
      // Auto-submit positive feedback
      await FeedbackCollector.trackResolutionSatisfaction(errorId || "", true);
    }
  };

  const handleSubmitMessage = async () => {
    if (selected !== null) {
      await FeedbackCollector.trackResolutionSatisfaction(errorId || "", selected, message);

      setShowMessage(false);
      setMessage("");
    }
  };

  if (selected !== null && !showMessage) {
    return <div className="text-sm text-muted-foreground">Thank you for your feedback!</div>;
  }

  return (
    <div className="space-y-3">
      {!showMessage ? (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Was this helpful?</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleFeedback(true)} className="gap-2">
              <ThumbsUp className="w-4 h-4" />
              Yes
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleFeedback(false)} className="gap-2">
              <ThumbsDown className="w-4 h-4" />
              No
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium">How can we improve? (Optional)</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what went wrong or how we can help better..."
            rows={3}
          />
          <Button size="sm" onClick={handleSubmitMessage}>
            Submit Feedback
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Feature suggestion component
 */
export function FeatureSuggestion({ featureName }: { featureName: string }) {
  const [showForm, setShowForm] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!suggestion.trim()) {
      toast.error("Please enter a suggestion");
      return;
    }

    setIsSubmitting(true);

    const success = await FeedbackCollector.collectSuggestion(featureName, suggestion);

    if (success) {
      setSuggestion("");
      setShowForm(false);
    }

    setIsSubmitting(false);
  };

  if (!showForm) {
    return (
      <Button size="sm" variant="ghost" onClick={() => setShowForm(true)}>
        💡 Suggest Improvement
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={suggestion}
        onChange={(e) => setSuggestion(e.target.value)}
        placeholder="How can we improve this feature?"
        rows={3}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
