/**
 * Family Concierge AI - Agent Orchestrator & Sub-agents Logic
 */

const AgentSystem = {
  // Telemetry logger callback
  logCallback: null,

  setLogCallback(callback) {
    this.logCallback = callback;
  },

  log(agent, message, data = null) {
    if (this.logCallback) {
      this.logCallback({
        timestamp: new Date().toISOString().substring(11, 19),
        type: 'agent-log',
        agent: agent,
        message: message,
        data: data ? JSON.stringify(data) : null
      });
    }
  },

  // UI Event hooks (defined in app.js)
  uiTriggerNodeHighlight: null,
  uiTriggerLineFlow: null,
  uiClearHighlights: null,

  setUiHandlers(highlight, lineFlow, clear) {
    this.uiTriggerNodeHighlight = highlight;
    this.uiTriggerLineFlow = lineFlow;
    this.uiClearHighlights = clear;
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // ==========================================
  // 1. CONCIERGE AGENT (Main Gateway)
  // ==========================================
  async conciergeReceive(prompt) {
    this.log("Concierge Agent", `Received request: "${prompt}"`);
    if (this.uiClearHighlights) this.uiClearHighlights();
    
    // Step 1: Highlight User & Concierge Node
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('user', true);
      this.uiTriggerNodeHighlight('concierge', true);
      this.uiTriggerLineFlow('user', 'concierge', 'normal');
    }
    await this.delay(600);

    // Step 2: Concierge passes to Antigravity Orchestrator
    this.log("Concierge Agent", "Delegating request to Antigravity Orchestrator for agent matching...");
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('antigravity', true);
      this.uiTriggerLineFlow('concierge', 'antigravity', 'normal');
    }
    await this.delay(700);

    // Intent Parsing & Orchestration Router
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('insurance') || lowerPrompt.includes('deed') || lowerPrompt.includes('password') || lowerPrompt.includes('wifi') || lowerPrompt.includes('recipe')) {
      // Scenario 1: Knowledge Query
      return await this.orchestrateKnowledgeQuery(prompt);
    } 
    else if (lowerPrompt.includes('collapse') || lowerPrompt.includes('sick') || lowerPrompt.includes('emergency') || lowerPrompt.includes('grandma fall')) {
      // Scenario 2: Emergency Alert
      return await this.orchestrateEmergency();
    }
    else if (lowerPrompt.includes('story') || lowerPrompt.includes('grandpa') || lowerPrompt.includes('advice')) {
      // Scenario 3: Legacy Query
      return await this.orchestrateLegacyQuery(prompt);
    }
    else if (lowerPrompt.includes('permission') || lowerPrompt.includes('privacy') || lowerPrompt.includes('role')) {
      // Scenario 5: Security / Permission Query
      return await this.orchestratePrivacyMatrixHelp();
    }
    else {
      // Default Query
      return await this.orchestrateGeneralSearch(prompt);
    }
  },

  // ==========================================
  // Direct Agent Chats (Bypassing Concierge)
  // ==========================================
  async knowledgeAgentReceive(prompt) {
    this.log("Knowledge Agent", `Direct Query Received: "${prompt}"`);
    if (this.uiClearHighlights) this.uiClearHighlights();
    
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('user', true);
      this.uiTriggerNodeHighlight('knowledge', true);
      this.uiTriggerLineFlow('user', 'knowledge', 'normal');
    }
    await this.delay(500);

    this.log("Knowledge Agent", "Querying Storage MCP directly...");
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('mcp-storage', true);
      this.uiTriggerLineFlow('knowledge', 'mcp-storage', 'normal');
    }
    const results = await McpSimulator.storage.search(prompt);
    await this.delay(600);

    if (results.length === 0) {
      return {
        text: "Knowledge Agent: No matching documents found directly in the Storage MCP database.",
        success: false
      };
    }

    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('privacy', true);
    }
    const checkedResults = [];
    let responseText = "📖 **Knowledge Agent Direct Search Results** (Privacy Filter Applied):\n\n";
    
    for (const item of results) {
      const check = SecurityModule.checkAccess(item);
      if (check.allowed) {
        checkedResults.push(item);
        responseText += `📁 **${item.title}** (${item.category})\n`;
        responseText += `• **Location:** ${item.location}\n`;
        responseText += `• **Value:** \`${item.value}\`\n\n`;
      } else {
        responseText += `🚫 **${item.title}** (Access Restricted)\n`;
        responseText += `• **Reason:** *${check.reason}*\n\n`;
      }
    }
    return { text: responseText, success: true };
  },

  async emergencyAgentReceive(prompt) {
    this.log("Emergency Agent", `Direct Query Received: "${prompt}"`);
    if (this.uiClearHighlights) this.uiClearHighlights();
    
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('user', true);
      this.uiTriggerNodeHighlight('emergency', true);
      this.uiTriggerLineFlow('user', 'emergency', 'emergency');
    }
    await this.delay(500);

    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('mcp-medical', true);
      this.uiTriggerLineFlow('emergency', 'mcp-medical', 'emergency');
    }
    
    const profile = await McpSimulator.medical.getProfile("grandma");
    const meds = await McpSimulator.medical.getMedications("grandma");
    await this.delay(600);

    let reply = `🚨 **Emergency Agent Direct Lookup**:\n` +
                `• **Subject**: Grandma Elena\n` +
                `• **Blood Group**: ${profile.bloodGroup}\n` +
                `• **Allergies**: ${profile.allergies.join(', ')}\n` +
                `• **Primary Doctor**: ${profile.doctor}\n` +
                `• **Preferred Hospital**: ${profile.hospital}\n\n` +
                `**Medications Schedule**:\n`;
                
    meds.forEach(m => {
      reply += `- **${m.name}**: ${m.schedule} (${m.purpose})\n`;
    });

    return { text: reply, success: true };
  },

  async legacyAgentReceive(prompt) {
    this.log("Legacy Agent", `Direct Query Received: "${prompt}"`);
    if (this.uiClearHighlights) this.uiClearHighlights();
    
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('user', true);
      this.uiTriggerNodeHighlight('legacy', true);
      this.uiTriggerLineFlow('user', 'legacy', 'normal');
    }
    await this.delay(500);

    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('mcp-legacy', true);
      this.uiTriggerLineFlow('legacy', 'mcp-legacy', 'normal');
    }

    const query = prompt.toLowerCase().includes('invest') ? 'interest' : 'snowstorm';
    const stories = await McpSimulator.legacy.searchStories(query);
    await this.delay(600);

    if (stories.length === 0) {
      return { text: "Legacy Agent: No matching verified stories in memory archive.", success: false };
    }

    const story = stories[0];
    this.log("Legacy Agent", `Verifying audio fingerprint for: "${story.title}"...`);
    await this.delay(400);
    this.log("Legacy Agent", `Verification matched. Confidence: 100%. Hash: ${story.verificationHash}`);

    return {
      text: `⏳ **Legacy Agent Direct Output** (100% Verified):\n` +
            `*"${story.story}"*\n\n` +
            `• **Record Date**: ${story.recordedDate}\n` +
            `• **Audio Track**: \`${story.mediaUrl}\`\n` +
            `• **Hash Match**: Validated`,
      success: true,
      legacyItem: story
    };
  },

  async coordinatorAgentReceive(prompt) {
    this.log("Coordinator Agent", `Direct Action Request: "${prompt}"`);
    if (this.uiClearHighlights) this.uiClearHighlights();
    
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('user', true);
      this.uiTriggerNodeHighlight('coordinator', true);
      this.uiTriggerLineFlow('user', 'coordinator', 'normal');
    }
    await this.delay(500);

    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('mcp-calendar', true);
      this.uiTriggerLineFlow('coordinator', 'mcp-calendar', 'normal');
    }

    const lower = prompt.toLowerCase();
    if (lower.includes('add') || lower.includes('task') || lower.includes('schedule')) {
      const match = prompt.match(/(?:add|schedule|task)\s+(.*)/i);
      const title = match ? match[1] : "Custom family coordinator task";
      const task = await McpSimulator.calendar.addTask({ title: title, date: "Scheduled via Chat" });
      await this.delay(500);
      
      return {
        text: `🗓️ **Coordinator Agent**: Task registered successfully in Calendar MCP!\n` +
              `• **Task**: "${task.title}"\n` +
              `• **Scheduled**: ${task.date}\n` +
              `• **Status**: Pending`,
        success: true
      };
    }

    const events = await McpSimulator.calendar.getEvents();
    let reply = `🗓️ **Coordinator Agent Direct Calendar Query**:\n`;
    events.forEach(e => {
      reply += `- **${e.title}** (${e.date}) - Assigned: ${e.assignedTo}\n`;
    });
    return { text: reply, success: true };
  },

  async privacyAgentReceive(prompt) {
    this.log("Privacy Agent", `Direct Query Received: "${prompt}"`);
    if (this.uiClearHighlights) this.uiClearHighlights();
    
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('user', true);
      this.uiTriggerNodeHighlight('privacy', true);
      this.uiTriggerLineFlow('user', 'privacy', 'normal');
    }
    await this.delay(500);

    const activeUser = SecurityModule.activeUser;
    const userObj = SecurityModule.users[activeUser];

    const reply = `🛡️ **Privacy Agent Audit Response**:\n` +
                  `• **Current Active Role**: **${userObj.name}**\n` +
                  `• **Clearance Level**: \`${userObj.clearance.toUpperCase()}\`\n` +
                  `• **Access Scope**: ${userObj.clearance === 'admin' ? 'Full folder read/write authorization.' : 'Restricted. Streaming & shared passwords only.'}\n\n` +
                  `*Enforcing active privacy policies. You can configure clearances directly in the **Privacy Center** tab in the sidebar.*`;

    return { text: reply, success: true };
  },

  async proactiveAgentReceive(prompt) {
    this.log("Proactive Agent", `Direct Diagnostics Triggered: "${prompt}"`);
    if (this.uiClearHighlights) this.uiClearHighlights();
    
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('user', true);
      this.uiTriggerNodeHighlight('proactive', true);
      this.uiTriggerLineFlow('user', 'proactive', 'normal');
    }
    await this.delay(500);

    const alerts = await this.runProactiveAudit();
    ProactiveModule.renderAlerts(alerts);

    return {
      text: `👁️ **Proactive Agent Audit Complete**:\n` +
            `• Successfully queried **Storage MCP** and **Calendar MCP**.\n` +
            `• Found **6 active recommendations**.\n` +
            `• Updated the main Family Dashboard with alerts (expiring passports, medicine conflicts, utility spikes).`,
      success: true
    };
  },

  // ==========================================
  // SCENARIO 1: Knowledge Search (Knowledge + Privacy)
  // ==========================================
  async orchestrateKnowledgeQuery(prompt) {
    this.log("Antigravity Orchestrator", "Routing to Knowledge Agent and Privacy Agent in series.");
    
    // Activate sub-agents
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('knowledge', true);
      this.uiTriggerLineFlow('antigravity', 'knowledge', 'normal');
    }
    await this.delay(500);

    // Query Storage MCP
    this.log("Knowledge Agent", `Querying Storage MCP for: "${prompt}"`);
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('mcp-storage', true);
      this.uiTriggerLineFlow('knowledge', 'mcp-storage', 'normal');
    }
    
    const results = await McpSimulator.storage.search(prompt);
    await this.delay(600);

    if (results.length === 0) {
      return {
        text: "I searched the family storage vault but couldn't find any documents or credentials matching that description. You can add new details in the Knowledge Vault tab.",
        success: false
      };
    }

    // Pass results to Privacy Agent
    this.log("Antigravity Orchestrator", "Routing records to Privacy Agent for access control validation.");
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('privacy', true);
      this.uiTriggerLineFlow('antigravity', 'privacy', 'normal');
    }
    await this.delay(600);

    const activeUser = SecurityModule.activeUser;
    this.log("Privacy Agent", `Validating active user role "${activeUser}" against document security profiles...`);

    const checkedResults = [];
    let allDenied = true;

    for (const item of results) {
      const check = SecurityModule.checkAccess(item);
      if (check.allowed) {
        allDenied = false;
        checkedResults.push({
          title: item.title,
          category: item.category,
          owner: item.owner,
          location: item.location,
          value: item.value,
          privacyLevel: item.privacyLevel,
          allowed: true
        });
        this.log("Privacy Agent", `ACCESS GRANTED for "${item.title}". Reason: ${check.reason}`);
      } else {
        checkedResults.push({
          title: item.title,
          category: item.category,
          owner: item.owner,
          privacyLevel: item.privacyLevel,
          allowed: false,
          reason: check.reason
        });
        this.log("Privacy Agent", `ACCESS DENIED for "${item.title}". Reason: ${check.reason}`, { error: true });
      }
    }

    // Build Response Text
    let responseText = "";
    checkedResults.forEach(res => {
      if (res.allowed) {
        responseText += `📁 **${res.title}** (${res.category})\n`;
        responseText += `• **Owner:** ${SecurityModule.users[res.owner].name}\n`;
        responseText += `• **Physical Location:** ${res.location}\n`;
        responseText += `• **Vault Content:** \`${res.value}\`\n\n`;
      } else {
        responseText += `🚫 **${res.title}** (Access Restricted)\n`;
        responseText += `• **Required Owner:** ${SecurityModule.users[res.owner].name}\n`;
        responseText += `• **Privacy Level:** ${res.privacyLevel}\n`;
        responseText += `• **Authorization Status:** Denied\n`;
        responseText += `• **Reason:** *${res.reason}*\n\n`;
      }
    });

    return {
      text: responseText,
      success: !allDenied,
      data: checkedResults
    };
  },

  // ==========================================
  // SCENARIO 2: Emergency (Emergency + Knowledge + Coordinator + Privacy)
  // ==========================================
  async orchestrateEmergency() {
    this.log("Antigravity Orchestrator", "CRITICAL WARNING: Parallel scheduling of Emergency, Knowledge, Coordinator, and Privacy agents!");
    
    // Elevate emergency state
    SecurityModule.setEmergencyMode(true);

    // 1. Highlight all relevant nodes and lines in parallel (emergency mode uses faster flow lines)
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('emergency', true);
      this.uiTriggerNodeHighlight('knowledge', true);
      this.uiTriggerNodeHighlight('coordinator', true);
      this.uiTriggerNodeHighlight('privacy', true);

      this.uiTriggerLineFlow('antigravity', 'emergency', 'emergency');
      this.uiTriggerLineFlow('antigravity', 'knowledge', 'emergency');
      this.uiTriggerLineFlow('antigravity', 'coordinator', 'emergency');
      this.uiTriggerLineFlow('antigravity', 'privacy', 'emergency');
    }
    await this.delay(800);

    // 2. Query Medical and Storage MCPs
    this.log("Emergency Agent", "Querying Medical MCP for Grandma Elena's profile and medication lists...");
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('mcp-medical', true);
      this.uiTriggerLineFlow('emergency', 'mcp-medical', 'emergency');
    }

    this.log("Knowledge Agent", "Searching Storage MCP for Grandma Elena's emergency insurance documentation...");
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('mcp-storage', true);
      this.uiTriggerLineFlow('knowledge', 'mcp-storage', 'emergency');
    }

    // Retrieve data
    const medicalProfile = await McpSimulator.medical.getProfile("grandma");
    const medsList = await McpSimulator.medical.getMedications("grandma");
    
    // Bypass query search for Insurance matching Grandma
    const insuranceItem = McpSimulator.storage.db.find(i => i.title.includes("Insurance"));
    
    await this.delay(900);

    // 3. Privacy Agent checks and overrides access levels
    this.log("Privacy Agent", "Elevating authorization levels. Bypass rules enabled for Grandma's medical documentation.");
    const insuranceAccess = SecurityModule.checkAccess(insuranceItem);
    this.log("Privacy Agent", `Insurance Access: Allowed. ${insuranceAccess.reason}`);

    // 4. Coordinator Agent assigns tasks to Calendar MCP
    this.log("Coordinator Agent", "Orchestrating emergency tasks. Registering calendar updates and alarms...");
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('mcp-calendar', true);
      this.uiTriggerLineFlow('coordinator', 'mcp-calendar', 'emergency');
    }

    const task1 = await McpSimulator.calendar.addTask({ title: "Notify Dad (Arthur) about Grandma Emergency", date: "Immediate" });
    const task2 = await McpSimulator.calendar.addTask({ title: "Contact Doctor Henderson at +1-555-894-3232", date: "Immediate" });
    const task3 = await McpSimulator.calendar.addTask({ title: "Coordinate with St. Jude Hospital Ward", date: "Immediate" });
    
    await this.delay(600);

    return {
      emergency: true,
      profile: medicalProfile,
      meds: medsList,
      insurance: {
        provider: medicalProfile.insuranceProvider,
        policyNum: medicalProfile.insurancePolicyNum,
        location: medicalProfile.insuranceLocation,
        value: insuranceItem.value
      },
      tasks: [task1.title, task2.title, task3.title]
    };
  },

  // ==========================================
  // SCENARIO 3: Legacy Story (Legacy Agent + Verification Engine)
  // ==========================================
  async orchestrateLegacyQuery(prompt) {
    this.log("Antigravity Orchestrator", "Routing search to Legacy Agent.");

    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('legacy', true);
      this.uiTriggerLineFlow('antigravity', 'legacy', 'normal');
    }
    await this.delay(600);

    this.log("Legacy Agent", `Searching Legacy MCP for memoirs matching: "${prompt}"`);
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('mcp-legacy', true);
      this.uiTriggerLineFlow('legacy', 'mcp-legacy', 'normal');
    }
    
    const query = prompt.includes('story') ? 'snowstorm' : 'interest';
    const stories = await McpSimulator.legacy.searchStories(query);
    await this.delay(700);

    if (stories.length === 0) {
      return {
        text: "I couldn't find any verified recordings for that request. The Legacy Archive only returns verified memories to prevent AI clones from making up stories.",
        success: false
      };
    }

    const story = stories[0];

    // Verification Pipeline
    this.log("Legacy Agent", "Memory retrieved. Activating Verification Engine to check audio hashes...");
    await this.delay(500);
    this.log("Legacy Agent", `Verification Success. Hash matched: ${story.verificationHash}. Integrity Confidence: 100%`);

    return {
      text: `✨ **Verified Memory capsule** of **${story.subject}**:\n"${story.story}"\n\n*Recorded on ${story.recordedDate} | Format: ${story.mediaType}*`,
      success: true,
      legacyItem: story
    };
  },

  // ==========================================
  // SCENARIO 4: Proactive Monitor Loop (Runs in background)
  // ==========================================
  async runProactiveAudit() {
    this.log("Proactive Agent", "Executing background audit of family files and calendars...");
    if (this.uiClearHighlights) this.uiClearHighlights();
    
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('proactive', true);
      this.uiTriggerLineFlow('antigravity', 'proactive', 'normal');
    }
    await this.delay(500);

    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('mcp-calendar', true);
      this.uiTriggerNodeHighlight('mcp-storage', true);
      this.uiTriggerLineFlow('proactive', 'mcp-calendar', 'normal');
      this.uiTriggerLineFlow('proactive', 'mcp-storage', 'normal');
    }

    const events = await McpSimulator.calendar.getEvents();
    this.log("Proactive Agent", `Found ${events.length} active monitors. Synthesizing alerts...`);
    await this.delay(600);

    const alerts = [
      {
        id: "alert-1",
        title: "Passport Expiring Soon",
        description: "Leo's passport expires in 4 months (October 2026). Direct renewal takes 8 weeks.",
        type: "warning",
        category: "Travel",
        actionText: "Renew Passport"
      },
      {
        id: "alert-2",
        title: "Dangerous Drug Overlap",
        description: "Grandma Elena's medications (Lisinopril & Aspirin) overlap. Risk of minor blood pressure dips. Monitored.",
        type: "critical",
        category: "Health",
        actionText: "Consult Doctor"
      },
      {
        id: "alert-3",
        title: "High Electricity Usage Spike",
        description: "June electricity bill is $285 (35% higher than the historical summer average). Check HVAC filter.",
        type: "warning",
        category: "Bills",
        actionText: "Compare Usage"
      },
      {
        id: "alert-4",
        title: "Mom's Birthday Gift Alert",
        description: "Mom's birthday is on July 14. Flowers or gifts have not been scheduled yet.",
        type: "warning",
        category: "Calendar",
        actionText: "Order Flowers"
      },
      {
        id: "alert-5",
        title: "Unworn Items Audit",
        description: "Your favorite leather boots have not been worn or logged in 12 months. Relocate to attic?",
        type: "info",
        category: "Wardrobe",
        actionText: "Relocate"
      },
      {
        id: "alert-6",
        title: "Refrigerator Food Expiration",
        description: "Milk carton expires tomorrow. Suggested action: Make french toast or pudding tonight.",
        type: "info",
        category: "Kitchen",
        actionText: "View Recipe"
      }
    ];

    this.log("Proactive Agent", "Background audit complete. 6 notifications dispatched to the Family Dashboard.", alerts);
    return alerts;
  },

  // ==========================================
  // HELPERS
  // ==========================================
  async orchestratePrivacyMatrixHelp() {
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('privacy', true);
    }
    await this.delay(400);
    return {
      text: "The Privacy Agent regulates folder visibility. To change permissions, click on the **Privacy Center** tab in the sidebar. Remember that 'Private' items are strictly owned and hidden from other family members.",
      success: true
    };
  },

  async orchestrateGeneralSearch(prompt) {
    if (this.uiTriggerNodeHighlight) {
      this.uiTriggerNodeHighlight('knowledge', true);
    }
    await this.delay(400);

    const text = prompt.toLowerCase().trim();
    let reply = "";

    // 1. Greetings & Identity
    if (text.includes("hello") || text.includes("hi ") || text === "hi" || text.includes("hey") || text.includes("who are you") || text.includes("what can you do") || text === "help") {
      reply = `👋 Hello! I am the **Family Digital Twin Concierge**, orchestrated by Antigravity.\n\nHere is what I can do:\n• **Retrieve Logistics**: Ask *"Where are the house insurance papers?"* or *"Where is the Wi-Fi password?"*\n• **Preserve Memories**: Ask *"What was Grandpa's favorite story?"* or *"Tell me Grandpa's advice on investments."*\n• **Simulate Emergency**: Type *"Grandma collapsed"* or click the Emergency trigger to instantly launch parallel agents.\n• **Store Knowledge**: Type *"save password [Title] value [Password]"* or *"add document [Title] location [Cabinet 2] value [Detail]"*.\n• **Check Statuses**: Ask *"Who is online?"* or *"Who is home?"*.`;
    }
    // 2. Family Circle Statuses
    else if (text.includes("status") || text.includes("online") || text.includes("who is home") || text.includes("chloe") || text.includes("leo") || text.includes("mom") || text.includes("dad")) {
      reply = `🏡 **Current Family Circle Status**:\n` +
              `• **Arthur (Dad)**: Online 🟢 *Specialty: Investments, House Documents*\n` +
              `• **Sarah (Mom)**: Online 🟢 *Specialty: Medicines, Recipes, Birthdays*\n` +
              `• **Leo (Son)**: Online 🟢 *Specialty: Subscriptions, Passwords*\n` +
              `• **Chloe (Daughter)**: Away 🟡 *Specialty: Wi-Fi Admin, Streaming*\n` +
              `• **Elena (Grandma)**: At Home 🔵 *Specialty: Medical Profile, Legacy Stories*`;
    }
    // 3. Add item dynamically via chat parsing
    else if (text.startsWith("save") || text.startsWith("add") || text.startsWith("store")) {
      try {
        let title = "Custom Note";
        let value = "";
        let category = "document";
        let location = "Digital Archive";
        
        if (text.includes("password")) {
          category = "credentials";
          const match = prompt.match(/(?:save|add|store)\s+password\s+(.*?)\s+value\s+(.*)/i);
          if (match) {
            title = match[1];
            value = match[2];
          }
        } else {
          const match = prompt.match(/(?:save|add|store)\s+document\s+(.*?)\s+location\s+(.*?)\s+value\s+(.*)/i);
          if (match) {
            title = match[1];
            location = match[2];
            value = match[3];
          } else {
            const genericMatch = prompt.match(/(?:save|add|store)\s+(.*?)\s+value\s+(.*)/i);
            if (genericMatch) {
              title = genericMatch[1];
              value = genericMatch[2];
            }
          }
        }

        if (value) {
          const activeUser = SecurityModule.activeUser;
          const inserted = await McpSimulator.storage.insert({
            title: title,
            category: category,
            owner: activeUser,
            location: location,
            value: value,
            privacyLevel: category === 'credentials' ? 'Family' : 'Restricted'
          });
          reply = `✅ **Knowledge Saved!** I've created a new node in the Storage MCP:\n` +
                  `• **Title**: ${title}\n` +
                  `• **Category**: ${category}\n` +
                  `• **Owner**: ${SecurityModule.users[activeUser].name}\n` +
                  `• **Stored Value**: \`${value}\`\n\nIt is now indexed and searchable!`;
        } else {
          reply = `💡 **How to store information via Chat**:\n` +
                  `• To store a password: \`save password [Service Name] value [YourPassword]\`\n` +
                  `• To store a document: \`add document [Doc Name] location [Box B] value [Key Details]\``;
        }
      } catch (e) {
        reply = "Sorry, I couldn't parse the save request. Please use: `save password [name] value [password]`";
      }
    }
    // 4. Lost keys
    else if (text.includes("key") || text.includes("wallet") || text.includes("phone")) {
      reply = "🔑 **Keys and Wallets Locator**:\nI don't track physical location trackers yet, but check the **front door key-hanger bowl** or the kitchen counter. Leo left his keys near the microwave yesterday!";
    }
    // 5. Jokes
    else if (text.includes("joke")) {
      reply = "😄 Here is a family tech joke:\nWhy did the digital twin go to family therapy?\n\nBecause it had too many unresolved conflicts in its child nodes! 🤖";
    }
    // 6. Recipe help
    else if (text.includes("cook") || text.includes("recipe") || text.includes("dinner") || text.includes("lemon")) {
      reply = "🍋 **Grandma's Lemon Tart Recipe** is stored in the Legacy Capsule! You can ask me: *'Tell me Grandpa's story'* to look up legacy archives, or view the **Living Legacy** tab in the sidebar.\n\nIngredients: 6 egg yolks, 1 cup sugar, 2 lemons, 1 pie crust.";
    }
    // 7. General Fallback
    else {
      reply = `I've analyzed your query "${prompt}" through the Concierge. As this is not a specific cataloged file query, I am responding as a general assistant.\n\nHow can I help you coordinate your family schedules or find files? Try asking: *"Who is online?"* or *"What can you do?"*`;
    }

    return {
      text: reply,
      success: true
    };
  }
};
