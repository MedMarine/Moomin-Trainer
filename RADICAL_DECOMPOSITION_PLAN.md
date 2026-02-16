# Radical Decomposition Integration Plan

## Moomin Japanese Trainer — WaniKani-Style Kanji Learning via Component Radicals

> **Status (February 2026):** Phases 1–3 implemented. Radical data generated, card back breakdown and tooltip integration live. Keyword authoring (85/239 remaining) in progress. Phases 4–6 planned for future work.

---

## Problem Statement

The current flashcard system presents kanji as opaque visual units. When a card like `語` appears, the learner either recognizes it instantly or doesn't — there's no scaffolding, no way to reason about it. This is pure rote visual pattern matching, which doesn't scale well beyond a few hundred kanji and provides no recovery path when memory fails.

WaniKani's core insight is that kanji aren't atomic — they're composed of smaller visual components (radicals/primitives) that can each carry a memorable English keyword. If you know that `語` is built from `言` (say), `五` (five), and `口` (mouth), you can construct a mnemonic like *"You say five things with your mouth — that's language/word."* The kanji stops being an arbitrary squiggle and becomes a structured composition you can reason about.

---

## Data Foundation: KRADFILE

### What It Provides

The KRADFILE project (EDRDG, CC-BY-SA 3.0) decomposes 6,355 JIS X 0208 kanji into 253 visual components. The format is simple — one line per kanji:

```
語 : 言 五 口
食 : 人 良
読 : 言 士 冖 貝
```

The Unicode-converted version (`krad-unicode` by bhffmnn on GitHub) is the best starting point. It replaces JIS X 0208 substitution characters with their proper Unicode radical forms (e.g., `化` → `⺅`, `艾` → `⺾`), provides a clean JSON format, and includes a companion `krad_components.json` with stroke counts for all 253 components.

### What It Doesn't Provide

KRADFILE gives you the decomposition but not the pedagogical layer. It doesn't include English keywords for components (only the raw characters), mnemonic stories, reading hints, or any teaching order. This is the gap that needs to be filled to make the WaniKani-style approach work.

---

## Architecture Plan

### Phase 1: Data Layer — `data/core/radicals.json` ✅ COMPLETE

Create a new data file containing the radical/component database. This file merges KRADFILE decomposition data with hand-authored pedagogical content.

**Schema:**

```json
{
  "components": {
    "言": {
      "keyword": "say",
      "strokes": 7,
      "hint": "The speech radical — a mouth with sound waves above it",
      "unicode": "U+8A00",
      "alternates": ["訁"]
    },
    "⺅": {
      "keyword": "person",
      "strokes": 2,
      "hint": "A person standing sideways — the left-side form of 人",
      "unicode": "U+2E85",
      "alternates": ["人", "亻"]
    }
  },
  "decompositions": {
    "語": ["言", "五", "口"],
    "食": ["人", "良"],
    "読": ["言", "士", "冖", "貝"]
  }
}
```

**Build process:** Write a Node.js script (`generate-radicals.js`) that parses `krad-unicode`'s JSON output, merges it with a hand-authored `radical-keywords.json` file containing the English keywords and hints, and produces the final `radicals.json`. The keyword file is the labor-intensive part — all 253 components need memorable, distinct English names. Start by using the traditional Kangxi radical meanings where they're vivid enough (e.g., 火 = "fire", 水 = "water"), and invent more evocative names where the traditional ones are too vague (following WaniKani's philosophy of prioritizing memorability over academic accuracy).

### Phase 2: Kanji Detail Panel — Component Breakdown Display ✅ COMPLETE

This is the most visible change. When a flashcard is flipped to reveal the answer, add a **radical breakdown section** between the word/meaning and the example sentences.

**Current card back structure:**
```
[Word + Reading]
[Meaning]
[Example Sentences]
[Notes]
```

**Proposed card back structure:**
```
[Word + Reading]
[Meaning]
[Radical Breakdown]     ← NEW
[Example Sentences]
[Notes]
```

**What the breakdown shows for a kanji like 語:**

```
┌─────────────────────────┐
│  語 = 言 + 五 + 口      │
│        say  five  mouth  │
│                          │
│  💡 "You say five things │
│   with your mouth —      │
│   that's a word."        │
└─────────────────────────┘
```

For vocabulary items that contain multiple kanji (e.g., `物語`), show the breakdown for each kanji character individually, stacked vertically.

**Implementation in `cards.js`:**

Add a new function `renderRadicalBreakdown(word)` that:

1. Extracts individual kanji characters from the word string (regex: `/[\u4e00-\u9faf\u3400-\u4dbf]/g`)
2. Looks up each character in `radicals.json` decompositions
3. For each component, looks up its keyword from the components table
4. Renders the visual breakdown with component characters and keywords
5. Optionally renders a mnemonic hint if one exists

Call this function inside `renderCard()` to insert the breakdown HTML into the card back.

### Phase 3: Enhanced Tooltip System ✅ COMPLETE

Currently `tooltips.js` shows reading + meaning on kanji hover. Extend this to also show the radical decomposition inline.

**Current tooltip:**
```
┌──────────────┐
│ はな・し      │
│ talk, story  │
└──────────────┘
```

**Enhanced tooltip:**
```
┌──────────────────┐
│ はな・し          │
│ talk, story      │
│ ─────────────    │
│ 言 say + 舌 tongue│
└──────────────────┘
```

**Implementation in `tooltips.js`:**

Extend `showTooltip()` to check for decomposition data. Add a `.tooltip-radicals` div to the tooltip HTML template in `index.html`. The tooltip already loads `kanji.json` — it just needs to also reference `radicals.json` decompositions.

### Phase 4: Dedicated Radical Review Mode — PLANNED

Add a new review card type: **radical cards**. These test whether the learner can identify a component radical and recall its keyword.

**Card front:** Shows a large radical character (e.g., `言`)

**Card back:** Shows the keyword ("say"), the hint, and a few example kanji that contain this radical (e.g., 語、話、読、記、言)

**Why this matters:** WaniKani's key structural principle is that you learn radicals *before* the kanji that contain them. The trainer should track which radicals the learner has mastered and use that to unlock kanji containing those radicals. This creates a dependency graph: radical mastery → kanji learning → vocabulary in context.

**Implementation:**

1. Add a `radical_` prefix to radical card IDs in the SRS storage (alongside existing `vocab_` prefix)
2. Add radical cards to the review queue, interleaved with vocab cards
3. In `app.js`, add logic to the episode loading flow that extracts all unique radicals used by the episode's vocabulary and creates radical cards for any that haven't been seen
4. Track radical mastery status. When rendering a kanji flashcard, indicate which of its component radicals the learner has already mastered (e.g., green vs gray component labels)

### Phase 5: Mnemonic System — PLANNED

This is where the real WaniKani magic lives. Each kanji should have a mnemonic story composed from its component keywords.

**Two-tier approach:**

1. **Pre-authored mnemonics** for high-frequency kanji (the ~200-300 kanji that appear across Moomin episodes). Store these in the vocab data as a new `mnemonic` field. These should be written to connect the component keywords to both the meaning and the reading.

2. **AI-generated mnemonics on demand** using the Anthropic API (since this project already runs as a local web app). When a kanji doesn't have a pre-authored mnemonic, offer a "Generate Mnemonic" button that calls the API with the kanji, its components/keywords, meaning, and readings, then caches the result in localStorage. This is a natural fit since the existing architecture is client-side with localStorage persistence.

**Mnemonic structure (following WaniKani's pattern):**

- **Meaning mnemonic:** Uses component keywords → kanji meaning. *"When you SAY (言) something FIVE (五) times with your MOUTH (口), you're choosing the right WORD (語)."*
- **Reading mnemonic:** Extends the meaning story to encode the reading. *"...and the word you keep repeating is 'GO' (ご) — the Japanese reading."*

### Phase 6: Browse View Enhancement — PLANNED

The current Browse view shows a flat list of vocab items. Add a secondary browse mode: **Browse by Radical**.

This view shows all 253 components in a grid (sortable by stroke count), and tapping one shows all kanji in the learner's deck that contain that component. This provides a powerful cross-referencing tool — learners can see radical families and notice patterns across kanji they're studying.

**Implementation:**

Add a tab/toggle to the existing Browse view header: `[Vocabulary] [Radicals]`. The radicals grid reuses existing CSS patterns from the vocab list but with larger character display.

---

## File Changes Summary

### New Files (Phases 1–3 — all created)

| File | Purpose | Status |
|------|---------|--------|
| `data/core/radicals.json` | Component keywords, decompositions | ✅ Created |
| `data/core/radical-keywords.json` | Editable source for 239 component English keywords | ✅ Created (239/239 filled) |
| `generate-radicals.js` | Node.js build script: keywords + decompositions → radicals.json | ✅ Created |
| `build_radicals.py` | Python bootstrap script for initial data generation | ✅ Created |
| `js/radicals.js` | Client module: data loading, lookup, breakdown rendering | ✅ Created |

### Modified Files (Phases 1–3 — all applied)

| File | Changes | Status |
|------|---------|--------|
| `index.html` | Added `<script>` for radicals.js; added `.tooltip-radicals` div | ✅ Done |
| `js/cards.js` | Added `Radicals.renderBreakdown()` call in `renderCard()` | ✅ Done |
| `js/tooltips.js` | Extended `showTooltip()` with radical decomposition line | ✅ Done |
| `js/app.js` | Added `Radicals.init()` to startup sequence | ✅ Done |
| `css/styles.css` | Added radical breakdown styles, tooltip radical styles, widened tooltip | ✅ Done |
| `data/core/kanji.json` | Removed 19 hallucinated/duplicate entries | ✅ Done |

### Future File Changes (Phases 4–6)

| File | Changes | Status |
|------|---------|--------|
| `js/app.js` | Radical card creation, radical browse view, radical review queue | Planned |
| `js/storage.js` | Handle `radical_` prefixed card states | Planned |
| `index.html` | Radical browse tab, radical review card template | Planned |
| `css/styles.css` | Radical browse grid, mastery indicators | Planned |
| `data/core/kanji.json` | Add `mnemonic` field to entries | Planned |

### Data Dependencies

| Source | License | Usage |
|--------|---------|-------|
| KRADFILE/krad-unicode | CC-BY-SA 3.0 (EDRDG) | Kanji → component decompositions |
| krad_components.json | CC-BY-SA 3.0 (EDRDG) | Component stroke counts |
| radical-keywords.json | Original (you write this) | English keywords for 253 components |

---

## Implementation Order

**Sequence for incremental delivery:**

1. ✅ **Data first:** Created `radicals.json` with 419 decompositions and 154/239 component keywords covering all radicals used in episodes 1-5.

2. ✅ **Card back breakdown:** Radical decomposition display added to flashcard backs via `Radicals.renderBreakdown()` in `renderCard()`. Shows between meaning and examples.

3. ✅ **Enhanced tooltips:** Tooltip extended with third line showing compact radical string via `Radicals.getTooltipString()`.

4. **Radical browse view:** Useful study tool, but not blocking the core learning flow.

5. **Radical review cards:** Biggest structural change — introduces new card type and ordering dependencies. Deferred until display features are validated.

6. **Mnemonic system:** Can be built gradually. Start with `mnemonic` field in vocab data. AI generation is a nice-to-have.

---

## Scope Control Notes

The biggest risk with this feature is scope creep — the full WaniKani experience is an enormous amount of content authoring (they have 8,000+ mnemonics). The plan above is designed to deliver value incrementally:

- **Phases 1–3 are complete** and immediately improve the learning experience by showing "what's inside" each kanji.
- Phases 4–5 are significant structural additions deferred until the basic decomposition display proves useful in practice.
- Phase 6 is polish.

The KRADFILE data does the heavy lifting. All **239 component keywords** in `radical-keywords.json` are now authored, giving full coverage of every radical used in the trainer's vocabulary.

### Current Data Statistics
- **419** kanji with decompositions
- **239** unique components referenced
- **239** components with English keywords (100%)
- **0** components awaiting keyword authoring (0%)
- Source: EDRDG KRADFILE (CC-BY-SA 3.0), Unicode conversion via krad-unicode
