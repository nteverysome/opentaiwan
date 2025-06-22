/**
 * Daytona 整合管理器
 * 統一管理 Daytona 和 OpenHands 的整合功能
 */
class DaytonaIntegration {
    constructor() {
        this.currentMode = 'demo'; // 'demo', 'daytona', 'openhands'
        this.connectionStatus = 'disconnected';
        this.isInitialized = false;
        this.sessionId = null;
        
        // 服務實例
        this.daytonaAPI = null;
        this.openHandsAPI = null;
        this.currentSandbox = null;
        
        // 狀態管理
        this.state = {
            sandboxConnected: false,
            wsConnected: false,
            filesLoaded: false,
            billingLoaded: false
        };
        
        // 事件監聽器
        this.eventListeners = new Map();
        
        console.log('🏗️ Daytona 整合管理器已創建');
    }

    /**
     * 初始化整合系統
     */
    async initialize(autoConnect = false) {
        try {
            console.log('🚀 開始初始化 Daytona 整合系統...');

            // 1. 初始化配置
            if (!window.daytonaConfig) {
                window.daytonaConfig = new DaytonaConfig();
            }

            // 2. 創建 API 客戶端
            this.daytonaAPI = new DaytonaAPIClient(window.daytonaConfig.getAPIConfig());
            
            // 3. 根據配置決定默認模式
            if (window.daytonaConfig.isConfigured() && autoConnect) {
                await this.switchMode('daytona');
            } else {
                this.currentMode = 'demo';
            }

            // 4. 設置事件監聽器
            this.setupEventListeners();

            // 5. 初始化 UI 組件
            this.initializeUI();

            this.isInitialized = true;
            this.sessionId = 'dt-' + Math.random().toString(36).substr(2, 8);

            console.log('✅ Daytona 整合系統初始化完成');
            
            // 觸發初始化完成事件
            this.emit('daytona-initialized', { 
                mode: this.currentMode, 
                sessionId: this.sessionId 
            });

            return true;
        } catch (error) {
            console.error('❌ Daytona 整合系統初始化失敗:', error);
            this.currentMode = 'demo';
            return false;
        }
    }

    /**
     * 切換運行模式
     */
    async switchMode(newMode) {
        console.log(`🔄 切換模式: ${this.currentMode} → ${newMode}`);

        try {
            // 斷開當前連接
            await this.disconnect();

            this.currentMode = newMode;

            switch (newMode) {
                case 'daytona':
                    await this.connectToDaytona();
                    break;
                case 'openhands':
                    await this.connectToOpenHands();
                    break;
                case 'demo':
                    this.setupDemoMode();
                    break;
                default:
                    throw new Error(`不支持的模式: ${newMode}`);
            }

            // 更新 UI
            this.updateModeIndicators();
            
            // 觸發模式變更事件
            this.emit('daytona-mode-changed', { 
                newMode: newMode, 
                previousMode: this.currentMode 
            });

            console.log(`✅ 已切換到 ${newMode} 模式`);
            return true;
        } catch (error) {
            console.error(`❌ 切換到 ${newMode} 模式失敗:`, error);
            this.currentMode = 'demo';
            this.setupDemoMode();
            throw error;
        }
    }

    /**
     * 連接到 Daytona
     */
    async connectToDaytona() {
        this.connectionStatus = 'connecting';
        
        try {
            // 初始化 Daytona API
            const result = await this.daytonaAPI.initialize();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            // 獲取或創建沙盒
            if (window.daytonaConfig.get('autoCreateSandbox')) {
                await this.ensureSandbox();
            }

            // 載入付費信息
            if (window.daytonaConfig.get('enableBilling')) {
                await this.loadBillingInfo();
            }

            this.connectionStatus = 'connected';
            this.state.sandboxConnected = true;

            console.log('✅ 已連接到 Daytona');
            return true;
        } catch (error) {
            this.connectionStatus = 'failed';
            console.error('❌ 連接 Daytona 失敗:', error);
            throw error;
        }
    }

    /**
     * 連接到 OpenHands（保留兼容性）
     */
    async connectToOpenHands() {
        // 如果有現有的 OpenHands 整合，使用它
        if (window.openHandsIntegration) {
            return await window.openHandsIntegration.switchMode('integrated');
        }

        // 否則回退到演示模式
        console.warn('⚠️ OpenHands 整合不可用，回退到演示模式');
        this.setupDemoMode();
        return false;
    }

    /**
     * 設置演示模式
     */
    setupDemoMode() {
        this.connectionStatus = 'demo';
        this.state = {
            sandboxConnected: false,
            wsConnected: false,
            filesLoaded: false,
            billingLoaded: false
        };

        console.log('🎭 演示模式已啟用');
    }

    /**
     * 確保有可用的沙盒
     */
    async ensureSandbox() {
        if (!this.currentSandbox) {
            console.log('📦 創建新的開發沙盒...');
            
            const sandboxConfig = window.daytonaConfig.getSandboxConfig({
                name: `opentaiwan-${Date.now()}`,
                description: '由 Opentaiwan Dev Studio 創建'
            });

            this.currentSandbox = await this.daytonaAPI.createSandbox(sandboxConfig);
            console.log('✅ 沙盒創建成功:', this.currentSandbox.id);
        }

        return this.currentSandbox;
    }

    /**
     * 發送消息（統一接口）
     */
    async sendMessage(message) {
        console.log(`📤 發送消息 (${this.currentMode} 模式):`, message);

        switch (this.currentMode) {
            case 'daytona':
                return await this.sendDaytonaMessage(message);
            case 'openhands':
                return await this.sendOpenHandsMessage(message);
            default:
                return this.sendDemoMessage(message);
        }
    }

    /**
     * 通過 Daytona 發送消息
     */
    async sendDaytonaMessage(message) {
        try {
            // 確保有沙盒
            await this.ensureSandbox();

            // 分析消息類型並執行相應操作
            if (this.isCodeRequest(message)) {
                // 如果是代碼請求，生成並執行代碼
                const generatedCode = await this.generateCode(message);
                const result = await this.daytonaAPI.executeCode(
                    generatedCode.code, 
                    generatedCode.language,
                    this.currentSandbox.id
                );

                return {
                    content: this.formatCodeResponse(generatedCode, result),
                    type: 'code_execution',
                    sandboxId: this.currentSandbox.id
                };
            } else {
                // 一般對話回應
                return {
                    content: await this.generateTextResponse(message),
                    type: 'text_response'
                };
            }
        } catch (error) {
            console.error('❌ Daytona 消息處理失敗:', error);
            return {
                content: `抱歉，處理失敗：${error.message}`,
                type: 'error'
            };
        }
    }

    /**
     * 通過 OpenHands 發送消息
     */
    async sendOpenHandsMessage(message) {
        if (window.openHandsIntegration) {
            return await window.openHandsIntegration.sendMessage(message);
        } else {
            return this.sendDemoMessage(message);
        }
    }

    /**
     * 演示模式消息處理
     */
    sendDemoMessage(message) {
        const responses = [
            `基於您的需求「${message}」，我建議以下解決方案：`,
            `我理解您想要實現「${message}」，讓我為您生成相應的代碼：`,
            `關於「${message}」，這是一個很好的想法！讓我們來實現它：`
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        return Promise.resolve({
            content: randomResponse + this.generateDemoCode(message),
            type: 'demo_response'
        });
    }

    /**
     * 執行終端命令
     */
    async executeCommand(command) {
        console.log(`🖥️ 執行命令 (${this.currentMode} 模式):`, command);

        switch (this.currentMode) {
            case 'daytona':
                return await this.executeDaytonaCommand(command);
            case 'openhands':
                return await this.executeOpenHandsCommand(command);
            default:
                return this.executeDemoCommand(command);
        }
    }

    /**
     * 在 Daytona 中執行命令
     */
    async executeDaytonaCommand(command) {
        try {
            await this.ensureSandbox();
            const result = await this.daytonaAPI.executeCommand(command, this.currentSandbox.id);
            
            // 更新終端輸出
            this.updateTerminalOutput(command, result.output, result.exit_code);
            
            return result;
        } catch (error) {
            console.error('❌ Daytona 命令執行失敗:', error);
            const errorOutput = `錯誤: ${error.message}`;
            this.updateTerminalOutput(command, errorOutput, 1);
            return { output: errorOutput, exit_code: 1 };
        }
    }

    /**
     * OpenHands 命令執行
     */
    async executeOpenHandsCommand(command) {
        if (window.openHandsIntegration) {
            return await window.openHandsIntegration.executeCommand(command);
        } else {
            return this.executeDemoCommand(command);
        }
    }

    /**
     * 演示模式命令執行
     */
    executeDemoCommand(command) {
        const demoOutputs = {
            'ls': `total 4
drwxr-xr-x 2 user user 4096 $(date) workspace
-rw-r--r-- 1 user user  234 $(date) app.py
-rw-r--r-- 1 user user  156 $(date) requirements.txt`,
            'pwd': '/workspace/opentaiwan',
            'whoami': 'developer',
            'python --version': 'Python 3.11.5',
            'node --version': 'v18.17.0',
            'git status': `On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean`
        };

        const output = demoOutputs[command] || `已執行: ${command}\n演示模式輸出`;
        this.updateTerminalOutput(command, output, 0);
        
        return Promise.resolve({ output, exit_code: 0 });
    }

    /**
     * 載入付費信息
     */
    async loadBillingInfo() {
        try {
            const billingInfo = await this.daytonaAPI.getBillingInfo();
            
            if (billingInfo) {
                this.state.billingLoaded = true;
                this.updateBillingDisplay(billingInfo);
                console.log('📊 付費信息已載入:', billingInfo);
            }
        } catch (error) {
            console.error('❌ 載入付費信息失敗:', error);
        }
    }

    /**
     * 載入文件系統
     */
    async loadFileSystem(sandboxId = null) {
        try {
            const targetSandbox = sandboxId || this.currentSandbox?.id;
            
            if (!targetSandbox) {
                console.warn('⚠️ 沒有可用的沙盒來載入文件系統');
                return;
            }

            const fileSystem = await this.daytonaAPI.getFileSystem(targetSandbox);
            this.updateFileExplorer(fileSystem);
            this.state.filesLoaded = true;
            
            console.log('📁 文件系統已載入');
        } catch (error) {
            console.error('❌ 載入文件系統失敗:', error);
        }
    }

    /**
     * 獲取狀態信息
     */
    getStatus() {
        return {
            mode: this.currentMode,
            connectionStatus: this.connectionStatus,
            isInitialized: this.isInitialized,
            sessionId: this.sessionId,
            currentSandbox: this.currentSandbox,
            state: { ...this.state }
        };
    }

    /**
     * 斷開連接
     */
    async disconnect() {
        this.connectionStatus = 'disconnected';
        this.state = {
            sandboxConnected: false,
            wsConnected: false,
            filesLoaded: false,
            billingLoaded: false
        };

        // 清理 WebSocket 連接
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        console.log('🔌 已斷開所有連接');
    }

    /**
     * 重置整合系統
     */
    async reset() {
        await this.disconnect();
        this.currentSandbox = null;
        this.sessionId = null;
        this.isInitialized = false;
        
        console.log('🔄 整合系統已重置');
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 監聽配置變更
        window.addEventListener('daytona-config-updated', (event) => {
            console.log('⚙️ Daytona 配置已更新:', event.detail);
            
            // 如果 API 密鑰變更，重新初始化
            if (event.detail.changes.apiKey) {
                this.daytonaAPI = new DaytonaAPIClient(window.daytonaConfig.getAPIConfig());
            }
        });

        // 監聽頁面關閉
        window.addEventListener('beforeunload', () => {
            this.disconnect();
        });
    }

    /**
     * 初始化 UI 組件
     */
    initializeUI() {
        // 更新模式指示器
        this.updateModeIndicators();
        
        // 如果是 Daytona 模式，更新 UI 元素
        if (this.currentMode === 'daytona') {
            this.updateDaytonaUI();
        }
    }

    /**
     * 更新模式指示器
     */
    updateModeIndicators() {
        const modeTexts = {
            'demo': '● DEMO MODE',
            'daytona': '● DAYTONA MODE',
            'openhands': '● OPENHANDS MODE'
        };

        const modeColors = {
            'demo': '#60a5fa',
            'daytona': '#10b981',
            'openhands': '#f59e0b'
        };

        // 更新頭部標題
        const headerTitle = document.querySelector('.header h1');
        if (headerTitle) {
            const modeText = modeTexts[this.currentMode];
            const modeColor = modeColors[this.currentMode];
            
            headerTitle.innerHTML = `
                🚀 Opentaiwan Dev Studio
                <span style="color: ${modeColor}; font-size: 12px;">${modeText}</span>
            `;
        }
    }

    /**
     * 更新 Daytona UI
     */
    updateDaytonaUI() {
        // 顯示 Daytona 特定的 UI 元素
        this.showDaytonaDashboardLink();
        this.updateSandboxInfo();
    }

    /**
     * 顯示 Daytona 儀表板鏈接
     */
    showDaytonaDashboardLink() {
        // 在設定中添加 Daytona 儀表板鏈接
        const settingsBody = document.getElementById('settings-application');
        if (settingsBody && !settingsBody.querySelector('.daytona-dashboard-link')) {
            const dashboardSection = document.createElement('div');
            dashboardSection.className = 'settings-section daytona-dashboard-link';
            dashboardSection.innerHTML = `
                <h3>🏗️ Daytona 控制台</h3>
                <p style="margin-bottom: 12px; color: #94a3b8;">管理您的沙盒和付費設定</p>
                <div style="display: flex; gap: 8px;">
                    <button class="settings-btn" onclick="window.daytonaIntegration.openDashboard()">
                        🏗️ 開啟儀表板
                    </button>
                    <button class="settings-btn" onclick="window.daytonaIntegration.openBillingDashboard()">
                        💳 付費管理
                    </button>
                </div>
            `;
            settingsBody.appendChild(dashboardSection);
        }
    }

    /**
     * 更新沙盒信息
     */
    updateSandboxInfo() {
        if (this.currentSandbox) {
            console.log('📦 當前沙盒:', {
                id: this.currentSandbox.id,
                name: this.currentSandbox.name,
                status: this.currentSandbox.status
            });
        }
    }

    /**
     * 工具函數
     */
    isCodeRequest(message) {
        const codeKeywords = ['創建', '寫', '生成', '代碼', '函數', '組件', '腳本', '程式'];
        return codeKeywords.some(keyword => message.includes(keyword));
    }

    async generateCode(message) {
        // 簡化的代碼生成邏輯
        if (message.includes('React')) {
            return {
                code: `import React from 'react';

export function Component() {
    return (
        <div>
            <h1>Hello from Daytona!</h1>
            <p>這是由 Opentaiwan 在 Daytona 沙盒中生成的 React 組件</p>
        </div>
    );
}`,
                language: 'javascript'
            };
        } else {
            return {
                code: `print("Hello from Daytona Sandbox!")
print("這是由 Opentaiwan 生成的 Python 代碼")`,
                language: 'python'
            };
        }
    }

    formatCodeResponse(generatedCode, executionResult) {
        return `我已經為您生成並執行了代碼：

\`\`\`${generatedCode.language}
${generatedCode.code}
\`\`\`

執行結果：
\`\`\`
${executionResult.output}
退出代碼: ${executionResult.exitCode}
執行時間: ${executionResult.executionTime || 'N/A'}ms
\`\`\`

沙盒 ID: ${this.currentSandbox.id}`;
    }

    async generateTextResponse(message) {
        return `我了解您的需求：「${message}」

作為 Opentaiwan Dev Studio，我可以幫您：
• 在安全的 Daytona 沙盒中執行代碼
• 創建和管理開發環境
• 提供實時的代碼執行和測試
• 整合付費管理和資源控制

當前使用的是 Daytona 模式，為您提供隔離且安全的開發環境。`;
    }

    generateDemoCode(message) {
        return `

\`\`\`javascript
// 演示代碼 - 基於您的需求：${message}
function handleUserRequest() {
    console.log("處理用戶請求：${message}");
    
    // 這裡是演示代碼
    // 在實際模式中，會在 Daytona 沙盒中執行
    
    return "完成處理";
}

handleUserRequest();
\`\`\`

💡 這是演示模式的回應。要獲得真實的代碼執行，請：
1. 設置 Daytona API 密鑰
2. 切換到 Daytona 模式
3. 享受安全的沙盒環境！`;
    }

    updateTerminalOutput(command, output, exitCode) {
        const terminalOutput = document.getElementById('terminal-output');
        if (terminalOutput) {
            const timestamp = new Date().toLocaleTimeString();
            const statusIcon = exitCode === 0 ? '✅' : '❌';
            
            terminalOutput.innerHTML += `
<div style="margin-bottom: 2px; color: #10b981;">$ ${command}</div>
<div style="margin-bottom: 2px; color: ${exitCode === 0 ? '#e2e8f0' : '#ef4444'};">${output}</div>
<div style="margin-bottom: 4px; color: #64748b; font-size: 11px;">${statusIcon} [${timestamp}] 退出代碼: ${exitCode}</div>
`;
            
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    }

    updateBillingDisplay(billingInfo) {
        // 更新配額顯示
        const quotaDisplay = document.querySelector('.quota-display span');
        if (quotaDisplay && billingInfo.usage && billingInfo.limits) {
            quotaDisplay.textContent = `${billingInfo.usage.current}/${billingInfo.limits.monthly}`;
        }
    }

    updateFileExplorer(fileSystem) {
        // 更新文件瀏覽器（簡化版本）
        console.log('📁 文件系統已更新:', fileSystem);
    }

    // 委派方法到 Daytona API
    openDashboard() {
        if (this.daytonaAPI) {
            this.daytonaAPI.openDashboard();
        } else {
            window.open('https://app.daytona.io', '_blank');
        }
    }

    openBillingDashboard() {
        if (this.daytonaAPI) {
            this.daytonaAPI.openBillingDashboard();
        } else {
            window.open('https://app.daytona.io/dashboard/billing', '_blank');
        }
    }

    /**
     * 事件發射器
     */
    emit(eventName, data) {
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    /**
     * 事件監聽器
     */
    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
    }
}

// 全局導出
window.DaytonaIntegration = DaytonaIntegration;