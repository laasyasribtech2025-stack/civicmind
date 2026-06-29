/**
 * CivicMind AI - Decision Engine & Predictive Diagnostics
 */

const AiEngine = {
  // Preset AI Profiles for Issue Categories
  presets: {
    pothole: {
      type: "Deep Road Pothole",
      severity: "High",
      urgency: 7.8,
      department: "Public Works Department",
      impact: "High danger of vehicle chassis deformation, tire blowouts, and pedestrian balance loss. Heavy rains will expand structural base damage."
    },
    leak: {
      type: "Leaking Water Main",
      severity: "Critical",
      urgency: 9.2,
      department: "Water & Sanitation Dept",
      impact: "Severe sub-surface soil erosion, potential sinkhole formation, basement flooding, and drinkable water waste."
    },
    streetlight: {
      type: "Dead Streetlight",
      severity: "Low",
      urgency: 3.5,
      department: "Department of Energy & Lighting",
      impact: "Reduced safety perception, increased crime risk during hours of darkness, and vehicle-pedestrian visibility impairment."
    },
    garbage: {
      type: "Overflown Garbage Bin",
      severity: "Medium",
      urgency: 5.4,
      department: "Waste & Environment Services",
      impact: "Biohazard accumulation, local pest breeding ground expansion, offensive odors, and blockage of public footpaths."
    },
    wire: {
      type: "Fallen Powerline",
      severity: "Critical",
      urgency: 9.8,
      department: "Public Safety & Power Grid",
      impact: "IMMEDIATE electrocution hazard, secondary fire danger, power grid blackout, and localized traffic flow blockage."
    }
  },

  /**
   * Diagnoses an issue submission by matching to presets and enriching metadata
   */
  diagnose: function(presetKey, textContext = "") {
    const profile = this.presets[presetKey] || this.presets.pothole;
    
    // Auto-adjust parameters slightly based on length of descriptive context
    let adjustedUrgency = profile.urgency;
    if (textContext.toLowerCase().includes("urgent") || textContext.toLowerCase().includes("danger") || textContext.toLowerCase().includes("blocking")) {
      adjustedUrgency = Math.min(10.0, adjustedUrgency + 1.0);
    }
    
    return {
      ...profile,
      urgency: adjustedUrgency.toFixed(1),
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Scans existing issue registry to identify duplicates based on grid coordinate distance
   */
  checkDuplicate: function(newX, newZ, existingIssues, range = 6.0) {
    for (let issue of existingIssues) {
      // Calculate 2D Euclidean distance in the grid layout
      const dx = issue.x - newX;
      const dz = issue.z - newZ;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // If within proximity threshold and is the same general type category
      if (distance <= range) {
        return issue;
      }
    }
    return null;
  },

  /**
   * Computes overall City Health Index based on active issue count and severities
   */
  calculateCityHealth: function(issues) {
    if (issues.length === 0) return 100;
    
    let totalDeduction = 0;
    issues.forEach(issue => {
      if (issue.status === 'Resolved') return;
      
      switch (issue.severity.toLowerCase()) {
        case 'critical':
          totalDeduction += 5.0;
          break;
        case 'high':
          totalDeduction += 3.0;
          break;
        case 'medium':
          totalDeduction += 1.5;
          break;
        case 'low':
          totalDeduction += 0.5;
          break;
      }
    });

    // Clamp health score between 40% and 100%
    const health = 100 - totalDeduction;
    return Math.max(40, Math.round(health));
  }
};
