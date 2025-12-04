/**
 * AnalyticsTracker - Business intelligence
 *
 * Features:
 * - Error impact analysis (affected users, revenue impact)
 * - User behavior before/after errors
 * - Error resolution tracking
 * - SLA compliance monitoring (error rate < 0.1%)
 */

export interface ErrorImpact {
  errorId: string;
  affectedUsers: number;
  occurences: number;
  firstSeen: number;
  lastSeen: number;
  resolved: boolean;
  revenueImpact?: number;
}

export interface UserBehavior {
  userId: string;
  actionsBeforeError: Array<{ type: string; timestamp: number }>;
  actionsAfterError: Array<{ type: string; timestamp: number }>;
  recovered: boolean;
}

export class AnalyticsTracker {
  private static errorImpacts = new Map<string, ErrorImpact>();
  private static userBehaviors = new Map<string, UserBehavior>();
  private static errorRate = {
    total: 0,
    errors: 0,
    windowStart: Date.now(),
  };
  private static readonly SLA_ERROR_RATE_THRESHOLD = 0.001; // 0.1%

  /**
   * Track error impact
   */
  static trackErrorImpact(errorId: string, userId?: string): void {
    const existing = this.errorImpacts.get(errorId);

    if (existing) {
      existing.occurences++;
      existing.lastSeen = Date.now();

      if (userId) {
        existing.affectedUsers = new Set([...Array.from({ length: existing.affectedUsers }), userId]).size;
      }
    } else {
      this.errorImpacts.set(errorId, {
        errorId,
        affectedUsers: userId ? 1 : 0,
        occurences: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        resolved: false,
      });
    }

    // Update error rate
    this.updateErrorRate();
  }

  /**
   * Track user behavior around errors
   */
  static trackUserBehavior(
    userId: string,
    action: { type: string; timestamp: number },
    isAfterError: boolean = false
  ): void {
    let behavior = this.userBehaviors.get(userId);

    if (!behavior) {
      behavior = {
        userId,
        actionsBeforeError: [],
        actionsAfterError: [],
        recovered: false,
      };
      this.userBehaviors.set(userId, behavior);
    }

    if (isAfterError) {
      behavior.actionsAfterError.push(action);

      // Check if user recovered (completed successful action after error)
      if (action.type.includes("success")) {
        behavior.recovered = true;
      }
    } else {
      behavior.actionsBeforeError.push(action);

      // Keep only last 10 actions
      if (behavior.actionsBeforeError.length > 10) {
        behavior.actionsBeforeError.shift();
      }
    }
  }

  /**
   * Mark error as resolved
   */
  static markErrorResolved(errorId: string): void {
    const impact = this.errorImpacts.get(errorId);

    if (impact) {
      impact.resolved = true;
    }
  }

  /**
   * Get error impact analysis
   */
  static getErrorImpact(errorId: string): ErrorImpact | null {
    return this.errorImpacts.get(errorId) || null;
  }

  /**
   * Get all error impacts
   */
  static getAllErrorImpacts(): ErrorImpact[] {
    return Array.from(this.errorImpacts.values());
  }

  /**
   * Get top errors by impact
   */
  static getTopErrors(limit: number = 10): ErrorImpact[] {
    return Array.from(this.errorImpacts.values())
      .sort((a, b) => {
        // Sort by: unresolved first, then by affected users, then by occurences
        if (a.resolved !== b.resolved) {
          return a.resolved ? 1 : -1;
        }
        if (a.affectedUsers !== b.affectedUsers) {
          return b.affectedUsers - a.affectedUsers;
        }
        return b.occurences - a.occurences;
      })
      .slice(0, limit);
  }

  /**
   * Get user behavior patterns
   */
  static getUserBehavior(userId: string): UserBehavior | null {
    return this.userBehaviors.get(userId) || null;
  }

  /**
   * Get recovery rate
   */
  static getRecoveryRate(): number {
    const behaviors = Array.from(this.userBehaviors.values());

    if (behaviors.length === 0) return 0;

    const recovered = behaviors.filter((b) => b.recovered).length;

    return recovered / behaviors.length;
  }

  /**
   * Update error rate
   */
  private static updateErrorRate(): void {
    this.errorRate.errors++;
    this.errorRate.total++;

    // Reset window every hour
    const windowDuration = Date.now() - this.errorRate.windowStart;

    if (windowDuration > 3600000) {
      // 1 hour
      this.errorRate = {
        total: 0,
        errors: 0,
        windowStart: Date.now(),
      };
    }
  }

  /**
   * Get current error rate
   */
  static getErrorRate(): number {
    if (this.errorRate.total === 0) return 0;

    return this.errorRate.errors / this.errorRate.total;
  }

  /**
   * Check SLA compliance
   */
  static checkSLACompliance(): boolean {
    return this.getErrorRate() < this.SLA_ERROR_RATE_THRESHOLD;
  }

  /**
   * Get SLA status
   */
  static getSLAStatus(): {
    compliant: boolean;
    currentRate: number;
    threshold: number;
    errorsInWindow: number;
    totalInWindow: number;
  } {
    const currentRate = this.getErrorRate();

    return {
      compliant: currentRate < this.SLA_ERROR_RATE_THRESHOLD,
      currentRate,
      threshold: this.SLA_ERROR_RATE_THRESHOLD,
      errorsInWindow: this.errorRate.errors,
      totalInWindow: this.errorRate.total,
    };
  }

  /**
   * Get analytics summary
   */
  static getSummary(): Record<string, any> {
    const impacts = this.getAllErrorImpacts();
    const unresolved = impacts.filter((i) => !i.resolved);
    const totalAffectedUsers = new Set(impacts.map((i) => Array.from({ length: i.affectedUsers })).flat()).size;

    return {
      errorImpact: {
        totalErrors: impacts.length,
        unresolvedErrors: unresolved.length,
        totalAffectedUsers,
        totalOccurences: impacts.reduce((sum, i) => sum + i.occurences, 0),
      },
      userBehavior: {
        totalUsers: this.userBehaviors.size,
        recoveryRate: this.getRecoveryRate(),
      },
      sla: this.getSLAStatus(),
      topErrors: this.getTopErrors(5),
    };
  }

  /**
   * Send analytics to backend
   */
  static async sendAnalytics(): Promise<void> {
    try {
      const summary = this.getSummary();

      await fetch("/api/monitoring/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently fail
      });
    } catch {
      // Ignore errors
    }
  }

  /**
   * Calculate revenue impact (placeholder)
   */
  static calculateRevenueImpact(errorId: string, avgOrderValue: number): number {
    const impact = this.getErrorImpact(errorId);

    if (!impact) return 0;

    // Estimate: affected users * conversion rate * average order value
    const estimatedConversionRate = 0.02; // 2%

    return impact.affectedUsers * estimatedConversionRate * avgOrderValue;
  }

  /**
   * Get error trend
   */
  static getErrorTrend(errorId: string, hours: number = 24): Array<{ hour: number; count: number }> {
    // Placeholder for trend analysis
    // In production, this would query historical data
    return [];
  }
}

// Send analytics periodically
if (typeof window !== "undefined") {
  setInterval(() => {
    AnalyticsTracker.sendAnalytics();
  }, 60000); // Every minute
}
