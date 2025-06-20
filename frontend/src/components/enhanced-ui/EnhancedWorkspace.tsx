import React, { useState, useRef } from "react";

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
  terminalOutput?: string[];
}

const EnhancedWorkspace: React.FC<EnhancedWorkspaceProps> = ({
  activeTab,
  onTabSwitch,
  fileTree = [],
  gitStatus,
  terminalOutput = [],
}) => {
  const [openFiles, setOpenFiles] = useState<string[]>(["UserProfile.tsx"]);
  const [activeFile, setActiveFile] = useState("UserProfile.tsx");
  const [terminalInput, setTerminalInput] = useState("");
  const [codeContent, setCodeContent] = useState(defaultCodeContent);

  const terminalRef = useRef<HTMLDivElement>(null);

  // 模擬的文件樹數據

  const displayFileTree = fileTree || [];

  // 模擬的 Git 狀態

  const displayGitStatus = gitStatus || {
    branch: "",
    staged: [],
    modified: [],
    untracked: [],
  };

  // 標籤配置
  const tabs = [
    { id: "changes", name: "Changes", icon: "🔄" },
    { id: "vscode", name: "VS Code", icon: "💻" },
    { id: "terminal", name: "Terminal", icon: "🖥️" },
    { id: "jupyter", name: "Jupyter", icon: "📓" },
    { id: "app", name: "App", icon: "📱" },
    { id: "browser", name: "Browser", icon: "🌐" },
  ];

  // 文件操作
  const openFile = (fileName: string, filePath: string) => {
    if (!openFiles.includes(fileName)) {
      setOpenFiles([...openFiles, fileName]);
    }
    setActiveFile(fileName);

    // 這裡應該調用 OpenHands 的文件讀取 API
    console.log("Opening file:", filePath);
  };

  const closeFile = (fileName: string) => {
    const newOpenFiles = openFiles.filter((f) => f !== fileName);
    setOpenFiles(newOpenFiles);

    if (activeFile === fileName && newOpenFiles.length > 0) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
    }
  };

  // 終端操作
  const handleTerminalCommand = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const command = terminalInput;
      setTerminalInput("");

      // 這裡應該調用 OpenHands 的命令執行 API
      console.log("Executing command:", command);
    }
  };

  // Git 操作
  const gitCommit = () => console.log("Git commit");
  const gitPush = () => console.log("Git push");
  const gitPull = () => console.log("Git pull");
  const gitReset = () => console.log("Git reset");

  // 匯出功能
  const exportConversation = (format: string) => {
    console.log("Exporting as:", format);
  };

  // 渲染文件樹
  const renderFileTree = (items: FileItem[], level = 0) =>
    items.map((item) => (
      <div key={item.id}>
        <div
          className={`file-tree-item ${item.type} ${activeFile === item.name ? "active" : ""}`}
          style={{ marginLeft: `${level * 16}px` }}
          onClick={() => item.type === "file" && openFile(item.name, item.path)}
        >
          {item.type === "folder" ? "📁" : getFileIcon(item.language)}
          {item.name}
        </div>
        {item.children && renderFileTree(item.children, level + 1)}
      </div>
    ));

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

  return (
    <div className="workspace-panel">
      {/* 工作區標籤 */}
      <div className="workspace-tabs">
        {tabs.map((tab) => (
          <button
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
                  📝 Git 狀態
                </div>
                <div style={{ color: "#10b981", fontSize: "10px" }}>
                  🟢 運行中
                </div>
              </div>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#e2e8f0",
                }}
              >
                當前分支: {displayGitStatus.branch}
              </div>
              <div style={{ color: "#94a3b8", fontSize: "14px" }}>
                待提交:{" "}
                {displayGitStatus.modified.length +
                  displayGitStatus.untracked.length}{" "}
                個文件
              </div>

              <div className="git-actions">
                <button className="git-btn" onClick={gitCommit}>
                  📤 Commit
                </button>
                <button className="git-btn" onClick={gitPush}>
                  🚀 Push
                </button>
                <button className="git-btn" onClick={gitPull}>
                  ⬇️ Pull
                </button>
                <button className="git-btn danger" onClick={gitReset}>
                  🔄 Reset
                </button>
              </div>
            </div>

            <h3 style={{ marginBottom: "16px", color: "#e2e8f0" }}>變更文件</h3>
            <div className="file-list">
              {displayGitStatus.modified.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-status modified">M</div>
                  <span>{file}</span>
                </div>
              ))}
              {displayGitStatus.untracked.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-status added">A</div>
                  <span>{file}</span>
                </div>
              ))}
            </div>

            {/* 匯出功能 */}
            <div className="export-section">
              <h4 style={{ color: "#e2e8f0", marginBottom: "12px" }}>
                📤 匯出功能
              </h4>
              <div className="export-options">
                <button
                  className="export-btn"
                  onClick={() => exportConversation("markdown")}
                >
                  📝 Markdown
                </button>
                <button
                  className="export-btn"
                  onClick={() => exportConversation("pdf")}
                >
                  📄 PDF
                </button>
                <button
                  className="export-btn"
                  onClick={() => exportConversation("json")}
                >
                  📋 JSON
                </button>
                <button
                  className="export-btn"
                  onClick={() => exportConversation("zip")}
                >
                  📦 ZIP
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* VS Code 標籤 */}
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
                {openFiles.map((fileName) => (
                  <div
                    key={fileName}
                    className={`editor-tab ${activeFile === fileName ? "active" : ""}`}
                    onClick={() => setActiveFile(fileName)}
                  >
                    <span>📄 {fileName}</span>
                    <span
                      className="close-btn"
                      onClick={() => closeFile(fileName)}
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
                  onChange={(e) => setCodeContent(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Terminal 標籤 */}
        <div
          className={`tab-content ${activeTab === "terminal" ? "active" : ""}`}
        >
          <div className="terminal-content">
            <div className="terminal-header">
              <div className="terminal-tabs">
                <div className="terminal-tab active">bash</div>
                <div className="terminal-tab">+</div>
              </div>
              <div>
                <button className="action-btn">Clear</button>
                <button className="action-btn">Split</button>
              </div>
            </div>

            <div className="terminal-output" ref={terminalRef} />

            <div className="terminal-input">
              <span className="terminal-prompt">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalCommand}
                placeholder="輸入命令..."
              />
            </div>
          </div>
        </div>

        {/* Jupyter 標籤 */}
        <div
          className={`tab-content ${activeTab === "jupyter" ? "active" : ""}`}
        >
          <div className="jupyter-content">
            <h3 style={{ marginBottom: "16px", color: "#e2e8f0" }}>
              🪐 Jupyter Notebook
            </h3>

            <div className="notebook-cell">
              <div className="cell-header">
                <span>Code Cell [1]</span>
                <div>
                  <button className="action-btn">▶️ Run</button>
                  <button className="action-btn">➕ Add</button>
                </div>
              </div>
              <div className="cell-content">
                <pre>{`import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# 分析用戶數據
users_data = {
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'age': [25, 30, 35, 28, 32],
    'score': [85, 92, 78, 95, 88],
    'role': ['user', 'admin', 'user', 'admin', 'user']
}

df = pd.DataFrame(users_data)
print("用戶數據統計:")
print(df.describe())`}</pre>
              </div>
              <div className="cell-output">
                <pre>{`用戶數據統計:
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
              <h3 style={{ color: "#e2e8f0" }}>📱 應用管理中心</h3>
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
                <div className="app-title">React App</div>
                <div className="app-description">現代化前端應用</div>
                <div className="app-status running">🟢 Port 3000</div>
              </div>

              <div className="app-card">
                <div className="app-icon">🌐</div>
                <div className="app-title">Express API</div>
                <div className="app-description">後端 API 服務</div>
                <div className="app-status stopped">⚫ 停止</div>
              </div>
            </div>
          </div>
        </div>

        {/* Browser 標籤 */}
        <div
          className={`tab-content ${activeTab === "browser" ? "active" : ""}`}
        >
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div className="browser-toolbar">
              <button className="browser-nav-btn">⬅️</button>
              <button className="browser-nav-btn">➡️</button>
              <button className="browser-nav-btn">🔄</button>
              <input
                type="text"
                className="browser-url-input"
                defaultValue="http://localhost:3000"
              />
              <button className="action-btn">🔧 DevTools</button>
            </div>
            <div className="browser-preview">
              <div>
                🌐 實時預覽區域
                <br />
                <br />
                <div style={{ fontSize: "14px", opacity: 0.8 }}>
                  您的應用程序將在這裡顯示
                  <br />
                  支持熱重載和實時調試
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

export default EnhancedWorkspace;
