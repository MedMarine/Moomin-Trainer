/**
 * icons.js - Cute SVG icons for vocabulary flashcard visual memory aids
 * Moomin Japanese Trainer
 * 
 * Design: Simple, Moomin-inspired icons using the app's color palette
 * All icons use viewBox="0 0 64 64" for consistent sizing
 */

const CardIcons = (function() {
  
  // Color palette (matches CSS variables)
  const COLORS = {
    accent: '#7eb8da',      // Moomin blue
    accentBright: '#a8d4f0', // Light blue highlight
    primary: '#f0f6fc',      // White/cream
    warning: '#d29922',      // Gold
    muted: '#8b949e',        // Gray
    pink: '#f0a5b5',         // Cherry blossom pink
    green: '#3fb950'         // Nature green
  };

  // ============================================================================
  // NATURE & SEASONS
  // ============================================================================

  const nature = {
    // 春 - Spring: Cherry blossom
    '春': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="28" r="6" fill="${COLORS.pink}" opacity="0.8"/>
      <circle cx="24" cy="36" r="5" fill="${COLORS.pink}" opacity="0.7"/>
      <circle cx="40" cy="36" r="5" fill="${COLORS.pink}" opacity="0.7"/>
      <circle cx="26" cy="44" r="4" fill="${COLORS.pink}" opacity="0.6"/>
      <circle cx="38" cy="44" r="4" fill="${COLORS.pink}" opacity="0.6"/>
      <circle cx="32" cy="36" r="3" fill="${COLORS.warning}" opacity="0.9"/>
      <path d="M32 48 L32 56" stroke="${COLORS.green}" stroke-width="2" stroke-linecap="round"/>
      <path d="M28 52 Q32 48 36 52" stroke="${COLORS.green}" stroke-width="1.5" fill="none"/>
    </svg>`,

    // 冬 - Winter: Snowflake
    '冬': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="32" y1="12" x2="32" y2="52" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="32" x2="52" y2="32" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <line x1="18" y1="18" x2="46" y2="46" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <line x1="46" y1="18" x2="18" y2="46" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="4" fill="${COLORS.accentBright}"/>
      <circle cx="32" cy="16" r="2" fill="${COLORS.primary}"/>
      <circle cx="32" cy="48" r="2" fill="${COLORS.primary}"/>
      <circle cx="16" cy="32" r="2" fill="${COLORS.primary}"/>
      <circle cx="48" cy="32" r="2" fill="${COLORS.primary}"/>
    </svg>`,

    // 雪 - Snow: Falling snowflakes
    '雪': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="16" r="4" fill="${COLORS.primary}" opacity="0.9"/>
      <circle cx="44" cy="12" r="3" fill="${COLORS.primary}" opacity="0.7"/>
      <circle cx="32" cy="24" r="5" fill="${COLORS.accentBright}" opacity="0.8"/>
      <circle cx="16" cy="36" r="3" fill="${COLORS.primary}" opacity="0.6"/>
      <circle cx="48" cy="32" r="4" fill="${COLORS.primary}" opacity="0.8"/>
      <circle cx="28" cy="44" r="4" fill="${COLORS.accentBright}" opacity="0.7"/>
      <circle cx="44" cy="48" r="3" fill="${COLORS.primary}" opacity="0.6"/>
      <circle cx="18" cy="52" r="2" fill="${COLORS.primary}" opacity="0.5"/>
      <path d="M8 56 Q32 48 56 56" stroke="${COLORS.muted}" stroke-width="1.5" fill="none" opacity="0.5"/>
    </svg>`,

    // 山 - Mountain: Simple peak
    '山': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 52 L28 16 L36 28 L44 20 L56 52 Z" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <path d="M28 16 L24 24 L32 24 L28 16" fill="${COLORS.primary}" opacity="0.8"/>
      <path d="M44 20 L40 28 L48 28 L44 20" fill="${COLORS.primary}" opacity="0.6"/>
      <line x1="8" y1="52" x2="56" y2="52" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    // 海 - Sea: Wave
    '海': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 28 Q16 20 24 28 T40 28 T56 28" stroke="${COLORS.accent}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M8 38 Q16 30 24 38 T40 38 T56 38" stroke="${COLORS.accentBright}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M8 48 Q16 40 24 48 T40 48 T56 48" stroke="${COLORS.accent}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6"/>
    </svg>`,

    // 雲 - Cloud: Fluffy cloud
    '雲': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="36" r="12" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="40" cy="36" r="10" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="32" cy="28" r="10" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <rect x="16" y="36" width="32" height="12" fill="${COLORS.primary}" opacity="0.1"/>
      <path d="M12 42 L52 42" stroke="${COLORS.accentBright}" stroke-width="1.5" opacity="0.5"/>
    </svg>`,

    // 谷 - Valley: V-shape with curves
    '谷': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 16 L8 24 Q8 32 16 40 L32 52 L48 40 Q56 32 56 24 L56 16" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20 28 Q32 44 44 28" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none" opacity="0.6"/>
      <circle cx="32" cy="48" r="3" fill="${COLORS.green}" opacity="0.6"/>
    </svg>`,

    // 空 - Sky: Sun and clouds hint
    '空': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="10" stroke="${COLORS.warning}" stroke-width="2" fill="none"/>
      <line x1="24" y1="8" x2="24" y2="12" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="24" y1="36" x2="24" y2="40" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="24" x2="12" y2="24" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="36" y1="24" x2="40" y2="24" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="44" cy="44" r="6" stroke="${COLORS.accent}" stroke-width="1.5" fill="none" opacity="0.6"/>
      <circle cx="52" cy="44" r="5" stroke="${COLORS.accent}" stroke-width="1.5" fill="none" opacity="0.6"/>
    </svg>`
  };

  // ============================================================================
  // FAMILY & PEOPLE
  // ============================================================================

  const people = {
    // パパ - Papa: Simple face with top hat hint
    'パパ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="36" r="14" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <rect x="22" y="12" width="20" height="12" rx="2" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <rect x="18" y="22" width="28" height="4" rx="1" fill="${COLORS.accent}"/>
      <circle cx="27" cy="34" r="2" fill="${COLORS.primary}"/>
      <circle cx="37" cy="34" r="2" fill="${COLORS.primary}"/>
      <path d="M28 42 Q32 46 36 42" stroke="${COLORS.primary}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </svg>`,

    // ママ - Mama: Female face
    'ママ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="14" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M18 28 Q18 16 32 16 Q46 16 46 28" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="27" cy="30" r="2" fill="${COLORS.primary}"/>
      <circle cx="37" cy="30" r="2" fill="${COLORS.primary}"/>
      <path d="M28 38 Q32 42 36 38" stroke="${COLORS.primary}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <rect x="26" y="48" width="12" height="8" rx="2" stroke="${COLORS.pink}" stroke-width="1.5" fill="none" opacity="0.7"/>
    </svg>`,

    // お姉ちゃん - Big sister
    'お姉ちゃん': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="28" r="12" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M20 24 Q20 12 32 14 Q44 12 44 24" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="28" cy="26" r="1.5" fill="${COLORS.primary}"/>
      <circle cx="36" cy="26" r="1.5" fill="${COLORS.primary}"/>
      <path d="M29 33 Q32 36 35 33" stroke="${COLORS.primary}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M26 44 L32 56 L38 44" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <line x1="32" y1="40" x2="32" y2="44" stroke="${COLORS.accent}" stroke-width="2"/>
    </svg>`,

    // お兄さん - Big brother
    'お兄さん': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="28" r="12" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M22 22 L24 16 L40 16 L42 22" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <circle cx="28" cy="26" r="1.5" fill="${COLORS.primary}"/>
      <circle cx="36" cy="26" r="1.5" fill="${COLORS.primary}"/>
      <path d="M29 33 Q32 36 35 33" stroke="${COLORS.primary}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <rect x="26" y="42" width="12" height="14" rx="2" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
    </svg>`,

    // 僕 - I (male): Figure pointing at self
    '僕': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="20" r="10" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="32" y1="30" x2="32" y2="48" stroke="${COLORS.accent}" stroke-width="2"/>
      <line x1="20" y1="38" x2="32" y2="44" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <line x1="44" y1="38" x2="32" y2="48" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="23" cy="36" r="3" fill="${COLORS.accentBright}" opacity="0.8"/>
      <line x1="32" y1="48" x2="24" y2="60" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <line x1="32" y1="48" x2="40" y2="60" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    // 私 - I (neutral)
    '私': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="20" r="10" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M24 32 L32 56 L40 32" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <line x1="32" y1="30" x2="32" y2="40" stroke="${COLORS.accent}" stroke-width="2"/>
      <circle cx="32" cy="20" r="4" fill="${COLORS.accentBright}" opacity="0.3"/>
    </svg>`,

    // みんな - Everyone: Multiple figures
    'みんな': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="24" r="7" stroke="${COLORS.accent}" stroke-width="1.5" fill="none"/>
      <line x1="20" y1="31" x2="20" y2="44" stroke="${COLORS.accent}" stroke-width="1.5"/>
      <circle cx="32" cy="20" r="8" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="32" y1="28" x2="32" y2="44" stroke="${COLORS.accent}" stroke-width="2"/>
      <circle cx="44" cy="24" r="7" stroke="${COLORS.accent}" stroke-width="1.5" fill="none"/>
      <line x1="44" y1="31" x2="44" y2="44" stroke="${COLORS.accent}" stroke-width="1.5"/>
      <path d="M12 52 Q32 44 52 52" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none" opacity="0.6"/>
    </svg>`,

    // 誰 - Who: Person with question mark
    '誰': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="32" r="12" stroke="${COLORS.muted}" stroke-width="2" fill="none" stroke-dasharray="4 2"/>
      <text x="42" y="28" font-family="Arial" font-size="24" font-weight="bold" fill="${COLORS.accent}">?</text>
      <circle cx="24" cy="30" r="1.5" fill="${COLORS.muted}"/>
      <circle cx="32" cy="30" r="1.5" fill="${COLORS.muted}"/>
    </svg>`
  };

  // ============================================================================
  // OBJECTS
  // ============================================================================

  const objects = {
    // 家 - House
    '家': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 32 L32 12 L52 32" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <rect x="16" y="32" width="32" height="24" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <rect x="26" y="40" width="12" height="16" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="35" cy="48" r="1.5" fill="${COLORS.warning}"/>
      <rect x="20" y="36" width="6" height="6" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none"/>
      <rect x="38" y="36" width="6" height="6" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none"/>
    </svg>`,

    // 帽子 - Hat (Hobgoblin's top hat!)
    '帽子': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="48" rx="20" ry="6" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <rect x="20" y="16" width="24" height="32" rx="2" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <ellipse cx="32" cy="16" rx="12" ry="4" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M22 36 Q32 32 42 36" stroke="${COLORS.warning}" stroke-width="2" fill="none"/>
      <text x="29" y="28" font-family="Arial" font-size="10" fill="${COLORS.accentBright}">✧</text>
    </svg>`,

    // 船 - Ship/boat
    '船': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 44 L16 52 L48 52 L56 44 L44 44 L44 24 L32 12 L32 44 Z" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <path d="M32 24 L44 24 L44 36 L32 36" stroke="${COLORS.accent}" stroke-width="1.5" fill="none"/>
      <path d="M8 48 Q32 56 56 48" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none" opacity="0.6"/>
    </svg>`,

    // 夢 - Dream: Cloud with star
    '夢': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="36" r="10" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-dasharray="3 2"/>
      <circle cx="38" cy="36" r="8" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-dasharray="3 2"/>
      <circle cx="32" cy="28" r="8" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-dasharray="3 2"/>
      <path d="M32 18 L33.5 24 L40 24 L35 28 L37 34 L32 30 L27 34 L29 28 L24 24 L30.5 24 Z" fill="${COLORS.warning}" opacity="0.8"/>
    </svg>`,

    // 旅 - Trip/journey: Path with footsteps
    '旅': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 52 Q24 44 32 48 Q40 52 52 44" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="20" cy="36" r="3" fill="${COLORS.accentBright}" opacity="0.6"/>
      <circle cx="32" cy="32" r="3" fill="${COLORS.accentBright}" opacity="0.7"/>
      <circle cx="44" cy="28" r="3" fill="${COLORS.accentBright}" opacity="0.8"/>
      <path d="M44 20 L48 12 L52 20" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linejoin="round"/>
    </svg>`,

    // 話 - Talk/story: Speech bubble
    '話': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 16 L52 16 Q56 16 56 20 L56 40 Q56 44 52 44 L24 44 L16 52 L16 44 L12 44 Q8 44 8 40 L8 20 Q8 16 12 16 Z" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="16" y1="24" x2="48" y2="24" stroke="${COLORS.accentBright}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      <line x1="16" y1="32" x2="40" y2="32" stroke="${COLORS.accentBright}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
    </svg>`,

    // 物語 - Tale: Open book
    '物語': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 16 Q16 20 32 16 Q48 20 56 16 L56 48 Q48 44 32 48 Q16 44 8 48 Z" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="32" y1="16" x2="32" y2="48" stroke="${COLORS.accent}" stroke-width="2"/>
      <line x1="14" y1="24" x2="26" y2="26" stroke="${COLORS.accentBright}" stroke-width="1" opacity="0.5"/>
      <line x1="14" y1="32" x2="26" y2="34" stroke="${COLORS.accentBright}" stroke-width="1" opacity="0.5"/>
      <line x1="38" y1="26" x2="50" y2="24" stroke="${COLORS.accentBright}" stroke-width="1" opacity="0.5"/>
      <line x1="38" y1="34" x2="50" y2="32" stroke="${COLORS.accentBright}" stroke-width="1" opacity="0.5"/>
    </svg>`
  };

  // ============================================================================
  // VERBS - MOVEMENT
  // ============================================================================

  const verbsMovement = {
    // 来る - To come: Arrow toward viewer
    '来る': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M32 16 L32 44" stroke="${COLORS.accent}" stroke-width="3" stroke-linecap="round"/>
      <path d="M24 36 L32 48 L40 36" stroke="${COLORS.accent}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    // 行く - To go: Arrow away
    '行く': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M32 48 L32 20" stroke="${COLORS.accent}" stroke-width="3" stroke-linecap="round"/>
      <path d="M24 28 L32 16 L40 28" stroke="${COLORS.accent}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    // 帰る - To return: Circular arrow + house
    '帰る': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M44 20 A16 16 0 1 1 20 36" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M16 28 L20 36 L28 32" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28 44 L36 36 L44 44" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
      <rect x="30" y="44" width="12" height="10" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none"/>
    </svg>`,

    // 飛ぶ - To fly: Wings
    '飛ぶ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 32 Q16 24 8 32 Q16 40 32 32" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M32 32 Q48 24 56 32 Q48 40 32 32" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <ellipse cx="32" cy="32" rx="6" ry="4" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="20" y1="20" x2="16" y2="16" stroke="${COLORS.accentBright}" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <line x1="44" y1="20" x2="48" y2="16" stroke="${COLORS.accentBright}" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
    </svg>`,

    // 乗る - To ride: Person on vehicle
    '乗る': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="20" r="8" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M32 28 L32 40 L24 52" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 40 L40 52" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="32" cy="52" rx="18" ry="6" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="20" cy="52" r="3" fill="${COLORS.accentBright}" opacity="0.6"/>
      <circle cx="44" cy="52" r="3" fill="${COLORS.accentBright}" opacity="0.6"/>
    </svg>`,

    // 落ちる - To fall: Downward motion
    '落ちる': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="20" r="8" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M32 28 L32 48" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 4"/>
      <path d="M24 44 L32 56 L40 44" stroke="${COLORS.accent}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="20" y1="24" x2="16" y2="28" stroke="${COLORS.muted}" stroke-width="1.5" opacity="0.5"/>
      <line x1="44" y1="24" x2="48" y2="28" stroke="${COLORS.muted}" stroke-width="1.5" opacity="0.5"/>
    </svg>`,

    // 登る - To climb
    '登る': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 52 L32 20 L52 52" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <circle cx="28" cy="36" r="5" stroke="${COLORS.accent}" stroke-width="1.5" fill="none"/>
      <path d="M24 40 L28 44 L32 40" stroke="${COLORS.accent}" stroke-width="1.5" fill="none"/>
      <path d="M36 28 L32 24 L28 28" stroke="${COLORS.accentBright}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  };

  // ============================================================================
  // VERBS - SENSES & COMMUNICATION
  // ============================================================================

  const verbsSenses = {
    // 見る - To see: Eye
    '見る': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="32" rx="22" ry="14" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="32" cy="32" r="10" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="32" cy="32" r="4" fill="${COLORS.accentBright}"/>
      <circle cx="34" cy="30" r="1.5" fill="${COLORS.primary}"/>
    </svg>`,

    // 聞く - To hear: Ear
    '聞く': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 16 Q52 20 52 32 Q52 44 44 52 L40 52" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M36 24 Q44 28 44 32 Q44 36 36 40" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M20 28 Q12 32 12 40 Q12 48 20 52 L28 52 L28 40 Q28 32 20 28" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="20" y1="32" x2="20" y2="44" stroke="${COLORS.accentBright}" stroke-width="1.5" opacity="0.6"/>
    </svg>`,

    // 言う - To say: Speech marks
    '言う': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 16 L20 28 Q20 32 24 32" stroke="${COLORS.accent}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M32 16 L32 28 Q32 32 36 32" stroke="${COLORS.accent}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="48" r="12" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M28 46 L32 50 L36 46" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </svg>`,

    // 呼ぶ - To call
    '呼ぶ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="28" r="10" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M24 32 L24 36 Q24 40 28 40" stroke="${COLORS.accent}" stroke-width="1.5" fill="none"/>
      <path d="M36 24 Q44 20 48 24" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M38 32 Q48 28 52 32" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M40 40 Q52 36 56 40" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,

    // 知る - To know: Light bulb
    '知る': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="28" r="14" stroke="${COLORS.warning}" stroke-width="2" fill="none"/>
      <path d="M26 40 L26 48 L38 48 L38 40" stroke="${COLORS.warning}" stroke-width="2" fill="none"/>
      <line x1="28" y1="52" x2="36" y2="52" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="32" y1="12" x2="32" y2="8" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="44" y1="16" x2="48" y2="12" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="20" y1="16" x2="16" y2="12" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    // 分かる - To understand: Checkmark in head
    '分かる': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="18" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M24 32 L30 38 L42 26" stroke="${COLORS.green}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  };

  // ============================================================================
  // VERBS - STATES & ACTIONS
  // ============================================================================

  const verbsStates = {
    // 眠る - To sleep: Closed eyes + zzz
    '眠る': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="36" r="16" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M24 34 Q28 38 32 34" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M32 34 Q36 38 40 34" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <text x="44" y="24" font-family="Arial" font-size="12" font-weight="bold" fill="${COLORS.accentBright}">z</text>
      <text x="50" y="18" font-family="Arial" font-size="10" fill="${COLORS.accentBright}">z</text>
    </svg>`,

    // 起きる - To wake up: Open eyes + sun
    '起きる': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="36" r="16" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="26" cy="34" r="3" fill="${COLORS.accentBright}"/>
      <circle cx="38" cy="34" r="3" fill="${COLORS.accentBright}"/>
      <circle cx="27" cy="33" r="1" fill="${COLORS.primary}"/>
      <circle cx="39" cy="33" r="1" fill="${COLORS.primary}"/>
      <circle cx="52" cy="16" r="6" stroke="${COLORS.warning}" stroke-width="1.5" fill="none"/>
      <line x1="52" y1="6" x2="52" y2="8" stroke="${COLORS.warning}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="60" y1="12" x2="58" y2="14" stroke="${COLORS.warning}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    // 待つ - To wait: Hourglass/clock
    '待つ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 12 L44 12 L44 16 L36 32 L44 48 L44 52 L20 52 L20 48 L28 32 L20 16 Z" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <path d="M24 16 L24 18 L32 28 L40 18 L40 16" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none"/>
      <circle cx="32" cy="40" r="3" fill="${COLORS.accentBright}" opacity="0.6"/>
      <circle cx="28" cy="44" r="2" fill="${COLORS.accentBright}" opacity="0.4"/>
      <circle cx="36" cy="44" r="2" fill="${COLORS.accentBright}" opacity="0.4"/>
    </svg>`,

    // 作る - To make: Hammer/tool
    '作る': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="28" y="8" width="8" height="20" rx="2" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <rect x="26" y="28" width="12" height="8" rx="1" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="32" y1="36" x2="32" y2="56" stroke="${COLORS.accent}" stroke-width="3" stroke-linecap="round"/>
      <path d="M16 48 L24 52" stroke="${COLORS.accentBright}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      <path d="M48 48 L40 52" stroke="${COLORS.accentBright}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
    </svg>`,

    // 始める - To begin: Play button
    '始める': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M26 20 L26 44 L46 32 Z" stroke="${COLORS.accent}" stroke-width="2" fill="${COLORS.accentBright}" opacity="0.3" stroke-linejoin="round"/>
    </svg>`,

    // 忘れる - To forget: Fading thought
    '忘れる': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="36" r="16" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="27" cy="34" r="2" fill="${COLORS.muted}" opacity="0.5"/>
      <circle cx="37" cy="34" r="2" fill="${COLORS.muted}" opacity="0.5"/>
      <path d="M28 42 Q32 40 36 42" stroke="${COLORS.muted}" stroke-width="1.5" fill="none"/>
      <circle cx="44" cy="16" r="6" stroke="${COLORS.muted}" stroke-width="1.5" fill="none" opacity="0.4" stroke-dasharray="2 2"/>
      <text x="42" y="20" font-family="Arial" font-size="8" fill="${COLORS.muted}" opacity="0.4">?</text>
    </svg>`,

    // 思い出す - To remember: Light bulb moment
    '思い出す': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="36" r="16" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="27" cy="34" r="2.5" fill="${COLORS.accentBright}"/>
      <circle cx="37" cy="34" r="2.5" fill="${COLORS.accentBright}"/>
      <path d="M28 42 Q32 46 36 42" stroke="${COLORS.primary}" stroke-width="1.5" fill="none"/>
      <circle cx="48" cy="14" r="6" stroke="${COLORS.warning}" stroke-width="1.5" fill="none"/>
      <line x1="48" y1="6" x2="48" y2="4" stroke="${COLORS.warning}" stroke-width="1.5"/>
      <line x1="54" y1="10" x2="56" y2="8" stroke="${COLORS.warning}" stroke-width="1.5"/>
      <text x="46" y="17" font-family="Arial" font-size="8" fill="${COLORS.warning}">!</text>
    </svg>`,

    // 遊ぶ - To play
    '遊ぶ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="10" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="40" cy="24" r="10" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M24 32 Q32 48 40 32" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="21" cy="22" r="1.5" fill="${COLORS.primary}"/>
      <circle cx="37" cy="22" r="1.5" fill="${COLORS.primary}"/>
      <path d="M22 26 Q24 28 26 26" stroke="${COLORS.primary}" stroke-width="1"/>
      <path d="M38 26 Q40 28 42 26" stroke="${COLORS.primary}" stroke-width="1"/>
      <circle cx="32" cy="52" r="6" stroke="${COLORS.pink}" stroke-width="1.5" fill="none" opacity="0.6"/>
    </svg>`,

    // 探す - To search
    '探す': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="14" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="38" y1="38" x2="52" y2="52" stroke="${COLORS.accent}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="28" cy="28" r="6" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none" opacity="0.5"/>
    </svg>`,

    // 見つかる - To be found
    '見つかる': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="14" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="38" y1="38" x2="52" y2="52" stroke="${COLORS.accent}" stroke-width="3" stroke-linecap="round"/>
      <path d="M22 28 L26 32 L34 24" stroke="${COLORS.green}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    // 隠れる - To hide
    '隠れる': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="28" width="32" height="28" rx="4" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="32" cy="20" r="10" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="28" cy="18" r="1.5" fill="${COLORS.primary}"/>
      <circle cx="36" cy="18" r="1.5" fill="${COLORS.primary}"/>
      <path d="M16 36 L48 36" stroke="${COLORS.accent}" stroke-width="2"/>
    </svg>`,

    // 捨てる - To throw away
    '捨てる': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 20 L24 56 L40 56 L44 20" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <line x1="16" y1="20" x2="48" y2="20" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <path d="M26 20 L26 14 L38 14 L38 20" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="28" y1="28" x2="28" y2="48" stroke="${COLORS.muted}" stroke-width="1.5" opacity="0.5"/>
      <line x1="36" y1="28" x2="36" y2="48" stroke="${COLORS.muted}" stroke-width="1.5" opacity="0.5"/>
    </svg>`,

    // かくれんぼ - Hide and seek
    'かくれんぼ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="32" width="24" height="24" rx="4" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="20" cy="24" r="8" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="17" cy="22" r="1" fill="${COLORS.primary}"/>
      <circle cx="23" cy="22" r="1" fill="${COLORS.primary}"/>
      <circle cx="48" cy="28" r="10" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M44 26 Q48 30 52 26" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <text x="46" y="46" font-family="Arial" font-size="16" fill="${COLORS.accent}">10</text>
    </svg>`
  };

  // ============================================================================
  // ADJECTIVES
  // ============================================================================

  const adjectives = {
    // 大きい - Big: Large circle
    '大きい': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="24" stroke="${COLORS.accent}" stroke-width="2.5" fill="none"/>
      <circle cx="32" cy="32" r="8" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none" opacity="0.5"/>
    </svg>`,

    // 早い - Early/fast: Clock with fast hands
    '早い': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="32" y1="32" x2="32" y2="18" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <line x1="32" y1="32" x2="44" y2="32" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="3" fill="${COLORS.accentBright}"/>
      <path d="M48 16 L54 10 L56 16" stroke="${COLORS.warning}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="52" y1="20" x2="56" y2="16" stroke="${COLORS.warning}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    // 面白い - Interesting: Star eyes
    '面白い': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M24 28 L25 32 L22 30 L27 30 L24 32 Z" fill="${COLORS.warning}"/>
      <path d="M40 28 L41 32 L38 30 L43 30 L40 32 Z" fill="${COLORS.warning}"/>
      <path d="M26 40 Q32 46 38 40" stroke="${COLORS.primary}" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,

    // 寂しい - Lonely: Single figure with rain
    '寂しい': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="28" r="12" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="32" y1="40" x2="32" y2="56" stroke="${COLORS.accent}" stroke-width="2"/>
      <circle cx="28" cy="26" r="1.5" fill="${COLORS.muted}"/>
      <circle cx="36" cy="26" r="1.5" fill="${COLORS.muted}"/>
      <path d="M29 32 Q32 30 35 32" stroke="${COLORS.muted}" stroke-width="1.5" fill="none"/>
      <line x1="12" y1="16" x2="12" y2="24" stroke="${COLORS.accentBright}" stroke-width="1" opacity="0.4"/>
      <line x1="52" y1="20" x2="52" y2="28" stroke="${COLORS.accentBright}" stroke-width="1" opacity="0.4"/>
      <line x1="20" y1="12" x2="20" y2="20" stroke="${COLORS.accentBright}" stroke-width="1" opacity="0.3"/>
    </svg>`,

    // 暖かい - Warm: Sun with rays
    '暖かい': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="12" stroke="${COLORS.warning}" stroke-width="2" fill="none"/>
      <line x1="32" y1="12" x2="32" y2="16" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="32" y1="48" x2="32" y2="52" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="32" x2="16" y2="32" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="48" y1="32" x2="52" y2="32" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="18" y1="18" x2="21" y2="21" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="43" y1="43" x2="46" y2="46" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="46" y1="18" x2="43" y2="21" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
      <line x1="21" y1="43" x2="18" y2="46" stroke="${COLORS.warning}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    // 危ない - Dangerous: Warning triangle
    '危ない': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8 L56 52 L8 52 Z" stroke="#f85149" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <line x1="32" y1="24" x2="32" y2="36" stroke="#f85149" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="44" r="2.5" fill="#f85149"/>
    </svg>`,

    // 素晴らしい - Wonderful: Stars/sparkles
    '素晴らしい': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8 L35 20 L48 20 L38 28 L42 40 L32 32 L22 40 L26 28 L16 20 L29 20 Z" stroke="${COLORS.warning}" stroke-width="2" fill="none"/>
      <circle cx="16" cy="44" r="4" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none"/>
      <circle cx="48" cy="44" r="4" stroke="${COLORS.accentBright}" stroke-width="1.5" fill="none"/>
      <line x1="16" y1="40" x2="16" y2="48" stroke="${COLORS.accentBright}" stroke-width="1"/>
      <line x1="12" y1="44" x2="20" y2="44" stroke="${COLORS.accentBright}" stroke-width="1"/>
    </svg>`,

    // 残念 - Unfortunate/regrettable
    '残念': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M24 26 L28 30" stroke="${COLORS.muted}" stroke-width="2" stroke-linecap="round"/>
      <path d="M28 26 L24 30" stroke="${COLORS.muted}" stroke-width="2" stroke-linecap="round"/>
      <path d="M36 26 L40 30" stroke="${COLORS.muted}" stroke-width="2" stroke-linecap="round"/>
      <path d="M40 26 L36 30" stroke="${COLORS.muted}" stroke-width="2" stroke-linecap="round"/>
      <path d="M26 42 Q32 36 38 42" stroke="${COLORS.muted}" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,

    // 本当 - Truth/really
    '本当': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M22 32 L28 38 L42 24" stroke="${COLORS.green}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  };

  // ============================================================================
  // ADVERBS & TIME
  // ============================================================================

  const adverbs = {
    // 今 - Now: Clock at 12
    '今': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="32" y1="32" x2="32" y2="16" stroke="${COLORS.accent}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="32" y1="32" x2="32" y2="24" stroke="${COLORS.accentBright}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="3" fill="${COLORS.warning}"/>
    </svg>`,

    // 今年 - This year: Calendar
    '今年': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="16" width="40" height="40" rx="4" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="12" y1="28" x2="52" y2="28" stroke="${COLORS.accent}" stroke-width="2"/>
      <line x1="20" y1="12" x2="20" y2="20" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <line x1="44" y1="12" x2="44" y2="20" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="42" r="6" stroke="${COLORS.warning}" stroke-width="2" fill="none"/>
    </svg>`,

    // 去年 - Last year: Calendar with arrow back
    '去年': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="16" width="36" height="36" rx="4" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <line x1="16" y1="28" x2="52" y2="28" stroke="${COLORS.accent}" stroke-width="2"/>
      <line x1="24" y1="12" x2="24" y2="20" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <line x1="44" y1="12" x2="44" y2="20" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <path d="M40 42 L24 42" stroke="${COLORS.muted}" stroke-width="2" stroke-linecap="round"/>
      <path d="M28 38 L24 42 L28 46" stroke="${COLORS.muted}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    // もう - Already: Checkmark
    'もう': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 32 L28 44 L48 20" stroke="${COLORS.green}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    // まだ - Still/yet: Hourglass
    'まだ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 12 L44 12 L44 16 L36 32 L44 48 L44 52 L20 52 L20 48 L28 32 L20 16 Z" stroke="${COLORS.accent}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <ellipse cx="32" cy="42" rx="6" ry="4" fill="${COLORS.accentBright}" opacity="0.5"/>
      <line x1="32" y1="24" x2="32" y2="32" stroke="${COLORS.accentBright}" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    // ここ - Here: Pin marker
    'ここ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8 C20 8 12 18 12 28 C12 42 32 56 32 56 C32 56 52 42 52 28 C52 18 44 8 32 8 Z" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="32" cy="28" r="8" fill="${COLORS.accentBright}"/>
    </svg>`,

    // どこ - Where: Compass
    'どこ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <path d="M32 16 L36 32 L32 48 L28 32 Z" stroke="${COLORS.accent}" stroke-width="1.5" fill="none"/>
      <path d="M32 16 L36 32 L32 28 L28 32 Z" fill="${COLORS.accentBright}" opacity="0.6"/>
      <circle cx="32" cy="32" r="3" fill="${COLORS.warning}"/>
      <text x="30" y="12" font-family="Arial" font-size="8" fill="${COLORS.muted}">N</text>
    </svg>`,

    // 何 - What: Question mark
    '何': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <text x="22" y="42" font-family="Arial" font-size="32" font-weight="bold" fill="${COLORS.accentBright}">?</text>
    </svg>`,

    // 一番 - First/best: Medal
    '一番': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="36" r="16" stroke="${COLORS.warning}" stroke-width="2" fill="none"/>
      <path d="M24 12 L32 24 L40 12" stroke="${COLORS.warning}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <text x="27" y="42" font-family="Arial" font-size="16" font-weight="bold" fill="${COLORS.warning}">1</text>
    </svg>`,

    // ちょっと - A little
    'ちょっと': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="16" y1="32" x2="48" y2="32" stroke="${COLORS.muted}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="24" cy="32" r="6" stroke="${COLORS.accent}" stroke-width="2" fill="${COLORS.accentBright}" opacity="0.5"/>
    </svg>`,

    // ずっと - All the time
    'ずっと': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="32" x2="56" y2="32" stroke="${COLORS.accent}" stroke-width="3" stroke-linecap="round"/>
      <path d="M48 24 L56 32 L48 40" stroke="${COLORS.accent}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="16" cy="32" r="4" fill="${COLORS.accentBright}"/>
      <circle cx="32" cy="32" r="4" fill="${COLORS.accentBright}"/>
    </svg>`,

    // とても - Very
    'とても': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="8" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="32" cy="32" r="16" stroke="${COLORS.accent}" stroke-width="2" fill="none" opacity="0.6"/>
      <circle cx="32" cy="32" r="24" stroke="${COLORS.accent}" stroke-width="2" fill="none" opacity="0.3"/>
    </svg>`
  };

  // ============================================================================
  // INTERJECTIONS
  // ============================================================================

  const interjections = {
    // ああ - Ah
    'あ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="18" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <ellipse cx="32" cy="36" rx="8" ry="10" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
    </svg>`,

    // さあ - Well/come on
    'さあ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 32 L44 32" stroke="${COLORS.accent}" stroke-width="3" stroke-linecap="round"/>
      <path d="M36 24 L44 32 L36 40" stroke="${COLORS.accent}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="16" cy="32" r="4" fill="${COLORS.accentBright}"/>
    </svg>`,

    // やあ - Hey/hi
    'やあ': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="28" r="12" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="28" cy="26" r="2" fill="${COLORS.primary}"/>
      <circle cx="36" cy="26" r="2" fill="${COLORS.primary}"/>
      <path d="M28 32 Q32 36 36 32" stroke="${COLORS.primary}" stroke-width="1.5" fill="none"/>
      <path d="M44 20 L52 12" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
      <path d="M48 24 L56 16" stroke="${COLORS.accent}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    // すごい - Amazing
    'すごい': `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="18" stroke="${COLORS.accent}" stroke-width="2" fill="none"/>
      <circle cx="26" cy="28" r="4" fill="${COLORS.warning}"/>
      <circle cx="38" cy="28" r="4" fill="${COLORS.warning}"/>
      <ellipse cx="32" cy="40" rx="6" ry="4" stroke="${COLORS.primary}" stroke-width="2" fill="none"/>
    </svg>`
  };

  // ============================================================================
  // COMBINE ALL CATEGORIES
  // ============================================================================

  const allIcons = {
    ...nature,
    ...people,
    ...objects,
    ...verbsMovement,
    ...verbsSenses,
    ...verbsStates,
    ...adjectives,
    ...adverbs,
    ...interjections
  };

  /**
   * Get SVG icon for a word
   * @param {string} wordId - The vocabulary word ID
   * @returns {string|null} SVG markup or null if no icon exists
   */
  function getIcon(wordId) {
    return allIcons[wordId] || null;
  }

  /**
   * Get all available icon IDs
   * @returns {string[]} Array of word IDs that have icons
   */
  function getAvailableIcons() {
    return Object.keys(allIcons);
  }

  /**
   * Check if an icon exists for a word
   * @param {string} wordId - The vocabulary word ID
   * @returns {boolean}
   */
  function hasIcon(wordId) {
    return wordId in allIcons;
  }

  /**
   * Get icon wrapped in container div
   * @param {string} wordId - The vocabulary word ID
   * @returns {string} HTML string with icon in container
   */
  function renderIcon(wordId) {
    const icon = getIcon(wordId);
    if (!icon) {
      return '<div class="card-icon card-icon-placeholder"></div>';
    }
    return `<div class="card-icon">${icon}</div>`;
  }

  // Public API
  return {
    getIcon,
    getAvailableIcons,
    hasIcon,
    renderIcon,
    COLORS
  };
})();

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CardIcons;
}
