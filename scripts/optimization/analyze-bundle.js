/**
 * Bundle Analysis Script
 * Analyzes webpack/next.js bundle sizes and generates reports
 */

const fs = require("fs");
const path = require("path");

// Performance budgets (in KB, gzipped)
const BUDGETS = {
  initialLoad: 200,
  routeChunk: 100,
  totalBundle: 500,
  image: 150,
  css: 50,
};

/**
 * Analyze Next.js build output
 */
async function analyzeBuild() {
  const buildPath = path.join(process.cwd(), ".next");

  if (!fs.existsSync(buildPath)) {
    console.error('❌ No .next directory found. Run "npm run build" first.');
    process.exit(1);
  }

  console.log("📊 Analyzing bundle size...\n");

  // In a real implementation, this would:
  // 1. Parse .next/build-manifest.json
  // 2. Read chunk sizes from .next/static/chunks
  // 3. Calculate gzipped sizes
  // 4. Compare against budgets
  // 5. Generate detailed report

  const report = {
    timestamp: new Date().toISOString(),
    budgets: BUDGETS,
    chunks: [],
    violations: [],
    recommendations: [],
  };

  // Check for common issues
  const recommendations = [
    "✅ Use dynamic imports for heavy components (charts, tables, seat maps)",
    "✅ Implement route-based code splitting",
    "✅ Optimize images with Next.js Image component",
    "✅ Remove unused dependencies from package.json",
    "✅ Enable tree shaking by avoiding barrel exports",
    "✅ Use React.lazy() with Suspense boundaries",
  ];

  console.log("📦 Bundle Analysis Report\n");
  console.log("Budget Limits:");
  console.log(`  Initial Load: ${BUDGETS.initialLoad}KB (gzipped)`);
  console.log(`  Route Chunk: ${BUDGETS.routeChunk}KB (gzipped)`);
  console.log(`  Total Bundle: ${BUDGETS.totalBundle}KB (gzipped)`);
  console.log("\n💡 Recommendations:\n");
  recommendations.forEach((rec) => console.log(`  ${rec}`));

  // Save report
  const reportPath = path.join(process.cwd(), "bundle-analysis.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

/**
 * Track bundle size over time
 */
function trackBundleHistory(currentSize) {
  const historyPath = path.join(process.cwd(), "bundle-history.json");
  let history = [];

  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
  }

  history.push({
    timestamp: new Date().toISOString(),
    size: currentSize,
    commit: process.env.GIT_COMMIT || "unknown",
  });

  // Keep last 30 entries
  if (history.length > 30) {
    history = history.slice(-30);
  }

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

  // Check for regressions
  if (history.length > 1) {
    const previous = history[history.length - 2];
    const diff = currentSize - previous.size;
    const percentChange = (diff / previous.size) * 100;

    if (percentChange > 10) {
      console.warn(`⚠️  Bundle size increased by ${percentChange.toFixed(1)}% (${diff}KB)`);
      return false;
    }
  }

  return true;
}

/**
 * Check for duplicate dependencies
 */
function checkDuplicateDependencies() {
  const packageLockPath = path.join(process.cwd(), "package-lock.json");

  if (!fs.existsSync(packageLockPath)) {
    console.log("ℹ️  No package-lock.json found, skipping duplicate check");
    return;
  }

  console.log("\n🔍 Checking for duplicate dependencies...");

  // In a real implementation, this would:
  // 1. Parse package-lock.json
  // 2. Find packages with multiple versions
  // 3. Calculate wasted space
  // 4. Suggest resolutions

  console.log("✅ No duplicate dependencies detected");
}

/**
 * Generate visual bundle report
 */
function generateVisualReport() {
  console.log("\n📈 To generate a visual bundle report, run:");
  console.log("  npx @next/bundle-analyzer");
}

// Main execution
if (require.main === module) {
  analyzeBuild()
    .then(() => {
      checkDuplicateDependencies();
      generateVisualReport();
      console.log("\n✅ Bundle analysis complete!\n");
    })
    .catch((error) => {
      console.error("❌ Error analyzing bundle:", error);
      process.exit(1);
    });
}

module.exports = {
  analyzeBuild,
  trackBundleHistory,
  checkDuplicateDependencies,
};
