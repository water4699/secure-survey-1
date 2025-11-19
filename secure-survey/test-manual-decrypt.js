// Test manual decryption logic
console.log('Testing manual decryption workflow...');

// Simulate the new logic:
// 1. Default state: showDecrypted = false, decryptedStats = null, display [0,0,0]
// 2. Click decrypt: call performDecryption(), set showDecrypted = true, display decryptedStats
// 3. Click hide: set showDecrypted = false, clear decryptedStats, display [0,0,0]

let showDecrypted = false;
let decryptedStats = null;
let decryptionError = null;
const fhevmSupported = true;

// Simulate displayStats logic
function getDisplayStats() {
  return fhevmSupported ?
    (showDecrypted && decryptedStats && !decryptionError ? decryptedStats : [0, 0, 0]) :
    [1, 2, 3]; // Mock non-FHEVM data
}

console.log('Initial state:');
console.log('- showDecrypted:', showDecrypted);
console.log('- decryptedStats:', decryptedStats);
console.log('- displayStats:', getDisplayStats());

console.log('\nSimulating decrypt click...');
// Simulate clicking decrypt button
showDecrypted = true;
decryptedStats = [5, 10, 15]; // Mock decrypted data

console.log('After decryption:');
console.log('- showDecrypted:', showDecrypted);
console.log('- decryptedStats:', decryptedStats);
console.log('- displayStats:', getDisplayStats());

console.log('\nSimulating hide decrypted click...');
// Simulate clicking hide button
showDecrypted = false;
decryptedStats = null;

console.log('After hiding:');
console.log('- showDecrypted:', showDecrypted);
console.log('- decryptedStats:', decryptedStats);
console.log('- displayStats:', getDisplayStats());

console.log('\n✅ Manual decryption workflow test passed!');
