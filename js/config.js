// OpenHands整合配置
class OpenHandsConfig {
    constructor() {
      this.settings = {
        // 連接設定
        baseURL: 'http://localhost:3000',
        wsURL: 'ws://localhost:3000',
        
        // 功能開關
        enableIntegration: false, // 預設關閉，避免錯誤
        enableWebSocket: false,
        enableFileSync: false,
        
        // 回退設定
        fallbackToDemo: true,
        demoMode: true,
        
        // API超時設定
        connectionTimeout: 5000,
        apiTimeout: 10000,
        
        // 調試模式
        debugMode: true,
        logLevel: 'info' // 'debug', 'info', 'warn', 'error'
      };
    }
  
    // 更新設定
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
      this.saveToLocalStorage();
    }
  
    // 從localStorage載入設定
    loadFromLocalStorage() {
      const saved = localStorage.getItem('openhands-config');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    }
  
    // 保存到localStorage
    saveToLocalStorage() {
      localStorage.setItem('openhands-config', JSON.stringify(this.settings));
    }
  
    // 檢查功能是否啟用
    isFeatureEnabled(feature) {
      return this.settings[feature] || false;
    }
  
    // 獲取API URL
    getAPIURL(endpoint) {
      return `${this.settings.baseURL}/api${endpoint}`;
    }
  
    // 獲取WebSocket URL  
    getWSURL(endpoint) {
      return `${this.settings.wsURL}/ws${endpoint}`;
    }
  
    // 日誌函數
    log(level, message, data = null) {
      if (!this.settings.debugMode) return;
      
      const levels = { debug: 0, info: 1, warn: 2, error: 3 };
      const currentLevel = levels[this.settings.logLevel] || 1;
      
      if (levels[level] >= currentLevel) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[OpenHands ${level.toUpperCase()}] ${timestamp}:`;
        
        if (data) {
          console[level](prefix, message, data);
        } else {
          console[level](prefix, message);
        }
      }
    }
  }
  
  // 全局配置實例
  window.openHandsConfig = new OpenHandsConfig();
  
  // 載入保存的設定
  window.openHandsConfig.loadFromLocalStorage();