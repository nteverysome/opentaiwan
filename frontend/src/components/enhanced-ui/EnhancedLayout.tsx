import React, { useState } from 'react';
// import { WebSocketProvider } from "#/context/ws-client-provider";
// import { useCreateConversation } from "#/hooks/query/use-create-conversation";
import WelcomeScreen from './WelcomeScreen';
import EnhancedHeader from './EnhancedHeader';
import EnhancedLeftPanel from './EnhancedLeftPanel';
import EnhancedWorkspace from './EnhancedWorkspace';
import SettingsModal from './SettingsModal';
import BillingModal from './BillingModal';
import '../../../styles/enhanced-theme.css';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface EnhancedLayoutProps {
  className?: string;
  children?: React.ReactNode;
}

interface LayoutState {
  isLoggedIn: boolean;
  currentUser: User | null;
  showWelcome: boolean;
  showSettings: boolean;
  showBilling: boolean;
  leftPanelWidth: number;
  activeTab: string;
  quotaUsed: number;
  quotaTotal: number;
  queueCount: number;
}

const EnhancedLayout: React.FC<EnhancedLayoutProps> = ({ className, children }) => {
  const [state, setState] = useState<LayoutState>({
    isLoggedIn: false,
    currentUser: null,
    showWelcome: true,
    showSettings: false,
    showBilling: false,
    leftPanelWidth: 35,
    activeTab: 'changes',
    quotaUsed: 485,
    quotaTotal: 600,
    queueCount: 347
  });

  const handleLogin = (user: User) => {
    setState(prev => ({
      ...prev,
      isLoggedIn: true,
      currentUser: user,
      showWelcome: false
    }));
  };

  const handleLogout = () => {
    setState(prev => ({
      ...prev,
      isLoggedIn: false,
      currentUser: null,
      showWelcome: true
    }));
  };

  const toggleModal = (modalType: 'settings' | 'billing') => {
    setState(prev => ({
      ...prev,
      showSettings: modalType === 'settings' ? !prev.showSettings : false,
      showBilling: modalType === 'billing' ? !prev.showBilling : false
    }));
  };

  const updateLeftPanelWidth = (width: number) => {
    setState(prev => ({ ...prev, leftPanelWidth: width }));
  };

  const switchTab = (tabId: string) => {
    setState(prev => ({ ...prev, activeTab: tabId }));
  };

  return (
    <div className={`enhanced-ui ${className || ''}`}>
      {/* 歡迎頁面 */}
      {state.showWelcome && (
        <WelcomeScreen
          onLogin={handleLogin}
          onLaunchFromScratch={() => setState(prev => ({ ...prev, showWelcome: false }))}
        />
      )}

      {/* 主應用界面 */}
      {!state.showWelcome && (
        <div className="studio-container">
          {/* 頂部標題欄 */}
          <EnhancedHeader
            user={state.currentUser}
            quotaUsed={state.quotaUsed}
            quotaTotal={state.quotaTotal}
            queueCount={state.queueCount}
            onShowSettings={() => toggleModal('settings')}
            onShowBilling={() => toggleModal('billing')}
            onLogout={handleLogout}
          />

          {/* 主要內容區域 */}
          <main className="main-content">
            {/* 左側面板 */}
            <EnhancedLeftPanel
              onLogin={handleLogin}
              onLaunchFromScratch={() => setState(prev => ({ ...prev, showWelcome: false }))}
            />

            {/* 右側工作區 */}
            <EnhancedWorkspace
              activeTab={state.activeTab}
              onTabSwitch={switchTab}
            />
          </main>
        </div>
      )}

      {/* 設定模態框 */}
      {state.showSettings && (
        <SettingsModal
          user={state.currentUser}
          onClose={() => toggleModal('settings')}
        />
      )}

      {/* 付費模態框 */}
      {state.showBilling && (
        <BillingModal
          user={state.currentUser}
          onClose={() => toggleModal('billing')}
        />
      )}
    </div>
  );
};

export default EnhancedLayout;