import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';
import { ethers } from 'ethers';

export function useEthersSigner() {
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!walletClient) {
      // Return a mock signer that throws an error when signTypedData is called
      // This prevents the "is not a function" error when wallet is not connected
      return {
        signTypedData: async () => {
          throw new Error('Wallet not connected. Please connect your wallet first.');
        }
      } as any;
    }

    // Create ethers v6 signer from wagmi wallet client
    const provider = new ethers.BrowserProvider(walletClient.transport, {
      chainId: walletClient.chain.id,
      name: walletClient.chain.name,
    });

    // provider.getSigner returns a Promise in ethers v6, we need to handle this properly
    // For now, we'll create a proxy that awaits the signer when needed
    let signerPromise: Promise<ethers.Signer> | null = null;

    const getSigner = () => {
      if (!signerPromise) {
        signerPromise = provider.getSigner(walletClient.account.address);
      }
      return signerPromise;
    };

    // Return a proxy object that delegates to the actual signer
    return new Proxy({} as ethers.Signer, {
      get(target, prop) {
        if (prop === 'signTypedData') {
          return async (...args: any[]) => {
            const signer = await getSigner();
            return signer.signTypedData(...args);
          };
        }
        // For other properties, delegate to the actual signer
        return async (...args: any[]) => {
          const signer = await getSigner();
          const method = (signer as any)[prop];
          if (typeof method === 'function') {
            return method.apply(signer, args);
          }
          return (signer as any)[prop];
        };
      }
    });
  }, [walletClient]);
}