/**
 * CivicMind AI - 3D Digital Twin City Engine (Three.js)
 */

const City3D = {
  container: null,
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  
  // Lights
  ambientLight: null,
  sunLight: null,
  
  // Settings
  isCinematic: false,
  fogEnabled: true,
  heatmapEnabled: false,
  trafficEnabled: true,
  
  // Database / Trackers
  buildings: [],
  markers: {}, // issueId -> marker mesh
  trafficParticles: null,
  heatmapPlanes: [],
  rainSystem: null,
  weatherState: 'clear',
  keys: {},
  
  // Animation path parameter
  pathTime: 0,
  onMarkerClick: null,

  init: function(containerId, onMarkerClick) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Clear loader if present
    this.container.innerHTML = '';
    this.onMarkerClick = onMarkerClick;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 500;

    // 1. Setup Scene & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05060e);
    this.scene.fog = new THREE.FogExp2(0x05060e, 0.015);

    // 2. Setup Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(40, 30, 45);

    // 3. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Setup Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1; // Don't allow camera below ground
    this.controls.minDistance = 5;
    this.controls.maxDistance = 150;

    // 5. Setup Lights
    this.ambientLight = new THREE.AmbientLight(0x0c0f2b, 0.8);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    this.sunLight.position.set(40, 60, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.scene.add(this.sunLight);

    // Secondary purple rim light
    this.rimLight = new THREE.DirectionalLight(0xbd00ff, 0.6);
    this.rimLight.position.set(-40, 20, -20);
    this.scene.add(this.rimLight);

    // 6. Generate City Grid (Ground + Buildings)
    this.buildCityGround();
    this.generateProceduralBuildings();
    this.createTrafficFlow();
    
    // 7. Raycaster Setup for marker clicking
    this.setupRaycasting();

    // 8. Handle Window Resizes
    window.addEventListener('resize', () => this.onWindowResize());

    // Keyboard controls for first-person flying camera navigation
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // 9. Start Render Loop
    this.animate();
  },

  buildCityGround: function() {
    // Add grid ground
    const groundGeometry = new THREE.PlaneGeometry(300, 300);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x070815,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Cybernetic city grid lines
    const gridHelper = new THREE.GridHelper(300, 60, 0x00f0ff, 0x12183a);
    gridHelper.position.y = 0.02;
    this.scene.add(gridHelper);
  },

  generateProceduralBuildings: function() {
    const gridSize = 10;
    const spacing = 12;
    const offset = (gridSize * spacing) / 2 - spacing / 2;

    const buildingMaterialShared = new THREE.MeshStandardMaterial({
      color: 0x0e122b,
      roughness: 0.4,
      metalness: 0.8,
      flatShading: true
    });

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        // Skip some spots for streets or central parks
        if (x === 4 || x === 5 || z === 4 || z === 5) continue;
        if (Math.random() > 0.85) continue; // Random empty spaces

        const posX = x * spacing - offset;
        const posZ = z * spacing - offset;

        // Randomized Building Height
        const height = 10 + Math.random() * 25;
        const width = 6 + Math.random() * 4;
        const depth = 6 + Math.random() * 4;

        const geom = new THREE.BoxGeometry(width, height, depth);
        
        // Add neon outline to building or colored vertex elements
        const mat = buildingMaterialShared.clone();
        
        // Give buildings closer to Sector 4 (Center) a more vibrant cyber color
        const distFromCenter = Math.sqrt(posX * posX + posZ * posZ);
        if (distFromCenter < 25) {
          mat.color.setHex(0x131a44);
          mat.emissive.setHex(0x0c0620);
        } else {
          mat.color.setHex(0x0a0c1a);
        }

        const building = new THREE.Mesh(geom, mat);
        building.position.set(posX, height / 2, posZ);
        building.castShadow = true;
        building.receiveShadow = true;
        this.scene.add(building);

        // Save building reference for health alerts manipulation
        this.buildings.push({
          mesh: building,
          baseColor: mat.color.getHex(),
          x: posX,
          z: posZ,
          radius: (width + depth) / 2
        });

        // Add glowing window particles or segments on buildings
        this.addGlowingWindows(building, width, height, depth);
      }
    }
  },

  addGlowingWindows: function(buildingMesh, w, h, d) {
    const windowGeom = new THREE.BoxGeometry(w + 0.05, h * 0.8, d + 0.05);
    const windowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15,
      wireframe: true
    });
    const windowGlow = new THREE.Mesh(windowGeom, windowMat);
    windowGlow.position.copy(buildingMesh.position);
    this.scene.add(windowGlow);
    
    // Store reference inside building
    buildingMesh.userData.glowMesh = windowGlow;
  },

  createTrafficFlow: function() {
    // Generate particles that move along the main street grid (X=0 and Z=0 axes)
    const particleCount = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = [];
    const directions = [];

    for (let i = 0; i < particleCount; i++) {
      // Pick random lanes
      const isVertical = Math.random() > 0.5;
      let x = 0, z = 0;

      if (isVertical) {
        x = (Math.random() > 0.5 ? -6 : 6); // offset street lane
        z = (Math.random() - 0.5) * 200;
      } else {
        x = (Math.random() - 0.5) * 200;
        z = (Math.random() > 0.5 ? -6 : 6);
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = 0.5; // Hovering slightly above street level
      positions[i * 3 + 2] = z;

      speeds.push(0.3 + Math.random() * 0.8);
      directions.push(isVertical ? 'z' : 'x');
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const textureLoader = new THREE.TextureLoader();
    const material = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.9,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.trafficParticles = new THREE.Points(geometry, material);
    this.scene.add(this.trafficParticles);
    
    this.trafficData = { speeds, directions };
  },

  animateTraffic: function() {
    if (!this.trafficEnabled || !this.trafficParticles) return;

    const positions = this.trafficParticles.geometry.attributes.position.array;
    const count = positions.length / 3;

    for (let i = 0; i < count; i++) {
      const dir = this.trafficData.directions[i];
      const speed = this.trafficData.speeds[i];

      if (dir === 'z') {
        positions[i * 3 + 2] += speed;
        if (positions[i * 3 + 2] > 100) positions[i * 3 + 2] = -100;
      } else {
        positions[i * 3] += speed;
        if (positions[i * 3] > 100) positions[i * 3] = -100;
      }
    }
    
    this.trafficParticles.geometry.attributes.position.needsUpdate = true;
  },

  addIssueMarker: function(issue) {
    // If marker already exists, remove it
    if (this.markers[issue.id]) {
      this.removeIssueMarker(issue.id);
    }

    // Colors: Low = Green, Medium/High = Yellow, Critical = Red
    let color = 0x00ff66;
    if (issue.severity.toLowerCase() === 'critical') {
      color = 0xff0055;
    } else if (issue.severity.toLowerCase() === 'high' || issue.severity.toLowerCase() === 'medium') {
      color = 0xffb800;
    }

    // Outer spinning diamond
    const geom = new THREE.OctahedronGeometry(1.2, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });

    const marker = new THREE.Mesh(geom, mat);
    marker.position.set(issue.x, 2.5, issue.z);
    marker.castShadow = true;
    this.scene.add(marker);

    // Inner glowing core
    const innerGeom = new THREE.SphereGeometry(0.5, 8, 8);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const innerCore = new THREE.Mesh(innerGeom, innerMat);
    marker.add(innerCore);

    // Store custom data on marker object for Raycasting
    marker.userData = { issueId: issue.id, issue: issue };
    this.markers[issue.id] = marker;

    // Trigger local structural tinting on buildings in radius (infrastructure health simulation)
    this.updateLocalBuildingHealth(issue.x, issue.z, issue.severity, true);
  },

  removeIssueMarker: function(issueId) {
    const marker = this.markers[issueId];
    if (marker) {
      this.scene.remove(marker);
      
      // Clean building health overlays affected by this marker
      const issue = marker.userData.issue;
      if (issue) {
        this.updateLocalBuildingHealth(issue.x, issue.z, issue.severity, false);
      }
      
      delete this.markers[issueId];
    }
  },

  updateLocalBuildingHealth: function(x, z, severity, isActive) {
    const radius = 20.0;
    let alarmColor = 0xff0055;
    if (severity.toLowerCase() === 'medium' || severity.toLowerCase() === 'high') {
      alarmColor = 0xffb800;
    }

    this.buildings.forEach(building => {
      const dx = building.x - x;
      const dz = building.z - z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist <= radius) {
        if (isActive) {
          // Tint building red/yellow depending on issues
          building.mesh.material.color.setHex(alarmColor);
          building.mesh.material.emissive.setHex(alarmColor);
          building.mesh.material.emissiveIntensity = 0.25;
          if (building.mesh.userData.glowMesh) {
            building.mesh.userData.glowMesh.material.color.setHex(alarmColor);
            building.mesh.userData.glowMesh.material.opacity = 0.35;
          }
        } else {
          // Reset to normal
          building.mesh.material.color.setHex(building.baseColor);
          building.mesh.material.emissive.setHex(0x000000);
          if (building.mesh.userData.glowMesh) {
            building.mesh.userData.glowMesh.material.color.setHex(0x00f0ff);
            building.mesh.userData.glowMesh.material.opacity = 0.15;
          }
        }
      }
    });
  },

  setTimeOfDay: function(hour) {
    // 0 to 24 time cycle
    const pct = hour / 24;
    const angle = pct * Math.PI * 2;

    // Move sun sunlight position
    const sunX = Math.cos(angle) * 80;
    const sunY = Math.sin(angle) * 80;
    const sunZ = Math.sin(angle * 0.5) * 40;
    this.sunLight.position.set(sunX, sunY, sunZ);

    // Adjust light intensities and background colors
    if (sunY > 10) {
      // Day mode
      const intensity = Math.min(1.5, (sunY / 80) * 1.5);
      this.sunLight.intensity = intensity;
      this.sunLight.color.setHex(0x00f0ff); // Day neon cyan sun
      this.ambientLight.intensity = 0.6;
      this.scene.background.setHex(0x05060e);
      if (this.scene.fog) this.scene.fog.color.setHex(0x05060e);
    } else {
      // Night mode
      const nightPct = Math.max(0.1, (Math.abs(sunY) / 80));
      this.sunLight.intensity = nightPct * 0.4;
      this.sunLight.color.setHex(0xbd00ff); // Night glowing purple moon
      this.ambientLight.intensity = 0.2;
      this.scene.background.setHex(0x020207);
      if (this.scene.fog) this.scene.fog.color.setHex(0x020207);
    }
  },

  setFog: function(enabled) {
    this.fogEnabled = enabled;
    if (enabled) {
      this.scene.fog.density = 0.015;
    } else {
      this.scene.fog.density = 0;
    }
  },

  setHeatmap: function(enabled) {
    this.heatmapEnabled = enabled;
    
    // Clear old planes
    this.heatmapPlanes.forEach(plane => this.scene.remove(plane));
    this.heatmapPlanes = [];

    if (enabled) {
      // Draw colored semi-transparent grid rectangles indicating hazard zones
      const zones = [
        { x: 12, z: -8, radius: 25, color: 0xff0055 },  // Sector 4 Center
        { x: -35, z: 20, radius: 20, color: 0xffb800 }, // Suburbs Alpha
        { x: 45, z: 40, radius: 18, color: 0x00ff66 }   // Safe Sector
      ];

      zones.forEach(zone => {
        const geom = new THREE.RingGeometry(0.1, zone.radius, 32);
        const mat = new THREE.MeshBasicMaterial({
          color: zone.color,
          transparent: true,
          opacity: 0.18,
          side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(geom, mat);
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(zone.x, 0.1, zone.z);
        this.scene.add(plane);
        this.heatmapPlanes.push(plane);
      });
    }
  },

  setTraffic: function(enabled) {
    this.trafficEnabled = enabled;
    if (this.trafficParticles) {
      this.trafficParticles.visible = enabled;
    }
  },

  setWeather: function(weatherType) {
    this.weatherState = weatherType;

    // Clear old rain if exists
    if (this.rainSystem) {
      this.scene.remove(this.rainSystem);
      this.rainSystem = null;
    }

    if (weatherType === 'rain' || weatherType === 'storm') {
      const particleCount = 1200;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = Math.random() * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0xaaccff,
        size: 0.45,
        transparent: true,
        opacity: 0.6
      });

      this.rainSystem = new THREE.Points(geometry, material);
      this.scene.add(this.rainSystem);

      // Increase atmospheric fog density for rains
      if (this.fogEnabled) {
        this.scene.fog.density = 0.022;
      }
    } else {
      if (this.fogEnabled) {
        this.scene.fog.density = 0.015;
      }
    }
  },

  setupRaycasting: function() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    this.renderer.domElement.addEventListener('click', (event) => {
      // Calculate mouse position in normalized device coordinates
      const rect = this.renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);

      // Check intersections with active markers
      const markerMeshes = Object.values(this.markers);
      const intersects = raycaster.intersectObjects(markerMeshes);

      if (intersects.length > 0) {
        const clickedMarker = intersects[0].object;
        const issue = clickedMarker.userData.issue;
        if (this.onMarkerClick && issue) {
          this.onMarkerClick(issue);
        }
      }
    });
  },

  focusCamera: function(x, z) {
    // Smooth transition camera target to coordinates
    new TWEEN.Tween(this.controls.target)
      .to({ x: x, y: 0, z: z }, 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();

    new TWEEN.Tween(this.camera.position)
      .to({ x: x + 15, y: 12, z: z + 15 }, 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  },

  onWindowResize: function() {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 500;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  },

  animate: function(time) {
    requestAnimationFrame((t) => this.animate(t));

    // Update TWEEN animations if active
    if (typeof TWEEN !== 'undefined') {
      TWEEN.update();
    }

    // 1. Rotate & Bob active issue markers
    const osc = Math.sin(Date.now() * 0.003) * 0.25;
    Object.values(this.markers).forEach(marker => {
      marker.rotation.y += 0.02;
      marker.rotation.z += 0.01;
      // Bobbing up/down animation
      marker.position.y = 2.5 + osc;
    });

    // 2. Animate traffic particles
    this.animateTraffic();

    // 3. Animate Rain Particles
    if ((this.weatherState === 'rain' || this.weatherState === 'storm') && this.rainSystem) {
      const positions = this.rainSystem.geometry.attributes.position.array;
      const count = positions.length / 3;
      
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= 1.6; // Rain speed down
        
        // Reset if hitting ground
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 100;
        }
      }
      this.rainSystem.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Stormy Lightning Flash Simulation
    if (this.weatherState === 'storm' && Math.random() > 0.985) {
      const oldIntensity = this.ambientLight.intensity;
      const oldSunIntensity = this.sunLight.intensity;

      this.ambientLight.intensity = 3.5;
      this.sunLight.intensity = 4.0;
      
      if (window.appLogCallback && Math.random() > 0.5) {
        window.appLogCallback("[Weather Alert] Lightning discharge detected. Grid sensors compensating.", "error-log");
      }

      setTimeout(() => {
        this.ambientLight.intensity = oldIntensity;
        this.sunLight.intensity = oldSunIntensity;
      }, 70);
    }

    // 5. Cinematic Fly-through Mode
    if (this.isCinematic) {
      this.pathTime += 0.0015;
      
      // Calculate orbital/spline path positions
      const radius = 65;
      const camX = Math.cos(this.pathTime) * radius;
      const camZ = Math.sin(this.pathTime) * radius;
      const camY = 15 + Math.sin(this.pathTime * 3) * 5;

      this.camera.position.set(camX, camY, camZ);
      
      // Look at city center (0,0,0)
      this.controls.target.set(0, 0, 0);
    } else {
      // First-Person Keyboard Flying Controls (WASD / Arrows)
      const speed = 0.8;
      const direction = new THREE.Vector3();
      this.camera.getWorldDirection(direction);
      
      const moveDelta = new THREE.Vector3(0, 0, 0);

      if (this.keys['w'] || this.keys['arrowup']) {
        moveDelta.addScaledVector(direction, speed);
      }
      if (this.keys['s'] || this.keys['arrowdown']) {
        moveDelta.addScaledVector(direction, -speed);
      }
      if (this.keys['a'] || this.keys['arrowleft']) {
        const left = new THREE.Vector3();
        left.crossVectors(this.camera.up, direction).normalize();
        moveDelta.addScaledVector(left, speed);
      }
      if (this.keys['d'] || this.keys['arrowright']) {
        const right = new THREE.Vector3();
        right.crossVectors(direction, this.camera.up).normalize();
        moveDelta.addScaledVector(right, speed);
      }
      if (this.keys['e']) {
        moveDelta.y += speed * 0.7;
      }
      if (this.keys['q']) {
        moveDelta.y -= speed * 0.7;
      }

      if (moveDelta.lengthSq() > 0) {
        this.camera.position.add(moveDelta);
        this.controls.target.add(moveDelta);
      }

      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
};

// Include Tween JS dynamically if not loaded
if (typeof TWEEN === 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js';
  document.head.appendChild(script);
}
