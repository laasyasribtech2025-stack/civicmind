/**
 * Family Concierge AI - Master Coordination & Dynamic UI Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // Telemetry Console Logging System
  // ==========================================
  const terminalLogs = document.getElementById('terminal-body-logs');

  function appendTelemetryLog(logObj) {
    if (!terminalLogs) return;
    
    const logLine = document.createElement('span');
    logLine.className = 'log-line';
    
    if (logObj.type === 'agent-log') {
      logLine.className += ' agent-log';
      logLine.innerText = `[${logObj.timestamp}] [${logObj.agent}] ${logObj.message}`;
      if (logObj.data) {
        const detail = document.createElement('div');
        detail.className = 'log-line text-muted';
        detail.style.paddingLeft = '1.5rem';
        detail.innerText = `↳ Payload: ${logObj.data}`;
        logLine.appendChild(detail);
      }
    } 
    else if (logObj.type === 'mcp-log') {
      logLine.className += ' mcp-log';
      logLine.innerText = `[${logObj.timestamp}] [${logObj.server}] ${logObj.message}`;
      
      const detail = document.createElement('div');
      detail.className = 'log-line text-muted';
      detail.style.paddingLeft = '1.5rem';
      detail.innerText = `↳ Call: ${logObj.params} | Return: ${logObj.response}`;
      logLine.appendChild(detail);
    } 
    else if (logObj.type === 'success-log') {
      logLine.className += ' success-log';
      logLine.innerText = `[${logObj.timestamp}] [System] Success: ${logObj.message}`;
    } 
    else if (logObj.type === 'error-log') {
      logLine.className += ' error-log';
      logLine.innerText = `[${logObj.timestamp}] [Privacy] ALERT: ${logObj.message}`;
    } 
    else {
      logLine.innerText = `[${logObj.timestamp}] [System] ${logObj.message}`;
    }

    terminalLogs.appendChild(logLine);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  // Bind log outputs from modules
  McpSimulator.setLogCallback(appendTelemetryLog);
  AgentSystem.setLogCallback(appendTelemetryLog);
  ProactiveModule.init(appendTelemetryLog);
  LegacyModule.init(appendTelemetryLog);

  // Clear Terminal Button
  const btnClearTerminal = document.getElementById('btn-clear-terminal');
  if (btnClearTerminal) {
    btnClearTerminal.addEventListener('click', () => {
      terminalLogs.innerHTML = `<span class="log-line text-muted">[System] Logs cleared. Waiting for events...</span>`;
    });
  }

  // ==========================================
  // SPA View Navigation
  // ==========================================
  const navButtons = document.querySelectorAll('.nav-btn');
  const appViews = document.querySelectorAll('.app-view');
  const headerTitle = document.querySelector('.top-bar h1');
  const headerSubtitle = document.querySelector('.top-bar .subtitle');

  function switchView(viewName) {
    appViews.forEach(view => {
      view.classList.remove('active');
    });
    navButtons.forEach(btn => {
      btn.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewName}`);
    const targetBtn = document.querySelector(`[data-view="${viewName}"]`);
    
    if (targetView && targetBtn) {
      targetView.classList.add('active');
      targetBtn.classList.add('active');
    }

    // Update Header Text depending on view
    switch (viewName) {
      case 'dashboard':
        headerTitle.innerText = "Family Twin Dashboard";
        headerSubtitle.innerText = "Proactive intelligence keeping your family in sync.";
        break;
      case 'chat':
        headerTitle.innerText = "Antigravity Concierge Chat";
        headerSubtitle.innerText = "Speak with your digital twin network. Strict role filters apply.";
        break;
      case 'vault':
        headerTitle.innerText = "Knowledge Vault";
        headerSubtitle.innerText = "Structured document storage with owner permissions.";
        renderVaultList();
        break;
      case 'legacy':
        headerTitle.innerText = "Living Legacy Archive";
        headerSubtitle.innerText = "Verified historical records. Zero generated hallucinations.";
        LegacyModule.renderTimeline();
        break;
      case 'privacy':
        headerTitle.innerText = "Privacy Matrix Configuration";
        headerSubtitle.innerText = "Review sub-agent access authorization lists.";
        renderPrivacyMatrix();
        break;
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.getAttribute('data-view'));
    });
  });

  // ==========================================
  // Role Switcher Logic
  // ==========================================
  const roleSelector = document.getElementById('role-selector');
  const currentAvatar = document.getElementById('current-user-avatar');
  const currentName = document.getElementById('current-user-name');
  const currentRole = document.getElementById('current-user-role');

  function handleRoleChange(userKey) {
    const userObj = SecurityModule.setActiveUser(userKey);
    if (!userObj) return;

    // Update sidebar card
    currentAvatar.innerText = userObj.avatar;
    currentName.innerText = userObj.name;
    currentRole.innerText = userObj.role;

    // Log the change
    appendTelemetryLog({
      timestamp: new Date().toISOString().substring(11, 19),
      type: 'system',
      message: `Active session role switched to: ${userObj.name} (${userObj.role})`
    });

    // Update highlights on Family Cards
    document.querySelectorAll('.family-card').forEach(card => {
      card.classList.remove('active-user-highlight');
    });
    
    const cardMap = {
      dad: 'fam-dad',
      mom: 'fam-mom',
      son: 'fam-son',
      daughter: 'fam-daughter',
      grandma: 'fam-grandma'
    };
    
    const activeCard = document.getElementById(cardMap[userKey]);
    if (activeCard) {
      activeCard.classList.add('active-user-highlight');
    }

    // Refresh views to adjust permissions display
    const activeViewEl = document.querySelector('.app-view.active');
    if (activeViewEl) {
      const activeViewId = activeViewEl.id.replace('view-', '');
      if (activeViewId === 'vault') {
        renderVaultList();
      }
    }
  }

  roleSelector.addEventListener('change', (e) => {
    handleRoleChange(e.target.value);
  });

  // Family Cards Click Handler to Switch Roles directly by clicking on cards
  const familyCards = [
    { id: 'fam-dad', key: 'dad' },
    { id: 'fam-mom', key: 'mom' },
    { id: 'fam-son', key: 'son' },
    { id: 'fam-daughter', key: 'daughter' },
    { id: 'fam-grandma', key: 'grandma' }
  ];

  familyCards.forEach(card => {
    const cardEl = document.getElementById(card.id);
    if (cardEl) {
      cardEl.addEventListener('click', () => {
        roleSelector.value = card.key;
        handleRoleChange(card.key);
      });
    }
  });

  // Pre-highlight Dad initially
  document.getElementById('fam-dad').classList.add('active-user-highlight');

  // ==========================================
  // Knowledge Vault Operations
  // ==========================================
  let activeVaultCategory = 'all';
  const filterTags = document.querySelectorAll('.filter-tag');

  filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      filterTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      activeVaultCategory = tag.getAttribute('data-category');
      renderVaultList();
    });
  });

  function renderVaultList() {
    const listContainer = document.getElementById('vault-list-container');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const items = McpSimulator.storage.db;
    
    const filteredItems = items.filter(item => {
      if (activeVaultCategory === 'all') return true;
      return item.category === activeVaultCategory;
    });

    if (filteredItems.length === 0) {
      listContainer.innerHTML = '<div class="empty-list">No entries found for this filter.</div>';
      return;
    }

    filteredItems.forEach(item => {
      const accessCheck = SecurityModule.checkAccess(item);
      const card = document.createElement('div');
      card.className = 'vault-card';

      const iconMap = {
        document: '📄',
        credentials: '🔑',
        health: '🩺',
        legacy: '📜'
      };

      const ownerName = SecurityModule.users[item.owner].name;

      if (accessCheck.allowed) {
        card.innerHTML = `
          <div class="vault-info-left">
            <div class="vault-icon-box">${iconMap[item.category] || '📁'}</div>
            <div class="vault-details">
              <h4>${item.title}</h4>
              <p>Physical Location: <span class="loc-label">${item.location}</span></p>
              <p style="margin-top:0.25rem; font-family:var(--font-body); background:rgba(255,255,255,0.03); padding:0.35rem 0.5rem; border-radius:4px; font-size:0.8rem;">
                Vault Data: <code>${item.value}</code>
              </p>
            </div>
          </div>
          <div class="vault-info-right">
            <span class="vault-owner-badge">Owner: ${ownerName.split(' ')[0]}</span>
            <span class="vault-privacy-pill">${item.privacyLevel}</span>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="vault-info-left" style="opacity:0.6;">
            <div class="vault-icon-box">🔒</div>
            <div class="vault-details">
              <h4>${item.title} (Restricted)</h4>
              <p>Physical Location: <span class="text-muted">*Access Denied*</span></p>
              <p style="margin-top:0.25rem; font-size:0.75rem; color:var(--accent-rose); font-style:italic;">
                ⚠️ Access Blocked: ${accessCheck.reason}
              </p>
            </div>
          </div>
          <div class="vault-info-right">
            <span class="vault-owner-badge" style="opacity:0.5;">Owner: ${ownerName.split(' ')[0]}</span>
            <span class="vault-privacy-pill private">${item.privacyLevel}</span>
          </div>
        `;
      }
      
      listContainer.appendChild(card);
    });
  }

  // Form Submission for uploading items
  document.getElementById('btn-save-vault-item').addEventListener('click', async () => {
    const title = document.getElementById('new-item-title').value.trim();
    const category = document.getElementById('new-item-category').value;
    const location = document.getElementById('new-item-location').value.trim() || 'Digital Archive';
    const owner = document.getElementById('new-item-owner').value;
    const value = document.getElementById('new-item-value').value.trim();

    if (!title || !value) {
      alert("Please fill in a title and node value content.");
      return;
    }

    const privacyLevelMap = {
      document: 'Restricted',
      credentials: 'Family',
      health: 'Emergency',
      legacy: 'Family'
    };

    const newItem = {
      title,
      category,
      owner,
      location,
      value,
      privacyLevel: privacyLevelMap[category] || 'Family'
    };

    // Trigger loading nodes
    appendTelemetryLog({
      timestamp: new Date().toISOString().substring(11, 19),
      type: 'system',
      message: `Initiating upload flow for new node: "${title}"`
    });

    await McpSimulator.storage.insert(newItem);
    
    // Clear inputs
    document.getElementById('new-item-title').value = '';
    document.getElementById('new-item-location').value = '';
    document.getElementById('new-item-value').value = '';

    renderVaultList();
  });

  // ==========================================
  // Privacy Matrix Rendering
  // ==========================================
  function renderPrivacyMatrix() {
    const tbody = document.getElementById('privacy-matrix-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    const matrix = SecurityModule.getPermissionMatrix();

    matrix.forEach(row => {
      const tr = document.createElement('tr');
      
      let html = `
        <td>
          <strong>${row.name}</strong><br>
          <span class="text-muted" style="font-size:0.7rem;">Owner: ${row.owner}</span>
        </td>
      `;

      ['dad', 'mom', 'son', 'daughter', 'grandma'].forEach(u => {
        const perm = row.permissions[u] || 'Deny';
        let cls = 'deny';
        if (perm.includes('Read/Write')) cls = 'read';
        else if (perm.includes('Read')) cls = 'write';
        else if (perm.includes('Emergency')) cls = 'emergency';

        html += `<td class="perm-cell ${cls}">${perm}</td>`;
      });

      tr.innerHTML = html;
      tbody.appendChild(tr);
    });
  }

  // ==========================================
  // Visualizer Node Connection SVG Engine
  // ==========================================
  function drawConnectorLines() {
    const svg = document.getElementById('nodes-svg-links');
    const container = document.getElementById('nodes-canvas-wrapper');
    if (!svg || !container) return;
    
    svg.innerHTML = ''; // Clear SVG
    
    const connections = [
      { from: 'node-user', to: 'node-concierge', id: 'link-user-concierge' },
      { from: 'node-concierge', to: 'node-antigravity', id: 'link-concierge-antigravity' },
      
      { from: 'node-antigravity', to: 'node-emergency', id: 'link-antigravity-emergency' },
      { from: 'node-antigravity', to: 'node-knowledge', id: 'link-antigravity-knowledge' },
      { from: 'node-antigravity', to: 'node-legacy', id: 'link-antigravity-legacy' },
      { from: 'node-antigravity', to: 'node-coordinator', id: 'link-antigravity-coordinator' },
      { from: 'node-antigravity', to: 'node-privacy', id: 'link-antigravity-privacy' },
      { from: 'node-antigravity', to: 'node-proactive', id: 'link-antigravity-proactive' },
      
      { from: 'node-emergency', to: 'node-mcp-medical', id: 'link-emergency-medical' },
      { from: 'node-knowledge', to: 'node-mcp-storage', id: 'link-knowledge-storage' },
      { from: 'node-legacy', to: 'node-mcp-legacy', id: 'link-legacy-legacy' },
      { from: 'node-coordinator', to: 'node-mcp-calendar', id: 'link-coordinator-calendar' },

      // Direct bypass links when talking directly to sub-agents
      { from: 'node-user', to: 'node-emergency', id: 'link-user-emergency' },
      { from: 'node-user', to: 'node-knowledge', id: 'link-user-knowledge' },
      { from: 'node-user', to: 'node-legacy', id: 'link-user-legacy' },
      { from: 'node-user', to: 'node-coordinator', id: 'link-user-coordinator' },
      { from: 'node-user', to: 'node-privacy', id: 'link-user-privacy' },
      { from: 'node-user', to: 'node-proactive', id: 'link-user-proactive' }
    ];
    
    const containerRect = container.getBoundingClientRect();
    
    connections.forEach(conn => {
      // Direct links logic: only render direct line if we are actively chatting with that sub-agent
      if (conn.id.startsWith('link-user-') && conn.to !== 'node-concierge') {
        const agentName = conn.to.replace('node-', '');
        if (activeChatAgent !== agentName) return;
      }

      const fromEl = document.getElementById(conn.from);
      const toEl = document.getElementById(conn.to);
      if (!fromEl || !toEl) return;
      
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      
      // Centers relative to container
      const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
      const x2 = toRect.left + toRect.width / 2 - containerRect.left;
      const y2 = toRect.top + toRect.height / 2 - containerRect.top;
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('id', conn.id);
      
      svg.appendChild(line);
    });
  }

  // Visualizer controls hooks
  function uiHighlightNode(nodeId, isHighlighted) {
    const el = document.getElementById(`node-${nodeId}`);
    if (el) {
      if (isHighlighted) {
        el.classList.add('highlighted');
      } else {
        el.classList.remove('highlighted');
      }
    }
  }

  function uiLineFlow(fromNode, toNode, level = 'normal') {
    const lineId = `link-${fromNode}-${toNode}`;
    const line = document.getElementById(lineId);
    if (line) {
      line.className.baseVal = level === 'emergency' ? 'flow-pulse-emergency' : 'flow-pulse';
    }
  }

  function uiClearAllHighlights() {
    document.querySelectorAll('.viz-node').forEach(node => {
      node.classList.remove('highlighted');
    });
    document.querySelectorAll('#nodes-svg-links line').forEach(line => {
      line.className.baseVal = '';
    });
    
    // Status text set to idle
    const statusText = document.getElementById('visualizer-status-indicator');
    if (statusText) {
      statusText.innerText = SecurityModule.emergencyModeActive ? "Emergency Active" : "Idle";
      statusText.className = SecurityModule.emergencyModeActive ? "visualizer-status emergency" : "visualizer-status";
    }
  }

  AgentSystem.setUiHandlers(uiHighlightNode, uiLineFlow, uiClearAllHighlights);

  // Redraw links on window resizing
  window.addEventListener('resize', drawConnectorLines);
  // Brief delay to allow rendering offsets to compute
  setTimeout(drawConnectorLines, 500);

  // ==========================================
  // AI Concierge Chat Dialog Binding (Multi-Chatbot support)
  // ==========================================
  let activeChatAgent = 'concierge';

  const chatHistories = {
    concierge: [
      { sender: "Antigravity Concierge", text: "Welcome to the Family Concierge. Ask me anything. I can delegate your request to specialized agents (Knowledge, Legacy, Emergency) while ensuring strict role-based privacy filters.", isAi: true }
    ],
    knowledge: [
      { sender: "Knowledge Agent", text: "Knowledge Agent direct terminal. Ask me directly about passwords, documents, locations, or recipes. (Queries typed here bypass the Concierge and talk to me directly.)", isAi: true }
    ],
    emergency: [
      { sender: "Emergency Agent", text: "Emergency Agent direct terminal. Ask me directly about Grandma Elena's medical status, doctor numbers, allergies, or preferred hospital.", isAi: true }
    ],
    legacy: [
      { sender: "Legacy Agent", text: "Legacy Agent direct terminal. Ask me directly about stories, recordings, or advice.", isAi: true }
    ],
    coordinator: [
      { sender: "Coordinator Agent", text: "Coordinator Agent direct terminal. Ask me to list schedule details, or add a task via 'add task [details]'.", isAi: true }
    ],
    privacy: [
      { sender: "Privacy Agent", text: "Privacy Agent direct terminal. Ask me to audit your current role's clearances or list folder security settings.", isAi: true }
    ],
    proactive: [
      { sender: "Proactive Agent", text: "Proactive Agent direct terminal. Query me to trigger background scans.", isAi: true }
    ]
  };

  const chatMessages = document.getElementById('chat-messages-container');
  const chatInput = document.getElementById('chat-user-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const clearChatBtn = document.getElementById('btn-clear-chat');

  function renderActiveChatHistory() {
    if (!chatMessages) return;
    chatMessages.innerHTML = '';
    const history = chatHistories[activeChatAgent] || [];
    history.forEach(msg => {
      appendChatBubbleHTML(msg.sender, msg.text, msg.isAi);
    });
  }

  function appendChatBubbleHTML(sender, text, isAi = false) {
    if (!chatMessages) return;

    const msg = document.createElement('div');
    msg.className = `message ${isAi ? 'ai' : 'user'}`;
    
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    msg.innerHTML = `
      <strong>${sender}:</strong>
      <div>${text}</div>
      <span class="message-meta">${timeStr}</span>
    `;

    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function handleUserChatMessage(text) {
    const queryText = text.trim();
    if (!queryText) return;

    chatInput.value = '';

    // Save to current history
    const currentUser = SecurityModule.getActiveUserObj();
    chatHistories[activeChatAgent].push({ sender: currentUser.name, text: queryText, isAi: false });
    appendChatBubbleHTML(currentUser.name, queryText, false);

    const statusText = document.getElementById('visualizer-status-indicator');
    if (statusText) {
      statusText.innerText = "Orchestrating";
      statusText.className = "visualizer-status active";
    }

    let response;
    let senderName = "Antigravity Twin";

    // Route message depending on active chatbot agent
    if (activeChatAgent === 'concierge') {
      response = await AgentSystem.conciergeReceive(queryText);
      senderName = "Antigravity Twin";
    } else if (activeChatAgent === 'knowledge') {
      response = await AgentSystem.knowledgeAgentReceive(queryText);
      senderName = "Knowledge Agent";
    } else if (activeChatAgent === 'emergency') {
      response = await AgentSystem.emergencyAgentReceive(queryText);
      senderName = "Emergency Agent";
    } else if (activeChatAgent === 'legacy') {
      response = await AgentSystem.legacyAgentReceive(queryText);
      senderName = "Legacy Agent";
    } else if (activeChatAgent === 'coordinator') {
      response = await AgentSystem.coordinatorAgentReceive(queryText);
      senderName = "Coordinator Agent";
    } else if (activeChatAgent === 'privacy') {
      response = await AgentSystem.privacyAgentReceive(queryText);
      senderName = "Privacy Agent";
    } else if (activeChatAgent === 'proactive') {
      response = await AgentSystem.proactiveAgentReceive(queryText);
      senderName = "Proactive Agent";
    }

    // Save AI reply to history
    chatHistories[activeChatAgent].push({ sender: senderName, text: response.text, isAi: true });
    appendChatBubbleHTML(senderName, response.text, true);

    if (response.legacyItem) {
      appendTelemetryLog({
        timestamp: new Date().toISOString().substring(11, 19),
        type: 'success-log',
        message: `Verified Audio Track played in timeline: ${response.legacyItem.mediaUrl}`
      });
      switchView('legacy');
    }

    setTimeout(uiClearAllHighlights, 1500);
  }

  // Bind chatbot tabs switching
  const chatAgentTabs = document.querySelectorAll('.agent-chat-tab');
  const chatWrapperEl = document.getElementById('chat-wrapper-element');
  const chatAgentTitle = document.getElementById('chat-agent-title');

  chatAgentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      chatAgentTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const agent = tab.getAttribute('data-agent');
      activeChatAgent = agent;

      // Update Title & Class theme on Wrapper
      chatWrapperEl.className = `chat-wrapper theme-${agent}`;
      
      const niceNameMap = {
        concierge: "Antigravity Concierge Active",
        knowledge: "Knowledge Agent Direct Mode",
        emergency: "Emergency Agent Direct Mode",
        legacy: "Legacy Agent Direct Mode",
        coordinator: "Coordinator Agent Direct Mode",
        privacy: "Privacy Agent Direct Mode",
        proactive: "Proactive Agent Direct Mode"
      };
      
      chatAgentTitle.innerText = niceNameMap[agent] || `${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent Active`;

      appendTelemetryLog({
        timestamp: new Date().toISOString().substring(11, 19),
        type: 'system',
        message: `Chat channel switched to: ${agent.toUpperCase()} Agent Chatbot`
      });

      // Clear highlights and draw connection bypasses
      uiClearAllHighlights();
      drawConnectorLines();
      
      if (uiHighlightNode) {
        uiHighlightNode('user', true);
        uiHighlightNode(agent, true);
        uiLineFlow('user', agent, agent === 'emergency' ? 'emergency' : 'normal');
      }

      renderActiveChatHistory();
    });
  });

  chatSendBtn.addEventListener('click', () => {
    handleUserChatMessage(chatInput.value);
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUserChatMessage(chatInput.value);
    }
  });

  // Clear chat trigger
  clearChatBtn.addEventListener('click', () => {
    const defaultWelcome = {
      concierge: "Welcome to the Family Concierge. Ask me anything. I can delegate your request to specialized agents (Knowledge, Legacy, Emergency) while ensuring strict role-based privacy filters.",
      knowledge: "Knowledge Agent direct terminal. Ask me directly about passwords, documents, locations, or recipes.",
      emergency: "Emergency Agent direct terminal. Ask me directly about Grandma Elena's medical status, doctor numbers, allergies, or preferred hospital.",
      legacy: "Legacy Agent direct terminal. Ask me directly about stories, recordings, or advice.",
      coordinator: "Coordinator Agent direct terminal. Ask me to list schedule details, or add a task via 'add task [details]'.",
      privacy: "Privacy Agent direct terminal. Ask me to audit your current role's clearances or list folder security settings.",
      proactive: "Proactive Agent direct terminal. Query me to trigger background scans."
    };

    chatHistories[activeChatAgent] = [
      { sender: `${activeChatAgent.charAt(0).toUpperCase() + activeChatAgent.slice(1)} Agent`, text: defaultWelcome[activeChatAgent], isAi: true }
    ];
    
    renderActiveChatHistory();
    
    appendTelemetryLog({
      timestamp: new Date().toISOString().substring(11, 19),
      type: 'system',
      message: `${activeChatAgent.toUpperCase()} Agent Chat thread history reset.`
    });
  });

  // Suggested prompt pills binding
  document.querySelectorAll('.pill-btn').forEach(pill => {
    pill.addEventListener('click', (e) => {
      handleUserChatMessage(e.target.getAttribute('data-query'));
    });
  });

  // ==========================================
  // Preset Demo Workflows (Scenarios 1 to 4)
  // ==========================================

  // Scenario 1: Find Insurance (Son Denied -> Dad Approved)
  document.getElementById('sim-scenario-1').addEventListener('click', async () => {
    appendTelemetryLog({
      timestamp: new Date().toISOString().substring(11, 19),
      type: 'system',
      message: '*** DEMO WORKFLOW 1 STARTED: Privacy Check (Son vs. Dad) ***'
    });

    switchView('chat');
    
    // Step A: Switch to Son Leo
    roleSelector.value = 'son';
    handleRoleChange('son');
    await AgentSystem.delay(800);

    // Step B: Send Query as Son (Denied)
    await handleUserChatMessage("Where is the insurance paper?");
    await AgentSystem.delay(2800);

    // Step C: Switch to Dad Arthur
    roleSelector.value = 'dad';
    handleRoleChange('dad');
    await AgentSystem.delay(800);

    // Step D: Send Query as Dad (Allowed)
    await handleUserChatMessage("Where is the insurance paper?");
  });

  // Scenario 2: Emergency Mode Activation
  const emergencyTrigger = document.getElementById('btn-emergency-trigger');
  const simScenario2 = document.getElementById('sim-scenario-2');
  const emergencyOverlay = document.getElementById('emergency-overlay');
  const btnResolveEmergency = document.getElementById('btn-resolve-emergency');

  async function triggerEmergencyPipeline() {
    appendTelemetryLog({
      timestamp: new Date().toISOString().substring(11, 19),
      type: 'error-log',
      message: '*** DETECTED CRITICAL ALARM: GRANDMA ELENA COLLAPSED ***'
    });

    // Run parallel agents
    const response = await AgentSystem.orchestrateEmergency();

    // Populate Emergency Dashboard elements
    document.getElementById('em-subject-name').innerText = `${response.profile.name} (Grandma)`;
    document.getElementById('em-subject-blood').innerText = response.profile.bloodGroup;
    
    const allergyBadge = document.getElementById('em-subject-allergies');
    allergyBadge.innerText = response.profile.allergies.join(', ');

    // Render medicines list
    const medsUl = document.getElementById('em-subject-meds');
    medsUl.innerHTML = '';
    response.meds.forEach(med => {
      const li = document.createElement('li');
      li.className = 'em-med-item';
      li.innerHTML = `
        <strong>${med.name}</strong>
        <span>Schedule: ${med.schedule} (${med.purpose})</span>
      `;
      medsUl.appendChild(li);
    });

    // Populate contacts
    document.getElementById('em-subject-doc').innerText = response.profile.doctor;
    document.getElementById('em-subject-hosp').innerText = response.profile.hospital;
    document.getElementById('em-subject-ins-provider').innerText = response.insurance.provider;
    document.getElementById('em-subject-ins-policy').innerText = response.insurance.policyNum;
    document.getElementById('em-subject-ins-loc').innerText = response.insurance.location;

    // Render coordinator tasks
    const tasksDiv = document.getElementById('em-coordinator-tasks');
    tasksDiv.innerHTML = '';
    response.tasks.forEach(t => {
      const pill = document.createElement('div');
      pill.className = 'task-pill';
      pill.innerText = t;
      tasksDiv.appendChild(pill);
    });

    // Show high-visibility warning panel overlay
    emergencyOverlay.classList.add('active');

    // Visualizer status indicator
    const statusText = document.getElementById('visualizer-status-indicator');
    if (statusText) {
      statusText.innerText = "Emergency Active";
      statusText.className = "visualizer-status emergency";
    }
  }

  emergencyTrigger.addEventListener('click', triggerEmergencyPipeline);
  simScenario2.addEventListener('click', triggerEmergencyPipeline);

  // Close Emergency Modal
  btnResolveEmergency.addEventListener('click', () => {
    emergencyOverlay.classList.remove('active');
    SecurityModule.setEmergencyMode(false);
    uiClearAllHighlights();

    appendTelemetryLog({
      timestamp: new Date().toISOString().substring(11, 19),
      type: 'success-log',
      message: 'Emergency state cleared. Returning agent nodes to idle state.'
    });
  });

  // Scenario 3: Grandpa's Memory
  document.getElementById('sim-scenario-3').addEventListener('click', async () => {
    appendTelemetryLog({
      timestamp: new Date().toISOString().substring(11, 19),
      type: 'system',
      message: '*** DEMO WORKFLOW 3 STARTED: Verified Legacy Retrieval ***'
    });

    switchView('chat');
    await AgentSystem.delay(400);
    await handleUserChatMessage("Tell me Grandpa's favorite story.");
  });

  // Scenario 4: Proactive Audit Scan
  document.getElementById('sim-scenario-4').addEventListener('click', async () => {
    appendTelemetryLog({
      timestamp: new Date().toISOString().substring(11, 19),
      type: 'system',
      message: '*** DEMO WORKFLOW 4 STARTED: Background Proactive Scanning ***'
    });

    // Trigger agent scan
    const alerts = await AgentSystem.runProactiveAudit();
    
    // Update alert feed HTML
    ProactiveModule.renderAlerts(alerts);
    
    // Switch to dashboard view to see alerts
    switchView('dashboard');
    
    setTimeout(uiClearAllHighlights, 2000);
  });

  // Global Search AI Input Binding
  const globalSearchInput = document.getElementById('global-search-ai');
  if (globalSearchInput) {
    globalSearchInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        const query = globalSearchInput.value.trim();
        if (!query) return;
        
        globalSearchInput.value = ''; // Clear search bar
        
        // 1. Switch to Chat View
        switchView('chat');
        
        // 2. Select the Knowledge Agent Chatbot Tab
        const knowledgeTab = document.querySelector('.agent-chat-tab[data-agent="knowledge"]');
        if (knowledgeTab) {
          knowledgeTab.click(); // Switches agent, updates themes, history, highlights
        }
        
        // 3. Submit the search query directly to the Knowledge Agent Chatbot!
        await handleUserChatMessage(query);
      }
    });
  }

  // Trigger default Proactive audit on startup
  setTimeout(async () => {
    const alerts = await AgentSystem.runProactiveAudit();
    ProactiveModule.renderAlerts(alerts);
    uiClearAllHighlights();
  }, 1000);

});
