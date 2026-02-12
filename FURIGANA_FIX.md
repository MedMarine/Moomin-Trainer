# Furigana Overhaul: Replacing the Homegrown Kanji Reader with Morphological Analysis

## The Problem

The Moomin Trainer currently generates furigana by looking up **individual kanji characters** in `data/core/kanji.json` and returning the first reading listed. This is fundamentally broken for compound words because Japanese kanji have multiple readings (on'yomi vs kun'yomi, plus irregular readings), and the correct reading depends entirely on *which word the kanji appears in*.

### The Concrete Example: 冬眠 (hibernation)

| Kanji | kanji.json first reading | Correct reading in 冬眠 |
|-------|--------------------------|------------------------|
| 冬 | ふゆ (kun'yomi, standalone "winter") | **とう** (on'yomi) |
| 眠 | ねむる (kun'yomi, standalone "to sleep") | **みん** (on'yomi) |

The trainer displays **ふゆ** over 冬 and **ねむる** over 眠, producing the nonsensical reading "ふゆねむる" instead of the correct **とうみん**. The standalone words 冬 (ふゆ) and 眠る (ねむる) display correctly because those *happen* to be the first listed reading — but the compound 冬眠 breaks because its kanji use completely different readings.

This class of bug affects a huge number of words. Consider just a few from the existing vocabulary:

- **今年** (ことし, "this year") — currently shows いま + とし instead of ことし (which is itself an irregular reading)
- **物語** (ものがたり, "story") — currently shows もの + かたる (close, but wrong: 語 here is がたり, not かたる)
- **冬眠** (とうみん, "hibernation") — currently shows ふゆ + ねむる
- **世界中** (せかいじゅう, "throughout the world") — would show よ + カイ + なか
- **難破船** (なんぱせん, "shipwreck") — would show むずかしい + やぶる + ふね

### Why the Current Approach Cannot Be Fixed

The `kanji.json` lookup is a **character-level dictionary** — it maps single kanji → list of possible readings. But choosing the *correct* reading requires **word-level knowledge**:

1. Is this kanji part of a compound word? Which compound?
2. Is it using on'yomi or kun'yomi in this context?
3. Are there irregular/special readings (熟字訓 like 今日=きょう, 大人=おとな)?
4. Does the reading change due to sequential voicing (連濁, e.g., 船 → せん in 難破船)?

No amount of heuristics layered onto a per-character lookup table can solve this. It's a morphological analysis problem, and it has been solved comprehensively by existing open-source tools.

### What the Code Currently Does

In `cards.js`, the `formatJapanese()` function processes example sentences by matching individual kanji characters with a regex and wrapping each one in `<ruby>` tags with its `kanji.json` reading:

```javascript
// Current broken approach in cards.js
function formatJapanese(text, addFurigana = true) {
    const kanjiRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/g;
    return text.replace(kanjiRegex, (kanji) => {
        const reading = getKanjiReading(kanji); // looks up single char in kanji.json
        return `<ruby><span class="kanji">${kanji}</span><rt>${reading}</rt></ruby>`;
    });
}
```

Meanwhile, `formatWordWithFurigana()` handles the card front and simply wraps the entire word in a single `<ruby>` tag using the vocab entry's reading — which is correct for vocabulary cards but doesn't help with example sentences.

---

## The Solution: Pre-Computed Furigana via Morphological Analysis

### Why Morphological Analysis Is the Right Tool

Japanese morphological analyzers (MeCab, kuromoji, etc.) tokenize sentences into words and provide the **correct reading for each token in context**, drawing on dictionaries of hundreds of thousands of entries. They handle compounds, conjugation, irregular readings, and sequential voicing — all the things our per-character lookup cannot.

This is a thoroughly solved problem. Every major Japanese text processing system (IMEs, search engines, screen readers, language learning apps like Jisho.org) uses morphological analysis for reading annotation.

### Recommended Approach: Build-Time Pre-Computation

Rather than running a morphological analyzer in the browser at runtime (which requires downloading ~12-20MB of dictionary files), the recommended approach for this project is **pre-computing furigana during the episode integration build step** and storing the annotated text directly in the data files.

This fits naturally into the existing workflow — vocab.json and lines.json are already authored/processed offline before being committed.

### Architecture

```
┌─────────────────────────────────────────────────┐
│              BUILD TIME (Node.js)                │
│                                                  │
│   Raw dialogue text                              │
│        │                                         │
│        ▼                                         │
│   kuromoji tokenizer                             │
│        │                                         │
│        ▼                                         │
│   Token stream with readings                     │
│        │                                         │
│        ▼                                         │
│   Generate furigana-annotated strings            │
│        │                                         │
│        ▼                                         │
│   Store in vocab.json / lines.json               │
│                                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              RUNTIME (Browser)                   │
│                                                  │
│   Read pre-computed furigana from JSON           │
│        │                                         │
│        ▼                                         │
│   Render <ruby> tags directly                    │
│   (no morphological analysis needed)             │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Build the Furigana Generation Script

Create `generate-furigana.js` (a Node.js build script alongside the existing `generate-audio.js`).

**Dependencies:**
```bash
npm install kuromoji
# or the newer fork:
npm install @sglkc/kuromoji
```

kuromoji.js is a pure JavaScript port of the MeCab-derived Kuromoji analyzer. It ships with IPADIC dictionaries and provides tokenization with readings for every token. No external services or API keys needed.

**Core logic:**

```javascript
const kuromoji = require("kuromoji");

// Build tokenizer (one-time, caches dictionary)
const tokenizer = await new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: "node_modules/kuromoji/dict/" })
        .build((err, tokenizer) => {
            if (err) reject(err);
            else resolve(tokenizer);
        });
});

function generateFuriganaHTML(text) {
    const tokens = tokenizer.tokenize(text);
    let result = "";

    for (const token of tokens) {
        const surface = token.surface_form;
        const reading = token.reading; // katakana reading

        // Check if this token contains kanji
        if (/[\u4e00-\u9faf]/.test(surface) && reading) {
            const hiragana = katakanaToHiragana(reading);
            result += `<ruby>${surface}<rt>${hiragana}</rt></ruby>`;
        } else {
            result += surface;
        }
    }
    return result;
}
```

The key insight is that kuromoji returns readings at the **word level**, so 冬眠 comes back as a single token with reading トウミン, not as two separate characters.

### Phase 2: Define the Storage Format

Add a `furigana` field to example sentences in `vocab.json`:

```json
{
    "japanese": "この谷の住民たちは冬の間眠って過ごします",
    "furigana": "この<ruby>谷<rt>たに</rt></ruby>の<ruby>住民<rt>じゅうみん</rt></ruby>たちは<ruby>冬<rt>ふゆ</rt></ruby>の<ruby>間<rt>あいだ</rt></ruby><ruby>眠<rt>ねむ</rt></ruby>って<ruby>過<rt>す</rt></ruby>ごします",
    "english": "The residents of this valley sleep through the winter.",
    "note": "〜て過ごす (spend time doing)"
}
```

Alternatively, use a lighter-weight annotation format and convert to HTML at render time:

```json
{
    "japanese": "この谷の住民たちは冬の間眠って過ごします",
    "furigana_pairs": [
        { "text": "この", "reading": null },
        { "text": "谷", "reading": "たに" },
        { "text": "の", "reading": null },
        { "text": "住民", "reading": "じゅうみん" },
        { "text": "たちは", "reading": null },
        { "text": "冬", "reading": "ふゆ" },
        { "text": "の", "reading": null },
        { "text": "間", "reading": "あいだ" },
        { "text": "眠", "reading": "ねむ" },
        { "text": "って", "reading": null },
        { "text": "過", "reading": "す" },
        { "text": "ごします", "reading": null }
    ]
}
```

**Recommended: Use pre-rendered HTML strings** (the first format). Reasons:

- Simpler runtime code — just inject the string
- The furigana data is authored once at build time and rarely changes
- The size overhead is minimal (these are short sentences)
- Avoids a rendering loop in the browser

### Phase 3: Modify the Runtime Renderer

Replace the current `formatJapanese()` in `cards.js`:

```javascript
// NEW approach - use pre-computed furigana
function formatJapanese(text, furiganaHtml) {
    // If pre-computed furigana exists, use it directly
    if (furiganaHtml) {
        return furiganaHtml;
    }
    // Fallback: return plain text with kanji tooltip spans (no furigana)
    const kanjiRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/g;
    return text.replace(kanjiRegex, (kanji) => {
        return `<span class="kanji">${kanji}</span>`;
    });
}
```

Update `renderCard()` to pass the furigana field through:

```javascript
examples.forEach((ex, idx) => {
    examplesHtml += `
        <div class="example">
            <div class="example-ja japanese">
                ${playButton}
                ${formatJapanese(ex.japanese, ex.furigana)}
            </div>
            ...
        </div>
    `;
});
```

### Phase 4: Remove or Repurpose kanji.json

After the migration, `data/core/kanji.json` is no longer needed for furigana generation. It can be:

- **Kept for the tooltip system** — individual kanji hover tooltips showing all possible readings and meanings are still pedagogically useful. The tooltips module (`tooltips.js`) can continue using it for that purpose.
- **Cleaned up** — the current file has some oddities (e.g., repeated 届 entries) that suggest it was auto-generated without full review.

The `getKanjiReading()` function in `tooltips.js` should no longer be called from `formatJapanese()` — it should only serve the hover tooltip popups.

### Phase 5: Process All Episodes

Run the furigana generation script across all five episodes:

```bash
node generate-furigana.js --episode ep01
node generate-furigana.js --episode ep02
node generate-furigana.js --episode ep03
node generate-furigana.js --episode ep04
node generate-furigana.js --episode ep05
```

This should be added to the Episode Integration Guide as a standard step between vocabulary extraction and audio generation.

---

## Manual Review Considerations

Morphological analyzers are extremely accurate for standard Japanese but not perfect. A review pass should check for:

1. **Rare/archaic words** — kuromoji's IPADIC dictionary may not cover every word in the Moomin anime (which has a somewhat literary register)
2. **Name readings** — character names like ムーミン are katakana and won't need furigana, but any kanji names should be verified
3. **Irregular readings (熟字訓)** — words like 今日 (きょう), 明日 (あした), 大人 (おとな) are usually handled correctly by kuromoji, but should be spot-checked
4. **Conjugated forms** — kuromoji handles standard conjugation well, but verify that okurigana (the kana suffix of a conjugated word) is handled correctly in the ruby annotation

The build script should output a report of any tokens where kuromoji returned no reading (unknown words), so they can be manually annotated.

---

## Alternative Approaches Considered

### Option A: Runtime Morphological Analysis (kuroshiro + kuromoji in browser)

**Pros:** No build step needed, always up-to-date
**Cons:** Requires loading ~12-20MB of dictionary files in the browser; adds significant load time; overkill when the text corpus is fixed and known in advance

**Verdict:** Not recommended. The Moomin Trainer has a fixed, curated corpus — pre-computing is the right call.

### Option B: Expand kanji.json with Compound Word Entries

Add entries like `"冬眠": { "readings": ["とうみん"] }` for every compound word.

**Pros:** No new dependencies
**Cons:** Requires manually maintaining a compound word dictionary that duplicates what morphological analyzers already have; still can't handle conjugation, sequential voicing, or context-dependent readings in sentences; the `formatJapanese()` regex would need a complete rewrite to match multi-character sequences before single characters

**Verdict:** This is reinventing the wheel poorly. It's the direction the current code is trending toward (kanji.json already has some multi-char entries like `作り出す`) and it doesn't scale.

### Option C: Annotate Furigana Manually in Each Example Sentence

Have Claude or the author manually write furigana for every example.

**Pros:** Maximum accuracy
**Cons:** Extremely tedious; error-prone for the same reason the current system fails (human annotators also make mistakes with readings); doesn't scale to new episodes

**Verdict:** Use the automated approach as the baseline, then manually review/correct.

---

## Files to Modify

| File | Change |
|------|--------|
| `generate-furigana.js` | **NEW** — Build script using kuromoji to annotate all example sentences |
| `data/episodes/ep*/vocab.json` | Add `furigana` field to each example object |
| `js/cards.js` | Replace `formatJapanese()` to use pre-computed furigana; stop calling `getKanjiReading()` |
| `js/tooltips.js` | No change needed — keep for hover tooltips |
| `data/core/kanji.json` | Clean up artifacts; keep for tooltip use only |
| `package.json` | Add `kuromoji` (or `@sglkc/kuromoji`) as a dev dependency |
| `EPISODE_INTEGRATION_GUIDE.md` | Add furigana generation as a standard build step |

---

## Summary

The current furigana system is a per-character kanji lookup that fundamentally cannot produce correct readings for compound words, conjugated verbs in sentences, or any context-dependent reading. This is a well-known problem in Japanese text processing, solved decades ago by morphological analyzers. The fix is to use kuromoji.js at build time to pre-compute correct furigana for all example sentences, store the results in the vocab data files, and simplify the runtime renderer to just display what's already been computed. The tooltip system for individual kanji hover information can remain as-is.
