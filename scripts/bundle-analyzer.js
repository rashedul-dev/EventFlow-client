#!/usr/bin/env node

/**
 * Bundle Size Analyzer
 * Analyzes production bundle and reports on size and composition
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const MAX_BUNDLE_SIZE = 500 * 1024; // 500KB in bytes
const MAX_CHUNK_SIZE = 200 * 1024; // 200KB in bytes

console.log("📦 Bundle Size Analysis\\n");
console.log("=".repeat(60));

// Build the application
console.log("\\n🔨 Building application...\\n");

try {
  execSync("npm run build", { stdio: "inherit" });
} catch (error) {
  console.error("❌ Build failed");
  process.exit(1);
}

// Analyze .next/static/chunks
const chunksDir = path.join(process.cwd(), ".next/static/chunks");

if (!fs.existsSync(chunksDir)) {
  console.error("❌ Chunks directory not found");
  process.exit(1);
}

console.log("\\n📊 Analyzing chunks...\\n");

const chunks = [];
let totalSize = 0;

// Read all chunks
function readDirectory(dir, prefix = "") {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      readDirectory(filePath, path.join(prefix, file));
    } else if (file.endsWith(".js")) {
      const size = stat.size;
      totalSize += size;
      chunks.push({
        name: path.join(prefix, file),
        size,
        sizeKB: (size / 1024).toFixed(2),
        percentage: 0, // Will calculate after total
      });
    }
  });
}

readDirectory(chunksDir);

// Calculate percentages
chunks.forEach((chunk) => {
  chunk.percentage = ((chunk.size / totalSize) * 100).toFixed(1);
});

// Sort by size
chunks.sort((a, b) => b.size - a.size);

// Display results
console.log("Top 10 Largest Chunks:");
console.log("-".repeat(60));

chunks.slice(0, 10).forEach((chunk, index) => {
  const status = chunk.size > MAX_CHUNK_SIZE ? "⚠️ " : "✅";
  console.log(`${status} ${index + 1}. ${chunk.name}`);
  console.log(`   Size: ${chunk.sizeKB} KB (${chunk.percentage}%)`);
});

// Total bundle size
const totalSizeKB = (totalSize / 1024).toFixed(2);
const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
const totalGzipEstimate = ((totalSize * 0.3) / 1024).toFixed(2); // Estimate 30% gzip compression

console.log("\\n" + "=".repeat(60));
console.log("📦 BUNDLE SUMMARY");
console.log("=".repeat(60));
console.log(`\\nTotal Chunks: ${chunks.length}`);
console.log(`Total Size: ${totalSizeKB} KB (${totalSizeMB} MB)`);
console.log(`Estimated Gzipped: ${totalGzipEstimate} KB`);

// Check against budget
const maxBudgetKB = (MAX_BUNDLE_SIZE / 1024).toFixed(0);
const gzipSize = parseFloat(totalGzipEstimate);
const budgetStatus = gzipSize <= MAX_BUNDLE_SIZE / 1024;

console.log(`\\nBudget: ${maxBudgetKB} KB (gzipped)`);
console.log(`Status: ${budgetStatus ? "✅ Within budget" : "⚠️  Over budget"}`);

// Recommendations
console.log("\\n" + "=".repeat(60));
console.log("💡 RECOMMENDATIONS");
console.log("=".repeat(60));

const oversizedChunks = chunks.filter((chunk) => chunk.size > MAX_CHUNK_SIZE);

if (oversizedChunks.length > 0) {
  console.log("\\n⚠️  Large chunks detected:");
  oversizedChunks.forEach((chunk) => {
    console.log(`   • ${chunk.name} (${chunk.sizeKB} KB)`);
  });
  console.log("\\n   Consider:");
  console.log("   - Dynamic imports for large components");
  console.log("   - Code splitting by route or feature");
  console.log("   - Removing unused dependencies");
}

// Check for duplicate dependencies
console.log("\\n🔍 Checking for potential optimizations...");

const chunkNames = chunks.map((c) => c.name);
const vendorChunks = chunkNames.filter((name) => name.includes("vendor") || name.includes("node_modules"));

if (vendorChunks.length > 1) {
  console.log("\\n   Multiple vendor chunks detected:");
  console.log("   Consider optimizing splitChunks configuration");
}

// Frameworks
const frameworkChunks = chunks.filter(
  (c) => c.name.includes("framework") || c.name.includes("react") || c.name.includes("next")
);

if (frameworkChunks.length > 0) {
  const frameworkSize = frameworkChunks.reduce((sum, c) => sum + c.size, 0);
  const frameworkKB = (frameworkSize / 1024).toFixed(2);
  console.log(`\\n   Framework bundle: ${frameworkKB} KB`);

  if (frameworkSize > 150 * 1024) {
    console.log("   Consider: Ensure tree-shaking is working correctly");
  }
}

// Large libraries
const largeChunks = chunks.filter((c) => c.size > 100 * 1024);
if (largeChunks.length > 0) {
  console.log("\\n   Large chunks (>100KB):");
  largeChunks.forEach((chunk) => {
    console.log(`   • ${chunk.name} (${chunk.sizeKB} KB)`);
  });
  console.log("   Consider: Lazy loading or finding lighter alternatives");
}

// Exit status
console.log("\\n" + "=".repeat(60));

if (budgetStatus && oversizedChunks.length === 0) {
  console.log("✅ Bundle size is optimal!\\n");
  process.exit(0);
} else if (budgetStatus) {
  console.log("⚠️  Bundle within budget but has large chunks\\n");
  process.exit(0);
} else {
  console.log("❌ Bundle exceeds size budget\\n");
  process.exit(1);
}
