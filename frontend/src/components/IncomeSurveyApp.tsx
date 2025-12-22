import { useState, useCallback } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSurveySubmitted = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      setForceRefresh((prev) => prev + 1);
    } catch (err) {
      setError('Failed to process survey submission. Please try again.');
      console.error('Survey submission error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="income-survey-app">
      <Header />

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Hero Section - 未连接钱包时显示 */}
      {!isConnected ? (
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">🔒 Powered by FHE Technology</div>
            <h1 className="hero-title">
              Privacy-First
              <span className="hero-title-gradient"> Income Survey</span>
            </h1>
            <p className="hero-description">
              Participate in anonymous income research while keeping your data completely private. 
              Your responses are encrypted using Fully Homomorphic Encryption - 
              even we can't see your individual answers.
            </p>
            <div className="hero-cta">
              <ConnectButton />
            </div>
            
            {/* 特性卡片 */}
            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3>End-to-End Encrypted</h3>
                <p>Your data is encrypted before it leaves your device</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔐</div>
                <h3>Zero Knowledge</h3>
                <p>No one can see your individual response, ever</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Anonymous Stats</h3>
                <p>Only aggregated statistics are computed and shared</p>
              </div>
            </div>
          </div>
          
          {/* 装饰性统计预览 */}
          <div className="hero-preview">
            <div className="preview-card">
              <div className="preview-header">
                <span className="preview-dot"></span>
                <span className="preview-title">Live Statistics Preview</span>
              </div>
              <div className="preview-stats">
                <div className="preview-stat-item">
                  <div className="preview-stat-bar" style={{ width: '65%' }}></div>
                  <span>Range 1</span>
                </div>
                <div className="preview-stat-item">
                  <div className="preview-stat-bar" style={{ width: '45%' }}></div>
                  <span>Range 2</span>
                </div>
                <div className="preview-stat-item">
                  <div className="preview-stat-bar" style={{ width: '30%' }}></div>
                  <span>Range 3</span>
                </div>
              </div>
              <div className="preview-footer">
                <span>🔒 Data encrypted</span>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* 主内容区 - 已连接钱包 */
        <main className="main-content">
          {/* 欢迎横幅 */}
          <div className="welcome-banner">
            <div className="welcome-icon">👋</div>
            <div className="welcome-text">
              <h2>Welcome to Secure Survey</h2>
              <p>Your privacy is protected by Fully Homomorphic Encryption</p>
            </div>
          </div>

          {/* 快速统计卡片 */}
          <div className="quick-stats">
            <div className="quick-stat-card">
              <div className="quick-stat-icon">👥</div>
              <div className="quick-stat-info">
                <span className="quick-stat-label">Participants</span>
                <span className="quick-stat-value">--</span>
              </div>
            </div>
            <div className="quick-stat-card">
              <div className="quick-stat-icon">🔐</div>
              <div className="quick-stat-info">
                <span className="quick-stat-label">Encryption</span>
                <span className="quick-stat-value">FHE</span>
              </div>
            </div>
            <div className="quick-stat-card">
              <div className="quick-stat-icon">✅</div>
              <div className="quick-stat-info">
                <span className="quick-stat-label">Status</span>
                <span className="quick-stat-value">Active</span>
              </div>
            </div>
          </div>

          {/* Tab 导航 */}
          <div className="tab-navigation">
            <nav className="tab-nav">
              <button
                onClick={() => setActiveTab('survey')}
                className={`tab-button ${activeTab === 'survey' ? 'active' : 'inactive'}`}
              >
                <span className="tab-icon">📝</span>
                Take Survey
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`tab-button ${activeTab === 'statistics' ? 'active' : 'inactive'}`}
              >
                <span className="tab-icon">📊</span>
                View Statistics
              </button>
            </nav>
          </div>

          {/* 内容区域 */}
          <div className="content-wrapper">
            {activeTab === 'survey' && (
              <div className={isLoading ? 'loading-overlay' : ''}>
                <SurveyForm onSurveySubmitted={handleSurveySubmitted} />
                {isLoading && <div className="loading-indicator">Processing...</div>}
              </div>
            )}
            {activeTab === 'statistics' && <StatisticsPanel forceRefresh={forceRefresh} />}
          </div>

          {/* 底部信息区 */}
          <div className="info-section">
            <div className="info-card">
              <h3>🔒 How Your Privacy is Protected</h3>
              <div className="info-steps">
                <div className="info-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Local Encryption</h4>
                    <p>Your response is encrypted on your device before submission</p>
                  </div>
                </div>
                <div className="info-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Secure Storage</h4>
                    <p>Encrypted data is stored on the blockchain</p>
                  </div>
                </div>
                <div className="info-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Homomorphic Computation</h4>
                    <p>Statistics are computed without decrypting individual data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">🔐</span>
            <span>Secure Survey Vault</span>
          </div>
          <div className="footer-links">
            <span>Built with FHE • Powered by Zama</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
