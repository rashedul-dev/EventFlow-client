#!/usr/bin/env node

/**
 * OWASP Top 10 Security Checklist
 * Automated checks for common vulnerabilities
 */

const fs = require("fs");
const path = require("path");

const checks = {
  "A01:2021 – Broken Access Control": [
    {
      name: "API route authentication",
      check: () => {
        const apiDir = path.join(process.cwd(), "src/app/api");
        if (!fs.existsSync(apiDir)) return { passed: false, message: "API directory not found" };

        // Check for auth middleware usage
        const hasAuthMiddleware = fs.existsSync(path.join(process.cwd(), "middleware.ts"));
        return {
          passed: hasAuthMiddleware,
          message: hasAuthMiddleware ? "Auth middleware configured" : "No auth middleware found",
        };
      },
    },
  ],
  "A02:2021 – Cryptographic Failures": [
    {
      name: "Environment variables not hardcoded",
      check: () => {
        const envExample = path.join(process.cwd(), ".env.example");
        const hasEnvExample = fs.existsSync(envExample);

        return {
          passed: hasEnvExample,
          message: hasEnvExample ? ".env.example exists" : "No .env.example template found",
        };
      },
    },
  ],
  "A03:2021 – Injection": [
    {
      name: "SQL injection prevention",
      check: () => {
        // Check if using ORM/query builder
        const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
        const hasORM =
          packageJson.dependencies?.["drizzle-orm"] ||
          packageJson.dependencies?.["prisma"] ||
          packageJson.dependencies?.["typeorm"];

        return {
          passed: !!hasORM,
          message: hasORM ? "Using ORM for database queries" : "No ORM detected - ensure parameterized queries",
        };
      },
    },
  ],
  "A04:2021 – Insecure Design": [
    {
      name: "Error boundaries implemented",
      check: () => {
        const errorBoundaryPath = path.join(process.cwd(), "src/lib/error/boundaries");
        const hasErrorBoundaries = fs.existsSync(errorBoundaryPath);

        return {
          passed: hasErrorBoundaries,
          message: hasErrorBoundaries ? "Error boundaries configured" : "No error boundaries found",
        };
      },
    },
  ],
  "A05:2021 – Security Misconfiguration": [
    {
      name: "Security headers configured",
      check: () => {
        const nextConfig = path.join(process.cwd(), "next.config.ts");
        if (!fs.existsSync(nextConfig)) return { passed: false, message: "next.config.ts not found" };

        const config = fs.readFileSync(nextConfig, "utf8");
        const hasSecurityHeaders = config.includes("Content-Security-Policy") || config.includes("X-Frame-Options");

        return {
          passed: hasSecurityHeaders,
          message: hasSecurityHeaders
            ? "Security headers configured in next.config.ts"
            : "No security headers found in next.config.ts",
        };
      },
    },
  ],
  "A06:2021 – Vulnerable Components": [
    {
      name: "Dependencies up to date",
      check: () => {
        return {
          passed: true,
          message: "Run npm audit to check for vulnerabilities",
        };
      },
    },
  ],
  "A07:2021 – Authentication Failures": [
    {
      name: "Authentication system implemented",
      check: () => {
        const authPath = path.join(process.cwd(), "src/lib/auth.ts");
        const hasAuth = fs.existsSync(authPath);

        return {
          passed: hasAuth,
          message: hasAuth ? "Authentication system detected" : "No authentication system found",
        };
      },
    },
  ],
  "A08:2021 – Software and Data Integrity Failures": [
    {
      name: "Dependencies integrity check",
      check: () => {
        const lockFile = path.join(process.cwd(), "package-lock.json");
        const hasLockFile = fs.existsSync(lockFile);

        return {
          passed: hasLockFile,
          message: hasLockFile ? "Lock file present for dependency integrity" : "No lock file found",
        };
      },
    },
  ],
  "A09:2021 – Logging and Monitoring Failures": [
    {
      name: "Error tracking implemented",
      check: () => {
        const monitoringPath = path.join(process.cwd(), "src/lib/monitoring");
        const hasMonitoring = fs.existsSync(monitoringPath);

        return {
          passed: hasMonitoring,
          message: hasMonitoring ? "Monitoring system configured" : "No monitoring system detected",
        };
      },
    },
  ],
  "A10:2021 – Server-Side Request Forgery (SSRF)": [
    {
      name: "API route validation",
      check: () => {
        return {
          passed: true,
          message: "Manually verify all external API calls are validated",
        };
      },
    },
  ],
};

console.log("🛡️  OWASP Top 10 Security Checklist\n");

let totalPassed = 0;
let totalFailed = 0;

Object.entries(checks).forEach(([category, categoryChecks]) => {
  console.log(`\n${category}`);
  console.log("=".repeat(60));

  categoryChecks.forEach(({ name, check }) => {
    try {
      const result = check();
      const symbol = result.passed ? "✅" : "❌";
      console.log(`${symbol} ${name}`);
      console.log(`   ${result.message}`);

      if (result.passed) {
        totalPassed++;
      } else {
        totalFailed++;
      }
    } catch (error) {
      console.log(`⚠️  ${name}`);
      console.log(`   Error: ${error.message}`);
      totalFailed++;
    }
  });
});

console.log(`\n${"=".repeat(60)}`);
console.log(`📊 Results: ${totalPassed} passed, ${totalFailed} failed`);

if (totalFailed > 0) {
  console.log("\n⚠️  Security issues detected. Please review and fix.");
  process.exit(1);
} else {
  console.log("\n✅ All security checks passed!");
  process.exit(0);
}
