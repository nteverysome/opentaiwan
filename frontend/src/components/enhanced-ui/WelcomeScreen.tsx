import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface WelcomeScreenProps {
  onLogin?: (user: User) => void;
  onLaunchFromScratch?: () => void;
  // repositories?: Repository[];
}

function WelcomeScreen({ 
  onLogin, 
  onLaunchFromScratch
}: WelcomeScreenProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 模擬的GitHub登入
  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      // 模擬登入過程
      setTimeout(() => {
        const mockUser: User = {
          id: "1",
          name: t('openhandsUser'),
          email: t('userEmail'),
          avatar: "https://github.com/github.png"
        };
        onLogin?.(mockUser);
        setIsLoading(false);
        setShowAuthModal(false);
      }, 1500);
    } catch (error) {
      // console.error(t('loginFailed'), error);
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
  // const handleLaunchRepo = () => {
  //   setIsLoading(true);
  //   try {
  //     // console.log(t('launchingRepository'));
  //     onLaunchFromScratch?.();
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
            {t('aiPoweredCompanion')}
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
              type="button"
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
              {isLoading ? t('starting') : t('launchFromScratch')}
            </button>

            <button
              type="button"
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
              {t('connectToRepository')}
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
            <li>{t('modernDevinInterface')}</li>
            <li>{t('enhancedWorkspace')}</li>
            <li>{t('realTimeTerminal')}</li>
            <li>{t('advancedGitOps')}</li>
            <li>{t('streamlinedConversation')}</li>
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
              {t('connectToRepository')}
            </h3>
            
            <p style={{
              color: '#94a3b8',
              marginBottom: '24px',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              {t('repositoryConnectionMessage')}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
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
                {isLoading ? t('connecting') : t('demoLogin')}
              </button>
              
              <button
                type="button"
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
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;