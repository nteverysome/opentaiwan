import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

interface Repository {
  id: string;
  name: string;
  fullName: string;
  branches: string[];
}

interface WelcomeScreenProps {
  onLaunchFromScratch: () => void;
  repositories?: Repository[];
}

function WelcomeScreen({
  // onLogin,
  onLaunchFromScratch,
  repositories = [],
}: WelcomeScreenProps) {
  const { t } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 模擬的倉庫數據 (實際應該從 OpenHands API 獲取)

  const availableRepos = repositories || [];
  const currentRepo = availableRepos.find(
    (repo) => repo.fullName === selectedRepo,
  );

  // 處理 GitHub 登入
  const handleGitHubLogin = async () => {
    setIsLoading(true);

    // 模擬登入過程 (實際應該調用 OpenHands 的認證 API)
    try {
      // onLogin should be called with real user data from API
      setShowAuthModal(false);
    } catch (error) {
      // console.error(t('loginFailed'), error);
    } finally {
      setIsLoading(false);
    }
  };

  // 顯示 Daytona 設置進度
  const showDaytonaSetup = (message: string, callback: () => void) => {
    // 這裡可以顯示進度條或載入動畫
    // console.log(message);
    setTimeout(callback, 2500);
  };

  // 處理從頭開始
  const handleLaunchFromScratch = () => {
    setIsLoading(true);
    showDaytonaSetup("正在設置您的雲端開發環境...", () => {
      onLaunchFromScratch();
    });
  };

  // 處理倉庫啟動
  const handleLaunchRepo = () => {
    if (!selectedRepo || !selectedBranch) {
      // console.warn("Please select a repository and branch");
      return;
    }

    setIsLoading(true);
    showDaytonaSetup(
      `正在連接到 ${selectedRepo} (${selectedBranch})...`,
      () => {
        onLaunchFromScratch();
      },
    );
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-left">
        <h1 className="welcome-title">{t('letsStartBuilding')}</h1>
        <p className="welcome-subtitle">
          {t('openHandsDescription')}
        </p>

        <div>
          <button
            type="button"
            className="welcome-btn"
            onClick={handleLaunchFromScratch}
            disabled={isLoading}
          >
            🚀 Launch from Scratch
          </button>
          <button
            type="button"
            className="welcome-btn secondary"
            onClick={() => setShowAuthModal(true)}
            disabled={isLoading}
          >
            🔐 {t('loginWithGitHub')}
          </button>
        </div>

        <p style={{ marginTop: "20px", fontSize: "14px", color: "#64748b" }}>
          {t('notSureHowToStart')}
          <button type="button" className="help-link" style={{background: "none", border: "none", textDecoration: "underline", cursor: "pointer"}}>
            Read this
          </button>
        </p>
      </div>

      <div className="welcome-right">
        <div className="repo-section">
          <h3>🔗 {t('connectToRepository')}</h3>

          <select
            className="repo-selector"
            value={selectedRepo}
            onChange={(e) => {
              setSelectedRepo(e.target.value);
              setSelectedBranch(""); // 重置分支選擇
            }}
          >
            <option value="">{t('selectRepo')}</option>
            {availableRepos.map((repo) => (
              <option key={repo.id} value={repo.fullName}>
                {repo.fullName}
              </option>
            ))}
          </select>

          <select
            className="repo-selector"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            disabled={!selectedRepo}
          >
            <option value="">Select a branch</option>
            {currentRepo?.branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="welcome-btn"
            onClick={handleLaunchRepo}
            disabled={!selectedRepo || !selectedBranch || isLoading}
            style={{ width: "100%", marginTop: "12px" }}
          >
            🚀 Launch
          </button>

          <p style={{ marginTop: "16px", fontSize: "14px", color: "#64748b" }}>
            <button type="button" className="help-link" style={{background: "none", border: "none", textDecoration: "underline", cursor: "pointer"}}>
              Add GitHub repos
            </button>
          </p>
        </div>

        <div style={{ marginTop: "40px" }}>
          <h3 style={{ color: "#e2e8f0", marginBottom: "16px" }}>
            ✨ Suggested Tasks
          </h3>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            {t('noTasksAvailable')}
          </p>
        </div>
      </div>

      {/* GitHub 登入模態框 */}
      {showAuthModal && (
        <div className="auth-modal show">
          <div className="auth-content">
            <h2 style={{ color: "#e2e8f0", marginBottom: "16px" }}>
              Welcome to OpenHands
            </h2>
            <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
              {t('signInDescription')}
            </p>

            <button
              type="button"
              className="github-btn"
              onClick={handleGitHubLogin}
              disabled={isLoading}
            >
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.577 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {isLoading ? t('signingIn') : t('loginWithGitHub')}
            </button>

            <p
              style={{ fontSize: "12px", color: "#64748b", marginTop: "16px" }}
            >
              {t('termsAndPrivacyAgreement')}
            </p>

            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                marginTop: "16px",
                cursor: "pointer",
              }}
              disabled={isLoading}
            >
              ✕ {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
