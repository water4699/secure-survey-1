import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId, useAccount } from 'wagmi';
import '../styles/Header.css';

const NETWORK_NAMES = {
  31337: 'Localhost',
  11155111: 'Sepolia',
} as const;

export function Header() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const networkName = NETWORK_NAMES[chainId as keyof typeof NETWORK_NAMES] || 'Unknown';

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo & Brand */}
          <div className="header-brand">
            <div className="brand-logo">
              <span className="logo-icon">🔐</span>
              <div className="logo-glow"></div>
            </div>
            <div className="brand-text">
              <h1 className="header-title">Secure Survey</h1>
              <p className="header-subtitle">Privacy-Preserving Research</p>
            </div>
          </div>

          {/* Center - Network Status */}
          {isConnected && (
            <div className="header-center">
              <div className={`network-badge ${chainId === 31337 ? 'localhost' : chainId === 11155111 ? 'sepolia' : 'unknown'}`}>
                <span className="network-dot"></span>
                <span className="network-name">{networkName}</span>
                <span className="network-chain">Chain {chainId}</span>
              </div>
            </div>
          )}

          {/* Right - Wallet */}
          <div className="header-right">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
