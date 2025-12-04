/**
 * AlertManager - Proactive alerting
 *
 * Features:
 * - Threshold-based alerts (error rate > 1%)
 * - PagerDuty/Slack integration for critical errors
 * - Escalation policies for unacknowledged alerts
 * - Maintenance window handling
 * - Alert fatigue prevention
 */

export interface Alert {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export interface AlertThreshold {
  metric: string;
  operator: ">" | "<" | "=" | ">=" | "<=";
  value: number;
  severity: Alert["severity"];
  message: string;
}

export class AlertManager {
  private static alerts: Map<string, Alert> = new Map();
  private static thresholds: AlertThreshold[] = [];
  private static maintenanceMode = false;
  private static maintenanceUntil: number | null = null;
  private static alertCooldowns = new Map<string, number>();
  private static readonly COOLDOWN_PERIOD = 300000; // 5 minutes

  /**
   * Initialize alert manager with default thresholds
   */
  static initialize(): void {
    // Default thresholds
    this.addThreshold({
      metric: "error_rate",
      operator: ">",
      value: 0.01, // 1%
      severity: "high",
      message: "Error rate exceeded 1%",
    });

    this.addThreshold({
      metric: "error_rate",
      operator: ">",
      value: 0.05, // 5%
      severity: "critical",
      message: "Error rate exceeded 5% - immediate action required",
    });

    this.addThreshold({
      metric: "api_response_time",
      operator: ">",
      value: 5000, // 5 seconds
      severity: "medium",
      message: "API response time is slow",
    });

    this.addThreshold({
      metric: "error_spike",
      operator: ">",
      value: 10, // 10 errors in short time
      severity: "high",
      message: "Sudden spike in errors detected",
    });

    // Check thresholds periodically
    setInterval(() => {
      this.checkThresholds();
    }, 60000); // Every minute
  }

  /**
   * Add alert threshold
   */
  static addThreshold(threshold: AlertThreshold): void {
    this.thresholds.push(threshold);
  }

  /**
   * Create alert
   */
  static createAlert(
    severity: Alert["severity"],
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): string {
    // Check if in maintenance mode
    if (this.isMaintenanceMode()) {
      console.log("Alert suppressed due to maintenance mode:", title);
      return "";
    }

    // Check cooldown
    const cooldownKey = `${severity}:${title}`;
    if (this.isInCooldown(cooldownKey)) {
      console.log("Alert suppressed due to cooldown:", title);
      return "";
    }

    const alertId = `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const alert: Alert = {
      id: alertId,
      severity,
      title,
      message,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      metadata,
    };

    this.alerts.set(alertId, alert);

    // Set cooldown
    this.alertCooldowns.set(cooldownKey, Date.now());

    // Send notifications based on severity
    this.sendNotifications(alert);

    // Log alert
    console.warn(`🚨 Alert Created [${severity.toUpperCase()}]: ${title}`, message);

    return alertId;
  }

  /**
   * Acknowledge alert
   */
  static acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);

    if (alert) {
      alert.acknowledged = true;
      return true;
    }

    return false;
  }

  /**
   * Resolve alert
   */
  static resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);

    if (alert) {
      alert.resolved = true;
      return true;
    }

    return false;
  }

  /**
   * Get all alerts
   */
  static getAlerts(filter?: { severity?: Alert["severity"]; acknowledged?: boolean; resolved?: boolean }): Alert[] {
    let alerts = Array.from(this.alerts.values());

    if (filter) {
      if (filter.severity) {
        alerts = alerts.filter((a) => a.severity === filter.severity);
      }
      if (filter.acknowledged !== undefined) {
        alerts = alerts.filter((a) => a.acknowledged === filter.acknowledged);
      }
      if (filter.resolved !== undefined) {
        alerts = alerts.filter((a) => a.resolved === filter.resolved);
      }
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get unacknowledged alerts
   */
  static getUnacknowledgedAlerts(): Alert[] {
    return this.getAlerts({ acknowledged: false, resolved: false });
  }

  /**
   * Check if alert should escalate
   */
  static checkEscalation(): void {
    const unacknowledged = this.getUnacknowledgedAlerts();
    const now = Date.now();

    unacknowledged.forEach((alert) => {
      const timeSinceCreation = now - alert.timestamp;

      // Escalate after 15 minutes for high severity
      if (alert.severity === "high" && timeSinceCreation > 900000) {
        this.escalateAlert(alert);
      }

      // Escalate after 5 minutes for critical
      if (alert.severity === "critical" && timeSinceCreation > 300000) {
        this.escalateAlert(alert);
      }
    });
  }

  /**
   * Escalate alert
   */
  private static escalateAlert(alert: Alert): void {
    console.error(`⚠️ ESCALATION: Alert ${alert.id} not acknowledged`, alert);

    // Send escalated notification
    this.sendEscalatedNotification(alert);
  }

  /**
   * Send notifications based on severity
   */
  private static sendNotifications(alert: Alert): void {
    switch (alert.severity) {
      case "critical":
        this.sendPagerDutyAlert(alert);
        this.sendSlackAlert(alert);
        this.sendEmailAlert(alert);
        break;
      case "high":
        this.sendSlackAlert(alert);
        this.sendEmailAlert(alert);
        break;
      case "medium":
        this.sendSlackAlert(alert);
        break;
      case "low":
        // Log only
        break;
    }
  }

  /**
   * Send PagerDuty alert (placeholder)
   */
  private static async sendPagerDutyAlert(alert: Alert): Promise<void> {
    try {
      await fetch("/api/alerts/pagerduty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      }).catch(() => {});
    } catch {}
  }

  /**
   * Send Slack alert (placeholder)
   */
  private static async sendSlackAlert(alert: Alert): Promise<void> {
    try {
      await fetch("/api/alerts/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      }).catch(() => {});
    } catch {}
  }

  /**
   * Send email alert (placeholder)
   */
  private static async sendEmailAlert(alert: Alert): Promise<void> {
    try {
      await fetch("/api/alerts/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      }).catch(() => {});
    } catch {}
  }

  /**
   * Send escalated notification
   */
  private static sendEscalatedNotification(alert: Alert): void {
    // Escalate through all channels
    this.sendPagerDutyAlert({ ...alert, title: `ESCALATED: ${alert.title}` });
    this.sendSlackAlert({ ...alert, title: `ESCALATED: ${alert.title}` });
    this.sendEmailAlert({ ...alert, title: `ESCALATED: ${alert.title}` });
  }

  /**
   * Check if in cooldown
   */
  private static isInCooldown(key: string): boolean {
    const lastAlert = this.alertCooldowns.get(key);

    if (!lastAlert) return false;

    return Date.now() - lastAlert < this.COOLDOWN_PERIOD;
  }

  /**
   * Enable maintenance mode
   */
  static enableMaintenanceMode(durationMinutes: number): void {
    this.maintenanceMode = true;
    this.maintenanceUntil = Date.now() + durationMinutes * 60000;

    console.log(`🔧 Maintenance mode enabled for ${durationMinutes} minutes`);
  }

  /**
   * Disable maintenance mode
   */
  static disableMaintenanceMode(): void {
    this.maintenanceMode = false;
    this.maintenanceUntil = null;

    console.log("✅ Maintenance mode disabled");
  }

  /**
   * Check if in maintenance mode
   */
  static isMaintenanceMode(): boolean {
    if (!this.maintenanceMode) return false;

    if (this.maintenanceUntil && Date.now() > this.maintenanceUntil) {
      this.disableMaintenanceMode();
      return false;
    }

    return true;
  }

  /**
   * Check thresholds
   */
  private static checkThresholds(): void {
    // Placeholder for threshold checking
    // In production, this would query real metrics
  }

  /**
   * Get alert statistics
   */
  static getStatistics(): Record<string, any> {
    const allAlerts = Array.from(this.alerts.values());

    return {
      total: allAlerts.length,
      unacknowledged: allAlerts.filter((a) => !a.acknowledged && !a.resolved).length,
      unresolved: allAlerts.filter((a) => !a.resolved).length,
      bySeverity: {
        critical: allAlerts.filter((a) => a.severity === "critical").length,
        high: allAlerts.filter((a) => a.severity === "high").length,
        medium: allAlerts.filter((a) => a.severity === "medium").length,
        low: allAlerts.filter((a) => a.severity === "low").length,
      },
      maintenanceMode: this.isMaintenanceMode(),
    };
  }
}

// Initialize on load
if (typeof window !== "undefined") {
  AlertManager.initialize();

  // Check for escalations every 5 minutes
  setInterval(() => {
    AlertManager.checkEscalation();
  }, 300000);
}
