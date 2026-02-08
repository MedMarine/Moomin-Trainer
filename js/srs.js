/**
 * srs.js - FSRS (Free Spaced Repetition Scheduler) v5 implementation
 * Based on the open-source FSRS algorithm by Jarrett Ye
 * https://github.com/open-spaced-repetition/fsrs4anki
 * 
 * FSRS models memory using:
 * - Stability (S): Time in days for retrievability to decay to 90%
 * - Difficulty (D): Inherent difficulty of the card (1-10 scale)
 * - Retrievability (R): Probability of successful recall
 */

const SRS = (function() {
  // Grade definitions (same interface as before)
  const GRADES = {
    AGAIN: 0,  // Complete failure
    HARD: 1,   // Correct with significant difficulty
    GOOD: 2,   // Correct with some effort
    EASY: 3    // Effortless recall
  };

  // FSRS-5 default parameters (optimized from large dataset)
  // These can be personalized based on user review history
  const PARAMS = {
    w: [
      0.4072,  // w0: Initial stability for Again
      1.1829,  // w1: Initial stability for Hard
      3.1262,  // w2: Initial stability for Good
      15.4722, // w3: Initial stability for Easy
      7.2102,  // w4: Difficulty weight
      0.5316,  // w5: Difficulty weight
      1.0651,  // w6: Difficulty weight
      0.0234,  // w7: Stability decay
      1.616,   // w8: Stability factor for fail
      0.1544,  // w9: Stability factor for hard
      1.0824,  // w10: Stability factor for good
      1.9813,  // w11: Stability factor for easy
      0.0953,  // w12: Forgetting curve factor
      0.2975,  // w13: Stability after forgetting
      2.2042,  // w14: Stability after forgetting
      0.2407,  // w15: Stability after forgetting
      2.9466,  // w16: Stability after forgetting
      0.5034,  // w17: Short-term stability factor
      0.6567   // w18: Short-term stability factor
    ],
    requestRetention: 0.9,  // Target retention rate (90%)
    maximumInterval: 36500, // Max interval in days (~100 years)
    enableShortTerm: true   // Enable short-term scheduling for learning
  };

  // Learning steps in minutes (for short-term scheduling)
  const LEARNING_STEPS = [1, 10];

  /**
   * Create a new card state
   */
  function createCard() {
    return {
      stability: 0,      // S: Memory stability in days
      difficulty: 0,     // D: Card difficulty (1-10)
      elapsedDays: 0,    // Days since last review
      scheduledDays: 0,  // Interval until next review
      reps: 0,           // Total successful reviews
      lapses: 0,         // Times forgotten (Again pressed)
      step: 0,           // Learning step index, -1 = graduated
      due: null,         // null = new card, timestamp = due date
      lastReview: null   // Timestamp of last review
    };
  }

  /**
   * Calculate retrievability (probability of recall)
   * @param {number} stability - Current stability
   * @param {number} elapsedDays - Days since last review
   * @returns {number} Retrievability (0-1)
   */
  function getRetrievability(stability, elapsedDays) {
    if (stability <= 0) return 0;
    const decay = Math.pow(1 + elapsedDays / (9 * stability), -1);
    return decay;
  }

  /**
   * Calculate initial difficulty for a new card based on first grade
   * @param {number} grade - First review grade (0-3)
   * @returns {number} Initial difficulty (1-10)
   */
  function initDifficulty(grade) {
    const w = PARAMS.w;
    return Math.min(10, Math.max(1,
      w[4] - Math.exp(w[5] * (grade - 1)) + 1
    ));
  }

  /**
   * Calculate initial stability for a new card
   * @param {number} grade - First review grade (0-3)
   * @returns {number} Initial stability in days
   */
  function initStability(grade) {
    return Math.max(0.1, PARAMS.w[grade]);
  }

  /**
   * Update difficulty after a review
   * @param {number} difficulty - Current difficulty
   * @param {number} grade - Review grade (0-3)
   * @returns {number} New difficulty (1-10)
   */
  function nextDifficulty(difficulty, grade) {
    const w = PARAMS.w;
    const deltaDifficulty = -w[6] * (grade - 3);
    const meanReversion = w[7] * (initDifficulty(GRADES.GOOD) - difficulty);
    return Math.min(10, Math.max(1,
      difficulty + deltaDifficulty + meanReversion
    ));
  }

  /**
   * Calculate stability after successful recall
   * @param {number} difficulty - Card difficulty
   * @param {number} stability - Current stability
   * @param {number} retrievability - Current retrievability
   * @param {number} grade - Review grade (1-3, not Again)
   * @returns {number} New stability
   */
  function nextRecallStability(difficulty, stability, retrievability, grade) {
    const w = PARAMS.w;
    const hardPenalty = grade === GRADES.HARD ? w[15] : 1;
    const easyBonus = grade === GRADES.EASY ? w[16] : 1;
    
    return stability * (
      1 +
      Math.exp(w[8]) *
      (11 - difficulty) *
      Math.pow(stability, -w[9]) *
      (Math.exp((1 - retrievability) * w[10]) - 1) *
      hardPenalty *
      easyBonus
    );
  }

  /**
   * Calculate stability after forgetting (Again)
   * @param {number} difficulty - Card difficulty
   * @param {number} stability - Current stability
   * @param {number} retrievability - Current retrievability
   * @returns {number} New stability
   */
  function nextForgetStability(difficulty, stability, retrievability) {
    const w = PARAMS.w;
    return Math.max(0.1,
      w[11] *
      Math.pow(difficulty, -w[12]) *
      (Math.pow(stability + 1, w[13]) - 1) *
      Math.exp((1 - retrievability) * w[14])
    );
  }

  /**
   * Calculate interval from stability
   * @param {number} stability - Memory stability
   * @returns {number} Interval in days
   */
  function stabilityToInterval(stability) {
    const requestRetention = PARAMS.requestRetention;
    const interval = (stability / 9) * (Math.pow(requestRetention, -1) - 1);
    return Math.min(PARAMS.maximumInterval, Math.max(1, Math.round(interval)));
  }

  /**
   * Calculate next review state based on grade (main entry point)
   * @param {Object} card - Current card state
   * @param {number} grade - Grade (0-3)
   * @returns {Object} New card state
   */
  function calculate(card, grade) {
    const now = Date.now();
    let { stability, difficulty, reps, lapses, step, lastReview } = card;
    
    // Calculate elapsed days since last review
    let elapsedDays = 0;
    if (lastReview) {
      elapsedDays = Math.max(0, (now - lastReview) / (24 * 60 * 60 * 1000));
    }

    // Handle Again - card forgotten
    if (grade === GRADES.AGAIN) {
      if (reps === 0) {
        // First review - initialize with Again parameters
        stability = initStability(GRADES.AGAIN);
        difficulty = initDifficulty(GRADES.AGAIN);
      } else {
        // Lapse - recalculate stability after forgetting
        const retrievability = getRetrievability(stability, elapsedDays);
        stability = nextForgetStability(difficulty, stability, retrievability);
        difficulty = nextDifficulty(difficulty, GRADES.AGAIN);
      }
      
      return {
        stability,
        difficulty,
        elapsedDays: 0,
        scheduledDays: 0,
        reps,
        lapses: lapses + 1,
        step: 0, // Back to first learning step
        due: now + LEARNING_STEPS[0] * 60 * 1000,
        lastReview: now
      };
    }

    // Handle new card (first successful review)
    if (reps === 0) {
      stability = initStability(grade);
      difficulty = initDifficulty(grade);
      
      // Easy skips learning entirely
      if (grade === GRADES.EASY) {
        const interval = stabilityToInterval(stability);
        return {
          stability,
          difficulty,
          elapsedDays: 0,
          scheduledDays: interval,
          reps: 1,
          lapses: 0,
          step: -1, // Graduated
          due: now + interval * 24 * 60 * 60 * 1000,
          lastReview: now
        };
      }
      
      // Good also graduates immediately (skip remaining learning steps)
      if (grade === GRADES.GOOD) {
        const interval = stabilityToInterval(stability);
        return {
          stability,
          difficulty,
          elapsedDays: 0,
          scheduledDays: interval,
          reps: 1,
          lapses: 0,
          step: -1,
          due: now + interval * 24 * 60 * 60 * 1000,
          lastReview: now
        };
      }
      
      // Hard goes through learning steps
      return {
        stability,
        difficulty,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        step: 1,
        due: now + LEARNING_STEPS[1] * 60 * 1000,
        lastReview: now
      };
    }

    // Card in learning phase
    if (step >= 0 && step < LEARNING_STEPS.length) {
      // Easy skips remaining learning
      if (grade === GRADES.EASY) {
        const retrievability = getRetrievability(stability, elapsedDays);
        stability = nextRecallStability(difficulty, stability, retrievability, grade);
        difficulty = nextDifficulty(difficulty, grade);
        const interval = stabilityToInterval(stability);
        
        return {
          stability,
          difficulty,
          elapsedDays: 0,
          scheduledDays: interval,
          reps: reps + 1,
          lapses,
          step: -1,
          due: now + interval * 24 * 60 * 60 * 1000,
          lastReview: now
        };
      }
      
      // Good graduates from learning
      if (grade === GRADES.GOOD) {
        const retrievability = getRetrievability(stability, elapsedDays);
        stability = nextRecallStability(difficulty, stability, retrievability, grade);
        difficulty = nextDifficulty(difficulty, grade);
        const interval = stabilityToInterval(stability);
        
        return {
          stability,
          difficulty,
          elapsedDays: 0,
          scheduledDays: interval,
          reps: reps + 1,
          lapses,
          step: -1,
          due: now + interval * 24 * 60 * 60 * 1000,
          lastReview: now
        };
      }
      
      // Hard continues through learning steps
      const nextStep = step + 1;
      if (nextStep >= LEARNING_STEPS.length) {
        // Graduate after completing learning
        const retrievability = getRetrievability(stability, elapsedDays);
        stability = nextRecallStability(difficulty, stability, retrievability, grade);
        difficulty = nextDifficulty(difficulty, grade);
        const interval = stabilityToInterval(stability);
        
        return {
          stability,
          difficulty,
          elapsedDays: 0,
          scheduledDays: interval,
          reps: reps + 1,
          lapses,
          step: -1,
          due: now + interval * 24 * 60 * 60 * 1000,
          lastReview: now
        };
      }
      
      return {
        stability,
        difficulty,
        elapsedDays: 0,
        scheduledDays: 0,
        reps,
        lapses,
        step: nextStep,
        due: now + LEARNING_STEPS[nextStep] * 60 * 1000,
        lastReview: now
      };
    }

    // Graduated card - normal review
    const retrievability = getRetrievability(stability, elapsedDays);
    stability = nextRecallStability(difficulty, stability, retrievability, grade);
    difficulty = nextDifficulty(difficulty, grade);
    const interval = stabilityToInterval(stability);

    return {
      stability,
      difficulty,
      elapsedDays: 0,
      scheduledDays: interval,
      reps: reps + 1,
      lapses,
      step: -1,
      due: now + interval * 24 * 60 * 60 * 1000,
      lastReview: now
    };
  }

  /**
   * Get human-readable interval string
   * @param {Object} card - Card state
   * @param {number} grade - Potential grade
   * @returns {string} Interval string (e.g., "1m", "1d", "2w")
   */
  function getIntervalString(card, grade) {
    const nextState = calculate(card, grade);

    if (nextState.step >= 0) {
      // Still in learning
      const stepIndex = nextState.step;
      const mins = LEARNING_STEPS[stepIndex] || 1;
      return `${mins}m`;
    }

    const days = nextState.scheduledDays;
    if (days < 1) return '<1d';
    if (days === 1) return '1d';
    if (days < 7) return `${days}d`;
    if (days < 30) return `${Math.round(days / 7)}w`;
    if (days < 365) return `${Math.round(days / 30)}mo`;
    return `${(days / 365).toFixed(1)}y`;
  }

  /**
   * Check if a card is due for review
   * @param {Object} card - Card state
   * @returns {boolean}
   */
  function isDue(card) {
    if (card.due === null) return false; // New card
    return Date.now() >= card.due;
  }

  /**
   * Check if a card is new (never reviewed)
   * @param {Object} card - Card state
   * @returns {boolean}
   */
  function isNew(card) {
    return card.due === null;
  }

  /**
   * Check if a card is in learning phase
   * @param {Object} card - Card state
   * @returns {boolean}
   */
  function isLearning(card) {
    return card.step >= 0;
  }

  /**
   * Check if a card is mature (interval >= 21 days)
   * @param {Object} card - Card state
   * @returns {boolean}
   */
  function isMature(card) {
    return card.scheduledDays >= 21;
  }

  /**
   * Get card status string
   * @param {Object} card - Card state
   * @returns {string} 'new' | 'learning' | 'review' | 'mature'
   */
  function getStatus(card) {
    if (isNew(card)) return 'new';
    if (isLearning(card)) return 'learning';
    if (isMature(card)) return 'mature';
    return 'review';
  }

  /**
   * Get current retrievability for a card
   * @param {Object} card - Card state
   * @returns {number} Retrievability percentage (0-100)
   */
  function getCurrentRetrievability(card) {
    if (!card.lastReview || card.stability <= 0) return 100;
    const elapsedDays = (Date.now() - card.lastReview) / (24 * 60 * 60 * 1000);
    return Math.round(getRetrievability(card.stability, elapsedDays) * 100);
  }

  // Public API
  return {
    GRADES,
    PARAMS,
    createCard,
    calculate,
    getIntervalString,
    isDue,
    isNew,
    isLearning,
    isMature,
    getStatus,
    getCurrentRetrievability,
    getRetrievability
  };
})();
