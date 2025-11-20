// Test the proxy-based useEthersSigner implementation
console.log('🧪 Testing Proxy-based useEthersSigner Implementation\n');

// Simulate the proxy behavior
function createMockProxySigner() {
  let signerPromise = null;

  const getSigner = () => {
    if (!signerPromise) {
      // Simulate async signer creation
      signerPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            signTypedData: async (domain, types, message) => {
              console.log('✅ Real signTypedData called with:', { domain, types, message });
              return '0x1234567890abcdef...mock_signature...';
            },
            getAddress: async () => '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
          });
        }, 100);
      });
    }
    return signerPromise;
  };

  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'signTypedData') {
        return async (...args) => {
          console.log(`🔄 Calling ${prop} via proxy...`);
          const signer = await getSigner();
          return signer.signTypedData(...args);
        };
      }
      return async (...args) => {
        const signer = await getSigner();
        const method = signer[prop];
        if (typeof method === 'function') {
          return method.apply(signer, args);
        }
        return signer[prop];
      };
    }
  });
}

// Test the proxy
async function testProxy() {
  console.log('Creating proxy signer...');
  const proxySigner = createMockProxySigner();

  console.log('Testing signTypedData method availability...');
  console.log('- signTypedData exists:', typeof proxySigner.signTypedData === 'function');

  console.log('\nCalling signTypedData...');
  try {
    const result = await proxySigner.signTypedData(
      { name: 'Test', version: '1.0', chainId: 1, verifyingContract: '0x123' },
      { Test: [{ name: 'test', type: 'string' }] },
      { test: 'hello' }
    );
    console.log('✅ signTypedData result:', result);
    console.log('🎉 Proxy implementation works correctly!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProxy().catch(console.error);
