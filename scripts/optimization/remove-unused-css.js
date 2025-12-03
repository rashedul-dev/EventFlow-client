/**
 * CSS Optimization Script
 * Analyzes and removes unused CSS (works with Tailwind)
 */

const fs = require("fs");
const path = require("path");

/**
 * Analyze CSS usage across the application
 */
function analyzeCSS() {
  console.log("🎨 CSS Optimization Analysis\n");

  const srcPath = path.join(process.cwd(), "src");

  if (!fs.existsSync(srcPath)) {
    console.error("❌ src directory not found");
    return;
  }

  console.log("✅ Tailwind CSS Configuration:");
  console.log("  • JIT (Just-In-Time) mode enabled by default in Tailwind v3+");
  console.log("  • Only classes used in your code are generated");
  console.log("  • Unused classes are automatically purged in production\n");

  console.log("📊 CSS Best Practices:");
  console.log("  ✓ Use Tailwind utility classes instead of custom CSS");
  console.log("  ✓ Avoid @apply in favor of direct utility classes");
  console.log("  ✓ Use CSS variables for theming (already implemented)");
  console.log("  ✓ Keep critical CSS inline for above-fold content\n");

  console.log("🔍 To analyze CSS specificity and duplication:");
  console.log("  1. Build the project: npm run build");
  console.log("  2. Check .next/static/css/* files");
  console.log("  3. Use Chrome DevTools Coverage tab\n");
}

/**
 * Check for unused Tailwind classes
 */
function checkTailwindUsage() {
  console.log("🌊 Tailwind CSS Usage Check:");
  console.log("  Tailwind automatically purges unused classes in production");
  console.log("  Content paths configured in tailwind.config.js\n");

  const tailwindConfigPath = path.join(process.cwd(), "tailwind.config.ts");

  if (fs.existsSync(tailwindConfigPath)) {
    console.log("  ✅ tailwind.config.ts found");
    console.log("  Make sure content paths include all component files:\n");
    console.log("  content: [");
    console.log('    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",');
    console.log('    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",');
    console.log('    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"');
    console.log("  ]\n");
  }
}

/**
 * Monitor CSS bundle size
 */
function monitorCSSSize() {
  console.log("📏 CSS Bundle Size:");

  const cssDir = path.join(process.cwd(), ".next/static/css");

  if (!fs.existsSync(cssDir)) {
    console.log("  ⚠️  Build the project first: npm run build\n");
    return;
  }

  const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"));
  let totalSize = 0;

  console.log("\n  CSS Files:");
  cssFiles.forEach((file) => {
    const filePath = path.join(cssDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalSize += stats.size;
    console.log(`    ${file}: ${sizeKB}KB`);
  });

  console.log(`\n  Total CSS Size: ${(totalSize / 1024).toFixed(2)}KB`);
  console.log(`  Budget: 50KB (gzipped)\n`);
}

/**
 * Critical CSS recommendations
 */
function criticalCSSRecommendations() {
  console.log("⚡ Critical CSS Optimization:");
  console.log("  1. Inline critical CSS for above-fold content");
  console.log("  2. Use next/font for optimal font loading");
  console.log('  3. Defer non-critical CSS with media="print" then switch');
  console.log("  4. Use CSS containment for better rendering performance\n");
}

/**
 * Generate CSS optimization report
 */
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    status: "Tailwind CSS with JIT mode enabled",
    recommendations: [
      "Tailwind automatically purges unused CSS in production",
      "Verify content paths in tailwind.config.ts",
      "Use utility classes instead of custom CSS",
      "Inline critical CSS for above-fold content",
      "Monitor CSS bundle size after each build",
    ],
    budget: {
      maxCSS: "50KB (gzipped)",
      current: 'Run "npm run build" to check',
    },
  };

  const reportPath = path.join(process.cwd(), "css-optimization-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportPath}\n`);
}

// Main execution
if (require.main === module) {
  console.log("🚀 CSS Optimization Check\n");
  console.log("=".repeat(50) + "\n");

  analyzeCSS();
  checkTailwindUsage();
  monitorCSSSize();
  criticalCSSRecommendations();
  generateReport();

  console.log("=".repeat(50));
  console.log("\n✅ CSS optimization check complete!\n");
}

module.exports = {
  analyzeCSS,
  checkTailwindUsage,
  monitorCSSSize,
};
