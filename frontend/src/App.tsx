import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { config } from '@/config/wagmi';
import { IncomeSurveyApp } from '@/components/IncomeSurveyApp';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en">
          <div className="app-wrapper">
            {/* 云雾背景效果 */}
            <div className="cloud-blob cloud-blob-1" />
            <div className="cloud-blob cloud-blob-2" />
            <div className="cloud-blob cloud-blob-3" />
            <IncomeSurveyApp />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
