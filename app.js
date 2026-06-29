/**
 * CivicMind AI - Main Application & State Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // Global Database & State
  // ==========================================
  const issueRegistry = [
    {
      id: "CIV-8419",
      category: "leak",
      title: "Broken Hydrant Water Leak",
      desc: "Water is spraying onto the pedestrian lane, causing flooding and hazardous footing.",
      sector: "Sector 4",
      x: 10,
      z: -15,
      severity: "Critical",
      urgency: 9.2,
      department: "Water & Sanitation Dept",
      impact: "Severe sub-surface soil erosion, potential sinkhole formation, and drinkable water waste.",
      status: "Reported",
      votes: 1,
      consensus: 50, // % consensus
      reportedBy: "Sarah Jenkins",
      timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      id: "CIV-9218",
      category: "pothole",
      title: "Deep Pothole Center Lane",
      desc: "Large pothole in the middle of the road, forcing cars to swerve into opposing lanes.",
      sector: "Sector 3",
      x: -20,
      z: 25,
      severity: "High",
      urgency: 7.8,
      department: "Public Works Department",
      impact: "High danger of vehicle chassis deformation, tire blowouts, and swerving collisions.",
      status: "Verified",
      votes: 8,
      consensus: 85,
      reportedBy: "Marcus K.",
      timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    },
    {
      id: "CIV-7301",
      category: "streetlight",
      title: "Faulty Streetlight Sector 4",
      desc: "Double streetlight out on commercial boulevard. Pitch black section near shopping precinct.",
      sector: "Sector 4",
      x: 25,
      z: 10,
      severity: "Low",
      urgency: 3.5,
      department: "Department of Energy & Lighting",
      impact: "Reduced safety perception, increased crime risk, and vehicle-pedestrian visibility impairment.",
      status: "In Progress",
      votes: 14,
      consensus: 100,
      reportedBy: "Alex Mercer",
      timestamp: new Date(Date.now() - 14400000).toISOString() // 4 hours ago
    },
    {
      id: "CIV-5192",
      category: "garbage",
      title: "Hazardous Chemical Disposal",
      desc: "Drums with warning labels abandoned on sidewalk adjacent to public park.",
      sector: "Sector 5",
      x: -35,
      z: -25,
      severity: "Critical",
      urgency: 9.8,
      department: "Public Safety & Power Grid",
      impact: "Severe toxicity hazard, direct soil pollution, and public contact safety danger.",
      status: "Assigned",
      votes: 21,
      consensus: 95,
      reportedBy: "Officer Chen",
      timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    }
  ];

  // User Profile Configurations
  const userProfiles = {
    hero: {
      name: "Alex Mercer",
      avatar: "AM",
      role: "Civic Hero",
      xp: 980,
      level: 4,
      reports: 32,
      votes: 145,
      trust: 98
    },
    citizen: {
      name: "Sarah Jenkins",
      avatar: "SJ",
      role: "Citizen",
      xp: 420,
      level: 2,
      reports: 4,
      votes: 28,
      trust: 85
    },
    officer: {
      name: "Officer Chen",
      avatar: "OC",
      role: "Public Safety Officer",
      xp: 1250,
      level: 5,
      reports: 55,
      votes: 310,
      trust: 100
    }
  };

  let currentUserKey = 'hero';
  let chartInstance = null;

  // ==========================================
  // Navigation & SPA Logic
  // ==========================================
  const navButtons = document.querySelectorAll('.nav-btn');
  const appViews = document.querySelectorAll('.app-view');
  const viewTitle = document.getElementById('view-title');
  const viewSubtitle = document.getElementById('view-subtitle');

  function switchView(viewName) {
    appViews.forEach(view => view.classList.remove('active'));
    navButtons.forEach(btn => btn.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewName}`);
    const targetBtn = document.querySelector(`[data-view="${viewName}"]`);
    
    if (targetView && targetBtn) {
      targetView.classList.add('active');
      targetBtn.classList.add('active');
    }

    // Refresh telemetry logs and header
    switch(viewName) {
      case 'dashboard':
        viewTitle.innerText = "Command Center";
        viewSubtitle.innerText = "Dynamic diagnostic twin controls and predictive analysis for Sector 4.";
        setTimeout(initPerformanceChart, 100);
        break;
      case 'twin':
        viewTitle.innerText = "3D Digital Twin";
        viewSubtitle.innerText = "Procedurally mapped smart twin showing hazards, traffic grid flows, and health markers.";
        // Trigger resize to fix canvas size issues
        if (window.City3D && City3D.onWindowResize) {
          setTimeout(() => City3D.onWindowResize(), 100);
        }
        break;
      case 'report':
        viewTitle.innerText = "Smart Reporting";
        viewSubtitle.innerText = "Auto-classify issue parameters and inspect for duplicate entries near coordinates.";
        break;
      case 'verification':
        viewTitle.innerText = "Verification Hub";
        viewSubtitle.innerText = "Upvote reports to confirm legitimacy or report duplicates to AI coordinator.";
        renderVerificationFeed();
        break;
      case 'gamification':
        viewTitle.innerText = "Civic Ranks & Rewards";
        viewSubtitle.innerText = "Review contributions, unlock achievements, and climb local leaderboards.";
        updateGamificationView();
        break;
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.getAttribute('data-view'));
    });
  });

  // Connect on-screen D-Pad flight buttons to City3D keys state
  const dpadButtons = [
    { id: 'btn-dpad-forward', key: 'w' },
    { id: 'btn-dpad-backward', key: 's' },
    { id: 'btn-dpad-left', key: 'a' },
    { id: 'btn-dpad-right', key: 'd' },
    { id: 'btn-dpad-up', key: 'e' },
    { id: 'btn-dpad-down', key: 'q' }
  ];

  dpadButtons.forEach(btnInfo => {
    const btnEl = document.getElementById(btnInfo.id);
    if (btnEl) {
      btnEl.addEventListener('mousedown', () => { City3D.keys[btnInfo.key] = true; });
      btnEl.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        City3D.keys[btnInfo.key] = true; 
      });
      btnEl.addEventListener('mouseup', () => { City3D.keys[btnInfo.key] = false; });
      btnEl.addEventListener('mouseleave', () => { City3D.keys[btnInfo.key] = false; });
      btnEl.addEventListener('touchend', () => { City3D.keys[btnInfo.key] = false; });
    }
  });

  // ==========================================
  // Telemetry Console Logger
  // ==========================================
  const terminalLogs = document.getElementById('telemetry-body-logs');

  function appendTelemetryLog(message, type = 'system-log') {
    if (!terminalLogs) return;
    const logLine = document.createElement('span');
    logLine.className = `log-line ${type}`;
    
    const timeStr = new Date().toLocaleTimeString([], { hour12: false });
    logLine.innerText = `[${timeStr}] ${message}`;
    
    terminalLogs.appendChild(logLine);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  // Set global logger callback for sub-modules
  window.appLogCallback = appendTelemetryLog;

  const btnClearTelemetry = document.getElementById('btn-clear-telemetry');
  if (btnClearTelemetry) {
    btnClearTelemetry.addEventListener('click', () => {
      terminalLogs.innerHTML = `<span class="log-line system-log">[System] Logs cleared. Listening to telemetry feeds...</span>`;
    });
  }

  // ==========================================
  // Department Performance Chart (Chart.js)
  // ==========================================
  function initPerformanceChart() {
    const ctx = document.getElementById('deptPerformanceChart');
    if (!ctx) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const data = {
      labels: ['Water & San.', 'Public Works', 'Energy & Light', 'Waste & Env.', 'Public Safety'],
      datasets: [{
        label: 'Average Response Time (Hours)',
        data: [1.8, 2.4, 4.2, 3.1, 0.9],
        backgroundColor: [
          'rgba(0, 240, 255, 0.15)',
          'rgba(189, 0, 255, 0.15)',
          'rgba(255, 184, 0, 0.15)',
          'rgba(0, 255, 102, 0.15)',
          'rgba(255, 0, 85, 0.15)'
        ],
        borderColor: [
          '#00f0ff',
          '#bd00ff',
          '#ffb800',
          '#00ff66',
          '#ff0055'
        ],
        borderWidth: 1.5,
        hoverBackgroundColor: [
          'rgba(0, 240, 255, 0.3)',
          'rgba(189, 0, 255, 0.3)',
          'rgba(255, 184, 0, 0.3)',
          'rgba(0, 255, 102, 0.3)',
          'rgba(255, 0, 85, 0.3)'
        ]
      }]
    };

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#8b9bb4', font: { family: 'Inter' } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#8b9bb4', font: { family: 'Inter' } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // ==========================================
  // Role Switcher Logic
  // ==========================================
  const roleSelector = document.getElementById('role-selector');
  const avatarEl = document.getElementById('current-user-avatar');
  const nameEl = document.getElementById('current-user-name');
  const roleEl = document.getElementById('current-user-role');
  const xpEl = document.getElementById('current-user-xp');

  function handleRoleChange(userKey) {
    currentUserKey = userKey;
    const profile = userProfiles[userKey];
    if (!profile) return;

    avatarEl.innerText = profile.avatar;
    nameEl.innerText = profile.name;
    roleEl.innerText = profile.role;
    xpEl.innerText = `${profile.xp} XP`;
    
    // Update rep bar fill width
    const repFill = document.querySelector('.rep-bar-fill');
    if (repFill) {
      const percentage = (profile.xp % 1000) / 10;
      repFill.style.width = `${percentage}%`;
    }

    appendTelemetryLog(`Session key switched. Active profile: ${profile.name} (${profile.role})`, 'system-log');
    
    // Refresh verification feed and gamification lists
    renderVerificationFeed();
    updateGamificationView();
  }

  roleSelector.addEventListener('change', (e) => {
    handleRoleChange(e.target.value);
  });

  // ==========================================
  // Smart Reporting (Submit telemetries)
  // ==========================================
  const imgPresets = document.querySelectorAll('.img-preset');
  const btnSubmitReport = document.getElementById('btn-submit-report');
  const scanFrame = document.querySelector('.scan-frame');
  const scanResults = document.getElementById('scan-results-card');

  let activePresetKey = 'pothole';

  imgPresets.forEach(preset => {
    preset.addEventListener('click', (e) => {
      imgPresets.forEach(p => p.classList.remove('active'));
      preset.classList.add('active');
      activePresetKey = preset.getAttribute('data-preset');
    });
  });

  btnSubmitReport.addEventListener('click', async () => {
    const xCoord = parseFloat(document.getElementById('coord-x').value) || 0;
    const zCoord = parseFloat(document.getElementById('coord-z').value) || 0;
    const descText = document.getElementById('report-desc').value.trim();
    const sector = document.getElementById('report-sector').value;

    appendTelemetryLog(`Broadcasting issue data stream to AI classifier...`, 'system-log');
    
    // Trigger Scanning Animation
    scanFrame.classList.add('scanning');
    
    // Reset Diagnostic box opacity
    scanResults.classList.remove('scanned');

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate scanning latency

    // Classify using AI Engine
    const weatherSelect = document.getElementById('weather-select');
    const weatherVal = weatherSelect ? weatherSelect.value : 'clear';
    const diag = AiEngine.diagnose(activePresetKey, descText);
    
    if (weatherVal === 'storm' || weatherVal === 'rain') {
      diag.urgency = Math.min(10.0, parseFloat(diag.urgency) + 1.2).toFixed(1);
    }

    // Duplicate Check
    const duplicate = AiEngine.checkDuplicate(xCoord, zCoord, issueRegistry);

    scanFrame.classList.remove('scanning');
    scanResults.classList.add('scanned');

    // Populate diagnostics box
    document.getElementById('diag-type').innerText = diag.type;
    document.getElementById('diag-severity').innerText = diag.severity;
    document.getElementById('diag-severity').className = `severity-pill ${diag.severity.toLowerCase()}`;
    document.getElementById('diag-urgency').innerText = `${diag.urgency}/10`;
    document.getElementById('diag-dept').innerText = diag.department;
    document.getElementById('diag-impact').innerText = diag.impact;

    if (duplicate) {
      appendTelemetryLog(`[AI Engine] DUPLICATE DETECTED. Incident matches coordinate bounds of existing ticket #${duplicate.id}`, 'error-log');
      
      // Update UI with warning banner or alerts
      document.getElementById('diag-impact').innerHTML = `⚠️ <span class="text-yellow">DUPLICATE ALERT: Same issue matches coordinates of ticket #${duplicate.id} (${duplicate.title})</span>. Telemetry archived as supporting consensus upvote instead.`;
      
      // Auto-vote up the duplicate instead
      duplicate.votes += 1;
      duplicate.consensus = Math.min(100, duplicate.consensus + 5);
      
      // Award minor XP for upvoting
      userProfiles[currentUserKey].xp += 25;
      handleRoleChange(currentUserKey);
    } else {
      // Create new ticket
      const newIssue = {
        id: `CIV-${Math.floor(1000 + Math.random() * 9000)}`,
        category: activePresetKey,
        title: diag.type + " " + sector,
        desc: descText || `Citizen reported ${diag.type} at Sector coordinates [${xCoord}, ${zCoord}]`,
        sector: sector,
        x: xCoord,
        z: zCoord,
        severity: diag.severity,
        urgency: parseFloat(diag.urgency),
        department: diag.department,
        impact: diag.impact,
        status: "Reported",
        votes: 1,
        consensus: 50,
        reportedBy: userProfiles[currentUserKey].name,
        timestamp: new Date().toISOString()
      };

      issueRegistry.push(newIssue);
      appendTelemetryLog(`[AI Engine] Diagnostic complete: Registered new incident ${newIssue.id}. Routing to ${newIssue.department}.`, 'success-log');

      // Create 3D marker in twin city
      if (window.City3D && City3D.addIssueMarker) {
        City3D.addIssueMarker(newIssue);
      }

      // Update XP & statistics
      userProfiles[currentUserKey].xp += 100;
      userProfiles[currentUserKey].reports += 1;
      handleRoleChange(currentUserKey);
      updateCityStats();

      // Clear input form
      document.getElementById('report-desc').value = '';
    }
  });

  // ==========================================
  // Verification Feed (consensus processing)
  // ==========================================
  const feedGrid = document.getElementById('verification-feed-grid');
  
  // Filters
  let activeFeedFilter = 'all';
  document.getElementById('btn-filter-all').addEventListener('click', () => setFeedFilter('all'));
  document.getElementById('btn-filter-critical').addEventListener('click', () => setFeedFilter('critical'));
  document.getElementById('btn-filter-duplicates').addEventListener('click', () => setFeedFilter('duplicates'));

  function setFeedFilter(filter) {
    document.querySelectorAll('.filter-buttons .btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-filter-${filter}`).classList.add('active');
    activeFeedFilter = filter;
    renderVerificationFeed();
  }

  function renderVerificationFeed() {
    if (!feedGrid) return;
    feedGrid.innerHTML = '';

    // Filter items
    let items = issueRegistry.filter(i => i.status !== 'Resolved');
    if (activeFeedFilter === 'critical') {
      items = items.filter(i => i.severity.toLowerCase() === 'critical');
    } else if (activeFeedFilter === 'duplicates') {
      // Find items with duplicates nearby just for visualization
      items = items.filter(i => {
        const others = issueRegistry.filter(o => o.id !== i.id && o.status !== 'Resolved');
        return AiEngine.checkDuplicate(i.x, i.z, others, 10.0) !== null;
      });
    }

    if (items.length === 0) {
      feedGrid.innerHTML = '<div class="empty-list">No pending reports match this telemetry filter.</div>';
      return;
    }

    items.forEach(issue => {
      const card = document.createElement('div');
      card.className = 'feed-card';

      // Check duplicates again to show UI warnings
      const others = issueRegistry.filter(o => o.id !== issue.id && o.status !== 'Resolved');
      const isDuplicate = AiEngine.checkDuplicate(issue.x, issue.z, others, 10.0) !== null;

      if (isDuplicate) {
        card.className += ' warn-duplicate';
      }

      card.innerHTML = `
        ${isDuplicate ? `<div class="duplicate-alert-banner"><i data-lucide="alert-triangle"></i> Proximity duplicate warning</div>` : ''}
        <div class="feed-card-header">
          <div>
            <h4>${issue.title}</h4>
            <span class="lbl">ID: ${issue.id} • ${issue.sector}</span>
          </div>
          <span class="severity-pill ${issue.severity.toLowerCase()}">${issue.severity}</span>
        </div>
        <p class="feed-card-body">${issue.desc}</p>
        <div class="feed-card-footer">
          <div class="consensus-count">
            <i data-lucide="users"></i> <span>${issue.votes} upvotes (${issue.consensus}% consensus)</span>
          </div>
          <div class="feed-actions">
            <button class="btn btn-tiny btn-cyber-primary btn-upvote" data-id="${issue.id}">
              <i data-lucide="thumbs-up"></i> Verify
            </button>
            <button class="btn btn-tiny btn-secondary btn-focus-twin" data-id="${issue.id}">
              <i data-lucide="focus"></i> Map
            </button>
          </div>
        </div>
      `;

      feedGrid.appendChild(card);
    });

    // Reinitialize lucide icons inside dynamically created cards
    lucide.createIcons();

    // Bind upvote click handlers
    document.querySelectorAll('.btn-upvote').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        upvoteIssue(id);
      });
    });

    // Bind focus click handlers
    document.querySelectorAll('.btn-focus-twin').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const issue = issueRegistry.find(i => i.id === id);
        if (issue) {
          switchView('twin');
          if (window.City3D && City3D.focusCamera) {
            City3D.focusCamera(issue.x, issue.z);
          }
        }
      });
    });
  }

  function upvoteIssue(issueId) {
    const issue = issueRegistry.find(i => i.id === issueId);
    if (!issue) return;

    issue.votes += 1;
    // Calculate consensus increases
    issue.consensus = Math.min(100, issue.consensus + 8);
    
    appendTelemetryLog(`[Community Feed] Upvote cast on issue ${issue.id} (${issue.title})`, 'success-log');

    // Lifecycle state promotion based on votes / consensus threshold
    if (issue.status === 'Reported' && issue.votes >= 3) {
      issue.status = 'Verified';
      appendTelemetryLog(`[AI Engine] Issue ${issue.id} has achieved consensus validation threshold. Upgraded status to VERIFIED.`, 'success-log');
    } else if (issue.status === 'Verified' && issue.votes >= 8) {
      issue.status = 'Assigned';
      appendTelemetryLog(`[AI Engine] Issue ${issue.id} dispatched to ${issue.department}. Status upgraded to ASSIGNED.`, 'ai-log');
    }

    // Award XP
    userProfiles[currentUserKey].xp += 30;
    userProfiles[currentUserKey].votes += 1;
    handleRoleChange(currentUserKey);
    
    renderVerificationFeed();
    updateCityStats();
  }

  // ==========================================
  // Gamification & Level Upgrades
  // ==========================================
  function updateGamificationView() {
    const profile = userProfiles[currentUserKey];
    if (!profile) return;

    // Calculate level overlay details
    const levelOverlayNum = document.querySelector('.level-num');
    const levelOverlayLbl = document.querySelector('.level-lbl');
    const circleFill = document.querySelector('.circle-fill');

    if (levelOverlayNum) {
      // Calculate level based on XP
      const computedLvl = Math.floor(profile.xp / 400) + 1;
      profile.level = computedLvl;
      
      let badgeTitle = 'Citizen';
      if (computedLvl >= 5) badgeTitle = 'Civic Legend';
      else if (computedLvl >= 3) badgeTitle = 'Civic Hero';
      else if (computedLvl >= 2) badgeTitle = 'Trusted Reporter';

      profile.role = badgeTitle;

      levelOverlayNum.innerText = `Lvl ${computedLvl}`;
      levelOverlayLbl.innerText = badgeTitle;

      // Adjust circular progress meter (dashoffset calculations)
      // circumference = 2 * PI * r = 2 * 3.14 * 40 = 251.2
      const nextLevelXp = computedLvl * 400;
      const currentLevelBaseXp = (computedLvl - 1) * 400;
      const xpInThisLevel = profile.xp - currentLevelBaseXp;
      const progressPct = xpInThisLevel / 400;
      const offset = 251.2 - (progressPct * 251.2);
      circleFill.style.strokeDashoffset = offset;
    }

    // Update stats recap row
    const recapItems = document.querySelectorAll('.stat-recap-item .recap-num');
    if (recapItems.length >= 3) {
      recapItems[0].innerText = profile.reports;
      recapItems[1].innerText = profile.votes;
      recapItems[2].innerText = `${profile.trust}%`;
    }

    // Re-render badges list classes based on levels
    const badgeCards = document.querySelectorAll('.badges-grid .badge-card');
    if (badgeCards.length >= 4) {
      if (profile.level >= 1) badgeCards[0].className = 'badge-card unlocked'; // Guardian
      if (profile.level >= 3) badgeCards[1].className = 'badge-card unlocked'; // Hazard
      if (profile.level >= 4) badgeCards[2].className = 'badge-card unlocked'; // Aqua
      if (profile.level >= 5) badgeCards[3].className = 'badge-card unlocked'; // King
      else badgeCards[3].className = 'badge-card locked';
    }
  }

  // ==========================================
  // Global Stats Updates
  // ==========================================
  function updateCityStats() {
    const activeCount = issueRegistry.filter(i => i.status !== 'Resolved').length;
    const resolvedCount = issueRegistry.filter(i => i.status === 'Resolved').length;
    const health = AiEngine.calculateCityHealth(issueRegistry);

    const healthEl = document.getElementById('stat-city-health');
    const activeEl = document.getElementById('stat-active-issues');
    const votesEl = document.getElementById('stat-votes-count');

    if (healthEl) healthEl.innerText = `${health}%`;
    if (activeEl) activeEl.innerText = activeCount;
    if (votesEl) {
      const totalVotes = issueRegistry.reduce((acc, curr) => acc + curr.votes, 0);
      votesEl.innerText = totalVotes;
    }

    // Adjust health coloring indicator class
    if (healthEl) {
      if (health >= 85) healthEl.className = 'stat-val text-green';
      else if (health >= 65) healthEl.className = 'stat-val text-yellow';
      else healthEl.className = 'stat-val text-red';
    }
  }

  // ==========================================
  // Inspect / Prevent button handler in Dashboard
  // ==========================================
  document.querySelectorAll('.btn-prevent').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sector = e.currentTarget.getAttribute('data-sec');
      const type = e.currentTarget.getAttribute('data-type');
      
      appendTelemetryLog(`[Preventative Maintenance] Drone dispatched to Sector ${sector} for preventive ${type} scan.`, 'success-log');
      
      // Auto upgrade XP
      userProfiles[currentUserKey].xp += 50;
      handleRoleChange(currentUserKey);
    });
  });

  // ==========================================
  // 3D Twin View Interaction Toggles
  // ==========================================
  const timeSlider = document.getElementById('time-slider');
  const btnToggleFog = document.getElementById('btn-toggle-fog');
  const btnToggleHeatmap = document.getElementById('btn-toggle-heatmap');
  const btnToggleTraffic = document.getElementById('btn-toggle-traffic');
  const btnCameraCinematic = document.getElementById('btn-camera-cinematic');
  const btnCameraFree = document.getElementById('btn-camera-free');

  timeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (window.City3D && City3D.setTimeOfDay) {
      City3D.setTimeOfDay(val);
    }
  });

  const weatherSelect = document.getElementById('weather-select');
  if (weatherSelect) {
    weatherSelect.addEventListener('change', (e) => {
      const type = e.target.value;
      if (window.City3D && City3D.setWeather) {
        City3D.setWeather(type);
      }
      appendTelemetryLog(`[Weather System] Active weather preset updated to: ${type.toUpperCase()}`, 'system-log');
    });
  }

  btnToggleFog.addEventListener('click', () => {
    btnToggleFog.classList.toggle('active');
    const active = btnToggleFog.classList.contains('active');
    if (window.City3D && City3D.setFog) {
      City3D.setFog(active);
    }
  });

  btnToggleHeatmap.addEventListener('click', () => {
    btnToggleHeatmap.classList.toggle('active');
    const active = btnToggleHeatmap.classList.contains('active');
    if (window.City3D && City3D.setHeatmap) {
      City3D.setHeatmap(active);
    }
  });

  btnToggleTraffic.addEventListener('click', () => {
    btnToggleTraffic.classList.toggle('active');
    const active = btnToggleTraffic.classList.contains('active');
    if (window.City3D && City3D.setTraffic) {
      City3D.setTraffic(active);
    }
  });

  btnCameraCinematic.addEventListener('click', () => {
    btnCameraCinematic.classList.add('active');
    btnCameraFree.classList.remove('active');
    if (window.City3D) {
      City3D.isCinematic = true;
      City3D.controls.enabled = false;
      appendTelemetryLog(`[3D Twin] Drone Camera fly-through mode initialized. Controls locked.`, 'system-log');
    }
  });

  btnCameraFree.addEventListener('click', () => {
    btnCameraFree.classList.add('active');
    btnCameraCinematic.classList.remove('active');
    if (window.City3D) {
      City3D.isCinematic = false;
      City3D.controls.enabled = true;
      appendTelemetryLog(`[3D Twin] Dynamic camera Orbit control returned to user session.`, 'system-log');
    }
  });

  // ==========================================
  // 3D Twin Raycaster Marker Interaction Callback
  // ==========================================
  const aiInsightsPanel = document.getElementById('ai-insights-panel');
  const btnCloseInsights = document.getElementById('btn-close-insights');
  const btnVoteInsight = document.getElementById('btn-vote-insight');
  
  let selectedIssueIdFromMarker = null;

  function onMarkerClickCallback(issue) {
    selectedIssueIdFromMarker = issue.id;
    
    // Fill insights panel data
    document.getElementById('ins-asset-id').innerText = `#CIV-${issue.id.split('-')[1] || issue.id}`;
    document.getElementById('ins-type').innerText = issue.title;
    document.getElementById('ins-severity').innerText = issue.severity;
    document.getElementById('ins-severity').className = `severity-pill ${issue.severity.toLowerCase()}`;
    document.getElementById('ins-urgency').innerText = `${issue.urgency}/10`;
    document.getElementById('ins-dept').innerText = issue.department;
    document.getElementById('ins-prediction').innerText = issue.impact;
    
    // Consensus bar
    const consensusFill = document.getElementById('ins-consensus-fill');
    const consensusText = document.getElementById('ins-consensus-text');
    if (consensusFill && consensusText) {
      consensusFill.style.width = `${issue.consensus}%`;
      consensusText.innerText = `${issue.consensus}% Consensus (${issue.votes} Verified Votes)`;
    }

    // Toggle panel visible
    aiInsightsPanel.classList.add('visible');
    
    // Focus camera
    if (window.City3D && City3D.focusCamera) {
      City3D.focusCamera(issue.x, issue.z);
    }

    appendTelemetryLog(`[3D Twin] Focused camera on marker. Accessing database parameters for ${issue.id}.`, 'system-log');
  }

  btnCloseInsights.addEventListener('click', () => {
    aiInsightsPanel.classList.remove('visible');
  });

  btnVoteInsight.addEventListener('click', () => {
    if (selectedIssueIdFromMarker) {
      upvoteIssue(selectedIssueIdFromMarker);
      
      // Update insights screen consensus values live
      const issue = issueRegistry.find(i => i.id === selectedIssueIdFromMarker);
      if (issue) {
        const consensusFill = document.getElementById('ins-consensus-fill');
        const consensusText = document.getElementById('ins-consensus-text');
        if (consensusFill && consensusText) {
          consensusFill.style.width = `${issue.consensus}%`;
          consensusText.innerText = `${issue.consensus}% Consensus (${issue.votes} Verified Votes)`;
        }
      }
    }
  });

  // ==========================================
  // Initialize Modules & Sub-systems
  // ==========================================
  
  // 1. Init 3D digital twin
  const onSensorDetectionCallback = (pedId, issueId) => {
    const issue = issueRegistry.find(i => i.id === issueId);
    if (!issue) return;

    // Log to telemetry panel
    appendTelemetryLog(`[Sensor Node #${pedId}] Proximity scan matched active anomaly #${issueId}: ${issue.title} in Sector ${issue.sector}.`, "success-log");

    // Add a minor consensus vote to this issue
    issue.votes += 1;
    updateIssuesList();

    // Spawn a temporary Jarvis assistant message alert in the chat!
    if (Math.random() > 0.6) {
      const messagesContainer = document.getElementById('jarvis-chat-messages');
      if (messagesContainer) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot-message';
        msgDiv.innerHTML = `
          <div class="bot-header" style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.25rem;">
            <span class="bot-name" style="color: var(--cyan); font-weight: 600;"><i data-lucide="bot" style="width: 12px; height: 12px; vertical-align: middle;"></i> Jarvis AI</span>
            <span class="bot-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div class="bot-text" style="font-size: 0.8rem; line-height: 1.3;">
            Notice: Mobile sensor #${pedId} validated telemetry status for active issue #${issueId} (${issue.title}). Consensus telemetry increased.
          </div>
        `;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        if (window.lucide) lucide.createIcons();
      }
    }
  };

  setTimeout(() => {
    City3D.init('city-twin-canvas-container', onMarkerClickCallback, onSensorDetectionCallback);

    // Populate Initial Markers
    issueRegistry.forEach(issue => {
      if (issue.status !== 'Resolved') {
        City3D.addIssueMarker(issue);
      }
    });

    // Draw Heatmap initially if checked
    const heatmapBtnActive = btnToggleHeatmap.classList.contains('active');
    City3D.setHeatmap(heatmapBtnActive);
  }, 100);

  // 2. Init Jarvis Assistant
  ChatAssistant.init(
    'jarvis-chat-messages',
    'jarvis-input',
    'btn-jarvis-send',
    () => issueRegistry
  );

  // 3. Init local widgets
  initPerformanceChart();
  updateCityStats();
  handleRoleChange('hero');

});
