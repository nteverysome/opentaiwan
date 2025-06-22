import React, { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface SettingsModalProps {
  user: User | null;
  onClose: () => void;
}

type SettingsTab =
  | "user"
  | "integrations"
  | "application"
  | "credits"
  | "secrets"
  | "apikeys";

interface UserSettings {
  email: string;
  notifications: boolean;
  analytics: boolean;
  soundNotifications: boolean;
  suggestTasks: boolean;
  language: string;
}

function SettingsModal({ user, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("user");
  const [settings, setSettings] = useState<UserSettings>({
    email: user?.email || "",
    notifications: true,
    analytics: true,
    soundNotifications: false,
    suggestTasks: true,
    language: "zh",
  });

  const tabs = [
    { id: "user" as SettingsTab, name: "User", icon: "👤" },
    { id: "integrations" as SettingsTab, name: "Integrations", icon: "🔗" },
    { id: "application" as SettingsTab, name: "Application", icon: "⚙️" },
    { id: "credits" as SettingsTab, name: "Credits", icon: "💰" },
    { id: "secrets" as SettingsTab, name: "Secrets", icon: "🔐" },
    { id: "apikeys" as SettingsTab, name: "API Keys", icon: "🔑" },
  ];

  const updateSetting = (key: keyof UserSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // 這裡應該調用 OpenHands 的設定保存 API
    // console.log("Saving settings:", settings);
  };

  const configureGithubRepos = () => {
    // 跳轉到 GitHub 設定頁面
    window.open("https://github.com/settings/installations", "_blank");
  };

  const installSlackApp = () => {
    // 安裝 Slack 應用
    // console.log("Installing Slack app...");
  };

  const createApiKey = () => {
    // 創建新的 API 密鑰
    // console.log("Creating new API key...");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "user":
        return (
          <div>
            <div className="settings-section">
              <h3>Email</h3>
              <input
                type="email"
                className="settings-input"
                value={settings.email}
                onChange={(e) => updateSetting("email", e.target.value)}
              />
              <button type="button" className="settings-btn" onClick={saveSettings}>
                Save
              </button>
            </div>

            <div className="settings-section">
              <h3>Profile Information</h3>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginBottom: "12px",
                }}
              >
                Your profile information is synced with your GitHub account.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {user?.avatar || "👤"}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "#e2e8f0" }}>
                    {user?.name || "User"}
                  </div>
                  <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "integrations":
        return (
          <div>
            <div className="settings-section">
              <h3>GitHub Integration</h3>
              <button type="button" className="settings-btn" onClick={configureGithubRepos}>
                Configure Github Repositories
              </button>
              <p
                style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}
              >
                Manage which repositories OpenHands can access
              </p>
            </div>

            <div className="settings-section">
              <h3>Slack Integration</h3>
              <button type="button" className="settings-btn" onClick={installSlackApp}>
                Install OpenHands Slack App
              </button>
              <p
                style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}
              >
                Get notifications and updates in Slack
              </p>
            </div>

            <div className="settings-section">
              <h3>IDE Extensions</h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{
                    padding: "12px",
                    background: "#334155",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#e2e8f0" }}>
                      VS Code Extension
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Connect directly from VS Code
                    </div>
                  </div>
                  <button type="button" className="settings-btn">Install</button>
                </div>

                <div
                  style={{
                    padding: "12px",
                    background: "#334155",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#e2e8f0" }}>
                      JetBrains Plugin
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      For IntelliJ, PyCharm, and more
                    </div>
                  </div>
                  <button type="button" className="settings-btn">Install</button>
                </div>
              </div>
            </div>
          </div>
        );

      case "application":
        return (
          <div>
            <div className="settings-section">
              <h3>Language</h3>
              <select
                className="settings-input"
                value={settings.language}
                onChange={(e) => updateSetting("language", e.target.value)}
              >
                <option value="en">English</option>
                <option value="zh">繁體中文</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </div>

            <div className="settings-section">
              <h3>Preferences</h3>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  color: "#e2e8f0",
                }}
              >
                <input
                  type="checkbox"
                  checked={settings.analytics}
                  onChange={(e) => updateSetting("analytics", e.target.checked)}
                />
                Enable analytics
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  color: "#e2e8f0",
                }}
              >
                <input
                  type="checkbox"
                  checked={settings.soundNotifications}
                  onChange={(e) =>
                    updateSetting("soundNotifications", e.target.checked)
                  }
                />
                Sound Notifications
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#e2e8f0",
                }}
              >
                <input
                  type="checkbox"
                  checked={settings.suggestTasks}
                  onChange={(e) =>
                    updateSetting("suggestTasks", e.target.checked)
                  }
                />
                Suggest Tasks on GitHub
              </label>
            </div>

            <div className="settings-section">
              <h3>Theme</h3>
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
              >
                <div
                  style={{
                    padding: "12px",
                    background: "#334155",
                    borderRadius: "6px",
                    border: "2px solid #10b981",
                    cursor: "pointer",
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>🌙</div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#e2e8f0",
                    }}
                  >
                    Enhanced Dark
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Current
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px",
                    background: "#334155",
                    borderRadius: "6px",
                    border: "2px solid transparent",
                    cursor: "pointer",
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>🏛️</div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#e2e8f0",
                    }}
                  >
                    Classic
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Original OpenHands
                  </div>
                </div>
              </div>

              <button type="button" className="settings-btn" onClick={saveSettings}>
                Save Preferences
              </button>
            </div>
          </div>
        );

      case "credits":
        return (
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "24px",
                color: "white",
                textAlign: "center",
              }}
            >
              <h2 style={{ marginBottom: "8px" }}>💎 Your Usage</h2>
              <p style={{ opacity: 0.9, margin: 0 }}>
                Track your OpenHands usage and manage billing
              </p>
            </div>

            <div className="settings-section">
              <h3>Current Plan</h3>
              <div
                style={{
                  background: "#1e3a3a",
                  border: "2px solid #10b981",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#e2e8f0",
                      }}
                    >
                      Pro Plan
                    </div>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: "#10b981",
                      }}
                    >
                      $29
                      <span style={{ fontSize: "16px", color: "#94a3b8" }}>
                        /month
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginBottom: "4px",
                      }}
                    >
                      配額使用
                    </div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#10b981",
                      }}
                    >
                      485/600
                    </div>
                    <div
                      style={{
                        width: "80px",
                        height: "6px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "3px",
                        marginTop: "4px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: "#10b981",
                          borderRadius: "3px",
                          width: "80%",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  ✨ 600 requests/month • ⚡ No queue • 🎯 Premium models • 📞
                  Priority support
                </div>
              </div>

              <button type="button" className="settings-btn" style={{ marginRight: "8px" }}>
                💳 Manage Billing
              </button>
              <button
                type="button"
                className="settings-btn"
                style={{ background: "#ef4444" }}
              >
                ❌ Cancel Subscription
              </button>
            </div>

            <div className="settings-section">
              <h3>Usage History</h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "#334155",
                    borderRadius: "6px",
                  }}
                >
                  <span>今天</span>
                  <span style={{ color: "#10b981" }}>23 requests</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "#334155",
                    borderRadius: "6px",
                  }}
                >
                  <span>昨天</span>
                  <span style={{ color: "#10b981" }}>45 requests</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "#334155",
                    borderRadius: "6px",
                  }}
                >
                  <span>本週</span>
                  <span style={{ color: "#10b981" }}>156 requests</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "#334155",
                    borderRadius: "6px",
                  }}
                >
                  <span>本月</span>
                  <span style={{ color: "#10b981" }}>485 requests</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "secrets":
        return (
          <div>
            <div
              style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
              <h3 style={{ marginBottom: "8px", color: "#94a3b8" }}>
                No secrets found
              </h3>
              <p style={{ marginBottom: "16px" }}>
                Store sensitive configuration values securely
              </p>
              <button type="button" className="settings-btn">Add a new secret</button>
            </div>

            <div className="settings-section">
              <h3>What are secrets?</h3>
              <p
                style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.5 }}
              >
                Secrets are encrypted environment variables that can be used in
                your OpenHands sessions. They&apos;re perfect for storing API keys,
                database credentials, and other sensitive information that you
                don&apos;t want to hardcode in your projects.
              </p>
            </div>
          </div>
        );

      case "apikeys":
        return (
          <div>
            <div className="settings-section">
              <h3>API Keys</h3>
              <button type="button" className="settings-btn" onClick={createApiKey}>
                Create API Key
              </button>
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "8px",
                  lineHeight: 1.5,
                }}
              >
                API keys allow you to authenticate with the OpenHands API
                programmatically. Keep your API keys secure: anyone with your
                API key can access your account. For more information on how to
                use the API, see our{" "}
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#60a5fa",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    font: "inherit"
                  }}
                >
                  API documentation
                </button>
                .
              </p>
            </div>

            <div className="settings-section">
              <h3>Existing API Keys</h3>
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#64748b",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔑</div>
                <p>No API keys created yet</p>
              </div>
            </div>

            <div className="settings-section">
              <h3>Rate Limits</h3>
              <div
                style={{
                  background: "#334155",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "#e2e8f0" }}>Requests per minute</span>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>60</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "#e2e8f0" }}>Requests per hour</span>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>
                    1,000
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#e2e8f0" }}>Requests per day</span>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>
                    10,000
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="settings-modal show">
      <div className="settings-content">
        {/* 標題欄 */}
        <div className="settings-header">
          <h2 style={{ color: "#e2e8f0" }}>⚙️ Settings</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            ✕
          </button>
        </div>

        {/* 標籤列 */}
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`settings-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        {/* 內容區域 */}
        <div className="settings-body">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default SettingsModal;
