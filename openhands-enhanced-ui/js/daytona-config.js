/**
 * Daytona 配置管理器
 * 管理 Daytona 整合的所有配置
 */
class DaytonaConfig {
    constructor() {
        this.settings = {
            // API 配置
            apiKey: '',
            baseURL: 'https://api.daytona.io',
            dashboardURL: 'https://app.daytona.io',
            
            // 沙盒默認配置
            defaultLanguage: 'python',
            defaultImage: 'python:3.11',
            autoCreateSandbox: true,
            sandboxTimeout: 3600000, // 1小時
            
            // 功能開關
            enableBilling: true,
            enableSnapshots: true,
            enableFileSync: true,
            enableTerminal: true,
            enablePreview: true,
            
            // UI 配置
            showUsageStats: true,
            showBillingInfo: true,
            autoSaveSandbox: true,
            
            // 調試和日誌
            debugMode: false,
            logLevel: 'info', // 'debug', 'info', 'warn', 'error'
            
            // 性能配置
            maxConcurrentSandboxes: 5,
            executionTimeout: 30000, // 30秒
            
            // 安全配置
            allowUntrustedCode: false,
            sandboxIsolation: 'strict'
        };
        
        this.loadFromStorage();
        console.log('⚙️ Daytona 配置管理器已初始化');
    }
    
    /**
     * 從 localStorage 載入配置
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('daytona-config');
            if (saved) {
                const savedSettings = JSON.parse(saved);
                this.settings = { ...this.settings, ...savedSettings };
                console.log('📖 已載入保存的 Daytona 配置');
            }
        } catch (error) {
            console.warn('⚠️ 載入配置失敗，使用默認配置:', error);
        }
    }
    
    /**
     * 保存配置到 localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('daytona-config', JSON.stringify(this.settings));
            console.log('💾 Daytona 配置已保存');
        } catch (error) {
            console.error('❌ 保存配置失敗:', error);
        }
    }
    
    /**
     * 更新配置
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveToStorage();
        
        // 觸發配置更新事件
        window.dispatchEvent(new CustomEvent('daytona-config-updated', {
            detail: { settings: this.settings, changes: newSettings }
        }));
        
        console.log('🔄 Daytona 配置已更新:', newSettings);
    }
    
    /**
     * 重置為默認配置
     */
    resetToDefaults() {
        const apiKey = this.settings.apiKey; // 保留 API 密鑰
        
        this.settings = {
            apiKey: apiKey,
            baseURL: 'https://api.daytona.io',
            dashboardURL: 'https://app.daytona.io',
            defaultLanguage: 'python',
            defaultImage: 'python:3.11',
            autoCreateSandbox: true,
            sandboxTimeout: 3600000,
            enableBilling: true,
            enableSnapshots: true,
            enableFileSync: true,
            enableTerminal: true,
            enablePreview: true,
            showUsageStats: true,
            showBillingInfo: true,
            autoSaveSandbox: true,
            debugMode: false,
            logLevel: 'info',
            maxConcurrentSandboxes: 5,
            executionTimeout: 30000,
            allowUntrustedCode: false,
            sandboxIsolation: 'strict'
        };
        
        this.saveToStorage();
        console.log('🔄 Daytona 配置已重置為默認值');
        
        // 觸發重置事件
        window.dispatchEvent(new CustomEvent('daytona-config-reset', {
            detail: { settings: this.settings }
        }));
    }
    
    /**
     * 獲取特定配置值
     */
    get(key) {
        return this.settings[key];
    }
    
    /**
     * 設置特定配置值
     */
    set(key, value) {
        this.updateSettings({ [key]: value });
    }
    
    /**
     * 驗證配置
     */
    validate() {
        const errors = [];
        
        // 驗證必須的配置
        if (!this.settings.apiKey) {
            errors.push('需要 Daytona API 密鑰');
        }
        
        if (!this.settings.baseURL) {
            errors.push('需要 Daytona API URL');
        }
        
        // 驗證數值範圍
        if (this.settings.maxConcurrentSandboxes < 1 || this.settings.maxConcurrentSandboxes > 10) {
            errors.push('最大並發沙盒數量必須在 1-10 之間');
        }
        
        if (this.settings.executionTimeout < 1000 || this.settings.executionTimeout > 300000) {
            errors.push('執行超時時間必須在 1-300 秒之間');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * 獲取沙盒配置
     */
    getSandboxConfig(overrides = {}) {
        return {
            language: overrides.language || this.settings.defaultLanguage,
            image: overrides.image || this.settings.defaultImage,
            timeout: overrides.timeout || this.settings.sandboxTimeout,
            isolation: this.settings.sandboxIsolation,
            allowUntrusted: this.settings.allowUntrustedCode,
            ...overrides
        };
    }
    
    /**
     * 獲取 API 配置
     */
    getAPIConfig() {
        return {
            apiKey: this.settings.apiKey,
            baseURL: this.settings.baseURL,
            timeout: this.settings.executionTimeout,
            debugMode: this.settings.debugMode
        };
    }
    
    /**
     * 導出配置
     */
    exportConfig() {
        const exportData = {
            ...this.settings,
            apiKey: this.settings.apiKey ? '***已設置***' : '未設置' // 隱藏 API 密鑰
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    /**
     * 導入配置
     */
    importConfig(configJSON) {
        try {
            const importedConfig = JSON.parse(configJSON);
            
            // 驗證導入的配置
            const validKeys = Object.keys(this.settings);
            const filteredConfig = {};
            
            for (const [key, value] of Object.entries(importedConfig)) {
                if (validKeys.includes(key) && key !== 'apiKey') { // 不導入 API 密鑰
                    filteredConfig[key] = value;
                }
            }
            
            this.updateSettings(filteredConfig);
            console.log('📥 配置導入成功');
            return { success: true };
        } catch (error) {
            console.error('❌ 配置導入失敗:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 獲取功能狀態
     */
    getFeatureStatus() {
        return {
            billing: this.settings.enableBilling,
            snapshots: this.settings.enableSnapshots,
            fileSync: this.settings.enableFileSync,
            terminal: this.settings.enableTerminal,
            preview: this.settings.enablePreview,
            autoSave: this.settings.autoSaveSandbox,
            debug: this.settings.debugMode
        };
    }
    
    /**
     * 切換功能開關
     */
    toggleFeature(featureName) {
        const featureMap = {
            'billing': 'enableBilling',
            'snapshots': 'enableSnapshots',
            'fileSync': 'enableFileSync',
            'terminal': 'enableTerminal',
            'preview': 'enablePreview',
            'autoSave': 'autoSaveSandbox',
            'debug': 'debugMode'
        };
        
        const settingKey = featureMap[featureName];
        if (settingKey) {
            this.set(settingKey, !this.settings[settingKey]);
            return this.settings[settingKey];
        }
        
        throw new Error(`未知的功能: ${featureName}`);
    }
    
    /**
     * 獲取日誌配置
     */
    getLogConfig() {
        return {
            level: this.settings.logLevel,
            debug: this.settings.debugMode
        };
    }
    
    /**
     * 設置 API 密鑰
     */
    setAPIKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('無效的 API 密鑰');
        }
        
        this.set('apiKey', apiKey);
        console.log('🔑 Daytona API 密鑰已設置');
    }
    
    /**
     * 清除 API 密鑰
     */
    clearAPIKey() {
        this.set('apiKey', '');
        console.log('🗑️ Daytona API 密鑰已清除');
    }
    
    /**
     * 檢查是否已配置
     */
    isConfigured() {
        return Boolean(this.settings.apiKey && this.settings.baseURL);
    }
    
    /**
     * 獲取配置摘要
     */
    getConfigSummary() {
        return {
            configured: this.isConfigured(),
            apiKeySet: Boolean(this.settings.apiKey),
            baseURL: this.settings.baseURL,
            features: this.getFeatureStatus(),
            sandboxDefaults: {
                language: this.settings.defaultLanguage,
                image: this.settings.defaultImage,
                autoCreate: this.settings.autoCreateSandbox
            }
        };
    }
}

// 全局導出
window.DaytonaConfig = DaytonaConfig;
window.daytonaConfig = new DaytonaConfig();