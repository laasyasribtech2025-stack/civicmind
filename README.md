# 🌍 CivicMind AI — 3D Smart City Control OS

> **Futuristic government-grade AI control system for smart cities in 2040.** 

CivicMind AI is an interactive, real-time digital twin of a city. It enables citizens and municipal authorities to collaboratively identify, diagnose, validate, track, and resolve real-world infrastructure problems (leaks, potholes, grid failures, sanitation issues) using intelligent automation.

![CivicMind AI Dashboard Command Screen](https://raw.githubusercontent.com/laasyasribtech2025-stack/civicmind/main/README_banner.png) *(Note: Add your custom dashboard screenshot here)*

---

## ⚙️ Core Platform Features

### 1. 🌐 Interactive 3D Digital Twin Backdrop
* **WebGL Procedural Engine**: Built with Three.js, rendering a rotating and panning matrix of city sectors and buildings.
* **Severity Markers**: Glowing 3D diamond nodes (Critical, Warning, Safe) bobbing in space at the coordinates of reported issues.
* **Environmental Control Hub**: Toggles for atmospheric fog density, neon traffic flow particles, and color-coded risk heatmaps.
* **Solar Clock slider**: Real-time Day/Night cycle lighting controller, adjusting directional sun rays, ambient shadow values, and emissive window glows.
* **Cinematic Spline mode**: Automatic spline camera tracking for drone-view autonomous city sweeps.

### 2. 🧠 AI Diagnostic Decision Engine
* **Multimodal classification presets**: Auto-categorizes issues (Potholes, Water Leaks, Dead Streetlights, Overflowing Garbage, Fallen Powerlines).
* **AI diagnostics**: Instantly predicts community impact consequence metrics, outputs urgency urgency ratings (out of 10.0), and matches task routing to municipal departments.
* **Duplicate Proximity Scanner**: Scans grid coordinate distance bounds using 2D Euclidean math. If a duplicate is submitted within a close range, the AI flags it, redirects the entry, and records it as a consensus vote for the original issue.

### 3. ⛈️ Live Weather Twin Synchronizer
* **Precipitation Simulation**: Toggles for Clear, Rainy, and Stormy weather patterns, generating descending particle animations.
* **Lightning Discharges**: Storm mode triggers random bright structural lighting flashes and logs warning telemetry data.
* **Urgency Adjustments**: Rains and storms dynamically elevate the priority scores of critical power and water incidents.

### 4. 🤖 Jarvis Conversational Coordinator
* A conversational console docked on the right side of the screen.
* Resolves natural language commands like `"locate water leaks"`, `"focus critical hazards"`, `"inspect sector 4"`, `"audit departments"`, and `"trigger storm"`.
* Connects directly to the Three.js controls to focus camera angles on coordinates in real-time.

### 5. 🏆 Gamification & Verification Hub
* **Upvoting Consensus**: Community validation feed to filter fake reports. Tickets advance through states (*Reported → Verified → Assigned → In Progress → Resolved*) based on consensus.
* **Reporter Tiers**: Level upgrades based on XP contribution (Citizen → Trusted Reporter → Civic Hero → Civic Legend).
* **Badges showroom**: Unlock achievements like *Guardian Watcher*, *Hazard Shield*, and *Aqua Conservator*.

---

## 📁 Repository Structure

```
civicmind/
├── index.html          # Core layout (Apple Vision Pro glassmorphism HUD interface)
├── style.css           # Futuristic dark-theme variables, neon borders, and animations
├── app.js              # State manager, Chart.js integrations, upvote logic, and routing
├── city3d.js           # Three.js 3D backdrop renderer, camera splines, and weather particle setups
├── aiEngine.js         # Proximity duplicates check, diagnostic presets, and health indices
└── chatAssistant.js   # Jarvis assistant NLP parsing and camera-focus commands
```

---

## 🚀 Getting Started

No build tools, compilation pipelines, or local server dependencies are required!

1. Clone this repository:
   ```bash
   git clone https://github.com/laasyasribtech2025-stack/civicmind.git
   ```
2. Open the directory:
   ```bash
   cd civicmind
   ```
3. Open `index.html` directly in your favorite modern browser:
   * Double-click `index.html` or drag-and-drop it into Chrome/Edge/Safari.
   * Or serve it locally using a simple HTTP server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve
     ```

---

## 🎨 Technologies Used

* **Core**: HTML5, Vanilla JavaScript (ES6+ Modules)
* **Styling**: Modern CSS3 (CSS Custom Variables, Glassmorphism Backdrop-Blur, Neon Shadows, Keyframe sweeps)
* **3D Visualizer**: [Three.js](https://threejs.org/) (via CDN) + OrbitControls
* **Charts**: [Chart.js](https://www.chartjs.org/) (via CDN)
* **Icons**: [Lucide Icons](https://lucide.dev/) (via CDN)
