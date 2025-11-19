#!/usr/bin/env node

/**
 * Automated deployment update script
 * This script updates the frontend configuration after contract deployment
 */

const fs = require('fs');
const path = require('path');

async function updateDeployment() {
  try {
    console.log('🔄 Updating deployment configuration...');

    // Read deployment files
    const localhostDeployment = path.join(__dirname, '../deployments/localhost/IncomeSurveySimple.json');
    const sepoliaDeployment = path.join(__dirname, '../deployments/sepolia/IncomeSurveySepolia.json');

    // Get contract addresses
    const addresses = {};

    if (fs.existsSync(localhostDeployment)) {
      const localhostData = JSON.parse(fs.readFileSync(localhostDeployment, 'utf8'));
      addresses[31337] = localhostData.address;
      console.log(`📍 Localhost contract: ${localhostData.address}`);
    }

    if (fs.existsSync(sepoliaDeployment)) {
      const sepoliaData = JSON.parse(fs.readFileSync(sepoliaDeployment, 'utf8'));
      addresses[11155111] = sepoliaData.address;
      console.log(`📍 Sepolia contract: ${sepoliaData.address}`);
    }

    // Update frontend config
    const configPath = path.join(__dirname, '../frontend/src/config/contracts.ts');
    let configContent = fs.readFileSync(configPath, 'utf8');

    // Update addresses
    Object.entries(addresses).forEach(([chainId, address]) => {
      const networkName = chainId === '31337' ? 'Localhost' : 'Sepolia';
      const regex = new RegExp(`(// ${networkName} deployment \\(chainId: ${chainId}\\) - .*\n)\\s*${chainId}: '[^']*'`, 'g');
      configContent = configContent.replace(regex, `$1  ${chainId}: '${address}'`);
    });

    fs.writeFileSync(configPath, configContent);
    console.log('✅ Frontend configuration updated');

    // Copy latest ABIs
    const artifactsDir = path.join(__dirname, '../artifacts/contracts');

    if (fs.existsSync(path.join(artifactsDir, 'IncomeSurveySimple.sol'))) {
      const abiPath = path.join(artifactsDir, 'IncomeSurveySimple.sol/IncomeSurveySimple.json');
      const abiData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

      // Update ABI in config
      const abiStart = configContent.indexOf('// Generated ABI from contract artifacts (simple contract version)');
      const abiEndPattern = '] as const;';
      const abiEnd = configContent.indexOf(abiEndPattern, abiStart);

      if (abiStart !== -1 && abiEnd !== -1) {
        const abiEndFull = abiEnd + abiEndPattern.length;
        const abiString = JSON.stringify(abiData.abi, null, 2);
        const newAbiSection = '// Generated ABI from contract artifacts (simple contract version)\n' +
                             `export const CONTRACT_ABI = ${abiString} as const;`;

        configContent = configContent.substring(0, abiStart) +
                        newAbiSection +
                        configContent.substring(abiEndFull);

        fs.writeFileSync(configPath, configContent);
        console.log('✅ ABI updated');
      }
    }

    console.log('🎉 Deployment update completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your frontend development server');
    console.log('2. Test contract interactions');

  } catch (error) {
    console.error('❌ Error updating deployment:', error.message);
    process.exit(1);
  }
}

updateDeployment();
