import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import EnhancedLayout from '../components/enhanced-ui/EnhancedLayout';
import EnhancedHeader from '../components/enhanced-ui/EnhancedHeader';
import EnhancedLeftPanel from '../components/enhanced-ui/EnhancedLeftPanel';
import EnhancedWorkspace from '../components/enhanced-ui/EnhancedWorkspace';
import WelcomeScreen from '../components/enhanced-ui/WelcomeScreen';
import SettingsModal from '../components/enhanced-ui/SettingsModal';
import BillingModal from '../components/enhanced-ui/BillingModal';

export default function EnhancedUI() {
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [activeTab, setActiveTab] = useState('Changes');

  // 模擬用戶數據
  const mockUser = {
    id: 'user-1',
    name: 'Administrator',
    email: t('adminEmail'),
    avatar: '',
    role: 'admin' as const
  };

  // 處理登入
  const handleLogin = () => {
    // console.log(t('githubLoginProcessing'));
    setShowWelcome(false);
  };

  // 處理從頭開始
  const handleLaunchFromScratch = () => {
    // console.log('從頭開始處理');
    setShowWelcome(false);
  };

  // 處理登出
  const handleLogout = () => {
    // console.log('用戶登出');
  };

  // 處理標籤切換
  const handleTabSwitch = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* 歡迎頁面 - 確保有所有必需的 props */}
      {showWelcome && (
        <WelcomeScreen 
          onLogin={handleLogin}
          onLaunchFromScratch={handleLaunchFromScratch}
        />
      )}
      
      {/* 設置模態框 */}
      {showSettings && (
        <SettingsModal 
          user={mockUser}
          onClose={() => setShowSettings(false)} 
        />
      )}
      
      {/* 付費模態框 */}
      {showBilling && (
        <BillingModal 
          user={mockUser}
          onClose={() => setShowBilling(false)} 
        />
      )}

      {/* 主要佈局 */}
      <EnhancedLayout>
        <EnhancedHeader 
          user={mockUser}
          quotaUsed={485}
          quotaTotal={600}
          queueCount={347}
          onShowSettings={() => setShowSettings(true)}
          onShowBilling={() => setShowBilling(true)}
          onLogout={handleLogout}
        />
        <div style={{ 
          display: 'flex', 
          height: 'calc(100vh - 3.75rem)',
          overflow: 'hidden'
        }}>
          <EnhancedLeftPanel 
            onLaunchFromScratch={handleLaunchFromScratch}
          />
          <EnhancedWorkspace 
            activeTab={activeTab}
            onTabSwitch={handleTabSwitch}
          />
        </div>
      </EnhancedLayout>

      {/* 快速啟動按鈕 - 用於測試 */}
      <button 
        type="button"
        onClick={() => setShowWelcome(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        顯示歡迎頁面
      </button>
    </div>
  );
}