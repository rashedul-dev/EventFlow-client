/**
 * ErrorTracker - Sentry/LogRocket integration
 * 
 * Comprehensive error tracking:
 * - User context (id, role, session duration)
 * - Breadcrumbs (user actions leading to error)
 * - Environment (browser, OS, device, network)
 * - Release tracking (git commit, build version)
 * - Error grouping and fingerprinting
 * - Rate limiting to prevent spam
 */

export interface ErrorContext {
  user?: {
    id: string
    email?: string
    role?: string
    sessionDuration?: number
  }
  environment?: {
    browser: string
    os: string
    device: string
    network: string
    viewport: { width: number; height: number }
  }
  release?: {
    version: string
    commit?: string
    buildTime?: string
  }
  breadcrumbs?: Array<{
    type: string
    message: string
    timestamp: number
    data?: any
  }>
  tags?: Record<string, string>
  extra?: Record<string, any>
}

export class ErrorTracker {
  private static breadcrumbs: Array<any> = []
  private static readonly MAX_BREADCRUMBS = 50
  private static userContext: ErrorContext['user'] | null = null
  private static sessionStartTime = Date.now()
  private static errorRateLimit = new Map<string, number>()
  private static readonly RATE_LIMIT_WINDOW = 60000 // 1 minute
  private static readonly MAX_ERRORS_PER_WINDOW = 10

  /**
   * Initialize error tracker
   */
  static initialize(config?: { user?: ErrorContext['user']; release?: ErrorContext['release'] }): void {
    if (config?.user) {
      this.setUser(config.user)
    }

    // Capture global errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error || new Error(event.message), {
          tags: { type: 'global_error' },
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(
          new Error(event.reason?.message || 'Unhandled Promise Rejection'),
          {
            tags: { type: 'unhandled_rejection' },
            extra: { reason: event.reason },
          }
        )
      })
    }
  }

  /**
   * Capture error with context
   */
  static captureError(error: Error, context?: Partial<ErrorContext>): void {
    // Check rate limit
    if (!this.checkRateLimit(error)) {
      console.warn('Error rate limit exceeded, skipping:', error.message)
      return
    }

    const errorData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: this.buildContext(context),
      timestamp: new Date().toISOString(),
      errorId: this.generateErrorId(error),
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔍 Error Tracker:', errorData)
    }

    // Send to backend
    this.sendToBackend(errorData)

    // Send to external service (Sentry, LogRocket, etc.)
    this.sendToExternalService(errorData)
  }

  /**
   * Add breadcrumb for error context
   */
  static addBreadcrumb(breadcrumb: {
    type: string
    message: string
    data?: any
  }): void {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: Date.now(),
    })

    // Keep only recent breadcrumbs
    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs.shift()
    }
  }

  /**
   * Set user context
   */
  static setUser(user: ErrorContext['user']): void {
    this.userContext = user
  }

  /**
   * Clear user context
   */
  static clearUser(): void {
    this.userContext = null
  }

  /**
   * Build complete error context
   */
  private static buildContext(context?: Partial<ErrorContext>): ErrorContext {
    return {
      user: this.userContext || undefined,
      environment: this.getEnvironmentInfo(),
      breadcrumbs: this.breadcrumbs,
      tags: context?.tags,
      extra: {
        sessionDuration: Date.now() - this.sessionStartTime,
        ...context?.extra,
      },
    }
  }

  /**
   * Get environment information
   */
  private static getEnvironmentInfo(): ErrorContext['environment'] {
    if (typeof window === 'undefined') {
      return {
        browser: 'unknown',
        os: 'unknown',
        device: 'unknown',
        network: 'unknown',
        viewport: { width: 0, height: 0 },
      }
    }

    return {
      browser: this.getBrowserInfo(),
      os: this.getOSInfo(),
      device: this.getDeviceInfo(),
      network: this.getNetworkInfo(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    }
  }

  /**
   * Get browser information
   */
  private static getBrowserInfo(): string {
    const ua = navigator.userAgent
    
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    
    return 'Unknown'
  }

  /**
   * Get OS information
   */
  private static getOSInfo(): string {
    const ua = navigator.userAgent
    
    if (ua.includes('Win')) return 'Windows'
    if (ua.includes('Mac')) return 'MacOS'
    if (ua.includes('Linux')) return 'Linux'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('iOS')) return 'iOS'
    
    return 'Unknown'
  }

  /**
   * Get device information
   */
  private static getDeviceInfo(): string {
    const width = window.innerWidth
    
    if (width < 768) return 'Mobile'
    if (width < 1024) return 'Tablet'
    
    return 'Desktop'
  }

  /**
   * Get network information
   */
  private static getNetworkInfo(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    if (connection) {
      return connection.effectiveType || 'unknown'
    }
    
    return 'unknown'
  }

  /**
   * Generate error ID for grouping
   */
  private static generateErrorId(error: Error): string {
    const fingerprint = `${error.name}:${error.message}:${error.stack?.split('\n')[1]}`
    
    // Simple hash
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    return `ERR-${Math.abs(hash).toString(36)}`
  }

  /**
   * Check rate limit
   */
  private static checkRateLimit(error: Error): boolean {
    const errorKey = `${error.name}:${error.message}`
    const now = Date.now()
    const lastErrorTime = this.errorRateLimit.get(errorKey) || 0

    // Reset if outside window
    if (now - lastErrorTime > this.RATE_LIMIT_WINDOW) {
      this.errorRateLimit.set(errorKey, now)
      return true
    }

    // Count errors in window
    let count = 0
    for (const [key, time] of this.errorRateLimit.entries()) {
      if (now - time < this.RATE_LIMIT_WINDOW && key.startsWith(error.name)) {
        count++
      }
    }

    if (count >= this.MAX_ERRORS_PER_WINDOW) {
      return false
    }

    this.errorRateLimit.set(errorKey, now)
    return true
  }

  /**
   * Send error to backend
   */
  private static async sendToBackend(errorData: any): Promise<void> {
    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Silently fail - error reporting shouldn't break the app
      })
    } catch {
      // Ignore reporting errors
    }
  }

  /**
   * Send to external service (Sentry, LogRocket, etc.)
   */
  private static sendToExternalService(errorData: any): void {
    // Placeholder for Sentry/LogRocket integration
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.captureException(errorData.error, {
    //     contexts: errorData.context,
    //   })
    // }
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  ErrorTracker.initialize()
}
