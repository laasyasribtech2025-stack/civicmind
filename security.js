/**
 * Family Concierge AI - Security & Privacy Module
 * Simulates user roles and controls granular permissions.
 */

const SecurityModule = {
  // Active role in the application simulation
  activeUser: 'dad', // Default is Dad

  users: {
    dad: {
      name: 'Arthur (Dad)',
      role: 'Owner / Admin',
      avatar: 'A',
      clearance: 'admin'
    },
    mom: {
      name: 'Sarah (Mom)',
      role: 'Owner / Admin',
      avatar: 'S',
      clearance: 'admin'
    },
    son: {
      name: 'Leo (Son)',
      role: 'Child',
      avatar: 'L',
      clearance: 'user'
    },
    daughter: {
      name: 'Chloe (Daughter)',
      role: 'Child',
      avatar: 'C',
      clearance: 'user'
    },
    grandma: {
      name: 'Elena (Grandma)',
      role: 'Elderly Parent',
      avatar: 'E',
      clearance: 'user'
    }
  },

  // Active Emergency State flag
  emergencyModeActive: false,

  setEmergencyMode(active) {
    this.emergencyModeActive = active;
  },

  setActiveUser(username) {
    if (this.users[username]) {
      this.activeUser = username;
      return this.users[username];
    }
    return null;
  },

  getActiveUserObj() {
    return this.users[this.activeUser];
  },

  // The Privacy Enforcer Method
  // Returns { allowed: boolean, reason: string }
  checkAccess(item) {
    const user = this.activeUser;
    const clearance = this.users[user].clearance;

    // 1. If Emergency Mode is active, bypass restrictions for health/critical files
    if (this.emergencyModeActive) {
      if (item.category === 'health' || item.privacyLevel === 'Emergency') {
        return {
          allowed: true,
          reason: "Emergency mode elevated clearance granted."
        };
      }
    }

    // 2. Owner always has access
    if (item.owner === user) {
      return {
        allowed: true,
        reason: "Owner access granted."
      };
    }

    // 3. Privacy level rules
    if (item.privacyLevel === 'Family') {
      return {
        allowed: true,
        reason: "Document is shared with the family."
      };
    }

    if (item.privacyLevel === 'Restricted') {
      if (clearance === 'admin') {
        return {
          allowed: true,
          reason: "Admin/Parent role authorized."
        };
      } else {
        return {
          allowed: false,
          reason: `Restricted content. Requires Mom or Dad clearance. ${this.users[user].name} has role: ${this.users[user].role}.`
        };
      }
    }

    if (item.privacyLevel === 'Private') {
      // Private items can ONLY be accessed by the owner, parents cannot even read children's strictly private items unless authorized (simulating full control)
      return {
        allowed: false,
        reason: `Strictly Private document owned by ${this.users[item.owner].name}.`
      };
    }

    if (item.privacyLevel === 'Emergency') {
      // Health folders require emergency activation, otherwise restricted to parents/owners
      if (clearance === 'admin') {
        return {
          allowed: true,
          reason: "Parent authorized for family health data."
        };
      } else {
        return {
          allowed: false,
          reason: "Requires emergency mode activation or parental access."
        };
      }
    }

    return {
      allowed: false,
      reason: "Access denied by default security policy."
    };
  },

  // Generates permission matrix schema for UI table
  getPermissionMatrix() {
    const categories = [
      { name: 'House Documents (Deed, Insurance)', level: 'Restricted', owner: 'Dad' },
      { name: 'Passwords & Accounts (Netflix, Spotify)', level: 'Family', owner: 'Son' },
      { name: 'Health Details (Allergies, Rx Profile)', level: 'Emergency', owner: 'Grandma/Mom' },
      { name: 'Investments & Bills', level: 'Restricted', owner: 'Dad/Mom' },
      { name: 'Legacy Capsule (Grandpa\'s Memoirs)', level: 'Family', owner: 'Grandpa' }
    ];

    const usersList = ['dad', 'mom', 'son', 'daughter', 'grandma'];
    const matrix = [];

    // Precomputed rules for matrix rendering
    categories.forEach(cat => {
      const row = { name: cat.name, owner: cat.owner, permissions: {} };
      usersList.forEach(u => {
        if (cat.level === 'Family') {
          row.permissions[u] = 'Read';
        } else if (cat.level === 'Restricted') {
          if (u === 'dad' || u === 'mom') {
            row.permissions[u] = 'Read/Write';
          } else {
            row.permissions[u] = 'Deny';
          }
        } else if (cat.level === 'Emergency') {
          if (u === 'dad' || u === 'mom' || u === 'grandma') {
            row.permissions[u] = 'Read/Write';
          } else {
            row.permissions[u] = 'Emergency-Only';
          }
        }
      });
      matrix.push(row);
    });

    return matrix;
  }
};
