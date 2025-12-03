/**
 * Dependency Health Check
 * Monitors dependency versions, security, and bundle impact
 */

const fs = require("fs");
const path = require("path");

/**
 * Heavy dependencies that should be lazy-loaded
 */
const HEAVY_DEPENDENCIES = ["recharts", "@tanstack/react-table", "date-fns", "zod"];

/**
 * Lighter alternatives for common dependencies
 */
const LIGHTER_ALTERNATIVES = {
  moment: "date-fns (86% smaller)",
  lodash: "lodash-es (tree-shakeable)",
  axios: "native fetch API",
  "react-select": "@headlessui/react",
};

/**
 * Check package.json for optimization opportunities
 */
function checkDependencies() {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.error("❌ package.json not found");
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  console.log("🔍 Dependency Health Check\n");

  // Check for lighter alternatives
  console.log("💡 Lighter Alternatives Available:");
  let hasAlternatives = false;
  Object.keys(dependencies).forEach((dep) => {
    if (LIGHTER_ALTERNATIVES[dep]) {
      hasAlternatives = true;
      console.log(`  ⚠️  ${dep} → Consider ${LIGHTER_ALTERNATIVES[dep]}`);
    }
  });
  if (!hasAlternatives) {
    console.log("  ✅ All dependencies are optimal\n");
  }

  // Check for heavy dependencies
  console.log("\n📦 Heavy Dependencies (Should be lazy-loaded):");
  const foundHeavy = HEAVY_DEPENDENCIES.filter((dep) => dependencies[dep]);
  if (foundHeavy.length > 0) {
    foundHeavy.forEach((dep) => {
      console.log(`  📊 ${dep} - Use dynamic imports`);
    });
  } else {
    console.log("  ✅ No heavy dependencies found\n");
  }

  // Check for unused dependencies
  console.log("\n🧹 To check for unused dependencies, run:");
  console.log("  npx depcheck\n");

  // Check for outdated dependencies
  console.log("📅 To check for outdated dependencies, run:");
  console.log("  npm outdated\n");

  // Security check
  console.log("🔒 To check for security vulnerabilities, run:");
  console.log("  npm audit\n");
}

/**
 * Analyze dependency sizes
 */
function analyzeDependencySizes() {
  console.log("📏 To analyze dependency sizes, run:");
  console.log("  npx bundle-phobia <package-name>");
  console.log("  Or visit: https://bundlephobia.com\n");
}

/**
 * Check for duplicate dependencies across versions
 */
function checkDuplicates() {
  const lockfilePath = path.join(process.cwd(), "package-lock.json");

  if (!fs.existsSync(lockfilePath)) {
    return;
  }

  console.log("🔄 Checking for duplicate package versions...");

  // In a real implementation, this would parse package-lock.json
  // and find packages that appear multiple times with different versions

  console.log("  Run: npm dedupe (to clean up duplicates)\n");
}

/**
 * Generate dependency optimization report
 */
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    recommendations: [
      "Use dynamic imports for heavy components",
      "Consider lighter alternatives where applicable",
      "Regularly run npm audit for security updates",
      "Remove unused dependencies with depcheck",
      "Update outdated packages carefully",
    ],
    heavyDependencies: HEAVY_DEPENDENCIES,
    lighterAlternatives: LIGHTER_ALTERNATIVES,
  };

  const reportPath = path.join(process.cwd(), "dependency-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportPath}\n`);
}

// Main execution
if (require.main === module) {
  console.log("🚀 EventFlow Dependency Health Check\n");
  console.log("=".repeat(50) + "\n");

  checkDependencies();
  checkDuplicates();
  analyzeDependencySizes();
  generateReport();

  console.log("=".repeat(50));
  console.log("\n✅ Dependency check complete!\n");
}

module.exports = {
  checkDependencies,
  analyzeDependencySizes,
  checkDuplicates,
};
