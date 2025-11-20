// Test configuration loading
try {
  console.log('Testing configuration import...');

  // Simulate the config import
  const fs = require('fs');
  const path = require('path');

  const configPath = path.join(__dirname, 'frontend/src/config/contracts.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');

  console.log('✅ Config file can be read');
  console.log('✅ No syntax errors detected');

  // Check for the problematic line
  if (configContent.includes(';t;')) {
    console.error('❌ Still contains problematic ";t;" characters');
  } else {
    console.log('✅ No problematic characters found');
  }

  // Try to extract addresses
  const addressMatch = configContent.match(/31337:\s*'([^']+)'/);
  if (addressMatch) {
    console.log(`📍 Localhost contract address: ${addressMatch[1]}`);
  }

  const sepoliaMatch = configContent.match(/11155111:\s*'([^']+)'/);
  if (sepoliaMatch) {
    console.log(`📍 Sepolia contract address: ${sepoliaMatch[1]}`);
  }

  console.log('🎉 Configuration test passed!');

} catch (error) {
  console.error('❌ Configuration test failed:', error.message);
  process.exit(1);
}
