// OpenHands API 客戶端
class OpenHandsAPIClient {
    constructor() {
      this.config = window.openHandsConfig;
      this.sessionId = null;
      this.isConnected = false;
      this.retryCount = 0;
      this.maxRetries = 3;
    }
  
    // 檢查連接狀態（不會實際連接）
    async checkConnection() {
      if (!this.config.isFeatureEnabled('enableIntegration')) {
        this.config.log('info', 'Integration disabled, using demo mode');
        return false;
      }
  
      try {
        this.config.log('info', `Checking connection to ${this.config.settings.baseURL}`);
        
        // 嘗試連接到OpenHands
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.settings.connectionTimeout);
        
        const response = await fetch(this.config.getAPIURL('/health'), {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        
        clearTimeout(timeout);
        
        if (response.ok) {
          this.isConnected = true;
          this.config.log('info', 'Successfully connected to OpenHands');
          return true;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        this.isConnected = false;
        this.config.log('warn', 'Failed to connect to OpenHands', error.message);
        
        if (this.config.settings.fallbackToDemo) {
          this.config.log('info', 'Falling back to demo mode');
          return false;
        } else {
          throw error;
        }
      }
    }
  
    // 初始化會話
    async initSession() {
      if (!this.isConnected && !await this.checkConnection()) {
        this.config.log('info', 'Using demo session');
        this.sessionId = 'demo-session-' + Date.now();
        return this.sessionId;
      }
  
      try {
        const response = await this.makeRequest('/sessions', {
          method: 'POST',
          body: JSON.stringify({
            workspace_path: '/workspace',
            agent_name: 'CodeActAgent',
            language: 'zh-TW'
          })
        });
        
        this.sessionId = response.session_id;
        this.config.log('info', `Session initialized: ${this.sessionId}`);
        return this.sessionId;
      } catch (error) {
        this.config.log('error', 'Failed to initialize session', error);
        // 回退到演示模式
        this.sessionId = 'demo-session-' + Date.now();
        return this.sessionId;
      }
    }
  
    // 發送聊天消息
    async sendMessage(message) {
      if (!this.sessionId) {
        await this.initSession();
      }
  
      // 如果是演示模式
      if (!this.isConnected || this.sessionId.startsWith('demo-session')) {
        return this.simulateResponse(message);
      }
  
      try {
        const response = await this.makeRequest(`/sessions/${this.sessionId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            content: message,
            type: 'user',
            timestamp: new Date().toISOString()
          })
        });
  
        this.config.log('info', 'Message sent successfully');
        return response;
      } catch (error) {
        this.config.log('error', 'Failed to send message', error);
        // 回退到演示回應
        return this.simulateResponse(message);
      }
    }
  
    // 模擬AI回應（演示模式）
    async simulateResponse(message) {
      this.config.log('debug', 'Generating demo response for:', message);
      
      // 模擬處理時間
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // 智能演示回應
      let response = this.generateDemoResponse(message);
      
      return {
        content: response,
        type: 'assistant',
        timestamp: new Date().toISOString(),
        demo: true
      };
    }
  
    // 生成演示回應
    generateDemoResponse(message) {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('react') || lowerMessage.includes('組件')) {
        return `我來幫你創建 React 組件：
  
  \`\`\`jsx
  import React from 'react';
  
  function MyComponent() {
    return (
      <div className="component">
        <h2>新組件</h2>
        <p>根據你的需求：${message}</p>
      </div>
    );
  }
  
  export default MyComponent;
  \`\`\`
  
  這是演示模式的回應。要體驗完整的 AI 編程功能，請在設定中啟用 OpenHands 整合。`;
      }
      
      if (lowerMessage.includes('api') || lowerMessage.includes('接口')) {
        return `我來幫你設計 API：
  
  \`\`\`javascript
  // API 端點設計
  app.get('/api/data', async (req, res) => {
    try {
      const result = await processData(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  \`\`\`
  
  💡 這是演示模式。真實模式可以直接修改你的專案文件並執行代碼。`;
      }
      
      if (lowerMessage.includes('調試') || lowerMessage.includes('bug') || lowerMessage.includes('錯誤')) {
        return `讓我幫你調試代碼：
  
  🔍 **常見問題檢查**：
  1. 檢查控制台錯誤
  2. 驗證API連接
  3. 確認數據格式
  4. 測試邊界條件
  
  \`\`\`javascript
  // 調試技巧
  console.log('Debug point:', variable);
  debugger; // 設置斷點
  \`\`\`
  
  📝 這是演示模式的建議。真實模式可以直接檢查你的代碼並提供具體修復方案。`;
      }
      
      // 預設回應
      return `收到你的請求：「${message}」
  
  我正在分析你的需求...
  
  ✨ **我可以幫你**：
  • 編寫和優化代碼
  • 調試和測試程序  
  • 設計系統架構
  • 學習新技術
  
  💡 **提示**：這是演示模式。要體驗完整功能，請：
  1. 啟動 OpenHands 後端服務
  2. 在設定中啟用整合模式
  3. 享受真實的 AI 編程助手體驗
  
  有什麼具體的編程問題想討論嗎？`;
    }
  
    // 獲取文件列表
    async getFiles(path = '/workspace') {
      if (!this.isConnected) {
        return this.getDemoFiles();
      }
  
      try {
        const response = await this.makeRequest(`/files?path=${encodeURIComponent(path)}`);
        return response.files || [];
      } catch (error) {
        this.config.log('error', 'Failed to get files', error);
        return this.getDemoFiles();
      }
    }
  
    // 演示文件列表
    getDemoFiles() {
      return [
        { name: 'src', type: 'directory', path: '/workspace/src' },
        { name: 'components', type: 'directory', path: '/workspace/src/components' },
        { name: 'UserProfile.tsx', type: 'file', path: '/workspace/src/components/UserProfile.tsx' },
        { name: 'App.tsx', type: 'file', path: '/workspace/src/App.tsx' },
        { name: 'types', type: 'directory', path: '/workspace/src/types' },
        { name: 'user.ts', type: 'file', path: '/workspace/src/types/user.ts' },
        { name: 'package.json', type: 'file', path: '/workspace/package.json' },
        { name: 'README.md', type: 'file', path: '/workspace/README.md' }
      ];
    }
  
    // 讀取文件內容
    async getFileContent(filePath) {
      if (!this.isConnected) {
        return this.getDemoFileContent(filePath);
      }
  
      try {
        const response = await this.makeRequest(`/files/content?path=${encodeURIComponent(filePath)}`);
        return response.content;
      } catch (error) {
        this.config.log('error', 'Failed to get file content', error);
        return this.getDemoFileContent(filePath);
      }
    }
  
    // 演示文件內容
    getDemoFileContent(filePath) {
      const demoContents = {
        '/workspace/src/components/UserProfile.tsx': `interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user' | 'guest';
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
  }`,
        '/workspace/package.json': `{
    "name": "demo-project",
    "version": "1.0.0",
    "dependencies": {
      "react": "^18.0.0",
      "typescript": "^5.0.0"
    },
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build"
    }
  }`
      };
      
      return demoContents[filePath] || `// 演示文件內容\n// 文件: ${filePath}\n\nconsole.log('這是演示模式的文件內容');`;
    }
  
    // 通用請求方法
    async makeRequest(endpoint, options = {}) {
      const url = this.config.getAPIURL(endpoint);
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
  
      const finalOptions = { ...defaultOptions, ...options };
      
      this.config.log('debug', `Making request to: ${url}`, finalOptions);
      
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    }
  
    // 獲取連接狀態
    getConnectionStatus() {
      return {
        connected: this.isConnected,
        sessionId: this.sessionId,
        mode: this.isConnected ? 'integrated' : 'demo'
      };
    }
  }
  
  // 全局實例
  window.openHandsAPI = new OpenHandsAPIClient();