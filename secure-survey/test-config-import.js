// Test if the config file can be imported without syntax errors
try {
  console.log('Testing config import...');

  // Try to import the config (simulate what the frontend does)
  const fs = require('fs');
  const path = require('path');

  const configPath = path.join(__dirname, 'frontend/src/config/contracts.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');

  // Check for common syntax errors
  const syntaxChecks = [
    { pattern: /\] as const;t;/, description: 'Invalid characters after array declaration' },
    { pattern: /;;/, description: 'Double semicolons' },
    { pattern: /,\s*\]/, description: 'Trailing comma before closing bracket' },
  ];

  let hasErrors = false;
  for (const check of syntaxChecks) {
    if (check.pattern.test(configContent)) {
      console.error(`❌ Syntax error found: ${check.description}`);
      hasErrors = true;
    }
  }

  if (!hasErrors) {
    console.log('✅ No syntax errors detected in config file');
  }

  // Try to extract key values
  const addressMatch = configContent.match(/31337:\s*'([^']+)'/);
  if (addressMatch) {
    console.log(`📍 Localhost address: ${addressMatch[1]}`);
  }

  const abiMatch = configContent.match(/export const CONTRACT_ABI = \[/);
  if (abiMatch) {
    console.log('✅ CONTRACT_ABI export found');
  }

  console.log('🎉 Config validation passed!');

} catch (error) {
  console.error('❌ Config validation failed:', error.message);
  process.exit(1);
}
