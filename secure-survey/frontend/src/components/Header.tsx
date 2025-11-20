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
          <div className="header-left">
            <h1 className="header-title">
              Secure Survey Vault
            </h1>
            <p className="header-subtitle">
              Privacy-Preserving Income Range Survey
            </p>
            {isConnected && (
              <div className="network-indicator">
                <div className={`network-status ${chainId ? 'connected' : 'disconnected'}`}>
                  <span className="network-dot"></span>
                  <span className="network-text">
                    {chainId ? `Connected to ${networkName}` : 'Network disconnected'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
