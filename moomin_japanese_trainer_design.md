# ムーミン日本語トレーナー — Moomin Japanese Trainer
## Design Document v3.0

---

## 1. Project Overview

### 1.1 Concept
A web-based Japanese language learning application using authentic dialogue from **楽しいムーミン一家** to teach Japanese through context-rich, narrative-driven vocabulary acquisition. The trainer features a built-in SRS (Spaced Repetition System) using the FSRS algorithm, ensuring learners encounter words in an optimal sequence for memory retention.

### 1.2 Target Audience
- Japanese learners at beginner to intermediate levels (JLPT N5-N4)
- Learners who **already know hiragana and katakana**
- Anime/manga enthusiasts who want to learn through authentic content
- Users who benefit from narrative-driven, contextual learning

### 1.3 Core Philosophy
- **Context-First**: Every word taught with authentic example sentences from the dialogue
- **Kanji Through Components**: Kanji taught via radical decomposition — each character broken into meaningful parts with English keywords
- **Kanji Through Exposure**: Unknown kanji reinforced via hover tooltips with readings, meanings, and component breakdowns
- **Built-in SRS**: All spaced repetition handled within the app using FSRS v5
- **Visual Memory Aids**: Custom SVG icons for vocabulary to aid retention
- **TTS Audio Support**: VOICEVOX-generated audio for example sentences
- **Multi-Episode Ready**: Architecture supports seamless addition of new episodes
- **Episode Activation**: Users control which episodes contribute to their flashcard deck

### 1.4 Key Architectural Additions
- **Radical Decomposition**: KRADFILE-based kanji-to-component breakdown displayed on card backs and in tooltips, with hand-authored English keywords for each component radical

### 1.5 What We're NOT Building
- Hiragana/katakana lessons (robust solutions exist elsewhere)
- Anki integration (SRS is built-in)
- Writing/stroke order practice

---

## 2. File Structure

```
moomin-trainer/
├── index.html                 # Main application shell
├── css/
│   └── styles.css             # All styling with dark theme
├── js/
│   ├── app.js                 # Initialization, view routing, state management
│   ├── srs.js                 # FSRS v5 algorithm implementation
│   ├── cards.js               # Card rendering, audio playback, vocab merging
│   ├── icons.js               # SVG visual memory aid icons (65+ icons)
│   ├── radicals.js            # Kanji radical decomposition & breakdown rendering
│   ├── tooltips.js            # Kanji hover tooltip system
│   └── storage.js             # LocalStorage API wrapper with validation
├── audio/
│   ├── manifest.json          # Audio file availability registry
│   └── ep##/                  # Episode audio folders
│       └── ep##_word_index.ogg  # VOICEVOX TTS files (OGG format)
├── data/
│   ├── core/
│   │   ├── kanji.json         # Master kanji readings dictionary
│   │   ├── radicals.json      # Radical decompositions & component keywords (KRADFILE)
│   │   └── radical-keywords.json  # Editable component keyword source file
│   └── episodes/
│       ├── index.json         # Episode registry & metadata
│       └── ep##/
│           ├── meta.json      # Episode title, description, stats
│           ├── vocab.json     # Episode-specific vocabulary with examples
│           └── lines.json     # Dialogue lines for reference
├── generate-audio.js          # Node.js script for TTS audio generation
├── generate-radicals.js       # Node.js script to rebuild radicals.json from keywords
├── build_radicals.py          # Python bootstrap script for initial data generation
├── EPISODE_INTEGRATION_GUIDE.md
├── RADICAL_DECOMPOSITION_PLAN.md
├── ICON_DESIGN.md
├── TTS_README.md
└── README.md
```

### 2.1 File Responsibilities

**index.html**
- Document structure with view containers
- CSS/JS imports
- Tooltip element
- Grade buttons, navigation, settings panels

**css/styles.css** (~800+ lines)
- Dark theme CSS custom properties
- Japanese typography (furigana, kanji)
- Flashcard states, flip animations
- Episode cards with activation toggles
- Vocabulary browser with expandable items
- Audio play button states
- SRS grade buttons
- Responsive breakpoints

**js/app.js** (~600+ lines)
- Application initialization and state management
- View switching (dashboard, review, browse, episode-study, episode-vocab)
- Episode activation system (controls which episodes contribute to deck)
- Review session logic with queue management
- XSS protection via escapeHtml()
- Vocabulary preview with hover popups
- Text selection protection on clickable items

**js/srs.js** (~300 lines)
- FSRS v5 algorithm implementation
- Stability, difficulty, retrievability calculations
- Learning steps: [1, 10] minutes
- Target retention: 90%
- Card state management (new, learning, review, mature)

**js/cards.js** (~350 lines)
- Card rendering with visual icons
- Radical breakdown display on card backs (via Radicals module)
- TTS audio playback (OGG format)
- Audio manifest loading and path generation
- Vocabulary data loading and merging across episodes
- Example sentence tracking with source episode/index for audio
- Episode-to-vocab mapping

**js/radicals.js** (~200 lines)
- Loads `data/core/radicals.json` at startup
- Kanji-to-component decomposition lookup
- Component keyword/hint lookup
- `renderBreakdown(word)` generates HTML for card backs
- `getTooltipString(kanji)` generates compact string for tooltips
- `findKanjiWithComponent(component)` for reverse lookup
- Based on EDRDG KRADFILE data (CC-BY-SA 3.0)

**js/icons.js** (~1200+ lines)
- 65+ custom SVG icons for visual memory aids
- Categories: nature, people, objects, verbs (movement/senses/states), adjectives, adverbs, interjections
- Moomin-inspired color palette
- renderIcon() for flashcard integration

**js/tooltips.js** (~170 lines)
- Kanji hover detection with mouse and touch support
- Dynamic tooltip positioning
- Kanji dictionary lookup
- Radical decomposition display in tooltip (via Radicals module)
- Furigana toggle

**js/storage.js** (~250 lines)
- LocalStorage wrapper with validation
- Prototype pollution protection on import
- Episode activation state management
- Streak tracking
- Import/export with size limits (5MB)

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
    "notes": "One of four seasons. Spring in Japan runs from March to May.",
    "jlpt": "N5",
    "frequency": 6,
    "examples": [
      {
        "japanese": "春だ！春が来たんだ！",
        "english": "It's spring! Spring has come!",
        "note": "だ (copula) + んだ (emphasis)"
      }
    ]
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

**audio/manifest.json**
```json
{
  "generatedAt": "2025-02-07T...",
  "episodes": {
    "ep01": {
      "春_0": true,
      "春_1": true,
      "来る_0": true
    }
  }
}
```

---

## 3. FSRS Spaced Repetition System

### 3.1 Overview

The app uses **FSRS v5** (Free Spaced Repetition Scheduler), a modern algorithm that models memory using:
- **Stability (S)**: Time in days for retrievability to decay to 90%
- **Difficulty (D)**: Inherent difficulty of the card (1-10 scale)
- **Retrievability (R)**: Probability of successful recall

### 3.2 Card States

| State | Condition | Behavior |
|-------|-----------|----------|
| New | `due === null` | Never reviewed |
| Learning | `step >= 0` | In learning steps (1m, 10m) |
| Review | `step === -1, scheduledDays < 21` | Graduated, short interval |
| Mature | `step === -1, scheduledDays >= 21` | Well-learned |

### 3.3 Grades

| Grade | Name | Effect |
|-------|------|--------|
| 0 | Again | Reset to learning step 0, increase lapses |
| 1 | Hard | Slower progression, decrease ease |
| 2 | Good | Normal progression, graduate from learning |
| 3 | Easy | Fast progression, skip learning steps |

### 3.4 Learning Flow

1. **New card** → First review initializes stability/difficulty
2. **Good/Easy** on new card → Graduates immediately to review
3. **Hard** on new card → Enters learning steps (1m → 10m → graduate)
4. **Again** at any point → Returns to learning step 0

### 3.5 FSRS Parameters

```javascript
const PARAMS = {
  w: [0.4072, 1.1829, 3.1262, 15.4722, ...], // 19 weights
  requestRetention: 0.9,  // 90% target
  maximumInterval: 36500, // ~100 years
  enableShortTerm: true
};
```

---

## 4. Episode Activation System

### 4.1 Design

Users can enable/disable episodes independently:
- **Active episodes** contribute words to the main review queue
- **Inactive episodes** are loaded but don't appear in daily reviews
- Each episode can be studied independently via "Study All" or "Learn New"

### 4.2 Storage Keys

```javascript
const KEYS = {
  CARDS: 'moomin_cards',
  PROGRESS: 'moomin_progress',
  SETTINGS: 'moomin_settings',
  EPISODES: 'moomin_episodes',        // All loaded episodes
  ACTIVE_EPISODES: 'moomin_active_episodes'  // Enabled for review
};
```

### 4.3 UI Components

- **Dashboard**: Episode cards with toggle switches and mini-stats
- **Episode Study View**: Detailed stats, activation banner, study options
- **Browse View**: Shows vocabulary from active episodes only

---

## 5. Vocabulary Merging (Multi-Episode)

### 5.1 How Merging Works

When a word appears in multiple episodes:
1. Card ID is based on word: `vocab_来る`
2. Examples accumulate from all episodes (capped at 5)
3. Each example tracks `sourceEpisode` and `sourceIndex` for audio lookup
4. Frequency sums across all loaded episodes
5. Word tracks all episodes it belongs to: `episodes: ["ep01", "ep02"]`

### 5.2 Audio Path Resolution

```javascript
// Each example stores its source for correct audio lookup
{
  "japanese": "春が来た！",
  "english": "Spring has come!",
  "sourceEpisode": "ep01",  // Audio file is in ep01/
  "sourceIndex": 0          // ep01_来る_0.ogg
}
```

---

## 6. TTS Audio System

### 6.1 Overview

Example sentences have VOICEVOX TTS audio support:
- Generated via `generate-audio.js` script
- Character-appropriate voices (ムーミン, パパ, ママ, etc.)
- OGG format for compression (~50KB per file)

### 6.2 Voice Mapping

| Character | VOICEVOX Speaker ID |
|-----------|---------------------|
| ムーミン | 2 (四国めたん ノーマル) |
| ムーミンパパ | 13 (青山龍星) |
| ムーミンママ | 3 (ずんだもん) |
| スノークのおじょうさん | 14 (冥鳴ひまり) |
| スニフ | 47 (もち子さん) |
| ミー | 8 (春日部つむぎ) |
| ナレーター | 46 (中国うさぎ) |

### 6.3 Audio File Naming

```
audio/ep01/ep01_春_0.ogg    # First example for 春 in ep01
audio/ep01/ep01_春_1.ogg    # Second example
audio/ep01/ep01_来る_0.ogg  # First example for 来る
```

---

## 7. Kanji Tooltip System

### 7.1 Design

Learners know kana but not kanji. Tooltips provide just-in-time readings on hover/tap.

### 7.2 Data Source

1. Check element `data-reading` and `data-meaning` attributes
2. Fall back to `data/core/kanji.json` dictionary lookup
3. Radical decomposition from `Radicals.getTooltipString()` (shown as third line)

### 7.3 Furigana Toggle

Global setting to show/hide furigana above all kanji:
```css
ruby rt { visibility: hidden; }
body.show-furigana ruby rt { visibility: visible; }
```

---

## 8. Kanji Radical Decomposition System

### 8.1 Overview

Kanji are decomposed into visual component radicals using KRADFILE data (EDRDG, CC-BY-SA 3.0). Each component has a hand-authored English keyword to enable mnemonic learning. The system shows breakdowns in two places: flashcard backs and kanji tooltips.

### 8.2 Data Pipeline

```
radical-keywords.json (hand-authored keywords)
        +
KRADFILE decompositions (embedded in build script)
        ↓
  generate-radicals.js
        ↓
  data/core/radicals.json (runtime data)
        ↓
  js/radicals.js (client module)
```

### 8.3 Data Format

**radicals.json:**
```json
{
  "components": {
    "言": { "strokes": 7, "keyword": "say", "hint": "Words coming from a mouth" }
  },
  "decompositions": {
    "語": ["言", "五", "口"]
  }
}
```

**radical-keywords.json** (editable source):
```json
{
  "言": { "keyword": "say", "hint": "Words coming from a mouth — the speech radical" },
  "口": { "keyword": "mouth", "hint": "An open mouth or square opening" }
}
```

### 8.4 Coverage

- 419 kanji decompositions (all single-character entries in kanji.json)
- 239 unique components
- 154 components have pre-authored keywords; 85 need manual authoring
- Component keywords are editable in `radical-keywords.json`; run `node generate-radicals.js` to rebuild

### 8.5 Card Back Display

After the meaning, before examples, the card back shows:
```
語 = 言 say + 五 + 口 mouth
```
Components without keywords appear dimmed. Hovering a component shows its hint.

### 8.6 Tooltip Enhancement

Kanji tooltips show a third line with the compact radical string:
```
はな・し
talk, story
───────
言 say + 口 mouth + 舌 tongue
```

---

## 9. Visual Memory Aid Icons

### 9.1 Design Philosophy

- Simple, recognizable SVG icons
- Moomin-inspired aesthetic
- 64x64 viewBox for consistency
- App color palette (blues, soft accents)

### 9.2 Categories (65+ icons)

| Category | Examples |
|----------|----------|
| Nature | 春, 冬, 雪, 山, 海, 雲, 谷, 空 |
| People | パパ, ママ, 僕, 私, みんな, 誰 |
| Objects | 家, 帽子, 船, 夢, 旅, 話, 物語 |
| Verbs (Movement) | 来る, 行く, 帰る, 飛ぶ, 乗る, 落ちる, 登る |
| Verbs (Senses) | 見る, 聞く, 言う, 呼ぶ, 知る, 分かる |
| Verbs (States) | 眠る, 起きる, 待つ, 作る, 遊ぶ, 探す, 隠れる |
| Adjectives | 大きい, 早い, 面白い, 寂しい, 暖かい, 危ない |
| Adverbs | 今, もう, まだ, ここ, どこ, 何, 一番 |
| Interjections | あ, さあ, やあ, すごい |

---

## 10. Security Considerations

### 10.1 XSS Protection

All user-facing text is escaped via `escapeHtml()`:
```javascript
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}
```

### 10.2 Path Traversal Protection

Episode IDs and file paths are sanitized:
```javascript
function sanitizeEpisodeId(episodeId) {
  if (!episodeId || typeof episodeId !== 'string') return 'ep01';
  return episodeId.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 20) || 'ep01';
}
```

### 10.3 Import Validation

Backup imports check for:
- Prototype pollution (`__proto__`, `constructor`, `prototype`)
- Size limits (5MB max)
- Type validation
- Sanitized episode IDs

---

## 11. UI Views

### 11.1 Dashboard
- Today's counts: New / Learning / Due / Mastered
- Study streak display
- Start Review button (shows card count)
- Episode list with activation toggles and mini-stats

### 11.2 Episode Study View
- Episode title and description
- Activation toggle with explanation
- Detailed stats grid (New/Learning/Review/Mastered)
- Study options: Study All, Learn New, Browse Vocabulary
- Vocabulary preview grid with hover popups

### 11.3 Review Session
- Single card display with visual icon
- Click-to-flip interaction
- Audio play buttons on examples
- Grade buttons with interval previews
- Progress bar and session stats

### 11.4 Vocabulary Browser
- Filter by episode
- Filter by status (new/learning/mature)
- Search functionality
- Expandable items with examples and audio
- Text selection protected (doesn't trigger expand on select)

### 11.5 Settings
- New cards per day (default: 20)
- Furigana toggle
- Export/Import progress
- Reset all data

---

## 12. Development Status

### Completed Features ✓
- [x] FSRS v5 SRS algorithm
- [x] Multi-episode data loading and merging
- [x] Episode activation system
- [x] Visual memory aid icons (65+)
- [x] TTS audio playback (VOICEVOX)
- [x] Kanji hover tooltips
- [x] Furigana toggle
- [x] XSS and path traversal protection
- [x] Import/export with validation
- [x] Episode study view with stats
- [x] Vocabulary browser with search
- [x] 5 episodes integrated (ep01-ep05)
- [x] Radical decomposition data (KRADFILE, 419 kanji, 239 components)
- [x] Radical breakdown on card backs
- [x] Radical info in kanji tooltips
- [x] Radical keyword scaffolding (154/239 pre-authored)
- [x] Build pipeline (generate-radicals.js, build_radicals.py)

### In Progress
- [ ] Authoring remaining 85 component keywords in radical-keywords.json

### Future Enhancements
- [ ] Dedicated radical review cards (radical_ card type)
- [ ] Browse by Radical view
- [ ] Mnemonic system (pre-authored + AI-generated)
- [ ] More visual icons (expand coverage)
- [ ] Additional VOICEVOX character voices
- [ ] Sentence comprehension card type
- [ ] Statistics graphs/charts
- [ ] Offline PWA support

---

*Document Version: 4.0*
*Updated: February 2026*
*Changes: Added radical decomposition system (KRADFILE data, card back breakdown, tooltip integration, build pipeline). Cleaned hallucinated kanji.json entries. See RADICAL_DECOMPOSITION_PLAN.md for full architecture.*
