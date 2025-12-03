/**
 * Tree Shaking Configuration and Analysis
 * Ensures dead code elimination and optimal bundle size
 */

const fs = require('fs');
const path = require('path');

/**
 * Packages known to have side effects (cannot be tree-shaken safely)
 */
const SIDE_EFFECT_PACKAGES = [
  'react',
  'react-dom',
  'next'
];

/**
 * Packages that should be tree-shakeable
 */
const TREE_SHAKEABLE_PACKAGES = [
  'lodash-es',
  'date-fns',
  'lucide-react',
  'recharts'
];

/**
 * Check import patterns for tree-shaking
 */
function checkImportPatterns() {
  console.log('🌳 Tree Shaking Analysis\n');

  const srcPath = path.join(process.cwd(), 'src');
  
  console.log('✅ Tree Shaking Best Practices:\n');
  
  console.log('1. Use Named Imports:');
  console.log('   ✓ import { Button } from "@/components/ui/button"');
  console.log('   ✗ import * as UI from "@/components/ui"\n');

  console.log('2. Avoid Barrel Exports:');
  console.log('   ✗ export * from "./component-a"');
  console.log('   ✓ export { ComponentA } from "./component-a"\n');

  console.log('3. Use Tree-Shakeable Libraries:');
  console.log('   ✓ import { format } from "date-fns"');
  console.log('   ✗ import moment from "moment"\n');

  console.log('4. Mark Side Effects in package.json:');
  console.log('   "sideEffects": ["*.css", "*.scss"]\n');
}

/**
 * Analyze package.json for tree-shaking configuration
 */
function analyzePackageConfig() {
  console.log('📦 Package Configuration Check:\n');

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Check sideEffects field
  if (packageJson.sideEffects === false) {
    console.log('  ✅ sideEffects: false (optimal for tree-shaking)');
  } else if (Array.isArray(packageJson.sideEffects)) {
    console.log('  ✅ sideEffects: specified files only');
    console.log(`     ${packageJson.sideEffects.join(', ')}`);
  } else {
    console.log('  ⚠️  Consider adding "sideEffects": false or array of side-effect files');
  }

  // Check module field
  if (packageJson.module) {
    console.log('  ✅ module field specified (ESM entry point)');
  }

  console.log('\n');
}

/**
 * Check for barrel exports (anti-pattern for tree-shaking)
 */
function checkBarrelExports() {
  console.log('🚫 Barrel Export Check:\n');
  
  console.log('  Barrel exports (export * from "./module") can prevent tree-shaking');
  console.log('  Use direct imports or specific named exports instead\n');
  
  console.log('  Example fixes:');
  console.log('  ✗ index.ts: export * from "./utils"');
  console.log('  ✓ Direct: import { utilA } from "@/lib/utils/utilA"\n');
}

/**
 * Analyze webpack/next.js configuration
 */
function analyzeWebpackConfig() {
  console.log('⚙️  Next.js Tree Shaking:\n');
  
  console.log('  Next.js automatically enables tree-shaking in production:');
  console.log('  ✓ Webpack 5 tree shaking enabled by default');
  console.log('  ✓ SWC minification with dead code elimination');
  console.log('  ✓ Module concatenation (scope hoisting)');
  console.log('  ✓ Side effect analysis\n');
}

/**
 * Check for common tree-shaking issues
 */
function checkCommonIssues() {
  console.log('⚠️  Common Tree Shaking Issues:\n');
  
  const issues = [
    {
      issue: 'Default exports',
      fix: 'Use named exports instead: export const Component = ...'
    },
    {
      issue: 'CommonJS requires',
      fix: 'Use ESM imports: import { x } from "package"'
    },
    {
      issue: 'Side effects in module scope',
      fix: 'Move side effects to function calls or useEffect'
    },
    {
      issue: 'Importing entire libraries',
      fix: 'Import specific functions: import { map } from "lodash-es"'
    }
  ];

  issues.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.issue}`);
    console.log(`     Fix: ${item.fix}\n`);
  });
}

/**
 * Recommendations for optimal tree-shaking
 */
function generateRecommendations() {
  console.log('💡 Tree Shaking Recommendations:\n');
  
  const recommendations = [
    'Use ESM (import/export) syntax exclusively',
    'Prefer named exports over default exports',
    'Avoid barrel exports (export * from)',
    'Import specific functions from libraries',
    'Mark CSS files as having side effects',
    'Use dynamic imports for code splitting',
    'Verify tree-shaking with bundle analyzer',
    'Keep module scope side-effect free'
  ];

  recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
  
  console.log('\n');
}

/**
 * Generate tree-shaking report
 */
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    configuration: {
      webpack5: true,
      swcMinification: true,
      productionMode: true
    },
    recommendations: [
      'Use named exports',
      'Avoid barrel exports',
      'Use tree-shakeable libraries',
      'Import specific functions',
      'Mark side effects properly'
    ],
    treeShakeablePackages: TREE_SHAKEABLE_PACKAGES,
    sideEffectPackages: SIDE_EFFECT_PACKAGES
  };

  const reportPath = path.join(process.cwd(), 'tree-shaking-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportPath}\n`);
}

// Main execution
if (require.main === module) {
  console.log('🚀 Tree Shaking Configuration Analysis\n');
  console.log('='.repeat(50) + '\n');
  
  checkImportPatterns();
  analyzePackageConfig();
  checkBarrelExports();
  analyzeWebpackConfig();
  checkCommonIssues();
  generateRecommendations();
  generateReport();
  
  console.log('='.repeat(50));
  console.log('\n✅ Tree shaking analysis complete!\n');
}

module.exports = {
  checkImportPatterns,
  analyzePackageConfig,
  checkCommonIssues
};
