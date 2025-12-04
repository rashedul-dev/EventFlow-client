module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/events",
        "http://localhost:3000/login",
        "http://localhost:3000/register",
      ],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        // Performance budgets
        "first-contentful-paint": ["error", { maxNumericValue: 1500 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        "speed-index": ["error", { maxNumericValue: 3400 }],

        // Scores
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],

        // Specific checks
        "uses-responsive-images": "warn",
        "offscreen-images": "warn",
        "unminified-css": "error",
        "unminified-javascript": "error",
        "unused-css-rules": "warn",
        "uses-optimized-images": "warn",
        "modern-image-formats": "warn",
        "uses-text-compression": "error",
        "uses-long-cache-ttl": "warn",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
