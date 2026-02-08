/**
 * storage.js - LocalStorage wrapper for Moomin Japanese Trainer
 * Handles persistence of SRS data, progress, and settings
 */

const Storage = (function() {
  const KEYS = {
    CARDS: 'moomin_cards',
    PROGRESS: 'moomin_progress',
    SETTINGS: 'moomin_settings',
    EPISODES: 'moomin_episodes'
  };

  // Default values
  const DEFAULTS = {
    settings: {
      showFurigana: false,
      newPerDay: 20
    },
    progress: {
      streak: {
        current: 0,
        longest: 0,
        lastReview: null
      },
      stats: {
        totalReviews: 0,
        cardsLearned: 0,
        cardsMature: 0
      }
    },
    cards: {},
    episodes: ['ep01']
  };

  /**
   * Get data from localStorage with fallback to default
   */
  function get(key) {
    try {
      const data = localStorage.getItem(KEYS[key]);
      if (data === null) {
        return DEFAULTS[key.toLowerCase()] || null;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error(`Storage.get error for ${key}:`, e);
      return DEFAULTS[key.toLowerCase()] || null;
    }
  }

  /**
   * Set data in localStorage
   */
  function set(key, value) {
    try {
      localStorage.setItem(KEYS[key], JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Storage.set error for ${key}:`, e);
      return false;
    }
  }

  /**
   * Get a single card's SRS state
   */
  function getCard(cardId) {
    const cards = get('CARDS');
    return cards[cardId] || null;
  }

  /**
   * Update a single card's SRS state
   */
  function setCard(cardId, state) {
    const cards = get('CARDS');
    cards[cardId] = state;
    return set('CARDS', cards);
  }

  /**
   * Get all cards as array with IDs
   */
  function getAllCards() {
    const cards = get('CARDS');
    return Object.entries(cards).map(([id, state]) => ({
      id,
      ...state
    }));
  }

  /**
   * Update streak based on review activity
   */
  function updateStreak() {
    const progress = get('PROGRESS');
    const today = new Date().toISOString().split('T')[0];
    const lastReview = progress.streak.lastReview;

    if (lastReview === today) {
      // Already reviewed today, no change
      return progress.streak.current;
    }

    if (lastReview) {
      const lastDate = new Date(lastReview);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        progress.streak.current++;
      } else if (diffDays > 1) {
        // Streak broken
        progress.streak.current = 1;
      }
    } else {
      // First review ever
      progress.streak.current = 1;
    }

    // Update longest streak
    if (progress.streak.current > progress.streak.longest) {
      progress.streak.longest = progress.streak.current;
    }

    progress.streak.lastReview = today;
    set('PROGRESS', progress);

    return progress.streak.current;
  }

  /**
   * Increment total reviews counter
   */
  function incrementReviews() {
    const progress = get('PROGRESS');
    progress.stats.totalReviews++;
    set('PROGRESS', progress);
  }

  /**
   * Update learned/mature card counts
   */
  function updateCardCounts() {
    const cards = get('CARDS');
    const progress = get('PROGRESS');

    let learned = 0;
    let mature = 0;

    Object.values(cards).forEach(card => {
      if (card.reps > 0) learned++;
      if (card.interval >= 21) mature++;
    });

    progress.stats.cardsLearned = learned;
    progress.stats.cardsMature = mature;
    set('PROGRESS', progress);
  }

  /**
   * Export all data as JSON
   */
  function exportAll() {
    return {
      version: '1.0',
      exported: new Date().toISOString(),
      cards: get('CARDS'),
      progress: get('PROGRESS'),
      settings: get('SETTINGS'),
      episodes: get('EPISODES')
    };
  }

  /**
   * Import data from JSON
   * Includes validation to prevent malicious data injection
   */
  function importAll(data) {
    // Basic type and structure validation
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Invalid backup file: not an object');
    }
    
    if (!data.version || typeof data.version !== 'string') {
      throw new Error('Invalid backup file: missing version');
    }

    // Only allow expected keys (prevent prototype pollution)
    const allowedKeys = ['cards', 'progress', 'settings', 'episodes', 'version', 'exported'];
    const dataKeys = Object.keys(data);
    const unexpectedKeys = dataKeys.filter(k => !allowedKeys.includes(k));
    if (unexpectedKeys.length > 0) {
      throw new Error('Invalid backup file: unexpected data fields');
    }

    // Check for prototype pollution attempts
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    const checkForDangerousKeys = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        if (dangerousKeys.includes(key)) {
          throw new Error(`Invalid backup file: dangerous key detected at ${path}${key}`);
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          checkForDangerousKeys(obj[key], `${path}${key}.`);
        }
      }
    };
    checkForDangerousKeys(data);

    // Size limit check (5MB)
    const dataSize = JSON.stringify(data).length;
    if (dataSize > 5 * 1024 * 1024) {
      throw new Error('Backup file too large (max 5MB)');
    }

    // Validate settings structure if present
    if (data.settings) {
      if (typeof data.settings !== 'object' || Array.isArray(data.settings)) {
        throw new Error('Invalid backup file: settings must be an object');
      }
      // Sanitize settings values
      if (data.settings.newPerDay !== undefined) {
        const npd = parseInt(data.settings.newPerDay);
        if (isNaN(npd) || npd < 1 || npd > 100) {
          data.settings.newPerDay = 20; // Reset to default
        }
      }
    }

    // Validate episodes array if present
    if (data.episodes) {
      if (!Array.isArray(data.episodes)) {
        throw new Error('Invalid backup file: episodes must be an array');
      }
      // Sanitize episode IDs
      data.episodes = data.episodes
        .filter(ep => typeof ep === 'string')
        .map(ep => ep.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 20))
        .slice(0, 100); // Max 100 episodes
    }

    if (data.cards) set('CARDS', data.cards);
    if (data.progress) set('PROGRESS', data.progress);
    if (data.settings) set('SETTINGS', data.settings);
    if (data.episodes) set('EPISODES', data.episodes);

    return true;
  }

  /**
   * Reset all data to defaults
   */
  function resetAll() {
    Object.keys(KEYS).forEach(key => {
      localStorage.removeItem(KEYS[key]);
    });
    return true;
  }

  // Public API
  return {
    get,
    set,
    getCard,
    setCard,
    getAllCards,
    updateStreak,
    incrementReviews,
    updateCardCounts,
    exportAll,
    importAll,
    resetAll,
    KEYS
  };
})();
