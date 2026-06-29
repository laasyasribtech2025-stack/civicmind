/**
 * CivicMind AI - Jarvis Chat Assistant
 */

const ChatAssistant = {
  chatContainer: null,
  inputField: null,
  sendBtn: null,
  issueDatabaseRef: null,
  
  init: function(chatContainerId, inputId, sendBtnId, issueDatabase) {
    this.chatContainer = document.getElementById(chatContainerId);
    this.inputField = document.getElementById(inputId);
    this.sendBtn = document.getElementById(sendBtnId);
    this.issueDatabaseRef = issueDatabase;

    if (!this.chatContainer || !this.inputField || !this.sendBtn) return;

    // Send click/keypress events
    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });

    // Preset command pills
    document.querySelectorAll('.chat-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const cmd = e.currentTarget.getAttribute('data-cmd');
        this.inputField.value = cmd;
        this.handleSend();
      });
    });
  },

  handleSend: function() {
    const text = this.inputField.value.trim();
    if (!text) return;

    this.inputField.value = '';
    
    // 1. Append User Bubble
    this.appendBubble(text, 'user');

    // 2. Process command
    setTimeout(() => {
      const response = this.processCommand(text);
      this.appendBubble(response, 'ai');
    }, 600);
  },

  appendBubble: function(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    bubble.innerHTML = `
      <div class="msg-bubble">${text}</div>
      <span class="msg-time">${time}</span>
    `;

    this.chatContainer.appendChild(bubble);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  },

  processCommand: function(rawCmd) {
    const cmd = rawCmd.toLowerCase();
    const activeIssues = this.issueDatabaseRef();
    
    // Log in telemetry
    if (window.appLogCallback) {
      window.appLogCallback(`[Jarvis AI] Processing command stream: "${rawCmd}"`, 'ai-log');
    }

    // Command: Weather Simulation adjustments
    if (cmd.includes('weather') || cmd.includes('rain') || cmd.includes('storm') || cmd.includes('clear')) {
      let type = 'clear';
      if (cmd.includes('rain')) type = 'rain';
      else if (cmd.includes('storm')) type = 'storm';

      if (window.City3D && City3D.setWeather) {
        City3D.setWeather(type);
        const wSelect = document.getElementById('weather-select');
        if (wSelect) wSelect.value = type;
      }
      return `Weather System modified: Adjusting environmental twin simulation to **${type.toUpperCase()}**. Alerting nearby infrastructure sensors.`;
    }

    // Command: Locate Leaks
    if (cmd.includes('leak') || cmd.includes('water')) {
      const leaks = activeIssues.filter(i => i.category === 'leak' && i.status !== 'Resolved');
      if (leaks.length === 0) {
        return "Analysis complete: No active water main leaks detected in Sector 4 telemetry.";
      }
      
      // Focus camera on first leak coordinate
      const target = leaks[0];
      if (window.City3D && City3D.focusCamera) {
        City3D.focusCamera(target.x, target.z);
      }

      return `Holographic locator updated. Detected ${leaks.length} active Water Main Leak(s). Zooming camera grid to coordinate X: ${target.x}, Z: ${target.z}.`;
    }

    // Command: Locate/Focus Criticals
    if (cmd.includes('critical') || cmd.includes('danger') || cmd.includes('hazard')) {
      const criticals = activeIssues.filter(i => i.severity.toLowerCase() === 'critical' && i.status !== 'Resolved');
      if (criticals.length === 0) {
        return "Grid search complete: Zero critical hazards registered in current sector.";
      }

      const target = criticals[0];
      if (window.City3D && City3D.focusCamera) {
        City3D.focusCamera(target.x, target.z);
      }

      return `Target acquired: Focusing camera on Critical incident #${target.id} (${target.title}) at grid coordinates [${target.x}, ${target.z}]. Routing to ${target.department}.`;
    }

    // Command: Inspect Departments
    if (cmd.includes('department') || cmd.includes('dept') || cmd.includes('inspect dept') || cmd.includes('audit')) {
      const depts = {};
      activeIssues.forEach(i => {
        if (i.status !== 'Resolved') {
          depts[i.department] = (depts[i.department] || 0) + 1;
        }
      });
      let responseText = "Department Case Load Report:<br>";
      for (let d in depts) {
        responseText += `• ${d}: <strong>${depts[d]} active issue(s)</strong><br>`;
      }
      if (Object.keys(depts).length === 0) responseText = "Department Audit: All city departments currently reporting 0 active incidents. Integrity values optimal.";
      return responseText;
    }

    // Command: Inspect Sector 4 or status of Sector 4
    if (cmd.includes('sector 4') || cmd.includes('health') || cmd.includes('inspect')) {
      const activeCount = activeIssues.filter(i => i.status !== 'Resolved').length;
      const resolvedCount = activeIssues.filter(i => i.status === 'Resolved').length;
      const score = AiEngine.calculateCityHealth(activeIssues);
      
      return `Sector 4 Command Briefing:<br>
      • Sector Health Index: <strong>${score}%</strong><br>
      • Active Incidents: <strong>${activeCount}</strong><br>
      • Resolved Incidents: <strong>${resolvedCount}</strong><br>
      AI assessment predicts normal telemetry grid stability. Preventative drones are patrolling.`;
    }

    // Command: How to report
    if (cmd.includes('report') || cmd.includes('submit')) {
      return "To broadcast an issue: Go to the 'Smart Reporting' view in the left sidebar, choose an image category preset, set your coordinates, add description tags, and click 'Broadcast Telemetry'.";
    }

    // Fallback AI conversation
    return `Command processed. I am analyzing the smart city twin databases. Active grid channels are stable. Please specify a sector diagnostic query or issue focus request.`;
  }
};
