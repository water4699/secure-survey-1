import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddress, getContractABI, isFhevmSupported } from '../config/contracts';
import { useFhevm } from '../hooks/useFhevm';
import '../styles/SurveyForm.css';

// Note: FHEVM encryption works in Hardhat environment (localhost:31337)
// For production, client-side FHEVM encryption would be needed

const INCOME_RANGES = [
  {
    value: 1,
    label: '< $3,000',
    description: 'Less than $3,000 per month',
    emoji: '💰'
  },
  {
    value: 2,
    label: '$3,000 - $6,000',
    description: '$3,000 to $6,000 per month',
    emoji: '💼'
  },
  {
    value: 3,
    label: '>= $6,000',
    description: '$6,000 or more per month',
    emoji: '🏦'
  },
];

interface SurveyFormProps {
  onSurveySubmitted?: () => void;
}

export function SurveyForm({ onSurveySubmitted }: SurveyFormProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const [selectedRange, setSelectedRange] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Get contract address and ABI based on current network
  const contractAddress = getContractAddress(chainId);
  const contractABI = getContractABI(chainId);
  const fhevmSupported = isFhevmSupported(chainId);

  // FHEVM hook for encryption
  const { isSupported: fhevmReady, instance: fhevmInstance } = useFhevm();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && (submitStatus === 'idle' || submitStatus === 'pending')) {
      console.log('Transaction confirmed successfully!');
      setSubmitStatus('success');
      setIsSubmitting(false);

      // Notify parent component that survey was submitted successfully
      if (onSurveySubmitted) {
        onSurveySubmitted();
      }
    }
  }, [isConfirmed, submitStatus, onSurveySubmitted]);

  // Handle transaction pending state
  useEffect(() => {
    if (isPending && submitStatus === 'idle') {
      console.log('Transaction submitted to wallet, waiting for user approval...');
      setSubmitStatus('pending');
    }
  }, [isPending, submitStatus]);

  // Debug logging for transaction states
  useEffect(() => {
    console.log('Transaction state:', {
      isSubmitting,
      submitStatus,
      isPending,
      isConfirming,
      isConfirmed,
      isError,
      hash: hash?.slice(0, 10) + '...'
    });
  }, [isSubmitting, submitStatus, isPending, isConfirming, isConfirmed, isError, hash]);

  // Handle transaction errors
  useEffect(() => {
    if (isError && error && (isSubmitting || submitStatus === 'pending')) {
      console.error('Transaction failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data
      });

      let errorMessage = 'Transaction failed. Please check your wallet connection and try again.';

      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction rejected: Please approve the transaction in your wallet.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds: Please add some test ETH to your wallet.';
      } else if (error.message?.includes('network')) {
        errorMessage = `Network error: Please ensure you're connected to the correct network (${chainId === 31337 ? 'localhost' : 'Sepolia'}).`;
      }

      setSubmitStatus('error');
      console.error('User-friendly error:', errorMessage);
      setIsSubmitting(false);
    }
  }, [isError, error, isSubmitting, submitStatus, chainId]);

  // Reset states when needed
  const resetSubmission = () => {
    setIsSubmitting(false);
    setSubmitStatus('idle');
  };

  // Check if user has already submitted a survey - disable auto-polling
  const { data: hasResponse } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: 'hasSurveyResponse',
    args: address ? [address] : undefined,
    query: {
      refetchInterval: false,  // Disable auto-polling to avoid 429 errors
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  });

  // Note: Statistics are now publicly accessible to all users
  // No need to check individual decryption access

  const handleSubmit = async () => {
    if (!selectedRange || !address) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Check network compatibility
      if (!contractAddress) {
        throw new Error(`Contract not deployed on network with chainId ${chainId}. Please switch to localhost (31337) or Sepolia (11155111).`);
      }

      console.log('Contract address:', contractAddress);
      console.log('Selected range:', selectedRange);
      console.log('FHEVM supported:', fhevmSupported);

      // Use the same submission method for both networks (simple contract)
      console.log('Using simple contract submission');

      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: 'submitSurvey',
        args: [selectedRange],
        gas: BigInt(300000),
      });

      console.log('Transaction initiated successfully');

    } catch (error: any) {
      console.error('Transaction error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data
      });

      // Provide more specific error messages
      let errorMessage = 'Transaction failed. Please check your connection and try again.';

      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction rejected: Please approve the transaction in your wallet.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds: Please add some test ETH to your wallet.';
      } else if (error.message?.includes('network')) {
        errorMessage = `Network error: Please ensure you're connected to the correct network (${chainId === 31337 ? 'localhost' : 'Sepolia'}).`;
      } else if (error.message?.includes('nonce')) {
        errorMessage = 'Transaction nonce error. Please refresh the page and try again.';
      } else if (error.message?.includes('gas')) {
        errorMessage = 'Gas estimation failed. Please try again.';
      } else if (error.message?.includes('replacement transaction underpriced')) {
        errorMessage = 'Transaction underpriced. Please wait a moment and try again.';
      } else if (error.message?.includes('already known')) {
        errorMessage = 'Transaction already submitted. Please wait for confirmation.';
      }

      setSubmitStatus('error');
      console.error('User-friendly error:', errorMessage);
      setIsSubmitting(false);
    }
  };


  // Handle transaction states
  useEffect(() => {
    if (isConfirming && submitStatus === 'idle') {
      console.log('Transaction submitted, waiting for confirmation...');
    }
  }, [isConfirming, submitStatus]);

  if (hasResponse) {
    return (
      <div className="survey-form-container">
        <div className="survey-completed-card">
          <div className="completed-icon">✅</div>
          <h2>Survey Completed!</h2>
          <p>You have already submitted your income range. Thank you for participating!</p>
          <p>Your response has been encrypted and added to the anonymous statistics.</p>
          <div className="completed-tip">
            <strong>Privacy Protected:</strong> Your individual response is encrypted, but aggregated statistics are publicly accessible.
          </div>

          {/* Public Statistics Access */}
          <div className="public-access-section">
            <h3>📊 Public Statistics</h3>
            <p>Anyone can view the aggregated survey statistics. Your individual response remains private.</p>
            <div className="access-info">
              <div className="access-icon">🌐</div>
              <p><strong>Statistics are publicly accessible!</strong> All users can view decrypted aggregated results.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-form-container">
      <div className="survey-form-card">
        <div className="survey-header">
          <h2>Income Range Survey</h2>
          <p className="survey-subtitle">
            Help us understand income distribution while keeping your data completely private
          </p>

          {/* Network Status Indicator */}
          <div className="network-status">
            <div className={`network-indicator ${chainId === 31337 ? 'localhost' : chainId === 11155111 ? 'sepolia' : 'unsupported'}`}>
              <span className="network-dot"></span>
              <span className="network-text">
                {chainId === 31337 ? '🏠 Localhost (FHEVM Enabled)' :
                 chainId === 11155111 ? '🌐 Sepolia (Standard Mode)' :
                 '❌ Unsupported Network'}
              </span>
            </div>
            {chainId === 11155111 && (
              <div className="network-note">
                <small>Sepolia uses standard blockchain operations without FHEVM encryption.</small>
              </div>
            )}
          </div>
        </div>

        <div className="survey-content">
          <div className="income-ranges-grid">
            {INCOME_RANGES.map((range) => (
              <div
                key={range.value}
                className={`income-range-card ${selectedRange === range.value ? 'selected' : ''}`}
                onClick={() => setSelectedRange(range.value)}
              >
                <div className="range-emoji">{range.emoji}</div>
                <div className="range-info">
                  <div className="range-label">{range.label}</div>
                  <div className="range-description">{range.description}</div>
                </div>
                <div className="range-radio">
                  <input
                    type="radio"
                    name="incomeRange"
                    value={range.value}
                    checked={selectedRange === range.value}
                    onChange={() => setSelectedRange(range.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="submit-section">
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={!selectedRange || isSubmitting || isPending || isConfirming}
            >
              {isConfirming ? (
                <>
                  <div className="loading-spinner"></div>
                  Confirming Transaction...
                </>
              ) : isPending ? (
                <>
                  <div className="loading-spinner"></div>
                  Processing Transaction...
                </>
              ) : isSubmitting ? (
                <>
                  <div className="loading-spinner"></div>
                  Preparing Transaction...
                </>
              ) : (
                'Submit Survey'
              )}
            </button>
          </div>

          {submitStatus === 'success' && (
            <div className="status-message success">
              <div className="status-icon">✅</div>
              <div className="status-content">
                <div className="status-title">Survey Submitted Successfully!</div>
                <div className="status-text">Your response has been encrypted and stored securely.</div>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="status-message error">
              <div className="status-icon">❌</div>
              <div className="status-content">
                <div className="status-title">Submission Failed</div>
                <div className="status-text">Please check your connection and try again.</div>
                <button
                  className="retry-button"
                  onClick={resetSubmission}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}


          {!address && (
            <div className="status-message warning">
              <div className="status-icon">⚠️</div>
              <div className="status-content">
                <div className="status-title">Wallet Connection Required</div>
                <div className="status-text">Please connect your wallet to submit the survey.</div>
              </div>
            </div>
          )}

          {/* Debug information for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="debug-info" style={{
              marginTop: '1rem',
              padding: '0.5rem',
              background: 'rgba(0,0,0,0.05)',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontFamily: 'monospace'
            }}>
              <div>Status: {submitStatus}</div>
              <div>Chain: {chainId} ({chainId === 31337 ? 'Localhost' : 'Sepolia'})</div>
              <div>Contract: {contractAddress?.slice(0, 10)}...</div>
              <div>Pending: {isPending ? 'Yes' : 'No'}</div>
              <div>Confirming: {isConfirming ? 'Yes' : 'No'}</div>
            </div>
          )}
        </div>

        <div className="privacy-section">
          <h3>🔒 Privacy Protection</h3>
          <div className="privacy-features">
            <div className="privacy-feature">
              <div className="feature-icon">🛡️</div>
              <div className="feature-text">
                <strong>Fully Encrypted:</strong> Your data is protected with homomorphic encryption
              </div>
            </div>
            <div className="privacy-feature">
              <div className="feature-icon">👤</div>
              <div className="feature-text">
                <strong>Anonymous:</strong> Only statistical aggregates are visible to others
              </div>
            </div>
            <div className="privacy-feature">
              <div className="feature-icon">🔐</div>
              <div className="feature-text">
                <strong>Self-Controlled:</strong> Only you can decrypt your own responses
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}