const { ethers } = require('ethers');

// 从环境变量获取私钥
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error('请设置 PRIVATE_KEY 环境变量');
  process.exit(1);
}

try {
  // 创建钱包实例
  const wallet = new ethers.Wallet(privateKey);
  console.log('账户地址:', wallet.address);
  console.log('请使用此地址从 Sepolia faucet 获取测试 ETH');
  console.log('推荐 faucet: https://sepoliafaucet.com/');
} catch (error) {
  console.error('无效的私钥:', error.message);
}
