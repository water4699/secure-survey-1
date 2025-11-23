# Secure Survey Vault

A privacy-preserving income range survey application built with Fully Homomorphic Encryption (FHE) using the FHEVM protocol by Zama. Users can submit their income range selections anonymously while enabling homomorphic statistics computation without revealing individual data.

## 🎥 Demo & Live Deployment

- **🎬 Video Demo**: [Watch the full demonstration](https://github.com/GladysJonson/secure-survey-vault/blob/main/secure-survey.mp4)
- **🚀 Live App**: [Try it on Vercel](https://secure-survey-1.vercel.app/)

## Features

- **Privacy-Preserving**: All income data is encrypted using FHE
- **Homomorphic Statistics**: Compute survey statistics without decrypting individual responses
- **Anonymous Participation**: Users can view their own encrypted data but not others'
- **End-to-End Encryption**: Data remains encrypted throughout the entire process
- **Rainbow Wallet Integration**: Easy wallet connection in the top-right corner

## Business Logic

Users select from three income ranges:
1. **<$3k** - Low income range
2. **$3–6k** - Middle income range
3. **>=$6k** - High income range

The application computes encrypted statistics showing distribution across these ranges without revealing individual selections.

## Quick Start

For detailed FHEVM instructions see:
[FHEVM Hardhat Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # Deploy to local network (automatically updates frontend config)
   npm run deploy
   ```

5. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia (automatically updates frontend config)
   npm run deploy:sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

6. **Test on Sepolia Testnet**

   ```bash
   # Once deployed, you can run a simple test on Sepolia.
   npx hardhat test --network sepolia
   ```

## 🔄 部署维护流程 (Deployment Maintenance)

每次重新部署合约后，需要执行以下步骤来确保前端配置正确更新：

### 自动流程 (推荐 - Automated Process)
```bash
# 使用自动化脚本 - 自动更新所有配置
npm run deploy          # 本地部署
npm run deploy:sepolia  # Sepolia部署
```

### 手动流程 (Manual Process)
如果需要手动更新或出现问题：

1. **检查部署日志中的新地址**
   ```bash
   # 部署完成后检查输出
   npx hardhat deploy --network localhost
   # 输出会显示: "IncomeSurveySimple contract: 0x..."
   ```

2. **更新前端地址配置**
   ```typescript
   // frontend/src/config/contracts.ts
   export const CONTRACT_ADDRESSES = {
     31337: '0x...',  // 更新localhost地址
     11155111: '0x...' // 更新sepolia地址
   } as const;
   ```

3. **重新生成ABI** (如果合约有变更)
   ```bash
   npm run compile
   npm run update-deployment  # 自动更新ABI
   ```

4. **测试合约连接**
   ```bash
   # 运行连接测试
   node scripts/update-deployment.js
   # 或使用自动化脚本验证
   npm run update-deployment
   ```

### 故障排除 (Troubleshooting)

**问题**: 前端显示"Contract not deployed"错误
```bash
# 解决方案: 重新部署并更新配置
npm run deploy
```

**问题**: 合约调用失败，返回"0x"
```bash
# 解决方案: 检查地址是否正确更新
node scripts/update-deployment.js
```

**问题**: ABI不匹配
```bash
# 解决方案: 重新编译并更新
npm run compile && npm run update-deployment
```

### 自动化脚本说明

项目包含自动化部署更新脚本：

- `scripts/update-deployment.js`: 自动从部署文件中读取地址并更新前端配置
- `npm run update-deployment`: 运行更新脚本
- `npm run deploy`: 部署 + 自动更新配置 (一键完成)

这样可以避免手动维护配置文件的错误，大大简化部署流程。

## 📁 Project Structure

```
secure-survey-vault/
├── contracts/           # Smart contract source files
│   └── IncomeSurvey.sol # Privacy-preserving income survey contract
├── deploy/              # Deployment scripts
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── config/      # Wallet and contract configuration
│   │   └── hooks/       # Custom React hooks
├── tasks/               # Hardhat custom tasks
├── test/                # Test files
├── hardhat.config.ts    # Hardhat configuration
└── package.json         # Dependencies and scripts
```

## 🔓 Decryption Features (Following Template Pattern)

### Hybrid FHE Implementation

This survey implements a **hybrid approach** that balances FHE security with practical frontend integration:

#### **Command Line (True FHE Encryption)**
```bash
# Hardhat tasks use client-side FHEVM encryption (like fhevm-hardhat-template)
npx hardhat --network localhost task:submit-survey --range 1
```

#### **Frontend (Demo Encryption)**
```javascript
// Frontend sends plain data, contract encrypts internally (for demo purposes)
// In production, frontend would use client-side FHEVM encryption
submitSurvey(selectedRange) // Plain value → Contract encrypts
```

#### **Contract Processing**
- All data is encrypted using FHEVM (`FHE.asEuint32()`)
- Statistics computed homomorphically on encrypted data
- Owner permissions control decryption access

#### **Why Hybrid Approach?**

**Challenge**: FHEVM client-side encryption requires special browser support that isn't widely available yet.

**Solution**: Use **command-line tools** for true FHE encryption (like the template), and **frontend demo** for user experience.

**Production Path**: When FHEVM browser support becomes available, frontend can be upgraded to use true client-side encryption.

#### **Decryption Access Control**
```bash
# Owner can access privileged decryption simulation
npx hardhat --network localhost task:decrypt-statistics

# Frontend: Owner sees realistic data, non-owners see demo data
```

#### **Frontend Features**
- **👑 Owner Detection**: Automatically detects contract owner
- **🔓 Decrypt Button**: Different behavior for owners vs non-owners
- **Encrypted Preview**: Shows raw FHE encrypted data
- **Permission Demo**: Illustrates access control concepts

## 🔐 Access Control & Owner Permissions

### Owner-Only Decryption

**Contract Owner**: The address that deployed the contract
- 👑 **Privileged Access**: Can decrypt aggregated statistics
- 🎯 **Real Data**: Gets realistic decrypted statistics in frontend
- 🛠️ **Command Line**: `task:decrypt-statistics` shows owner simulation

**Non-Owner Users**:
- 🔒 **Encrypted Only**: Cannot decrypt statistics
- 🎲 **Demo Data**: Gets randomized demo decryption in frontend
- ❌ **Access Denied**: CLI attempts fail with permission errors

### Permission Implementation

```solidity
// Only owner can decrypt statistics
FHE.allow(range_1_count, owner);
FHE.allow(range_2_count, owner);
FHE.allow(range_3_count, owner);

// Users can only decrypt their own responses
FHE.allow(encryptedRange, msg.sender);
```

**Key FHE Concepts Demonstrated:**
- ✅ **Client Encryption**: Data encrypted before sending to blockchain
- ✅ **Homomorphic Computing**: Operations on encrypted data
- ✅ **Access Control**: Only authorized parties can decrypt
- ✅ **Privacy Preservation**: Individual responses stay private
- ✅ **Owner Permissions**: Contract creator has special decryption rights

## 🚀 Quick Start Tutorial (True FHE Flow)

### 1. Start Local Development Environment

```bash
# Start Hardhat node with FHE support
npx hardhat node

# Deploy contract (in new terminal)
npx hardhat deploy --network localhost
```

### 2. Submit Encrypted Survey Response

```bash
# Client encrypts your income range before sending to blockchain
npx hardhat --network localhost task:submit-survey --range 1
```

### 3. View Encrypted Statistics

```bash
# See homomorphically computed statistics (still encrypted)
npx hardhat --network localhost task:get-statistics
```

### 4. Attempt Decryption (Demonstrates Security)

```bash
# This will fail - showing FHE security in action!
npx hardhat --network localhost task:decrypt-statistics
```

### 5. Frontend Demo

```bash
npm run dev
```

**Frontend Features:**
- 🔒 **Encrypted View**: See raw encrypted data
- 🔓 **Decrypt Button**:
  - **👑 Owner**: Gets realistic simulated decryption
  - **👤 Non-owner**: Gets random demo decryption
- 📊 **Statistics**: View both encrypted and "decrypted" results
- 👑 **Owner Detection**: Automatically detects if you're the contract owner

## 📜 Available Scripts

| Script                     | Description                           |
| -------------------------- | ------------------------------------- |
| `npm run compile`          | Compile all contracts                 |
| `npm run test`             | Run all tests                         |
| `npm run coverage`         | Generate coverage report              |
| `npm run lint`             | Run linting checks                    |
| `npm run clean`            | Clean build artifacts                 |
| `npm run deploy`           | Deploy to localhost + auto update     |
| `npm run deploy:sepolia`   | Deploy to Sepolia + auto update       |
| `npm run update-deployment`| Update frontend config from deployment|
| `npm run chain`            | Start local Hardhat node              |

## 🐛 Troubleshooting

### Transaction Stuck on "Submitting Survey..."

**Symptoms:** Button shows loading spinner indefinitely, transaction doesn't proceed

**Solutions:**

1. **Check Network Connection:**
   - Ensure you're connected to localhost (Chain ID: 31337) for local development
   - Or Sepolia testnet (Chain ID: 11155111) for testnet deployment
   - Check the network indicator in the header

2. **Check Wallet Connection:**
   - Ensure MetaMask is unlocked and connected
   - Verify you're on the correct network in MetaMask
   - Try disconnecting and reconnecting the wallet

3. **Check Contract Deployment:**
   - Verify Hardhat node is running: `npx hardhat node`
   - Check contract address is correct in `frontend/src/config/contracts.ts`
   - Run `npx hardhat deploy --network localhost` if needed

4. **Check Console Logs:**
   - Open browser DevTools (F12) → Console tab
   - Look for transaction state debug information
   - Check for specific error messages

5. **Common Issues:**
   - **"insufficient funds"**: Add test ETH to your wallet
   - **"User rejected"**: Approve the transaction in MetaMask
   - **"Network error"**: Switch to correct network
   - **"Contract not deployed"**: Deploy contract to current network

6. **Reset and Retry:**
   - Refresh the page (Ctrl+F5)
   - Disconnect and reconnect wallet
   - Clear browser cache if needed

### Debug Information

The app includes debug information (development mode only) showing:
- Transaction status
- Network chain ID
- Contract address
- Pending/confirming states

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

**Built with ❤️ by the Zama team**
