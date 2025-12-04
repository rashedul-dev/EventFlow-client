#!/usr/bin/env node

/**
 * Security Headers Verification Script
 * Checks that all required security headers are properly configured
 */

const https = require("https");
const http = require("http");

const REQUIRED_HEADERS = {
  "content-security-policy": {
    required: true,
    description: "Prevents XSS and other code injection attacks",
  },
  "strict-transport-security": {
    required: true,
    description: "Enforces HTTPS connections",
  },
  "x-content-type-options": {
    required: true,
    expected: "nosniff",
    description: "Prevents MIME type sniffing",
  },
  "x-frame-options": {
    required: true,
    expected: ["DENY", "SAMEORIGIN"],
    description: "Prevents clickjacking attacks",
  },
  "referrer-policy": {
    required: true,
    description: "Controls referrer information",
  },
  "permissions-policy": {
    required: true,
    description: "Controls browser features",
  },
};

async function checkHeaders(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol
      .get(url, (res) => {
        resolve(res.headers);
      })
      .on("error", reject);
  });
}

async function verifySecurityHeaders(url = "http://localhost:3000") {
  console.log("🔒 Security Headers Verification\n");
  console.log(`Checking: ${url}\n`);

  try {
    const headers = await checkHeaders(url);
    let passed = 0;
    let failed = 0;

    Object.entries(REQUIRED_HEADERS).forEach(([headerName, config]) => {
      const headerValue = headers[headerName];

      if (!headerValue && config.required) {
        console.log(`❌ ${headerName}: MISSING`);
        console.log(`   ${config.description}\n`);
        failed++;
      } else if (config.expected) {
        const expectedValues = Array.isArray(config.expected) ? config.expected : [config.expected];
        const isValid = expectedValues.some((exp) => headerValue?.toLowerCase().includes(exp.toLowerCase()));

        if (isValid) {
          console.log(`✅ ${headerName}: ${headerValue}`);
          passed++;
        } else {
          console.log(`⚠️  ${headerName}: ${headerValue}`);
          console.log(`   Expected: ${expectedValues.join(" or ")}`);
          failed++;
        }
      } else {
        console.log(`✅ ${headerName}: ${headerValue}`);
        passed++;
      }
    });

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
      console.log("\n⚠️  Security header issues detected!");
      process.exit(1);
    } else {
      console.log("\n✅ All security headers configured correctly!");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Error checking headers:", error.message);
    process.exit(1);
  }
}

// Run the check
const url = process.argv[2] || "http://localhost:3000";
verifySecurityHeaders(url);
