"use client";

/**
 * HelpCenterIntegrator - Contextual help
 *
 * Features:
 * - Show relevant help articles based on error type
 * - AI-powered error explanation for users
 * - Step-by-step recovery guides
 * - Live chat integration for critical errors
 */

export interface HelpArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  relevance: number;
}

export class HelpCenterIntegrator {
  private static helpArticles: Map<string, HelpArticle[]> = new Map([
    [
      "network",
      [
        {
          id: "network-1",
          title: "Troubleshooting Connection Issues",
          description: "Learn how to diagnose and fix common network problems",
          url: "/help/network-issues",
          relevance: 1.0,
        },
        {
          id: "network-2",
          title: "Using the App Offline",
          description: "Discover what features work without an internet connection",
          url: "/help/offline-mode",
          relevance: 0.8,
        },
      ],
    ],
    [
      "validation",
      [
        {
          id: "validation-1",
          title: "Form Validation Guide",
          description: "Understanding and fixing form validation errors",
          url: "/help/form-validation",
          relevance: 1.0,
        },
      ],
    ],
    [
      "server",
      [
        {
          id: "server-1",
          title: "Server Error Recovery",
          description: "What to do when you encounter server errors",
          url: "/help/server-errors",
          relevance: 1.0,
        },
        {
          id: "server-2",
          title: "Check System Status",
          description: "View current system status and ongoing incidents",
          url: "/status",
          relevance: 0.9,
        },
      ],
    ],
  ]);

  /**
   * Get relevant help articles
   */
  static getRelevantArticles(errorType: string, limit: number = 3): HelpArticle[] {
    const articles = this.helpArticles.get(errorType) || [];

    return articles.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
  }

  /**
   * Get AI-powered error explanation
   */
  static getErrorExplanation(errorMessage: string): string {
    // Simplified error explanations
    const explanations: Record<string, string> = {
      network:
        "This error occurs when your device cannot connect to our servers. It might be due to your internet connection, firewall settings, or temporary server issues.",
      validation:
        "The information you provided doesn't meet the required format. Please check the highlighted fields and make sure they match the expected format.",
      server:
        "Our servers are experiencing difficulties processing your request. This is usually temporary and our team has been notified.",
      unauthorized: "You need to be logged in to access this feature. Your session may have expired.",
      forbidden:
        "You don't have permission to access this resource. Please contact your administrator if you believe this is an error.",
      notfound: "The page or resource you're looking for doesn't exist. It may have been moved or deleted.",
    };

    // Match error type from message
    for (const [type, explanation] of Object.entries(explanations)) {
      if (errorMessage.toLowerCase().includes(type)) {
        return explanation;
      }
    }

    return "An unexpected error occurred. Our team has been notified and is working on a fix.";
  }

  /**
   * Get recovery steps
   */
  static getRecoverySteps(errorType: string): string[] {
    const steps: Record<string, string[]> = {
      network: [
        "Check your internet connection",
        "Try refreshing the page",
        "Disable VPN or proxy if enabled",
        "Clear browser cache and cookies",
        "Try again in a few minutes",
      ],
      validation: [
        "Review the highlighted fields",
        "Check that all required fields are filled",
        "Ensure data matches the expected format",
        "Try clearing and re-entering the information",
      ],
      server: [
        "Wait a moment and try again",
        "Check our status page for updates",
        "Clear your browser cache",
        "Contact support if the issue persists",
      ],
      unauthorized: [
        "Log out and log back in",
        "Clear your browser cookies",
        "Reset your password if needed",
        "Contact support for help",
      ],
    };

    return (
      steps[errorType] || ["Try refreshing the page", "Clear your browser cache", "Contact support for assistance"]
    );
  }

  /**
   * Should show live chat option
   */
  static shouldShowLiveChat(errorType: string, errorSeverity: string): boolean {
    // Show live chat for critical errors or payment-related issues
    return errorSeverity === "critical" || errorType.includes("payment") || errorType.includes("checkout");
  }

  /**
   * Get live chat URL
   */
  static getLiveChatUrl(): string {
    return "/support/chat";
  }

  /**
   * Search help articles
   */
  static searchArticles(query: string): HelpArticle[] {
    const allArticles: HelpArticle[] = [];

    this.helpArticles.forEach((articles) => {
      allArticles.push(...articles);
    });

    // Simple search by title and description
    const searchTerms = query.toLowerCase().split(" ");

    return allArticles
      .map((article) => {
        let relevance = 0;
        const text = `${article.title} ${article.description}`.toLowerCase();

        searchTerms.forEach((term) => {
          if (text.includes(term)) {
            relevance += 1;
          }
        });

        return { ...article, relevance };
      })
      .filter((article) => article.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  }

  /**
   * Track article view
   */
  static async trackArticleView(articleId: string): Promise<void> {
    try {
      await fetch("/api/support/track-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, timestamp: Date.now() }),
      }).catch(() => {});
    } catch {}
  }
}
