import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useNetworkState } from "@/lib/network/OfflineDetector";

describe("useNetworkState", () => {
  beforeEach(() => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns online state when navigator is online", () => {
    const { result } = renderHook(() => useNetworkState());

    expect(result.current.online).toBe(true);
  });

  it("updates state when going offline", () => {
    const { result } = renderHook(() => useNetworkState());

    act(() => {
      vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.online).toBe(false);
  });

  it("updates state when coming back online", () => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    const { result } = renderHook(() => useNetworkState());

    expect(result.current.online).toBe(false);

    act(() => {
      vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(true);
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.online).toBe(true);
  });

  it("detects connection type from navigator", () => {
    const mockConnection = {
      effectiveType: "4g",
      downlink: 10,
      rtt: 50,
    };

    Object.defineProperty(window.navigator, "connection", {
      value: mockConnection,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNetworkState());

    expect(result.current.connectionType).toBe("4g");
  });
});
