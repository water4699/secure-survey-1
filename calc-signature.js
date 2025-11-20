const { keccak256, toUtf8Bytes } = require('ethers');

console.log('submitSurvey(uint8):', '0x' + keccak256(toUtf8Bytes('submitSurvey(uint8)')).slice(0, 10));
console.log('submitSurvey(externalEuint32,bytes):', '0x' + keccak256(toUtf8Bytes('submitSurvey(externalEuint32,bytes)')).slice(0, 10));
