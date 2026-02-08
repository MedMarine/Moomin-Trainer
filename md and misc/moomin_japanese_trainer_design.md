# ムーミン日本語トレーナー — Moomin Japanese Trainer
## Design Document v2.1

---

## 1. Project Overview

### 1.1 Concept
A web-based Japanese language learning application using authentic dialogue from **楽しいムーミン一家** to teach Japanese through context-rich, narrative-driven vocabulary acquisition. The trainer features a built-in SRS (Spaced Repetition System) with n+1 vocabulary ordering, ensuring learners encounter words in an optimal sequence where each new word builds on previously learned material.

### 1.2 Target Audience
- Japanese learners at beginner to intermediate levels (JLPT N5-N4)
- Learners who **already know hiragana and katakana**
- Anime/manga enthusiasts who want to learn through authentic content
- Users who benefit from narrative-driven, contextual learning

### 1.3 Core Philosophy
- **N+1 Learning**: Vocabulary ordered so each word introduces exactly one new concept
- **Context-First**: Every word taught with authentic example sentences from the dialogue
- **Kanji Through Exposure**: Unknown kanji learned via hover tooltips, not isolated study
- **Built-in SRS**: All spaced repetition handled within the app—no external tools needed
- **Conjugation in Context**: See how verbs transform across real dialogue examples
- **Multi-Episode Ready**: Architecture supports seamless addition of new episodes

### 1.4 What We're NOT Building
- Hiragana/katakana lessons (robust solutions exist elsewhere)
- Audio playback (keeping scope focused)
- Anki integration (SRS is built-in)
- Writing/stroke order practice

---

## 2. File Structure

Designed for modularity, small file sizes, and easy episode expansion:

```
moomin-trainer/
├── index.html                 # Minimal shell, layout only
├── css/
│   └── styles.css             # All styling
├── js/
│   ├── app.js                 # Initialization, view routing, state
│   ├── srs.js                 # SRS algorithm (pure logic)
│   ├── cards.js               # Card rendering functions
│   ├── tooltips.js            # Kanji hover tooltip system
│   └── storage.js             # LocalStorage API wrapper
├── data/
│   ├── core/
│   │   ├── particles.json     # Shared particles (は, が, を, etc.)
│   │   ├── common-vocab.json  # High-frequency shared vocabulary
│   │   └── kanji.json         # Master kanji readings dictionary
│   └── episodes/
│       ├── index.json         # Episode registry & metadata
│       └── ep01/
│           ├── meta.json      # Episode title, description, stats
│           ├── vocab.json     # Episode-specific vocabulary
│           └── lines.json     # Dialogue lines for examples
└── tools/
    └── compute-order.js       # N+1 ordering algorithm (dev tool)
```

### 2.1 File Responsibilities

**index.html** (~50 lines)
- Document structure only
- CSS/JS imports
- Empty containers for dynamic content

**css/styles.css** (~400 lines)
- Dark theme variables
- Japanese typography (furigana, kanji)
- Flashcard states and animations
- SRS grade buttons
- Responsive breakpoints

**js/app.js** (~150 lines)
- App initialization
- View switching (dashboard, review, browse)
- Global state management
- Event delegation

**js/srs.js** (~100 lines)
- SM-2 algorithm implementation
- Card scheduling logic
- Due card calculation
- No DOM manipulation

**js/cards.js** (~150 lines)
- Render vocabulary cards
- Render sentence examples
- Handle card flip interactions
- Grade button handlers

**js/tooltips.js** (~80 lines)
- Kanji hover detection
- Tooltip positioning
- Mobile tap handling
- Furigana toggle

**js/storage.js** (~60 lines)
- LocalStorage get/set wrappers
- Progress serialization
- Import/export functions

### 2.2 Data File Formats

**episodes/index.json**
```json
{
  "episodes": [
    {
      "id": "ep01",
      "title": "春のしらせ",
      "titleEn": "Tidings of Spring",
      "available": true,
      "vocabCount": 85,
      "lineCount": 315
    }
  ]
}
```

**episodes/ep01/meta.json**
```json
{
  "id": "ep01",
  "series": "楽しいムーミン一家",
  "episode": 1,
  "title": "春のしらせ",
  "titleEn": "Tidings of Spring",
  "description": "Moomin Valley awakens from winter hibernation.",
  "vocabCount": 85,
  "lineCount": 315,
  "difficulty": "beginner"
}
```

**episodes/ep01/vocab.json**
```json
[
  {
    "id": "春",
    "word": "春",
    "reading": "はる",
    "pos": "noun",
    "meaning": "spring (season)",
    "notes": "One of four seasons. Spring in Japan: March-May.",
    "jlpt": "N5",
    "frequency": 4,
    "episodeFirst": "ep01"
  }
]
```

**episodes/ep01/lines.json**
```json
[
  {
    "id": "ep01_017",
    "timestamp": "198.64s",
    "speaker": "ムーミン",
    "japanese": "春だ！春が来たんだ！",
    "english": "It's spring! Spring has come!",
    "vocabUsed": ["春", "来る"],
    "grammar": ["だ (copula)", "んだ (emphasis)"]
  }
]
```

**core/kanji.json**
```json
{
  "春": {
    "readings": ["はる", "シュン"],
    "meanings": ["spring"],
    "common": true
  },
  "来": {
    "readings": ["く.る", "き.たる", "ライ"],
    "meanings": ["come", "arrive"],
    "common": true
  }
}
```

---

## 3. N+1 Vocabulary System

### 3.1 Ordering Philosophy

Words are extracted from dialogue and ordered using n+1 principles:

1. **Core First**: Particles and fundamental grammar always come first
2. **Frequency**: Words appearing most often get priority
3. **Dependency**: Words needed to understand other words come first
4. **Kanji Progression**: Simple kanji before complex compounds

### 3.2 Computed Ordering

The N+1 order is **computed** rather than hand-curated. Algorithm:

```javascript
function computeOrder(coreVocab, episodeVocab) {
  const ordered = [];
  const satisfied = new Set();
  
  // 1. Core particles always first
  const particles = coreVocab.filter(w => w.pos === 'particle');
  particles.sort((a, b) => b.frequency - a.frequency);
  ordered.push(...particles);
  particles.forEach(p => satisfied.add(p.id));
  
  // 2. Remaining words by frequency / dependency
  const remaining = [...coreVocab, ...episodeVocab]
    .filter(w => !satisfied.has(w.id));
  
  while (remaining.length > 0) {
    // Score each word
    remaining.forEach(w => {
      const depsMet = (w.dependencies || [])
        .filter(d => satisfied.has(d)).length;
      const depsTotal = (w.dependencies || []).length || 1;
      w.score = w.frequency * (depsMet / depsTotal);
    });
    
    // Take highest scoring
    remaining.sort((a, b) => b.score - a.score);
    const next = remaining.shift();
    ordered.push(next);
    satisfied.add(next.id);
  }
  
  return ordered;
}
```

### 3.3 Multi-Episode Vocabulary Merging

When a word appears in multiple episodes:
- Card ID is based on word, not episode: `vocab_来る`
- Example sentences accumulate (capped at 5 best)
- Each example tagged with source episode
- Frequency = sum across all loaded episodes

```javascript
function mergeVocab(existing, newEpisode) {
  newEpisode.vocab.forEach(word => {
    if (existing[word.id]) {
      // Merge examples
      const combined = [...existing[word.id].examples, ...word.examples];
      existing[word.id].examples = selectBestExamples(combined, 5);
      existing[word.id].frequency += word.frequency;
    } else {
      existing[word.id] = word;
    }
  });
  return existing;
}
```

---

## 4. Built-in SRS System

### 4.1 Overview

The SRS is fully integrated into the web application. All progress stored in localStorage.

### 4.2 Card Types

**Type 1: Word Recognition** (default)
- Front: Japanese word (kanji)
- Back: Meaning + example sentences with translations

**Type 2: Sentence Comprehension** (future)
- Front: Full Japanese sentence
- Back: Translation + breakdown

### 4.3 SRS Algorithm (Modified SM-2)

```javascript
const SRS = {
  GRADES: { AGAIN: 0, HARD: 1, GOOD: 2, EASY: 3 },
  
  // Initial intervals (days)
  INITIAL: [0, 1, 3],
  
  // Learning steps (minutes)
  LEARNING_STEPS: [1, 10],
  
  calculate(card, grade) {
    let { interval, ease, reps, step } = card;
    
    // Failed card
    if (grade === this.GRADES.AGAIN) {
      return {
        interval: 0,
        ease: Math.max(1.3, ease - 0.2),
        reps: 0,
        step: 0,
        due: Date.now() + this.LEARNING_STEPS[0] * 60000
      };
    }
    
    // Still in learning phase
    if (step < this.LEARNING_STEPS.length) {
      step++;
      if (step >= this.LEARNING_STEPS.length) {
        // Graduate to review
        return {
          interval: 1,
          ease,
          reps: 1,
          step: -1, // graduated
          due: Date.now() + 24 * 60 * 60000
        };
      }
      return {
        interval: 0,
        ease,
        reps,
        step,
        due: Date.now() + this.LEARNING_STEPS[step] * 60000
      };
    }
    
    // Review phase
    if (reps === 0) {
      interval = 1;
    } else if (reps === 1) {
      interval = 3;
    } else {
      interval = Math.round(interval * ease);
    }
    
    // Grade modifiers
    if (grade === this.GRADES.HARD) {
      interval = Math.max(1, Math.round(interval * 0.8));
      ease = Math.max(1.3, ease - 0.15);
    } else if (grade === this.GRADES.EASY) {
      interval = Math.round(interval * 1.3);
      ease += 0.15;
    }
    
    return {
      interval,
      ease,
      reps: reps + 1,
      step: -1,
      due: Date.now() + interval * 24 * 60 * 60000
    };
  }
};
```

### 4.4 Review Queue

```javascript
function getReviewQueue(cards, settings) {
  const now = Date.now();
  
  const due = cards.filter(c => c.due <= now && c.step === -1);
  const learning = cards.filter(c => c.due <= now && c.step >= 0);
  const newCards = cards.filter(c => c.due === null)
    .slice(0, settings.newPerDay);
  
  // Order: learning first, then due, then new
  return [...learning, ...due, ...newCards];
}
```

---

## 5. Kanji Tooltip System

### 5.1 Design

Learners know kana but not kanji. Rather than isolated kanji study, tooltips provide just-in-time readings.

### 5.2 Implementation

```html
<!-- Kanji with tooltip data -->
<span class="kanji" data-reading="はる" data-meaning="spring">春</span>

<!-- Tooltip element (one global, positioned dynamically) -->
<div id="tooltip" class="kanji-tooltip">
  <div class="tooltip-reading">はる</div>
  <div class="tooltip-meaning">spring</div>
</div>
```

```javascript
// tooltips.js
function initTooltips() {
  const tooltip = document.getElementById('tooltip');
  
  document.addEventListener('mouseover', e => {
    const kanji = e.target.closest('.kanji');
    if (!kanji) return;
    
    tooltip.querySelector('.tooltip-reading').textContent = 
      kanji.dataset.reading;
    tooltip.querySelector('.tooltip-meaning').textContent = 
      kanji.dataset.meaning;
    
    positionTooltip(tooltip, kanji);
    tooltip.classList.add('visible');
  });
  
  document.addEventListener('mouseout', e => {
    if (e.target.closest('.kanji')) {
      tooltip.classList.remove('visible');
    }
  });
}
```

### 5.3 Furigana Toggle

Global setting to show/hide furigana above all kanji:

```javascript
function toggleFurigana(show) {
  document.body.classList.toggle('show-furigana', show);
  storage.set('showFurigana', show);
}
```

```css
/* Furigana hidden by default */
ruby rt { visibility: hidden; }

/* Shown when toggled */
body.show-furigana ruby rt { visibility: visible; }
```

---

## 6. Flashcard Design

### 6.1 Card Structure

```html
<div class="flashcard" data-card-id="vocab_来る">
  <!-- Front -->
  <div class="card-front">
    <div class="word-display">
      <ruby>来<rt>く</rt></ruby>る
    </div>
    <div class="word-pos">動詞 (irregular)</div>
    <div class="flip-hint">タップして答えを表示</div>
  </div>
  
  <!-- Back -->
  <div class="card-back">
    <div class="word-meaning">to come</div>
    
    <div class="examples">
      <div class="example">
        <div class="example-ja">
          <ruby>春<rt>はる</rt></ruby>が<ruby>来<rt>き</rt></ruby>たんだ！
        </div>
        <div class="example-en">Spring has come!</div>
        <div class="example-note">past tense (た-form)</div>
      </div>
      
      <div class="example">
        <div class="example-ja">さあこっちにおいで</div>
        <div class="example-en">Now come over here.</div>
        <div class="example-note">おいで (polite imperative)</div>
      </div>
    </div>
    
    <div class="word-notes">
      💡 Irregular verb—one of only two in Japanese.
    </div>
  </div>
</div>
```

### 6.2 SRS Grade Buttons

```html
<div class="grade-buttons">
  <button class="grade-btn again" data-grade="0">
    <span class="grade-label">Again</span>
    <span class="grade-interval">1m</span>
  </button>
  <button class="grade-btn hard" data-grade="1">
    <span class="grade-label">Hard</span>
    <span class="grade-interval">10m</span>
  </button>
  <button class="grade-btn good" data-grade="2">
    <span class="grade-label">Good</span>
    <span class="grade-interval">1d</span>
  </button>
  <button class="grade-btn easy" data-grade="3">
    <span class="grade-label">Easy</span>
    <span class="grade-interval">4d</span>
  </button>
</div>
```

---

## 7. UI Views

### 7.1 Dashboard
- Today's counts: New / Learning / Due
- Study streak
- Quick-start button
- Episode selector

### 7.2 Review Session
- Single card display
- Show Answer button
- Grade buttons (after reveal)
- Progress bar
- Session stats

### 7.3 Vocabulary Browser
- List of all vocabulary
- Filter by episode
- Filter by status (new/learning/mature)
- Search

### 7.4 Settings
- New cards per day
- Furigana toggle
- Export/import progress

---

## 8. Styling

### 8.1 Color Palette (Dark Theme)

```css
:root {
  /* Backgrounds */
  --bg-primary: #0d1117;
  --bg-card: #161b22;
  --bg-elevated: #21262d;
  
  /* Text */
  --text-primary: #f0f6fc;
  --text-secondary: #8b949e;
  --text-muted: #6e7681;
  
  /* Accent - Moomin Blue */
  --accent: #7eb8da;
  --accent-bright: #a8d4f0;
  
  /* Japanese */
  --furigana: #8b949e;
  
  /* SRS Grades */
  --grade-again: #f85149;
  --grade-hard: #d29922;
  --grade-good: #3fb950;
  --grade-easy: #58a6ff;
  
  /* Utility */
  --border-subtle: rgba(240, 246, 252, 0.1);
  --radius: 8px;
}
```

### 8.2 Typography

```css
/* Japanese text */
.japanese {
  font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic Pro', sans-serif;
  line-height: 1.8;
}

/* Furigana */
ruby rt {
  font-size: 0.5em;
  color: var(--furigana);
}

/* UI text */
body {
  font-family: 'Inter', -apple-system, sans-serif;
}
```

---

## 9. Data Persistence

### 9.1 Storage Keys

```javascript
const STORAGE = {
  CARDS: 'moomin_cards',      // SRS state per card
  PROGRESS: 'moomin_progress', // Stats, streak
  SETTINGS: 'moomin_settings', // User preferences
  EPISODES: 'moomin_episodes'  // Loaded episode IDs
};
```

### 9.2 Card State Format

```javascript
// Stored by card ID
{
  "vocab_来る": {
    "interval": 3,
    "ease": 2.5,
    "reps": 2,
    "step": -1,
    "due": 1707436800000
  }
}
```

### 9.3 Progress Format

```javascript
{
  "streak": {
    "current": 7,
    "longest": 14,
    "lastReview": "2024-02-06"
  },
  "stats": {
    "totalReviews": 234,
    "cardsLearned": 45,
    "cardsMature": 12
  }
}
```

---

## 10. Episode Integration Workflow

Adding a new episode:

1. Create `data/episodes/ep02/` folder
2. Add `meta.json`, `vocab.json`, `lines.json`
3. Update `data/episodes/index.json` registry
4. Run `tools/compute-order.js` to regenerate N+1 order
5. App automatically detects new episode on next load

No code changes required—just data files.

---

## 11. Development Phases

### Phase 1: Foundation (Current)
- [x] Design document
- [ ] Clean CSS file
- [ ] index.html shell
- [ ] Basic app.js structure

### Phase 2: Core SRS
- [ ] srs.js algorithm
- [ ] storage.js persistence
- [ ] cards.js rendering
- [ ] Review session view

### Phase 3: Data
- [ ] Extract ep01 vocabulary
- [ ] Create vocab.json
- [ ] Create lines.json
- [ ] Build kanji.json

### Phase 4: Polish
- [ ] Kanji tooltips
- [ ] Furigana toggle
- [ ] Dashboard view
- [ ] Vocabulary browser

### Phase 5: Multi-Episode
- [ ] Episode selector UI
- [ ] Vocabulary merging
- [ ] compute-order.js tool

---

*Document Version: 2.1*
*Updated: February 2024*
*Changes: Revised file structure for modularity, added multi-episode architecture, detailed data formats*
