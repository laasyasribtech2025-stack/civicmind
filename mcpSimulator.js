/**
 * Family Concierge AI - MCP Simulator
 * Simulates Model Context Protocol servers: Storage MCP, Medical MCP, Legacy MCP, Calendar MCP.
 */

const McpSimulator = {
  // Global callback for logging telemetry
  logCallback: null,

  setLogCallback(callback) {
    this.logCallback = callback;
  },

  log(server, method, params, responsePayload) {
    if (this.logCallback) {
      this.logCallback({
        timestamp: new Date().toISOString().substring(11, 19),
        type: 'mcp-log',
        server: server,
        message: `MCP CALL [${method}]`,
        params: JSON.stringify(params),
        response: JSON.stringify(responsePayload)
      });
    }
  },

  // Simulated latency helper
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // ==========================================
  // STORAGE MCP
  // ==========================================
  storage: {
    db: [
      {
        id: "doc-01",
        title: "House Insurance Papers",
        category: "document",
        owner: "dad",
        location: "Cupboard 2 (Blue Folder)",
        value: "Policy BC-9481-2294A. Provider: BlueCross Family Shield. Direct phone: 1-800-555-0199.",
        privacyLevel: "Restricted" // Family can see metadata, but details require Dad/Mom
      },
      {
        id: "doc-02",
        title: "House Deed / Title",
        category: "document",
        owner: "dad",
        location: "Cupboard 2 (Blue Folder)",
        value: "Official property register under Arthur & Sarah. Cert ID: 93821-PR.",
        privacyLevel: "Private" // Only Dad
      },
      {
        id: "cred-01",
        title: "Netflix & Spotify Passwords",
        category: "credentials",
        owner: "son",
        location: "Leo's Bitwarden Vault",
        value: "Netflix: chloe_leo_stream@gmail.com / TwinMems2026. Spotify: family_premium / LeoMusicRules!",
        privacyLevel: "Family" // All family members
      },
      {
        id: "cred-02",
        title: "Wi-Fi Router Password",
        category: "credentials",
        owner: "daughter",
        location: "Living Room Router Sticker",
        value: "SSID: TwinHome_5G / Key: ChloeWifiNetAdmin55",
        privacyLevel: "Family"
      },
      {
        id: "health-01",
        title: "Elena's Medical Allergies Card",
        category: "health",
        owner: "mom",
        location: "Kitchen Fridge / Medical Folder",
        value: "Severe Allergy: Penicillin, Peanuts. Moderate: Aspirin.",
        privacyLevel: "Emergency" // Visible to anyone in an Emergency, otherwise Mom/Dad/Elena
      },
      {
        id: "health-02",
        title: "Grandma Elena's Pharmacy File",
        category: "health",
        owner: "mom",
        location: "Elena's Medicine Cabinet",
        value: "Pharmacy ID: Rx-99482. CVS Pharmacy 4th Ave.",
        privacyLevel: "Emergency"
      },
      {
        id: "legacy-01",
        title: "Grandma's Lemon Tart Recipe",
        category: "legacy",
        owner: "mom",
        location: "Recipe Drawer (Box 1)",
        value: "Ingredients: 6 egg yolks, 1 cup sugar, 2 lemons, 1 pie crust. Beat yolks until thick, add lemon zest, bake 375F for 20m.",
        privacyLevel: "Family"
      }
    ],

    async search(query) {
      await McpSimulator.delay(300);
      const matches = McpSimulator.storage.db.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.value.toLowerCase().includes(query.toLowerCase())
      );
      McpSimulator.log("Storage MCP", "search_documents", { query: query }, matches);
      return matches;
    },

    async retrieve(id) {
      await McpSimulator.delay(200);
      const matched = McpSimulator.storage.db.find(item => item.id === id);
      McpSimulator.log("Storage MCP", "retrieve_document_by_id", { id: id }, matched);
      return matched;
    },

    async insert(item) {
      await McpSimulator.delay(400);
      const newItem = {
        id: `custom-${Date.now()}`,
        ...item
      };
      McpSimulator.storage.db.push(newItem);
      McpSimulator.log("Storage MCP", "insert_document", newItem, { status: "Success", id: newItem.id });
      return newItem;
    }
  },

  // ==========================================
  // MEDICAL MCP
  // ==========================================
  medical: {
    profiles: {
      "grandma": {
        name: "Elena",
        bloodGroup: "O Positive (O+)",
        allergies: ["Penicillin", "Peanuts", "Codeine"],
        hospital: "St. Jude Community Hospital Emergency (2.4 miles away)",
        doctor: "Dr. Henderson (Primary Care: +1-555-894-3232)",
        insuranceProvider: "BlueCross Family Shield Gold",
        insurancePolicyNum: "BC-9481-2294A",
        insuranceLocation: "Cabinet 1, Top Drawer (Yellow Folder)"
      }
    },
    meds: {
      "grandma": [
        { name: "Lisinopril 10mg", schedule: "Once daily in morning", purpose: "Blood Pressure control" },
        { name: "Metformin 500mg", schedule: "Twice daily with meals", purpose: "Diabetes management" },
        { name: "Aspirin 81mg", schedule: "Once daily in morning", purpose: "Cardio blood-thinner" }
      ]
    },

    async getProfile(subject) {
      await McpSimulator.delay(400);
      const profile = McpSimulator.medical.profiles[subject] || null;
      McpSimulator.log("Medical MCP", "get_patient_profile", { patient: subject }, profile);
      return profile;
    },

    async getMedications(subject) {
      await McpSimulator.delay(300);
      const medications = McpSimulator.medical.meds[subject] || [];
      McpSimulator.log("Medical MCP", "get_medication_schedule", { patient: subject }, medications);
      return medications;
    }
  },

  // ==========================================
  // LEGACY MCP (Verified memories)
  // ==========================================
  legacy: {
    memories: [
      {
        id: "legacy-story-01",
        subject: "Grandpa Robert",
        title: "The 1974 Snowstorm Walkout",
        story: "In December of 1974, we got hit by 30 inches of snow in less than 24 hours. The local power line collapsed, and we were freezing in the old cabin. I decided to walk 4 miles through the blizzard to retrieve kerosene for the heater and milk for your father who was just a toddler. It was so cold my eyelashes froze shut. But when I got back and fired up that heater, the room warmed up, and your grandma made us hot cocoa. It taught me that a family can get through any storm if they work together.",
        recordedDate: "2023-10-12",
        mediaType: "Audio Voice Clip",
        mediaUrl: "grandpa_snowstorm_1974.wav",
        verificationHash: "sha256-8a9d1fc5e6b772c91834ee8a58a74d2b",
        verifiable: true,
        confidenceScore: 1.00
      },
      {
        id: "legacy-story-02",
        subject: "Grandpa Robert",
        title: "Grandpa's Advice on Compound Interest",
        story: "Don't look at investments as a lottery. Look at them as planting an oak tree. In 1980, I started putting just twenty dollars a month into a standard S&P fund. It felt like nothing, but over forty years, that seed grew into the college fund that paid for Arthur and Sarah's university. Start early, stay steady, and don't panic when the market takes a dip. Time is your greatest asset.",
        recordedDate: "2021-06-15",
        mediaType: "Audio Voice Clip",
        mediaUrl: "grandpa_compound_interest.wav",
        verificationHash: "sha256-42ee9bcf9143a18a994775d04581f109",
        verifiable: true,
        confidenceScore: 1.00
      }
    ],

    async searchStories(query) {
      await McpSimulator.delay(400);
      const matches = McpSimulator.legacy.memories.filter(story => 
        story.title.toLowerCase().includes(query.toLowerCase()) || 
        story.story.toLowerCase().includes(query.toLowerCase())
      );
      McpSimulator.log("Legacy MCP", "get_verified_voice_recordings", { keyword: query }, matches);
      return matches;
    }
  },

  // ==========================================
  // CALENDAR MCP
  // ==========================================
  calendar: {
    events: [
      { id: "cal-01", title: "Mom's Birthday", date: "2026-07-14", assignedTo: "family", notes: "Order flower bouquet" },
      { id: "cal-02", title: "Leo's Passport Expiry", date: "2026-10-26", assignedTo: "son", notes: "Requires renewal paperwork" },
      { id: "cal-03", title: "Electricity Bill Due", date: "2026-06-30", assignedTo: "dad", notes: "Charge is unusually high: $285" }
    ],
    tasks: [],

    async getEvents() {
      await McpSimulator.delay(250);
      McpSimulator.log("Calendar MCP", "list_upcoming_events", {}, McpSimulator.calendar.events);
      return McpSimulator.calendar.events;
    },

    async addTask(task) {
      await McpSimulator.delay(300);
      const newTask = {
        id: `task-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        ...task
      };
      McpSimulator.calendar.tasks.push(newTask);
      McpSimulator.log("Calendar MCP", "create_calendar_task", task, { status: "Created", taskId: newTask.id });
      return newTask;
    },

    async getTasks() {
      return McpSimulator.calendar.tasks;
    }
  }
};
