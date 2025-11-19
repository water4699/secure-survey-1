import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Header } from './Header';
import { SurveyForm } from './SurveyForm';
import { StatisticsPanel } from './StatisticsPanel';
import '../styles/IncomeSurveyApp.css';

export function IncomeSurveyApp() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'survey' | 'statistics'>('survey');
  const [forceRefresh, setForceRefresh] = useState(0);

  const handleSurveySubmitted = () => {
    // Trigger StatisticsPanel to refresh its data
    setForceRefresh(prev => prev + 1);
  };

  return (
    <div className="income-survey-app">
      <Header />

      <main className="main-content">
        {!isConnected ? (
          <div className="connect-wallet-container">
            <h2 className="connect-wallet-title">
              Connect Your Wallet
            </h2>
            <p className="connect-wallet-description">
              Please connect your wallet to participate in the privacy-preserving income survey
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div>
            <div className="tab-navigation">
              <nav className="tab-nav">
                <button
                  onClick={() => setActiveTab('survey')}
                  className={`tab-button ${activeTab === 'survey' ? 'active' : 'inactive'}`}
                >
                  Take Survey
                </button>
                <button
                  onClick={() => setActiveTab('statistics')}
                  className={`tab-button ${activeTab === 'statistics' ? 'active' : 'inactive'}`}
                >
                  View Statistics
                </button>
              </nav>
            </div>

            {activeTab === 'survey' && <SurveyForm onSurveySubmitted={handleSurveySubmitted} />}
            {activeTab === 'statistics' && <StatisticsPanel forceRefresh={forceRefresh} />}
          </div>
        )}
      </main>
    </div>
  );
}
