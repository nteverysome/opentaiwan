import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Repository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  isPrivate: boolean;
}

interface WelcomeScreenProps {
  onLogin?: (user: User) => void;
  onLaunchFromScratch?: () => void;
  repositories?: Repository[];
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onLogin, 
  onLaunchFromScratch,
  repositories = []
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 模擬的GitHub登入
  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      // 模擬登入過程
      setTimeout(() => {
        const mockUser: User = {
          id: "1",
          name: "OpenHands User",
          email: "user@openhands.dev",
          avatar: "https://github.com/github.png"
        };
        onLogin?.(mockUser);
        setIsLoading(false);
        setShowAuthModal(false);
      }, 1500);
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  // 從頭開始
  const handleLaunchFromScratch = () => {
    setIsLoading(true);
    try {
      onLaunchFromScratch?.();
    } finally {
      setIsLoading(false);
    }
  };

  // 啟動倉庫
  const handleLaunchRepo = () => {
    if (!selectedRepo) return;
    
    setIsLoading(true);
    try {
      console.log('Launching repository:', selectedRepo, 'branch:', selectedBranch);
      onLaunchFromScratch?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '600px',
        width: '100%',
        border: '1px solid #334155'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#f8fafc',
            marginBottom: '16px'
          }}>
            🤖 Welcome to Enhanced OpenHands
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '18px',
            lineHeight: '1.6'
          }}>
            Your AI-powered development companion with an enhanced interface.
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#e2e8f0',
            marginBottom: '16px'
          }}>
            🚀 Quick Start Options
          </h2>

          <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <button
              onClick={handleLaunchFromScratch}
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? '🔄 Starting...' : '✨ Launch from Scratch'}
            </button>

            <button
              onClick={() => setShowAuthModal(true)}
              disabled={isLoading}
              style={{
                background: '#374151',
                color: '#e5e7eb',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              🔗 Connect to Repository
            </button>
          </div>
        </div>

        <div style={{
          background: '#334155',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #475569'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#e2e8f0',
            marginBottom: '12px'
          }}>
            🎯 Enhanced Features
          </h3>
          <ul style={{
            color: '#94a3b8',
            lineHeight: '1.6',
            listStyle: 'none',
            padding: 0
          }}>
            <li>✅ Modern Devin-style interface</li>
            <li>✅ Enhanced workspace with 6 integrated tools</li>
            <li>✅ Real-time terminal and code editor</li>
            <li>✅ Advanced Git operations</li>
            <li>✅ Streamlined conversation management</li>
          </ul>
        </div>
      </div>

      {/* 簡化的認證模態框 */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            border: '1px solid #334155'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              Connect to Repository
            </h3>
            
            <p style={{
              color: '#94a3b8',
              marginBottom: '24px',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Repository connection will be available in the next update. 
              For now, try "Launch from Scratch" to explore the enhanced interface.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {isLoading ? '⏳ Connecting...' : '🚀 Demo Login'}
              </button>
              
              <button
                onClick={() => setShowAuthModal(false)}
                style={{
                  flex: 1,
                  background: '#374151',
                  color: '#e5e7eb',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;