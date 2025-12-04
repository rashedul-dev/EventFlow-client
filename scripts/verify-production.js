#!/usr/bin/env node

/**
 * Production Readiness Verification Script
 * Comprehensive checks before production deployment
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const checks = [];
let passedChecks = 0;
let failedChecks = 0;

// Helper functions
function checkExists(filePath, description) {
  const exists = fs.existsSync(path.join(process.cwd(), filePath));
  checks.push({
    name: description,
    passed: exists,
    message: exists ? `✓ ${filePath} exists` : `✗ ${filePath} missing`,
  });
  if (exists) passedChecks++;
  else failedChecks++;
  return exists;
}

function runCommand(command, description) {
  try {
    execSync(command, { stdio: "pipe" });
    checks.push({
      name: description,
      passed: true,
      message: `✓ ${description}`,
    });
    passedChecks++;
    return true;
  } catch (error) {
    checks.push({
      name: description,
      passed: false,
      message: `✗ ${description} failed`,
      error: error.message,
    });
    failedChecks++;
    return false;
  }
}

function checkPackageJson(dependencies, description) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const missingDeps = dependencies.filter((dep) => !allDeps[dep]);
    const passed = missingDeps.length === 0;

    checks.push({
      name: description,
      passed,
      message: passed ? `✓ All required dependencies installed` : `✗ Missing: ${missingDeps.join(", ")}`,
    });

    if (passed) passedChecks++;
    else failedChecks++;

    return passed;
  } catch (error) {
    checks.push({
      name: description,
      passed: false,
      message: `✗ Failed to read package.json`,
    });
    failedChecks++;
    return false;
  }
}

console.log("🚀 EventFlow Production Readiness Verification\\n");
console.log("=".repeat(60));

// 1. Home Page Sections
console.log("\\n📄 HOME PAGE SECTIONS");
console.log("-".repeat(60));

const homeSections = [
  "src/components/home/hero-section.tsx",
  "src/components/home/features-section.tsx",
  "src/components/home/stats-section.tsx",
  "src/components/home/how-it-works-section.tsx",
  "src/components/home/testimonials-section.tsx",
  "src/components/home/faq-section.tsx",
];

homeSections.forEach((section) => {
  checkExists(section, `Home section: ${path.basename(section)}`);
});

// 2. Performance
console.log("\\n⚡ PERFORMANCE");
console.log("-".repeat(60));

checkExists(".lighthouserc.js", "Lighthouse CI configured");
checkExists("src/lib/performance/PerformanceMonitor.ts", "Performance monitoring");
checkExists("src/lib/optimization/splitting/ComponentRegistry.ts", "Code splitting");

// 3. Accessibility
console.log("\\n♿ ACCESSIBILITY");
console.log("-".repeat(60));

checkExists("src/lib/accessibility/A11yAudit.ts", "Accessibility audit tools");
checkExists("src/lib/accessibility/FocusManager.ts", "Focus management");
checkExists("__tests__/accessibility/keyboard-navigation.test.tsx", "Keyboard navigation tests");

// 4. Responsive Design
console.log("\\n📱 RESPONSIVE DESIGN");
console.log("-".repeat(60));

checkExists("src/lib/design/responsive/BreakpointManager.ts", "Breakpoint system");
checkExists("src/lib/design/responsive/ResponsiveHooks.tsx", "Responsive hooks");
checkExists("e2e/mobile-responsive.spec.ts", "Mobile responsiveness tests");

// 5. Error Handling
console.log("\\n🛡️  ERROR HANDLING");
console.log("-".repeat(60));

checkExists("src/lib/error/boundaries/GlobalErrorBoundary.tsx", "Global error boundary");
checkExists("src/lib/error/recovery/AutomaticRetryManager.ts", "Automatic retry");
checkExists("src/lib/monitoring/ErrorTracker.ts", "Error tracking");

// 6. Security
console.log("\\n🔒 SECURITY");
console.log("-".repeat(60));

checkExists("scripts/security/check-headers.js", "Security headers check");
checkExists("scripts/security/owasp-check.js", "OWASP checks");
checkExists("src/app/api/health/route.ts", "Health check endpoint");

// 7. Testing
console.log("\\n🧪 TESTING");
console.log("-".repeat(60));

checkExists("__tests__/unit", "Unit tests directory");
checkExists("__tests__/integration", "Integration tests directory");
checkExists("e2e", "E2E tests directory");
checkExists("vitest.config.ts", "Vitest configuration");
checkExists("playwright.config.ts", "Playwright configuration");

// 8. Documentation
console.log("\\n📚 DOCUMENTATION");
console.log("-".repeat(60));

checkExists("docs/GETTING_STARTED.md", "Getting started guide");
checkExists("docs/ARCHITECTURE.md", "Architecture documentation");
checkExists("docs/CONTRIBUTING.md", "Contributing guidelines");
checkExists("ERROR_HANDLING_GUIDE.md", "Error handling guide");

// 9. Deployment
console.log("\\n🚢 DEPLOYMENT");
console.log("-".repeat(60));

checkExists("Dockerfile", "Dockerfile");
checkExists("docker-compose.prod.yml", "Docker Compose production");
checkExists(".github/workflows/ci-cd.yml", "CI/CD pipeline");

// 10. Dependencies
console.log("\\n📦 DEPENDENCIES");
console.log("-".repeat(60));

checkPackageJson(["next", "react", "typescript", "tailwindcss"], "Core dependencies");

checkPackageJson(["vitest", "@playwright/test", "@testing-library/react"], "Testing dependencies");

// 11. Build Test
console.log("\\n🔨 BUILD");
console.log("-".repeat(60));

runCommand("npm run build", "Production build");

// 12. Type Check
console.log("\\n📘 TYPE CHECK");
console.log("-".repeat(60));

runCommand("npx tsc --noEmit", "TypeScript type check");

// 13. Lint Check
console.log("\\n🔍 LINT");
console.log("-".repeat(60));

runCommand("npm run lint", "ESLint check");

// Summary
console.log("\\n" + "=".repeat(60));
console.log("📊 VERIFICATION SUMMARY");
console.log("=".repeat(60));

console.log(`\\nTotal Checks: ${passedChecks + failedChecks}`);
console.log(`✅ Passed: ${passedChecks}`);
console.log(`❌ Failed: ${failedChecks}`);

const successRate = ((passedChecks / (passedChecks + failedChecks)) * 100).toFixed(1);
console.log(`\\n📈 Success Rate: ${successRate}%`);

// Failed checks detail
if (failedChecks > 0) {
  console.log("\\n❌ FAILED CHECKS:");
  console.log("-".repeat(60));
  checks
    .filter((check) => !check.passed)
    .forEach((check) => {
      console.log(`\\n• ${check.name}`);
      console.log(`  ${check.message}`);
      if (check.error) {
        console.log(`  Error: ${check.error}`);
      }
    });
}

// Production Readiness
console.log("\\n" + "=".repeat(60));

if (failedChecks === 0) {
  console.log("🎉 PRODUCTION READY!");
  console.log("=".repeat(60));
  console.log("\\n✅ All checks passed. Application is ready for deployment.\\n");
  process.exit(0);
} else if (failedChecks <= 5) {
  console.log("⚠️  MOSTLY READY");
  console.log("=".repeat(60));
  console.log("\\n⚠️  Minor issues detected. Review and fix before deployment.\\n");
  process.exit(1);
} else {
  console.log("❌ NOT READY");
  console.log("=".repeat(60));
  console.log("\\n❌ Critical issues detected. Fix all issues before deployment.\\n");
  process.exit(1);
}
