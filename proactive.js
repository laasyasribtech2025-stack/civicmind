/**
 * Family Concierge AI - Proactive Monitoring Dashboard Module
 */

const ProactiveModule = {
  activeAlerts: [],

  // Telemetry log callback hook
  logCallback: null,

  init(logCallback) {
    this.logCallback = logCallback;
  },

  log(message, detail = null) {
    if (this.logCallback) {
      this.logCallback({
        timestamp: new Date().toISOString().substring(11, 19),
        type: 'agent-log',
        agent: 'Proactive Agent',
        message: message,
        data: detail
      });
    }
  },

  renderAlerts(alertsList) {
    this.activeAlerts = alertsList;
    const feed = document.getElementById('proactive-alerts-feed');
    if (!feed) return;

    if (alertsList.length === 0) {
      feed.innerHTML = `
        <div class="empty-alerts">
          <p class="text-muted">No pending alerts. Family security checks clear.</p>
        </div>
      `;
      return;
    }

    feed.innerHTML = '';
    alertsList.forEach(alert => {
      const card = document.createElement('div');
      card.className = `alert-card ${alert.type === 'critical' ? 'critical' : alert.type === 'info' ? 'info' : ''}`;
      card.id = alert.id;

      card.innerHTML = `
        <div class="alert-content">
          <h4>${alert.title}</h4>
          <p>${alert.description}</p>
          <div class="alert-meta">
            <span class="alert-badge">${alert.category}</span>
            <span class="text-muted">• Priority: ${alert.type.toUpperCase()}</span>
          </div>
        </div>
        <button class="alert-btn" onclick="ProactiveModule.resolveAlert('${alert.id}')">${alert.actionText}</button>
      `;
      feed.appendChild(card);
    });
  },

  resolveAlert(alertId) {
    const alert = this.activeAlerts.find(a => a.id === alertId);
    if (!alert) return;

    // Log the user action
    this.log(`Resolving Alert: "${alert.title}"`, `User clicked "${alert.actionText}"`);
    
    // Telemetry log from coordinator or proactive agent
    if (this.logCallback) {
      this.logCallback({
        timestamp: new Date().toISOString().substring(11, 19),
        type: 'success-log',
        server: 'Coordinator Agent',
        message: `Task automation completed: ${alert.actionText} for ${alert.title}`
      });
    }

    // Dynamic UI visual effect
    const cardEl = document.getElementById(alertId);
    if (cardEl) {
      cardEl.style.transform = 'scale(0.95)';
      cardEl.style.opacity = '0';
      cardEl.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        this.activeAlerts = this.activeAlerts.filter(a => a.id !== alertId);
        this.renderAlerts(this.activeAlerts);
      }, 300);
    }
  }
};
