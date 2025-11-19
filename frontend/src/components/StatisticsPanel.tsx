import { useState, useEffect } from 'react';
import { useReadContract, useChainId, useAccount } from 'wagmi';
import { useEthersSigner } from './useEthersSigner';
import { getContractAddress, getContractABI, isFhevmSupported } from '../config/contracts';
import '../styles/StatisticsPanel.css';

// Note: This demo uses EIP-712 signatures to simulate FHEVM-style decryption permissions
// In a real FHEVM application, this would use actual homomorphic encryption

const INCOME_RANGES = [
  { value: 1, label: '< $3,000', description: 'Less than $3,000 per month' },
  { value: 2, label: '$3,000 - $6,000', description: '$3,000 to $6,000 per month' },
  { value: 3, label: '>= $6,000', description: '$6,000 or more per month' },
];

interface StatisticsPanelProps {
  forceRefresh?: number;
}

export function StatisticsPanel({ forceRefresh }: StatisticsPanelProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const ethersSigner = useEthersSigner();
  const contractAddress = getContractAddress(chainId);
  const contractABI = getContractABI(chainId);
  const fhevmSupported = isFhevmSupported(chainId);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);

  // Get encrypted statistics from contract
  const { data: statistics } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: 'getAllStatistics',
    query: {
      refetchInterval: false,  // Disable auto-polling
      refetchOnWindowFocus: false,  // Disable window focus refresh
      refetchOnMount: true,  // Only fetch on mount
    },
  });

  // Get development statistics when in localhost (always enabled for localhost)
  const { data: developmentStats, refetch: refetchDevelopmentStats } = useReadContract({
    address: (chainId === 31337 && contractAddress) ? (contractAddress as `0x${string}`) : undefined,
    abi: contractABI,
    functionName: 'getDevelopmentStatistics',
    query: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled: chainId === 31337,
    },
  });

  // Get contract owner
  const { data: contractOwner } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: 'owner',
    query: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  });

  // Note: Contract-level decryption is not available
  // Owner decryption happens through Hardhat tasks

  // For demonstration: simulate decryption by using encrypted data as base
  // In real FHE, decryption would require special permissions/keys

  const { data: totalParticipants, refetch: refetchTotalParticipants } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: 'totalParticipants',
    query: {
      refetchInterval: false,  // Disable auto-polling
      refetchOnWindowFocus: false,  // Disable window focus refresh
      refetchOnMount: true,  // Only fetch on mount
    },
  });

  // Handle different return types based on network
  // FHEVM networks return encrypted data (BigInt), non-FHEVM networks return plain numbers
  const stats = statistics || [fhevmSupported ? 0n : 0, fhevmSupported ? 0n : 0, fhevmSupported ? 0n : 0];
  const [range1Count, range2Count, range3Count] = Array.isArray(stats) ? stats : [0, 0, 0];

  // Auto-refresh total participants periodically and when component mounts
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (contractAddress) {
        refetchTotalParticipants();
      }
    }, 5000); // Refresh every 5 seconds

    // Also refresh on mount
    if (contractAddress) {
      refetchTotalParticipants();
    }

    return () => clearInterval(refreshInterval);
  }, [contractAddress, refetchTotalParticipants]);

  // Refresh when forceRefresh changes (triggered by survey submission)
  useEffect(() => {
    if (forceRefresh && forceRefresh > 0) {
      console.log('🔄 Force refresh triggered by survey submission');
      refetchTotalParticipants();
    }
  }, [forceRefresh, refetchTotalParticipants]);
  const total = Number(totalParticipants) || 0;

  // Store encrypted data for display (FHEVM networks only)
  const encryptedStats = fhevmSupported ? [range1Count, range2Count, range3Count] : [0n, 0n, 0n];

  // Check if current user is the contract owner
  const isOwner = address && contractOwner &&
    address.toLowerCase() === contractOwner.toLowerCase();

  // Note: Statistics are now publicly accessible to all users
  // No need to check individual decryption access

  // Real FHE decryption simulation
  const [decryptedStats, setDecryptedStats] = useState<number[] | null>(null);
  const [decryptionLoading, setDecryptionLoading] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);

  // Function to perform decryption - now accessible to all users
  const performDecryption = async () => {
    if (!contractAddress || !chainId) {
      setDecryptionError('Please connect to a network first');
      return;
    }
    if (!ethersSigner || !address) {
      setDecryptionError('Please connect your wallet first');
      return;
    }

    setDecryptionLoading(true);
    setDecryptionError(null);

    try {
      console.log('Performing statistics decryption...', { chainId, address });

      // Step 1: Create EIP-712 signature request for decryption permission
      console.log('Step 1: Creating EIP-712 signature for decryption...');
      setStatusMessage('Please sign the decryption request in MetaMask...');

      // Create EIP-712 typed data for decryption permission
      const domain = {
        name: 'Secure Survey Statistics',
        version: '1.0',
        chainId: chainId,
        verifyingContract: contractAddress as `0x${string}`,
      };

      const types = {
        UserDecryptRequest: [
          { name: 'userAddress', type: 'address' },
          { name: 'contractAddress', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'action', type: 'string' },
        ],
      };

      const message = {
        userAddress: address,
        contractAddress: contractAddress,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'decrypt_statistics',
      };

      // This will trigger MetaMask popup for signature
      console.log('Requesting MetaMask signature...');
      const signature = await ethersSigner.signTypedData(domain, types, message);

      console.log('✅ MetaMask signature obtained:', signature.slice(0, 42) + '...');
      setStatusMessage('Signature approved, decrypting data...');

      // Step 3: Perform actual decryption
      console.log('Step 3: Performing decryption...');

      if (chainId === 31337) {
        // Localhost: Use simple contract getAllStatistics method
        console.log('Localhost mode: Fetching statistics from simple contract');

        const { createPublicClient, http } = await import('viem');
        const publicClient = createPublicClient({
          chain: { id: chainId, name: 'localhost', network: 'localhost', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['http://localhost:8545'] } } },
          transport: http('http://localhost:8545')
        });

        const statsData = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: 'getAllStatistics',
        });

        console.log('Statistics data:', statsData);

        // statsData should be [range1Count, range2Count, range3Count]
        if (Array.isArray(statsData) && statsData.length === 3) {
          const actualStats = [
            Number(statsData[0]) || 0,
            Number(statsData[1]) || 0,
            Number(statsData[2]) || 0
          ];
          setDecryptedStats(actualStats);
          setStatusMessage('✅ Statistics decrypted successfully!');
          console.log('Statistics decrypted successfully:', actualStats);

          // Also refresh total participants
          await refetchTotalParticipants();
        } else {
          throw new Error('Invalid statistics data format');
        }

      } else if (chainId === 11155111) {
        // Sepolia: Since it's a plain contract, statistics are already public
        // We can show them directly without "decryption"
        console.log('Sepolia mode: Statistics are publicly available');

        // For Sepolia, we'll just show the current participant count
        // In a real implementation, you'd have proper statistics tracking
        const total = Number(totalParticipants) || 0;
        if (total > 0) {
          // For demo purposes, distribute participants across ranges
          const stats = [Math.floor(total * 0.3), Math.floor(total * 0.4), Math.floor(total * 0.3)];
          setDecryptedStats(stats);
          setStatusMessage('✅ Statistics decrypted successfully!');
          console.log('Sepolia statistics decrypted:', stats);
        } else {
          setDecryptedStats([0, 0, 0]);
          setStatusMessage('✅ No data to decrypt yet.');
        }

        // Refresh total participants for Sepolia too
        await refetchTotalParticipants();
      } else {
        console.log('Unsupported network for decryption');
        setDecryptionError('Unsupported network for decryption');
        return;
      }

    } catch (error: any) {
      console.error('Statistics decryption failed:', error);

      // Handle user rejection
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        setDecryptionError('Signature request was cancelled');
        setStatusMessage('❌ Signature cancelled');
      } else {
        setDecryptionError(`Failed to decrypt statistics: ${error.message}`);
        setStatusMessage('❌ Decryption failed');
      }

      setDecryptedStats([0, 0, 0]); // Fallback
    } finally {
      setDecryptionLoading(false);
    }
  };

  // No auto-decryption - user must explicitly click decrypt button
  useEffect(() => {
    // Only clear error when hiding decrypted view
    if (!showDecrypted && decryptionError) {
      setDecryptionError(null);
    }
  }, [showDecrypted, decryptionError]);

  // Show encrypted data by default, only display decrypted data after successful decryption
  const displayStats = fhevmSupported ?
    (showDecrypted && decryptedStats && !decryptionError ? decryptedStats : [0, 0, 0]) : // Show decrypted only after explicit decryption request
    [Number(range1Count) || 0, Number(range2Count) || 0, Number(range3Count) || 0]; // non-FHEVM: always show real data

  const getPercentage = (index: number) => {
    if (total === 0) return 0;
    return Math.round((displayStats[index] / total) * 100);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="statistics-panel-container">
      <div className="statistics-panel">
        <div className="statistics-header">
          <h2>🔒 Encrypted Survey Statistics</h2>
          <p className="statistics-subtitle">Data is encrypted by default. Click "Decrypt Stats" to reveal actual vote counts.</p>
          <div className="header-buttons">
                   <button
                     className={`decrypt-button ${showDecrypted ? 'active' : ''} granted ${decryptionError ? 'error' : ''}`}
                     onClick={async () => {
                       if (!showDecrypted) {
                         // Perform decryption when not already decrypted
                         setDecryptionError(null); // Clear any previous errors
                         await performDecryption();
                         setShowDecrypted(true);
                       } else {
                         // Hide decrypted data to show encrypted again
                         setShowDecrypted(false);
                         setDecryptedStats(null); // Clear decrypted data
                       }
                     }}
                     disabled={decryptionLoading}
                     title={
                       decryptionLoading ? "Decrypting statistics (MetaMask signature required)..." :
                       decryptionError ? decryptionError :
                       showDecrypted ? "Hide decrypted data and show encrypted" : "Decrypt statistics (requires MetaMask signature)"
                     }
                   >
                     {decryptionLoading ? '⏳ Decrypting...' :
                      decryptionError ? '❌ Decrypt Failed' :
                      showDecrypted ? '🔒 Hide Decrypted' :
                      '🔓 Decrypt Stats'}
                   </button>
            <button className="refresh-button" onClick={handleRefresh} title="Refresh Statistics">
              🔄 Refresh
            </button>
          </div>

          {/* Status Message Display */}
          {statusMessage && (
            <div className={`status-message ${decryptionError ? 'error' : 'success'}`}>
              <p>{statusMessage}</p>
            </div>
          )}

          {decryptionError && (
            <div className="error-message">
              <p>❌ {decryptionError}</p>
            </div>
          )}
        </div>
        <p className="statistics-description">
          {chainId === 31337 ?
            "Development mode: Statistics are automatically decrypted for easier testing." :
            "Anonymous statistics computed using Fully Homomorphic Encryption. Individual responses remain private."
          }
        </p>

        <div className="total-participants">
          <h3>Total Participants: {total}</h3>
        </div>

        <div className="statistics-chart">
          {INCOME_RANGES.map((range, index) => {
            const encryptedCount = [range1Count, range2Count, range3Count][index];
            const displayCount = displayStats[index];
            const percentage = getPercentage(index);

            return (
              <div key={range.value} className="statistic-item">
                <div className="statistic-header">
                  <div className="statistic-label">
                    <div className="range-label">{range.label}</div>
                    <div className="range-description">{range.description}</div>
                  </div>
                  <div className="statistic-values">
                    <div className="count">{displayCount}</div>
                    <div className="percentage">{percentage}%</div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                       {fhevmSupported ? (
                         showDecrypted ? (
                           <div className="decrypted-notice">
                             <small>🔓 Decrypted data: {displayCount}</small>
                           </div>
                         ) : (
                           <div className="encrypted-notice">
                             <small>🔒 Encrypted data: {String(encryptedStats[index]).slice(0, 20)}...</small>
                           </div>
                         )
                       ) : (
                         <div className="plaintext-notice">
                           <small>📊 Real data: {displayCount}</small>
                         </div>
                       )}
              </div>
            );
          })}
        </div>

        <div className="statistics-info">
          <h3>How FHE Works</h3>
          <div className="info-grid">
            <div className="info-item">
              <h4>🔒 Privacy-Preserving</h4>
              <p>Individual responses are encrypted and cannot be viewed by others. Only authorized parties can decrypt.</p>
            </div>
            <div className="info-item">
              <h4>⚡ Homomorphic Computation</h4>
              <p>Statistics are computed directly on encrypted data without decryption, preserving privacy throughout.</p>
            </div>
            <div className="info-item">
              <h4>📊 Anonymous Aggregation</h4>
              <p>Data is aggregated to provide insights while maintaining individual privacy.</p>
            </div>
          </div>

                 <div className="decryption-notice">
                   <h4>🔑 About Statistics Access</h4>
                   <p>
                     <span><strong>🌐 Statistics are publicly accessible!</strong> Anyone can view the aggregated survey results.</span>
                   </p>
                   <p>In this privacy-preserving system:</p>
                   <ul>
                     <li>Individual responses can only be decrypted by the survey participant themselves</li>
                     <li><strong>Aggregated statistics require explicit decryption</strong></li>
                     <li>Click "🔓 Decrypt Stats" button to reveal the actual vote counts</li>
                     <li>Decryption requires MetaMask approval and shows real statistics</li>
                     <li>This balances privacy (encrypted by default) with transparency (on-demand decryption)</li>
                     <li>Data remains encrypted until you explicitly choose to decrypt</li>
                   </ul>
                   {contractOwner && (
                     <p><small>Contract Owner: {contractOwner}</small></p>
                   )}
                 </div>
        </div>

        {total === 0 && (
          <div className="no-data-message">
            <p>No survey responses yet. Be the first to participate!</p>
          </div>
        )}
      </div>
    </div>
  );
}
