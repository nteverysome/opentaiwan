/**
 * Daytona API 客戶端
 * 提供與 Daytona 平台的完整整合
 */
class DaytonaAPIClient {
    constructor(config = {}) {
        this.apiKey = config.apiKey || window.daytonaConfig?.settings?.apiKey || '';
        this.baseURL = config.baseURL || 'https://api.daytona.io';
        this.dashboardURL = 'https://app.daytona.io';
        this.initialized = false;
        this.currentSandbox = null;
        this.organizationId = null;
        
        console.log('🏗️ Daytona API 客戶端已初始化');
    }

    /**
     * 初始化連接
     */
    async initialize() {
        try {
            if (!this.apiKey) {
                throw new Error('需要 Daytona API 密鑰');
            }

            // 驗證 API 密鑰並獲取用戶信息
            const userInfo = await this.getUserInfo();
            this.organizationId = userInfo.organization_id;
            this.initialized = true;

            console.log('✅ Daytona API 連接成功:', userInfo);
            return { success: true, user: userInfo };
        } catch (error) {
            console.error('❌ Daytona API 連接失敗:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 檢查連接狀態
     */
    async checkConnection() {
        try {
            const response = await this.makeRequest('/health', 'GET');
            return response.status === 'healthy';
        } catch (error) {
            console.error('連接檢查失敗:', error);
            return false;
        }
    }

    /**
     * 獲取用戶信息
     */
    async getUserInfo() {
        return await this.makeRequest('/user', 'GET');
    }

    /**
     * 獲取組織信息
     */
    async getOrganizationInfo() {
        return await this.makeRequest('/organizations/current', 'GET');
    }

    /**
     * 獲取付費信息
     */
    async getBillingInfo() {
        try {
            const billing = await this.makeRequest('/billing', 'GET');
            return {
                plan: billing.plan,
                usage: billing.usage,
                limits: billing.limits,
                nextBillingDate: billing.next_billing_date,
                invoices: billing.recent_invoices || []
            };
        } catch (error) {
            console.error('獲取付費信息失敗:', error);
            return null;
        }
    }

    /**
     * 創建沙盒
     */
    async createSandbox(params = {}) {
        try {
            const sandboxConfig = {
                language: params.language || 'python',
                image: params.image || 'python:3.11',
                name: params.name || `opentaiwan-${Date.now()}`,
                description: params.description || '由 Opentaiwan 創建的開發環境',
                ...params
            };

            const sandbox = await this.makeRequest('/sandboxes', 'POST', sandboxConfig);
            this.currentSandbox = sandbox;

            console.log('✅ 沙盒創建成功:', sandbox);
            return sandbox;
        } catch (error) {
            console.error('❌ 沙盒創建失敗:', error);
            throw error;
        }
    }

    /**
     * 獲取沙盒列表
     */
    async getSandboxes() {
        return await this.makeRequest('/sandboxes', 'GET');
    }

    /**
     * 獲取特定沙盒信息
     */
    async getSandbox(sandboxId) {
        return await this.makeRequest(`/sandboxes/${sandboxId}`, 'GET');
    }

    /**
     * 刪除沙盒
     */
    async deleteSandbox(sandboxId) {
        return await this.makeRequest(`/sandboxes/${sandboxId}`, 'DELETE');
    }

    /**
     * 在沙盒中執行代碼
     */
    async executeCode(code, language = 'python', sandboxId = null) {
        const targetSandbox = sandboxId || this.currentSandbox?.id;
        
        if (!targetSandbox) {
            // 如果沒有沙盒，創建一個
            const sandbox = await this.createSandbox({ language });
            targetSandbox = sandbox.id;
        }

        try {
            const result = await this.makeRequest(`/sandboxes/${targetSandbox}/execute`, 'POST', {
                code: code,
                language: language
            });

            return {
                success: true,
                output: result.output,
                exitCode: result.exit_code,
                executionTime: result.execution_time
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                output: '',
                exitCode: 1
            };
        }
    }

    /**
     * 上傳文件到沙盒
     */
    async uploadFile(sandboxId, filePath, content) {
        return await this.makeRequest(`/sandboxes/${sandboxId}/files`, 'POST', {
            path: filePath,
            content: content
        });
    }

    /**
     * 從沙盒下載文件
     */
    async downloadFile(sandboxId, filePath) {
        return await this.makeRequest(`/sandboxes/${sandboxId}/files/${filePath}`, 'GET');
    }

    /**
     * 獲取沙盒文件系統
     */
    async getFileSystem(sandboxId, path = '/') {
        return await this.makeRequest(`/sandboxes/${sandboxId}/filesystem?path=${path}`, 'GET');
    }

    /**
     * 在沙盒中執行終端命令
     */
    async executeCommand(command, sandboxId = null) {
        const targetSandbox = sandboxId || this.currentSandbox?.id;
        
        if (!targetSandbox) {
            throw new Error('沒有可用的沙盒');
        }

        return await this.makeRequest(`/sandboxes/${targetSandbox}/commands`, 'POST', {
            command: command
        });
    }

    /**
     * 創建快照
     */
    async createSnapshot(sandboxId, name, description = '') {
        return await this.makeRequest('/snapshots', 'POST', {
            sandbox_id: sandboxId,
            name: name,
            description: description
        });
    }

    /**
     * 從快照恢復沙盒
     */
    async restoreFromSnapshot(snapshotId, name = null) {
        return await this.makeRequest('/snapshots/restore', 'POST', {
            snapshot_id: snapshotId,
            name: name || `restored-${Date.now()}`
        });
    }

    /**
     * 獲取預覽 URL
     */
    async getPreviewURL(sandboxId, port = 3000) {
        const result = await this.makeRequest(`/sandboxes/${sandboxId}/preview/${port}`, 'GET');
        return result.url;
    }

    /**
     * 獲取終端 WebSocket URL
     */
    getTerminalWebSocketURL(sandboxId) {
        return `wss://terminal.daytona.io/ws/${sandboxId}?token=${this.apiKey}`;
    }

    /**
     * 升級付費計劃
     */
    async upgradePlan(planType) {
        return await this.makeRequest('/billing/upgrade', 'POST', {
            plan: planType
        });
    }

    /**
     * 獲取使用統計
     */
    async getUsageStats() {
        return await this.makeRequest('/usage', 'GET');
    }

    /**
     * 執行 HTTP 請求
     */
    async makeRequest(endpoint, method = 'GET', data = null) {
        const url = `${this.baseURL}${endpoint}`;
        
        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Opentaiwan-DevStudio/1.0'
            }
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '未知錯誤' }));
            throw new Error(`API 請求失敗 (${response.status}): ${errorData.message}`);
        }

        return await response.json();
    }

    /**
     * 建立 WebSocket 連接
     */
    createWebSocket(sandboxId, onMessage, onError) {
        const wsURL = this.getTerminalWebSocketURL(sandboxId);
        const ws = new WebSocket(wsURL);

        ws.onopen = () => {
            console.log('✅ Daytona WebSocket 連接已建立');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (onMessage) onMessage(data);
        };

        ws.onerror = (error) => {
            console.error('❌ Daytona WebSocket 錯誤:', error);
            if (onError) onError(error);
        };

        ws.onclose = () => {
            console.log('🔌 Daytona WebSocket 連接已關閉');
        };

        return ws;
    }

    /**
     * 打開 Daytona 儀表板
     */
    openDashboard(section = '') {
        const url = section ? `${this.dashboardURL}/${section}` : this.dashboardURL;
        window.open(url, '_blank');
    }

    /**
     * 打開付費頁面
     */
    openBillingDashboard() {
        this.openDashboard('dashboard/billing');
    }

    /**
     * 獲取沙盒狀態
     */
    async getSandboxStatus(sandboxId) {
        try {
            const sandbox = await this.getSandbox(sandboxId);
            return {
                status: sandbox.status,
                uptime: sandbox.uptime,
                resources: sandbox.resources,
                url: sandbox.preview_url
            };
        } catch (error) {
            return { status: 'unknown', error: error.message };
        }
    }

    /**
     * 批量操作沙盒
     */
    async batchSandboxOperation(operation, sandboxIds) {
        const results = [];
        
        for (const sandboxId of sandboxIds) {
            try {
                let result;
                switch (operation) {
                    case 'start':
                        result = await this.makeRequest(`/sandboxes/${sandboxId}/start`, 'POST');
                        break;
                    case 'stop':
                        result = await this.makeRequest(`/sandboxes/${sandboxId}/stop`, 'POST');
                        break;
                    case 'delete':
                        result = await this.deleteSandbox(sandboxId);
                        break;
                    default:
                        throw new Error(`不支持的操作: ${operation}`);
                }
                results.push({ sandboxId, success: true, result });
            } catch (error) {
                results.push({ sandboxId, success: false, error: error.message });
            }
        }
        
        return results;
    }
}

// 全局導出
window.DaytonaAPIClient = DaytonaAPIClient;