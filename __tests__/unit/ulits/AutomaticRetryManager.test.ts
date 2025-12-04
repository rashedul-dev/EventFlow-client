import { describe, it, expect, vi } from 'vitest'
import { AutomaticRetryManager } from '@/lib/error/recovery/AutomaticRetryManager'

describe('AutomaticRetryManager', () => {
  it('executes function successfully on first try', async () => {
    const mockFn = vi.fn().mockResolvedValue('success')
    
    const result = await AutomaticRetryManager.executeWithRetry(mockFn)
    
    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('retries on network errors up to maxRetries', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('Network request failed'))
      .mockRejectedValueOnce(new Error('Network request failed'))
      .mockResolvedValue('success')
    
    const result = await AutomaticRetryManager.executeWithRetry(mockFn, {
      maxRetries: 3,
      baseDelay: 10
    })
    
    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(3)
  })

  it('throws error after exceeding maxRetries', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Network request failed'))
    
    await expect(
      AutomaticRetryManager.executeWithRetry(mockFn, {
        maxRetries: 2,
        baseDelay: 10
      })
    ).rejects.toThrow('Network request failed')
    
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('does not retry on client errors (4xx)', async () => {
    const error = new Error('Bad Request')
    ;(error as any).status = 400
    const mockFn = vi.fn().mockRejectedValue(error)
    
    await expect(
      AutomaticRetryManager.executeWithRetry(mockFn, {
        maxRetries: 3,
        baseDelay: 10
      })
    ).rejects.toThrow('Bad Request')
    
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('implements exponential backoff', async () => {
    const delays: number[] = []
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('Network request failed'))
      .mockRejectedValueOnce(new Error('Network request failed'))
      .mockResolvedValue('success')
    
    const startTime = Date.now()
    await AutomaticRetryManager.executeWithRetry(mockFn, {
      maxRetries: 3,
      baseDelay: 100
    })
    const totalTime = Date.now() - startTime
    
    // Should take at least 100ms + 200ms = 300ms for exponential backoff
    expect(totalTime).toBeGreaterThanOrEqual(250)
    expect(mockFn).toHaveBeenCalledTimes(3)
  })
})
