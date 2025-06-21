// OpenHands 主整合控制器
class OpenHandsIntegration {
    constructor() {
      this.config = window.openHandsConfig;
      this.api = window.openHandsAPI;
      this.ws = window.wsManager;
      
      this.isInitialized = false;
      this.currentMode = 'demo'; // 'demo' | 'integrated'
      this.sessionId = null;
      
      // 狀態管理
      this.state = {
        connected: false,
        sessionActive: false,
        filesLoaded: false,
        wsConnected: false
      };
      
      // 事件監聽器
      this.eventListeners = new Map();
    }
  
    // 初始化整合（不會立即嘗試連接）
    async initialize(autoConnect = false) {
      if (this.isInitialized) {
        this.config.log('warn', 'Integration already initialized');
        return this.state.connected;
      }
  
      this.config.log('info', '🚀 Initializing OpenHands integration...');
      
      try {
        // 載入配置
        this.loadConfiguration();
        
        // 設置事件監聽
        this.setupEventListeners();
        
        // 更新UI狀態
        this.updateUIState();
        
        this.isInitialized = true;
        
        // 如果設定為自動連接，嘗試連接
        if (autoConnect && this.config.isFeatureEnabled('enableIntegration')) {
          await this.connect();
        }
        
        this.config.log('info', '✅ Integration initialized successfully');
        return true;
      } catch (error) {
        this.config.log('error', '❌ Failed to initialize integration', error);
        return false;
      }
    }
  
    // 載入配置
    loadConfiguration() {
      // 從URL參數或localStorage檢查是否應該啟用整合
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('mode') === 'integrated') {
        this.config.updateSettings({ enableIntegration: true });
      }
      
      // 根據配置設定當前模式
      this.currentMode = this.config.isFeatureEnabled('enableIntegration') ? 'integrated' : 'demo';
      this.config.log('info', `Mode set to: ${this.currentMode}`);
    }
  
    // 設置事件監聽器
    setupEventListeners() {
      // 頁面卸載時清理連接
      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });
      
      // 監聽網路狀態變化
      window.addEventListener('online', () => {
        this.config.log('info', 'Network back online');
        if (this.currentMode === 'integrated' && !this.state.connected) {
          this.connect();
        }
      });
      
      window.addEventListener('offline', () => {
        this.config.log('warn', 'Network offline, switching to demo mode');
        this.handleConnectionLoss();
      });
    }
  
    // 連接到OpenHands
    async connect() {
      if (this.state.connected) {
        this.config.log('info', 'Already connected');
        return true;
      }
  
      this.config.log('info', '🔌 Attempting to connect to OpenHands...');
      this.updateConnectionStatus('connecting');
      
      try {
        // 1. 檢查API連接
        const apiConnected = await this.api.checkConnection();
        if (!apiConnected) {
          throw new Error('Cannot connect to OpenHands API');
        }
        
        // 2. 初始化會話
        this.sessionId = await this.api.initSession();
        if (!this.sessionId || this.sessionId.startsWith('demo-session')) {
          throw new Error('Failed to create real session');
        }
        
        // 3. 連接WebSocket（如果啟用）
        if (this.config.isFeatureEnabled('enableWebSocket')) {
          const wsConnected = await this.ws.initialize(this.sessionId);
          this.state.wsConnected = wsConnected;
        }
        
        // 4. 載入文件系統（如果啟用）
        if (this.config.isFeatureEnabled('enableFileSync')) {
          await this.loadFileSystem();
        }
        
        // 更新狀態
        this.state.connected = true;
        this.state.sessionActive = true;
        this.currentMode = 'integrated';
        
        this.updateConnectionStatus('connected');
        this.showNotification('✅ 已連接到 OpenHands！完整功能現已可用');
        
        this.config.log('info', '✅ Successfully connected to OpenHands');
        return true;
        
      } catch (error) {
        this.config.log('warn', 'Connection failed, falling back to demo mode', error);
        
        // 回退到演示模式
        this.state.connected = false;
        this.currentMode = 'demo';
        this.updateConnectionStatus('demo');
        
        this.showNotification('⚠️ 無法連接到 OpenHands，使用演示模式');
        return false;
      }
    }
  
    // 斷開連接
    async disconnect() {
      this.config.log('info', 'Disconnecting from OpenHands...');
      
      // 關閉WebSocket連接
      this.ws.closeAllConnections();
      
      // 重置狀態
      this.state = {
        connected: false,
        sessionActive: false,
        filesLoaded: false,
        wsConnected: false
      };
      
      this.sessionId = null;
      this.currentMode = 'demo';
      
      this.updateConnectionStatus('disconnected');
      this.config.log('info', 'Disconnected from OpenHands');
    }
  
    // 切換模式
    async switchMode(mode) {
      if (mode === this.currentMode) {
        this.config.log('info', `Already in ${mode} mode`);
        return true;
      }
  
      this.config.log('info', `Switching to ${mode} mode`);
      
      if (mode === 'integrated') {
        // 啟用整合
        this.config.updateSettings({ 
          enableIntegration: true,
          enableWebSocket: true,
          enableFileSync: true
        });
        
        const success = await this.connect();
        return success;
      } else {
        // 切換到演示模式
        this.config.updateSettings({ 
          enableIntegration: false,
          enableWebSocket: false,
          enableFileSync: false
        });
        
        await this.disconnect();
        this.showNotification('已切換到演示模式');
        return true;
      }
    }
  
    // 發送消息（統一接口）
    async sendMessage(message) {
      this.config.log('debug', `Sending message in ${this.currentMode} mode:`, message);
      
      try {
        const response = await this.api.sendMessage(message);
        
        // 如果是演示模式，顯示提示
        if (response.demo) {
          this.addDemoModeBadge();
        }
        
        return response;
      } catch (error) {
        this.config.log('error', 'Failed to send message', error);
        throw error;
      }
    }
  
    // 執行終端命令
    async executeCommand(command) {
      this.config.log('debug', `Executing command in ${this.currentMode} mode:`, command);
      
      if (this.state.wsConnected) {
        return this.ws.sendTerminalCommand(command);
      } else {
        // 使用模擬模式
        this.ws.simulateTerminalCommand(command);
        return false;
      }
    }
  
    // 載入文件系統
    async loadFileSystem(path = '/workspace') {
      try {
        const files = await this.api.getFiles(path);
        this.updateFileExplorer(files);
        this.state.filesLoaded = true;
        return files;
      } catch (error) {
        this.config.log('error', 'Failed to load file system', error);
        this.state.filesLoaded = false;
        return [];
      }
    }
  
    // 更新文件瀏覽器
    updateFileExplorer(files) {
      // 尋找VS Code文件瀏覽器區域
      const explorer = document.querySelector('#vscode-tab .file-tree, #vscode-tab [style*="padding: 8px"]');
      if (!explorer) {
        this.config.log('warn', 'File explorer not found');
        return;
      }
  
      // 生成文件樹HTML
      const fileTreeHTML = files.map(file => `
        <div style="display: flex; align-items: center; padding: 4px 8px; cursor: pointer; border-radius: 4px; font-size: 13px; user-select: none;" 
             onclick="openFile('${file.path}')" 
             oncontextmenu="showFileContextMenu(event, '${file.type}')">
          ${file.type === 'directory' ? '📁' : this.getFileIcon(file.name)} ${file.name}
        </div>
      `).join('');
  
      explorer.innerHTML = `
        <div style="margin-bottom: 12px;">
          <input type="text" placeholder="🔍 Search files..." 
                 style="width: 100%; background: #334155; border: 1px solid #475569; border-radius: 4px; padding: 6px 8px; color: #e2e8f0; font-size: 12px;">
        </div>
        ${fileTreeHTML}
        <div style="margin-top: 16px; padding: 12px; border: 2px dashed #475569; border-radius: 8px; text-align: center; color: #64748b; font-size: 12px;" onclick="uploadFiles()">
          📁 拖拽檔案到此處上傳<br>或點擊選擇檔案
        </div>
      `;
    }
  
    // 獲取文件圖標
    getFileIcon(filename) {
      const ext = filename.split('.').pop()?.toLowerCase();
      const icons = {
        'tsx': '🟦', 'ts': '🟦', 'jsx': '🟨', 'js': '🟨',
        'json': '📋', 'md': '📝', 'html': '🌐', 'css': '🎨',
        'py': '🐍', 'java': '☕', 'cpp': '⚡', 'c': '⚡'
      };
      return icons[ext] || '📄';
    }
  
    // 更新連接狀態UI
    updateConnectionStatus(status) {
      const statusElement = document.querySelector('.status-indicator');
      const headerTitle = document.querySelector('.header h1');
      
      const statusConfig = {
        'connecting': {
          dot: '🟡',
          text: '連接中...',
          badge: '● CONNECTING'
        },
        'connected': {
          dot: '🟢',
          text: 'OpenHands Ready',
          badge: '● CONNECTED'
        },
        'demo': {
          dot: '🟠',
          text: 'Demo Mode',
          badge: '● DEMO MODE'
        },
        'disconnected': {
          dot: '🔴',
          text: 'Disconnected',
          badge: '● OFFLINE'
        }
      };
      
      const config = statusConfig[status] || statusConfig['demo'];
      
      if (statusElement) {
        statusElement.innerHTML = `
          <div class="status-dot"></div>
          ${config.text}
        `;
      }
      
      if (headerTitle) {
        const badgeColor = status === 'connected' ? '#10b981' : 
                          status === 'connecting' ? '#f59e0b' : 
                          status === 'demo' ? '#3b82f6' : '#ef4444';
        
        headerTitle.innerHTML = `
          🚀 OpenHands Dev Studio 
          <span style="color: ${badgeColor}; font-size: 12px;">${config.badge}</span>
        `;
      }
    }
  
    // 更新整體UI狀態
    updateUIState() {
      // 根據當前模式更新UI元素
      const modeElements = document.querySelectorAll('[data-mode]');
      modeElements.forEach(element => {
        const requiredMode = element.getAttribute('data-mode');
        element.style.display = (requiredMode === this.currentMode) ? 'block' : 'none';
      });
    }
  
    // 添加演示模式徽章
    addDemoModeBadge() {
      const chatHistory = document.getElementById('chat-history');
      if (chatHistory) {
        const lastMessage = chatHistory.lastElementChild;
        if (lastMessage && !lastMessage.querySelector('.demo-badge')) {
          const badge = document.createElement('div');
          badge.className = 'demo-badge';
          badge.innerHTML = '💡 演示模式';
          badge.style.cssText = `
            background: rgba(59, 130, 246, 0.1);
            color: #60a5fa;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            margin-top: 8px;
            display: inline-block;
          `;
          lastMessage.querySelector('.message-content').appendChild(badge);
        }
      }
    }
  
    // 處理連接丟失
    handleConnectionLoss() {
      this.state.connected = false;
      this.state.wsConnected = false;
      this.currentMode = 'demo';
      this.updateConnectionStatus('disconnected');
      this.showNotification('⚠️ 連接中斷，已切換到演示模式');
    }
  
    // 顯示通知
    showNotification(message, type = 'info') {
      // 使用你現有的showNotification函數
      if (typeof window.showNotification === 'function') {
        window.showNotification(message);
      } else {
        console.log(`[Notification] ${message}`);
      }
    }
  
    // 獲取整合狀態
    getStatus() {
      return {
        initialized: this.isInitialized,
        mode: this.currentMode,
        sessionId: this.sessionId,
        state: { ...this.state },
        api: this.api.getConnectionStatus(),
        ws: this.ws.getConnectionStatus()
      };
    }
  
    // 重置整合
    async reset() {
      this.config.log('info', 'Resetting integration...');
      
      await this.disconnect();
      this.isInitialized = false;
      
      // 清除會話數據
      this.sessionId = null;
      
      // 重新初始化
      await this.initialize();
      
      this.showNotification('🔄 整合已重置');
    }
  }
  
  // 全局實例
  window.openHandsIntegration = new OpenHandsIntegration();
  
  // 自動初始化（不自動連接）
  document.addEventListener('DOMContentLoaded', async function() {
    try {
      await window.openHandsIntegration.initialize(false); // false = 不自動連接
    } catch (error) {
      console.error('Failed to initialize OpenHands integration:', error);
    }
  });