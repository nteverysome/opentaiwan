import React from "react";
import { useTranslation } from 'react-i18next';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface EnhancedHeaderProps {
  user: User | null;
  quotaUsed: number;
  quotaTotal: number;
  queueCount: number;
  onShowSettings: () => void;
  onShowBilling: () => void;
  onLogout: () => void;
}

function EnhancedHeader({
  user,
  quotaUsed,
  quotaTotal,
  queueCount,
  onShowSettings,
  onShowBilling,
  onLogout,
}: EnhancedHeaderProps) {
  const { t } = useTranslation();
  const quotaPercentage = (quotaUsed / quotaTotal) * 100;
  const showQueue = quotaUsed >= 10; // 免費用戶超過10次顯示排隊

  return (
    <header className="header">
      <div className="header-left">
        <h1>🚀 {t('openHandsDevStudio')}</h1>
      </div>

      <div className="header-right">
        {/* 排隊提示 */}
        {showQueue && (
          <div className="queue-alert show">
            ⏳ {t('queue')}: <span>{queueCount}</span> {t('people')}
          </div>
        )}

        {/* 配額顯示 */}
        <div className="quota-display" onClick={onShowBilling}>
          <span>
            {quotaUsed}/{quotaTotal}
          </span>
          <div className="quota-bar">
            <div
              className="quota-fill"
              style={{
                width: `${quotaPercentage}%`,
                background: (() => {
                  if (quotaPercentage > 80) return "#ef4444";
                  if (quotaPercentage > 60) return "#f59e0b";
                  return "#10b981";
                })(),
              }}
            />
          </div>
        </div>

        {/* 狀態指示器 */}
        <div className="status-bar">
          <div className="status-indicator">
            <div className="status-dot" />
            {t('apiReady')}
          </div>
        </div>

        {/* 用戶頭像和選單 */}
        <div className="user-menu">
          <div
            className="user-avatar"
            onClick={onShowBilling}
            title={t('userProfileAndBilling')}
          >
            {user?.avatar || "👤"}
          </div>

          {/* 用戶下拉選單 */}
          <div className="user-dropdown">
            <div className="dropdown-item" onClick={onShowSettings}>
              ⚙️ {t('settings')}
            </div>
            <div className="dropdown-item" onClick={onShowBilling}>
              💰 {t('billing')}
            </div>
            <div className="dropdown-separator" />
            <div className="dropdown-item" onClick={onLogout}>
              🚪 {t('logout')}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EnhancedHeader;
