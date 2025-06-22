import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// 整合 OpenHands 真實組件
import Terminal from "#/components/features/terminal/terminal";

// 預設代碼內容
const defaultCodeContent = `interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
  lastLogin?: Date;
}

export function UserProfile({ user }: { user: User }) {
  return (
    <div className="user-profile">
      <img
        src={user.avatar || '/default-avatar.png'}
        alt={user.name}
        className="avatar"
      />
      <div className="user-info">
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <span className={\`role-badge \${user.role}\`}>
          {user.role.toUpperCase()}
        </span>
      </div>
    </div>
  );
}`;

// 獲取文件圖標
const getFileIcon = (language?: string) => {
  switch (language) {
    case "typescript":
      return "🟦";
    case "javascript":
      return "🟨";
    case "json":
      return "📋";
    case "markdown":
      return "📝";
    default:
      return "📄";
  }
};

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  language?: string;
  children?: FileItem[];
}

interface GitStatus {
  branch: string;
  staged: string[];
  modified: string[];
  untracked: string[];
}

interface EnhancedWorkspaceProps {
  activeTab: string;
  onTabSwitch: (tabId: string) => void;
  // 可以接收 OpenHands 現有的工作區相關 props
  fileTree?: FileItem[];
  gitStatus?: GitStatus;
}

function EnhancedWorkspace({
  activeTab,
  onTabSwitch,
  fileTree = [],
  gitStatus,
}: EnhancedWorkspaceProps) {
  const { t } = useTranslation();
  const [openFiles, setOpenFiles] = useState<string[]>(["UserProfile.tsx"]);
  const [activeFile, setActiveFile] = useState("UserProfile.tsx");
  // const [terminalInput, setTerminalInput] = useState("");
  const [codeContent, setCodeContent] = useState(defaultCodeContent);

  // const terminalRef = useRef<HTMLDivElement>(null);

  // 模擬的文件樹數據 - 將來可以替換為真實的 OpenHands 文件樹 API
  const mockFileTree: FileItem[] = [
    {
      id: "1",
      name: "src",
      type: "folder",
      path: "/src",
      children: [
        {
          id: "2",
          name: "components",
          type: "folder",
          path: "/src/components",
          children: [
            {
              id: "3",
              name: "UserProfile.tsx",
              type: "file",
              path: "/src/components/UserProfile.tsx",
              language: "typescript",
            },
            {
              id: "4",
              name: "Button.tsx",
              type: "file",
              path: "/src/components/Button.tsx",
              language: "typescript",
            },
          ],
        },
        {
          id: "5",
          name: "App.tsx",
          type: "file",
          path: "/src/App.tsx",
          language: "typescript",
        },
        {
          id: "6",
          name: "index.tsx",
          type: "file",
          path: "/src/index.tsx",
          language: "typescript",
        },
      ],
    },
    {
      id: "7",
      name: "package.json",
      type: "file",
      path: "/package.json",
      language: "json",
    },
    {
      id: "8",
      name: "README.md",
      type: "file",
      path: "/README.md",
      language: "markdown",
    },
  ];

  const displayFileTree = fileTree.length > 0 ? fileTree : mockFileTree;

  // 模擬的 Git 狀態 - 將來可以替換為真實的 OpenHands Git API
  const mockGitStatus = {
    branch: "main",
    staged: [],
    modified: [t('srcComponentsUserProfileTsx'), t('srcAppTsx')],
    untracked: [t('newComponentTsx')],
  };

  const displayGitStatus = gitStatus || mockGitStatus;

  // 標籤配置
  const tabs = [
    { id: "changes", name: t('changes'), icon: "🔄" },
    { id: "vscode", name: t('vsCode'), icon: "💻" },
    { id: "terminal", name: t('terminal'), icon: "🖥️" },
    { id: "jupyter", name: t('jupyter'), icon: "📓" },
    { id: "app", name: t('app'), icon: "📱" },
    { id: "browser", name: t('browser'), icon: "🌐" },
  ];

  // 文件操作 - 將來可以整合 OpenHands 的文件 API
  const openFile = (fileName: string) => {
    if (!openFiles.includes(fileName)) {
      setOpenFiles([...openFiles, fileName]);
    }
    setActiveFile(fileName);

    // TODO: 調用 OpenHands 的文件讀取 API
    // console.log(t('openingFile'), _filePath);
  };

  const closeFile = (fileName: string) => {
    const newOpenFiles = openFiles.filter((f: string) => f !== fileName);
    setOpenFiles(newOpenFiles);

    if (activeFile === fileName && newOpenFiles.length > 0) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
    }
  };

  // Git 操作 - 將來可以整合 OpenHands 的 Git API
  const gitCommit = () => {
    // TODO: 調用 OpenHands 的 Git commit API
    // console.log(t('gitCommit'));
  };
  const gitPush = () => {
    // TODO: 調用 OpenHands 的 Git push API
    // console.log(t('gitPush'));
  };
  const gitPull = () => {
    // TODO: 調用 OpenHands 的 Git pull API
    // console.log(t('gitPull'));
  };
  const gitReset = () => {
    // TODO: 調用 OpenHands 的 Git reset API
    // console.log(t('gitReset'));
  };

  // 匯出功能 - 將來可以整合 OpenHands 的匯出 API
  const exportConversation = () => {
    // TODO: 調用 OpenHands 的匯出 API
  };

  // 渲染文件樹
  const renderFileTree = (items: FileItem[], level = 0) =>
    items.map((item) => (
      <div key={item.id}>
        <div
          className={`file-tree-item ${item.type} ${activeFile === item.name ? "active" : ""}`}
          style={{ marginLeft: `${level * 16}px` }}
          onClick={() => item.type === "file" && openFile(item.name)}
        >
          {item.type === "folder" ? "📁" : getFileIcon(item.language)}
          {item.name}
        </div>
        {item.children && renderFileTree(item.children, level + 1)}
      </div>
    ));

  // 獲取文件圖標


  return (
    <div className="workspace-panel">
      {/* 工作區標籤 */}
      <div className="workspace-tabs">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabSwitch(tab.id)}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* 工作區內容 */}
      <div className="workspace-content">
        {/* Changes 標籤 */}
        <div
          className={`tab-content ${activeTab === "changes" ? "active" : ""}`}
        >
          <div className="changes-content">
            <div className="git-status">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  📝 Git Status
                </div>
                <div style={{ color: "#10b981", fontSize: "10px" }}>
                  🟢 {t('active')}
                </div>
              </div>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#e2e8f0",
                }}
              >
                {t('currentBranch')}: {displayGitStatus.branch}
              </div>
              <div style={{ color: "#94a3b8", fontSize: "14px" }}>
                Pending:{" "}
                {displayGitStatus.modified.length +
                  displayGitStatus.untracked.length}{" "}
                files
              </div>

              <div className="git-actions">
                <button type="button" className="git-btn" onClick={gitCommit}>
              📝 {t('commit')}
            </button>
            <button type="button" className="git-btn" onClick={gitPush}>
              ⬆️ {t('push')}
            </button>
            <button type="button" className="git-btn" onClick={gitPull}>
              ⬇️ {t('pull')}
            </button>
            <button type="button" className="git-btn danger" onClick={gitReset}>
              🔄 {t('reset')}
            </button>
              </div>
            </div>

            <h3 style={{ marginBottom: "16px", color: "#e2e8f0" }}>Changed Files</h3>
            <div className="file-list">
              {displayGitStatus.modified.map((file: string, index: number) => (
                <div key={index} className="file-item">
                  <div className="file-status modified">M</div>
                  <span>{file}</span>
                </div>
              ))}
              {displayGitStatus.untracked.map((file: string, index: number) => (
                <div key={index} className="file-item">
                  <div className="file-status added">A</div>
                  <span>{file}</span>
                </div>
              ))}
            </div>

            {/* 匯出功能 */}
            <div className="export-section">
              <h4 style={{ color: "#e2e8f0", marginBottom: "12px" }}>
                📤 Export Options
              </h4>
              <div className="export-options">
                <button
                  type="button"
                  className="export-btn"
                  onClick={() => exportConversation()}
                >
                  📝 {t('markdown')}
                </button>
                <button
                  type="button"
                  className="export-btn"
                  onClick={() => exportConversation()}
                >
                  📄 {t('pdf')}
                </button>
                <button
                  type="button"
                  className="export-btn"
                  onClick={() => exportConversation()}
                >
                  📋 {t('json')}
                </button>
                <button
                  type="button"
                  className="export-btn"
                  onClick={() => exportConversation()}
                >
                  📦 {t('zip')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* VS Code 標籤 - 保留現有實現，直到找到更好的編輯器組件 */}
        <div
          className={`tab-content ${activeTab === "vscode" ? "active" : ""}`}
        >
          <div className="vscode-content">
            <div className="file-explorer">
              <div className="explorer-header">Explorer</div>
              <div className="explorer-content">
                <div style={{ marginBottom: "12px" }}>
                  <input
                    type="text"
                    placeholder="🔍 Search files..."
                    style={{
                      width: "100%",
                      background: "#334155",
                      border: "1px solid #475569",
                      borderRadius: "4px",
                      padding: "6px 8px",
                      color: "#e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                </div>
                {renderFileTree(displayFileTree)}
              </div>
            </div>

            <div className="editor-area">
              <div className="editor-tabs">
                {openFiles.map((fileName: string) => (
                  <div
                    key={fileName}
                    className={`editor-tab ${activeFile === fileName ? "active" : ""}`}
                    onClick={() => setActiveFile(fileName)}
                  >
                    <span>📄 {fileName}</span>
                    <span
                      className="close-btn"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        closeFile(fileName);
                      }}
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>

              <div className="editor-content">
                <div className="line-numbers">
                  {Array.from({ length: 25 }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  className="code-editor"
                  value={codeContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCodeContent(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Terminal 標籤 - 使用真實的 OpenHands 終端組件 */}
        <div
          className={`tab-content ${activeTab === "terminal" ? "active" : ""}`}
        >
          <div className="terminal-content h-full">
            <Terminal />
          </div>
        </div>

        {/* Jupyter 標籤 */}
        <div
          className={`tab-content ${activeTab === "jupyter" ? "active" : ""}`}
        >
          <div className="jupyter-content">
            <h3 style={{ marginBottom: "16px", color: "#e2e8f0" }}>
              🪐 {t('jupyterNotebook')}
            </h3>

            <div className="notebook-cell">
              <div className="cell-header">
                <span>{t('codeCell')} [1]</span>
                <div>
                  <button type="button" className="action-btn">▶️ {t('run')}</button>
            <button type="button" className="action-btn">➕ {t('add')}</button>
                </div>
              </div>
              <div className="cell-content">
                <pre>{`import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Analyze user data
users_data = {
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'age': [25, 30, 35, 28, 32],
    'score': [85, 92, 78, 95, 88],
    'role': ['user', 'admin', 'user', 'admin', 'user']
}

df = pd.DataFrame(users_data)
print("User Data Statistics:")
print(df.describe())`}</pre>
              </div>
              <div className="cell-output">
                <pre>{`User Data Statistics:
             age      score
count   5.000000   5.000000
mean   30.000000  87.600000
std     4.242641   6.542171
min    25.000000  78.000000
25%    28.000000  85.000000
50%    30.000000  88.000000
75%    32.000000  92.000000
max    35.000000  95.000000`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* App 標籤 */}
        <div className={`tab-content ${activeTab === "app" ? "active" : ""}`}>
          <div className="app-content">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ color: "#e2e8f0" }}>📱 {t('appManagementCenter')}</h3>
              <span
                style={{
                  background: "#f59e0b",
                  color: "#000",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "10px",
                }}
              >
                BETA
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div className="app-card">
                <div className="app-icon">⚛️</div>
                <div className="app-title">{t('reactApp')}</div>
                <div className="app-description">{t('modernFrontendApplication')}</div>
                <div className="app-status running">🟢 {t('port3000')}</div>
              </div>

              <div className="app-card">
                <div className="app-icon">🌐</div>
                <div className="app-title">{t('expressApi')}</div>
                <div className="app-description">{t('backendApiService')}</div>
                <div className="app-status stopped">⚫ {t('stopped')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Browser 標籤 - 保留現有實現，直到找到正確的組件 */}
        <div
          className={`tab-content ${activeTab === "browser" ? "active" : ""}`}
        >
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div className="browser-toolbar">
              <button type="button" className="browser-nav-btn">⬅️</button>
            <button type="button" className="browser-nav-btn">➡️</button>
            <button type="button" className="browser-nav-btn">🔄</button>
              <input
                type="text"
                className="browser-url-input"
                defaultValue="http://localhost:3000"
              />
              <button type="button" className="action-btn">🔧 DevTools</button>
            </div>
            <div className="browser-preview">
              <div>
                🌐 {t('livePreviewArea')}
                <br />
                <br />
                <div style={{ fontSize: "14px", opacity: 0.8 }}>
                  {t('yourApplicationWillDisplayHere')}
                  <br />
                  {t('supportsHotReloadAndLiveDebugging')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default EnhancedWorkspace;