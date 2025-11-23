const { ethers } = require('ethers');

// Get private key from environment variable
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error('Please set the PRIVATE_KEY environment variable');
  process.exit(1);
}

try {
  // Create wallet instance
  const wallet = new ethers.Wallet(privateKey);
  console.log('Account address:', wallet.address);
  console.log('Please use this address to get test ETH from Sepolia faucet');
  console.log('Recommended faucet: https://sepoliafaucet.com/');
} catch (error) {
  console.error('Invalid private key:', error.message);
}
