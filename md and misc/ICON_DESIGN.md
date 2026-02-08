# Flashcard SVG Icon Design Document

## Moomin Japanese Trainer - Visual Memory Aids

---

## Project Overview

**Goal:** Create cute, simple SVG graphics for the front of each vocabulary flashcard to serve as visual identifiers/memory anchors during study.

**Current State:** Flashcards have blank space above the word display (Japanese word + furigana) and part-of-speech tag. The `flip-hint` sits below.

**Target:** Add a small, memorable SVG icon above each word that visually represents or hints at the word's meaning.

---

## Design Principles

### Visual Style
- **Moomin-inspired:** Soft, rounded shapes; friendly aesthetic
- **Dark theme compatible:** Light strokes (#7eb8da accent, #f0f6fc primary) on transparent
- **Simple & iconic:** Should be recognizable at 64×64px
- **Consistent stroke weight:** 2-3px strokes throughout
- **Minimal colors:** 1-2 colors max per icon (accent blue + white/cream)

### Memory Aid Strategy
- **Concrete nouns** (春, 山, 雲): Direct visual representation
- **Abstract nouns** (夢, 物語): Symbolic/metaphorical imagery  
- **Verbs** (来る, 行く, 見る): Action-suggesting shapes or arrows
- **Adjectives** (大きい, 面白い): Comparative or expressive imagery
- **Adverbs/particles**: Abstract geometric patterns or emoji-style faces

---

## Implementation Status

### Phase 1: Core Infrastructure ✅ COMPLETE
- [x] Create SVG component system in JavaScript (`js/icons.js`)
- [x] Update `cards.js` to render icons on card front
- [x] Add CSS for icon positioning/sizing
- [x] Add script tag to `index.html`

### Phase 2: Episode 1 Icons ✅ COMPLETE (~65 icons)
Categories covered:
- Nature & Seasons (春, 冬, 雪, 山, 海, 雲, 谷, 空)
- Family & People (パパ, ママ, お姉ちゃん, お兄さん, 僕, 私, みんな, 誰)
- Objects (家, 帽子, 船, 夢, 旅, 話, 物語)
- Movement Verbs (来る, 行く, 帰る, 飛ぶ, 乗る, 落ちる, 登る)
- Senses & Communication (見る, 聞く, 言う, 呼ぶ, 知る, 分かる)
- State Verbs (眠る, 起きる, 待つ, 作る, 始める, 忘れる, 思い出す, 遊ぶ, 探す, 見つかる, 隠れる, 捨てる, かくれんぼ)
- Adjectives (大きい, 早い, 面白い, 寂しい, 暖かい, 危ない, 素晴らしい, 残念, 本当)
- Adverbs & Time (今, 今年, 去年, もう, まだ, ここ, どこ, 何, 一番, ちょっと, ずっと, とても)
- Interjections (あ, さあ, やあ, すごい)

### Phase 3: Episodes 2-5 Icons 🔲 TODO
Extend to remaining episodes (~200+ more words), reusing templates where possible.

### Phase 4: Refinement 🔲 TODO
- A/B test effectiveness
- Gather feedback
- Iterate on confusing icons

---

## Technical Details

### Icon Specifications
- ViewBox: `0 0 64 64`
- Display size: 64px (48px on mobile)
- Colors from CSS variables:
  - `#7eb8da` - Moomin blue (primary strokes)
  - `#a8d4f0` - Light blue (highlights)
  - `#f0f6fc` - White/cream (fills)
  - `#d29922` - Gold (accents)
  - `#f0a5b5` - Pink (cherry blossoms)
  - `#3fb950` - Green (nature)

### File Structure
```
js/
  icons.js     # CardIcons module with all SVG definitions
  cards.js     # Modified to call CardIcons.renderIcon()
css/
  styles.css   # Added .card-icon styles
index.html     # Added <script src="js/icons.js">
```

### Usage
```javascript
// Check if icon exists
CardIcons.hasIcon('春')  // true

// Get raw SVG
CardIcons.getIcon('春')  // '<svg>...</svg>'

// Get wrapped in container
CardIcons.renderIcon('春')  // '<div class="card-icon"><svg>...</svg></div>'

// List all available icons
CardIcons.getAvailableIcons()  // ['春', '冬', '雪', ...]
```

---

## Icon Design Notes

### Particularly Effective Icons
- **帽子 (hat)** - The Hobgoblin's magic top hat with sparkle ✧
- **眠る (sleep)** - Closed-eye face with floating "zzz"
- **来る/行く** - Directional arrows (toward/away from viewer)
- **危ない (dangerous)** - Classic warning triangle in red
- **夢 (dream)** - Dashed cloud outline with golden star

### Design Patterns Used
1. **Faces** for emotions/states (眠る, 起きる, 面白い)
2. **Arrows** for direction/movement (来る, 行く, 帰る)
3. **Simple shapes** for concrete nouns (山, 海, 家)
4. **Symbols** for abstract concepts (知る→lightbulb, もう→checkmark)

---

*Document created: February 2026*
*Last updated: After Phase 2 completion*
*Project: Moomin Japanese Trainer*
