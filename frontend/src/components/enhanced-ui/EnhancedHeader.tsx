import React from "react";

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

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  user,
  quotaUsed,
  quotaTotal,
  queueCount,
  onShowSettings,
  onShowBilling,
  onLogout,
}) => {
  const quotaPercentage = (quotaUsed / quotaTotal) * 100;
  const showQueue = quotaUsed >= 10; // 免費用戶超過10次顯示排隊

  return (
    <header className="header">
      <div className="header-left">
        <h1>🚀 OpenHands Dev Studio</h1>
      </div>

      <div className="header-right">
        {/* 排隊提示 */}
        {showQueue && (
          <div className="queue-alert show">
            ⏳ Queue: <span>{queueCount}</span> people
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
                background:
                  quotaPercentage > 80
                    ? "#ef4444"
                    : quotaPercentage > 60
                      ? "#f59e0b"
                      : "#10b981",
              }}
            />
          </div>
        </div>

        {/* 狀態指示器 */}
        <div className="status-bar">
          <div className="status-indicator">
            <div className="status-dot" />
            API Ready
          </div>
        </div>

        {/* 用戶頭像和選單 */}
        <div className="user-menu">
          <div
            className="user-avatar"
            onClick={onShowBilling}
            title="User Profile & Billing"
          >
            {user?.avatar || "👤"}
          </div>

          {/* 用戶下拉選單 */}
          <div className="user-dropdown">
            <div className="dropdown-item" onClick={onShowSettings}>
              ⚙️ Settings
            </div>
            <div className="dropdown-item" onClick={onShowBilling}>
              💰 Billing
            </div>
            <div className="dropdown-separator" />
            <div className="dropdown-item" onClick={onLogout}>
              🚪 Logout
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EnhancedHeader;
