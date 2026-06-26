/**
 * Family Concierge AI - Living Legacy Memory Archive
 */

const LegacyModule = {
  activeAudioId: null,

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
        agent: 'Legacy Agent',
        message: message,
        data: detail
      });
    }
  },

  renderTimeline() {
    const container = document.getElementById('legacy-timeline-container');
    if (!container) return;

    const memories = McpSimulator.legacy.memories;
    container.innerHTML = '';

    memories.forEach(memory => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      
      const barsHtml = Array(35).fill(0).map((_, i) => `<div class="wave-bar ${i < 15 ? 'fill' : ''}"></div>`).join('');

      item.innerHTML = `
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-header-meta">
            <span class="date">${memory.recordedDate}</span>
            <span class="badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Verified (Conf: 100%)
            </span>
          </div>
          <h4>${memory.title}</h4>
          <p class="story-text">"${memory.story}"</p>
          
          <div class="legacy-audio-player" id="audio-player-${memory.id}">
            <button class="audio-play-btn" onclick="LegacyModule.toggleAudio('${memory.id}')" id="play-btn-${memory.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" id="play-icon-${memory.id}"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <div class="waveform-viz">
              ${barsHtml}
            </div>
            <span class="audio-duration">0:45</span>
          </div>
          
          <div class="mt-2" style="font-size:0.7rem; color:var(--text-dark);">
            <span>Hash Integrity: <code>${memory.verificationHash}</code></span>
          </div>
        </div>
      `;
      container.appendChild(item);
    });
  },

  toggleAudio(memoryId) {
    const playerEl = document.getElementById(`audio-player-${memoryId}`);
    const playBtn = document.getElementById(`play-btn-${memoryId}`);
    const playIcon = document.getElementById(`play-icon-${memoryId}`);
    
    if (this.activeAudioId && this.activeAudioId !== memoryId) {
      // Stop previous
      const prevPlayer = document.getElementById(`audio-player-${this.activeAudioId}`);
      const prevBtn = document.getElementById(`play-btn-${this.activeAudioId}`);
      const prevIcon = document.getElementById(`play-icon-${this.activeAudioId}`);
      if (prevPlayer) prevPlayer.classList.remove('playing');
      if (prevIcon) prevIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
      this.log(`Stopped playing audio file for "${this.activeAudioId}"`);
    }

    if (playerEl.classList.contains('playing')) {
      // Pause
      playerEl.classList.remove('playing');
      playIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
      this.log(`Paused audio file: "${memoryId}"`);
      this.activeAudioId = null;
    } else {
      // Play
      playerEl.classList.add('playing');
      // Set pause icon
      playIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
      this.log(`Playing verified legacy recording: "${memoryId}"`, `Source file: ${McpSimulator.legacy.memories.find(m => m.id === memoryId).mediaUrl}`);
      this.activeAudioId = memoryId;
    }
  }
};
