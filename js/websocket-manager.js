// WebSocket 連接管理器
class WebSocketManager {
    constructor() {
      this.config = window.openHandsConfig;
      this.connections = new Map();
      this.reconnectAttempts = new Map();
      this.maxReconnectAttempts = 3;
      this.reconnectDelay = 2000;
      this.isEnabled = false;
    }
  
    // 初始化WebSocket連接
    async initialize(sessionId) {
      if (!this.config.isFeatureEnabled('enableWebSocket')) {
        this.config.log('info', 'WebSocket disabled, using simulation mode');
        this.isEnabled = false;
        return false;
      }
  
      try {
        // 嘗試連接終端和聊天WebSocket
        await Promise.all([
          this.connectTerminal(sessionId),
          this.connectChat(sessionId)
        ]);
        
        this.isEnabled = true;
        this.config.log('info', 'All WebSocket connections established');
        return true;
      } catch (error) {
        this.config.log('warn', 'WebSocket initialization failed, using simulation', error);
        this.isEnabled = false;
        return false;
      }
    }
  
    // 連接終端WebSocket
    async connectTerminal(sessionId) {
      const connectionKey = 'terminal';
      
      // 如果已經連接，先關閉
      if (this.connections.has(connectionKey)) {
        this.closeConnection(connectionKey);
      }
  
      try {
        const wsURL = this.config.getWSURL(`/terminal/${sessionId}`);
        this.config.log('debug', `Connecting to terminal WebSocket: ${wsURL}`);
        
        const ws = new WebSocket(wsURL);
        
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Terminal WebSocket connection timeout'));
          }, this.config.settings.connectionTimeout);
  
          ws.onopen = () => {
            clearTimeout(timeout);
            this.connections.set(connectionKey, ws);
            this.reconnectAttempts.set(connectionKey, 0);
            this.config.log('info', 'Terminal WebSocket connected');
            resolve(ws);
          };
  
          ws.onmessage = (event) => {
            this.handleTerminalMessage(event.data);
          };
  
          ws.onclose = (event) => {
            clearTimeout(timeout);
            this.config.log('warn', `Terminal WebSocket closed: ${event.code}`);
            this.connections.delete(connectionKey);
            
            // 嘗試重連
            if (event.code !== 1000) { // 不是正常關閉
              this.attemptReconnect(connectionKey, () => this.connectTerminal(sessionId));
            }
          };
  
          ws.onerror = (error) => {
            clearTimeout(timeout);
            this.config.log('error', 'Terminal WebSocket error', error);
            reject(error);
          };
        });
      } catch (error) {
        this.config.log('error', 'Failed to create terminal WebSocket', error);
        throw error;
      }
    }
  
    // 連接聊天WebSocket
    async connectChat(sessionId) {
      const connectionKey = 'chat';
      
      if (this.connections.has(connectionKey)) {
        this.closeConnection(connectionKey);
      }
  
      try {
        const wsURL = this.config.getWSURL(`/chat/${sessionId}`);
        this.config.log('debug', `Connecting to chat WebSocket: ${wsURL}`);
        
        const ws = new WebSocket(wsURL);
        
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Chat WebSocket connection timeout'));
          }, this.config.settings.connectionTimeout);
  
          ws.onopen = () => {
            clearTimeout(timeout);
            this.connections.set(connectionKey, ws);
            this.reconnectAttempts.set(connectionKey, 0);
            this.config.log('info', 'Chat WebSocket connected');
            resolve(ws);
          };
  
          ws.onmessage = (event) => {
            this.handleChatMessage(event.data);
          };
  
          ws.onclose = (event) => {
            clearTimeout(timeout);
            this.config.log('warn', `Chat WebSocket closed: ${event.code}`);
            this.connections.delete(connectionKey);
            
            if (event.code !== 1000) {
              this.attemptReconnect(connectionKey, () => this.connectChat(sessionId));
            }
          };
  
          ws.onerror = (error) => {
            clearTimeout(timeout);
            this.config.log('error', 'Chat WebSocket error', error);
            reject(error);
          };
        });
      } catch (error) {
        this.config.log('error', 'Failed to create chat WebSocket', error);
        throw error;
      }
    }
  
    // 處理終端消息
    handleTerminalMessage(data) {
      try {
        const message = JSON.parse(data);
        this.config.log('debug', 'Terminal message received', message);
        
        const terminalOutput = document.getElementById('terminal-output');
        if (terminalOutput) {
          const outputLine = document.createElement('div');
          outputLine.style.marginBottom = '2px';
          
          if (message.type === 'output') {
            outputLine.textContent = message.content;
          } else if (message.type === 'error') {
            outputLine.style.color = '#ef4444';
            outputLine.textContent = message.content;
          } else if (message.type === 'command') {
            outputLine.style.color = '#10b981';
            outputLine.textContent = `$ ${message.content}`;
          }
          
          terminalOutput.appendChild(outputLine);
          terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
      } catch (error) {
        this.config.log('error', 'Failed to parse terminal message', error);
      }
    }
  
    // 處理聊天消息
    handleChatMessage(data) {
      try {
        const message = JSON.parse(data);
        this.config.log('debug', 'Chat message received', message);
        
        if (message.type === 'assistant') {
          this.displayAIResponse(message.content);
        } else if (message.type === 'status') {
          this.updateAgentStatus(message.status);
        } else if (message.type === 'file_change') {
          this.handleFileChange(message);
        }
      } catch (error) {
        this.config.log('error', 'Failed to parse chat message', error);
      }
    }
  
    // 顯示AI回應
    displayAIResponse(content) {
      const chatHistory = document.getElementById('chat-history');
      if (chatHistory) {
        const aiMessage = document.createElement('div');
        aiMessage.className = 'message assistant fade-in';
        aiMessage.innerHTML = `
          <div class="message-content">
            ${this.formatMessageContent(content)}
          </div>
        `;
        chatHistory.appendChild(aiMessage);
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
    }
  
    // 格式化消息內容
    formatMessageContent(content) {
      // 處理代碼塊
      return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `
          <div class="code-block">
            <div class="code-header">
              <span>📄 ${lang || 'Code'}</span>
              <div class="code-actions">
                <button class="action-btn" onclick="copyCode(this)">📋 Copy</button>
                <button class="action-btn apply" onclick="applyCode(this)">▶️ Apply</button>
              </div>
            </div>
            <div class="code-content">
              <pre>${code.trim()}</pre>
            </div>
          </div>
        `;
      });
    }
  
    // 更新Agent狀態
    updateAgentStatus(status) {
      const statusElement = document.querySelector('.status-indicator');
      if (statusElement) {
        const statusMessages = {
          'thinking': '🤔 思考中...',
          'executing': '⚡ 執行中...',
          'waiting': '⏳ 等待輸入...',
          'connected': '🟢 已連接',
          'disconnected': '🔴 已斷開'
        };
        
        statusElement.innerHTML = `
          <div class="status-dot"></div>
          ${statusMessages[status] || status}
        `;
      }
    }
  
    // 處理文件變更
    handleFileChange(message) {
      this.config.log('info', 'File changed', message);
      // 更新Changes面板
      this.updateChangesPanel(message);
    }
  
    // 更新變更面板
    updateChangesPanel(change) {
      // 這裡可以更新你的Changes面板UI
      const changesContainer = document.querySelector('.changes-content');
      if (changesContainer) {
        // 添加新的變更項目
        const changeItem = document.createElement('div');
        changeItem.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: #1e293b; border-radius: 6px; font-size: 14px; margin-bottom: 8px;">
            <div style="width: 16px; height: 16px; border-radius: 3px; background: #f59e0b; color: #000; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">M</div>
            <span>${change.file_path}</span>
          </div>
        `;
        
        // 找到變更文件列表並添加
        const filesList = changesContainer.querySelector('h3')?.nextElementSibling;
        if (filesList) {
          filesList.appendChild(changeItem);
        }
      }
    }
  
    // 發送終端命令
    sendTerminalCommand(command) {
      if (this.isEnabled) {
        const ws = this.connections.get('terminal');
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'command',
            content: command,
            timestamp: new Date().toISOString()
          }));
          this.config.log('debug', `Terminal command sent: ${command}`);
          return true;
        }
      }
      
      // 回退到模擬模式
      this.simulateTerminalCommand(command);
      return false;
    }
  
    // 模擬終端命令執行
    simulateTerminalCommand(command) {
      this.config.log('debug', `Simulating terminal command: ${command}`);
      
      const terminalOutput = document.getElementById('terminal-output');
      if (!terminalOutput) return;
  
      // 顯示命令
      const commandLine = document.createElement('div');
      commandLine.style.marginBottom = '2px';
      commandLine.style.color = '#10b981';
      commandLine.textContent = `$ ${command}`;
      terminalOutput.appendChild(commandLine);
  
      // 模擬延遲和回應
      setTimeout(() => {
        const outputLine = document.createElement('div');
        outputLine.style.marginBottom = '2px';
        
        // 根據命令生成模擬輸出
        let response = this.generateTerminalResponse(command);
        outputLine.textContent = response;
        
        terminalOutput.appendChild(outputLine);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
      }, 300 + Math.random() * 700);
    }
  
    // 生成終端回應
    generateTerminalResponse(command) {
      const cmd = command.toLowerCase().trim();
      
      if (cmd === 'ls' || cmd === 'dir') {
        return 'src/  package.json  README.md  node_modules/  .git/';
      } else if (cmd === 'pwd') {
        return '/workspace/openhands-project';
      } else if (cmd.startsWith('cd ')) {
        return ''; // cd 通常沒有輸出
      } else if (cmd === 'git status') {
        return `On branch main
  Your branch is up to date with 'origin/main'.
  
  Changes not staged for commit:
    modified:   src/components/UserProfile.tsx`;
      } else if (cmd.startsWith('npm ') || cmd.startsWith('yarn ')) {
        return '✓ Command executed successfully (demo mode)';
      } else if (cmd === 'clear') {
        // 清空終端
        const terminalOutput = document.getElementById('terminal-output');
        if (terminalOutput) {
          terminalOutput.innerHTML = '';
        }
        return '';
      } else if (cmd === '') {
        return '';
      } else {
        return `bash: ${command}: command not found (demo mode)`;
      }
    }
  
    // 嘗試重連
    attemptReconnect(connectionKey, connectFunc) {
      const attempts = this.reconnectAttempts.get(connectionKey) || 0;
      
      if (attempts < this.maxReconnectAttempts) {
        this.reconnectAttempts.set(connectionKey, attempts + 1);
        
        this.config.log('info', `Attempting to reconnect ${connectionKey} (${attempts + 1}/${this.maxReconnectAttempts})`);
        
        setTimeout(async () => {
          try {
            await connectFunc();
          } catch (error) {
            this.config.log('error', `Reconnection attempt ${attempts + 1} failed`, error);
          }
        }, this.reconnectDelay * (attempts + 1));
      } else {
        this.config.log('error', `Max reconnection attempts reached for ${connectionKey}`);
      }
    }
  
    // 關閉連接
    closeConnection(connectionKey) {
      const ws = this.connections.get(connectionKey);
      if (ws) {
        ws.close(1000, 'Normal closure');
        this.connections.delete(connectionKey);
        this.config.log('info', `${connectionKey} WebSocket closed`);
      }
    }
  
    // 關閉所有連接
    closeAllConnections() {
      for (const [key] of this.connections) {
        this.closeConnection(key);
      }
      this.config.log('info', 'All WebSocket connections closed');
    }
  
    // 獲取連接狀態
    getConnectionStatus() {
      const status = {};
      for (const [key, ws] of this.connections) {
        status[key] = {
          connected: ws.readyState === WebSocket.OPEN,
          readyState: ws.readyState
        };
      }
      return {
        enabled: this.isEnabled,
        connections: status
      };
    }
  }
  
  // 全局實例
  window.wsManager = new WebSocketManager();