const fs = require('fs');
const path = require('path');

console.log('Current Directory:', process.cwd());

// Read .env file directly
try {
  const envPath = path.join(process.cwd(), '.env');
  console.log('Reading .env from:', envPath);
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('.env file content:');
  console.log(envContent);

  // Load with dotenv
  require('dotenv').config();

  console.log('\nAfter dotenv load:');
  console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY ? 'SET' : 'NOT SET');
  console.log('INFURA_API_KEY:', process.env.INFURA_API_KEY ? 'SET' : 'NOT SET');
  console.log('VITE_WALLETCONNECT_PROJECT_ID:', process.env.VITE_WALLETCONNECT_PROJECT_ID ? 'SET' : 'NOT SET');

} catch (error) {
  console.error('Error reading .env file:', error.message);
}

if (process.env.PRIVATE_KEY) {
  const { ethers } = require('ethers');
  try {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    console.log('Wallet Address:', wallet.address);
  } catch (error) {
    console.log('Invalid Private Key:', error.message);
  }
}
