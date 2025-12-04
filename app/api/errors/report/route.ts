import { NextRequest, NextResponse } from "next/server";

/**
 * API route for error reporting
 * Receives error reports from the frontend and logs them
 */
export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("📥 Error Report Received:", {
        errorId: errorData.errorId,
        error: errorData.error,
        timestamp: errorData.timestamp,
        type: errorData.type || "unknown",
      });
    }

    // In production, you would send this to:
    // - Sentry: Sentry.captureException()
    // - LogRocket: LogRocket.captureException()
    // - Custom logging service
    // - Database for analytics

    // For now, just acknowledge receipt
    return NextResponse.json({
      success: true,
      message: "Error report received",
      errorId: errorData.errorId,
    });
  } catch (error) {
    console.error("Failed to process error report:", error);

    return NextResponse.json({ success: false, message: "Failed to process error report" }, { status: 500 });
  }
}
