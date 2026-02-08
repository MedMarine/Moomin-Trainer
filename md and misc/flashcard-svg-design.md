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

## Implementation Phases

### Phase 1: Core Infrastructure
1. Create SVG component system in JavaScript
2. Define icon-to-word mapping in JSON
3. Update `cards.js` to render icons on card front
4. Add CSS for icon positioning/sizing

### Phase 2: Icon Categories & Templates
Create base templates for each part-of-speech:

| Category | Template Style | Examples |
|----------|---------------|----------|
| Nature nouns | Organic, rounded | 春🌸 山⛰ 海🌊 雪❄ |
| People nouns | Simple faces/figures | パパ👨 ママ👩 お姉ちゃん |
| Object nouns | Outlined objects | 家🏠 帽子🎩 船⛵ |
| Action verbs | Arrows + motion lines | 来る→ 行く← 飛ぶ↑ |
| State verbs | Frames/containers | 眠る😴 知る💡 待つ⏳ |
| i-adjectives | Expressive shapes | 大きい(big circle) 面白い(star) |
| Adverbs | Abstract patterns | もう(arrow) まだ(dots) |

### Phase 3: Episode 1 Icons (84 words)
Create all icons for Episode 1 vocabulary first as pilot.

### Phase 4: Episodes 2-5 Icons
Extend to remaining episodes, reusing templates where possible.

### Phase 5: Refinement
- A/B test effectiveness
- Gather feedback
- Iterate on confusing icons

---

## Technical Architecture

### File Structure
```
/img/
  /icons/
    icon-manifest.json    # Maps word IDs to icon names
    /nature/
      spring.svg
      mountain.svg
      ...
    /people/
      papa.svg
      mama.svg
      ...
    /objects/
      house.svg
      hat.svg
      ...
    /verbs/
      come.svg
      go.svg
      ...
    /adjectives/
      big.svg
      interesting.svg
      ...
```

### Alternative: Inline SVG Approach
Instead of separate files, embed SVGs directly in JavaScript as template literals:

```javascript
const CardIcons = {
  春: `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="20" fill="none" stroke="#7eb8da" stroke-width="2"/>
    <path d="M32 20 Q38 32 32 44 Q26 32 32 20" fill="#f0a5b5"/>
  </svg>`,
  // ... more icons
};
```

**Recommended:** Inline SVGs for simplicity (no extra HTTP requests, easier to maintain).

---

## Icon Design Specifications

### Canvas & Sizing
- ViewBox: `0 0 64 64`
- Display size: 48-64px on card
- Safe area: Keep content within 8px margin (8-56 range)

### Colors (from CSS variables)
```css
--accent: #7eb8da       /* Moomin blue - primary strokes */
--accent-bright: #a8d4f0 /* Highlights */
--text-primary: #f0f6fc  /* White/cream fills */
--warning: #d29922       /* Gold accent (sparingly) */
```

### Stroke Guidelines
- Primary outlines: 2px
- Detail lines: 1.5px
- No fills on large shapes (transparent/outline style)
- Rounded line caps and joins

---

## Episode 1 Icon Mapping (Priority List)

### Batch 1: Nature & Seasons (High Visual Impact)
| Word | Reading | Meaning | Icon Concept |
|------|---------|---------|--------------|
| 春 | はる | spring | Cherry blossom / sun emerging |
| 冬 | ふゆ | winter | Snowflake |
| 雪 | ゆき | snow | Snow pile or falling flakes |
| 山 | やま | mountain | Simple peak |
| 海 | うみ | sea | Wave |
| 雲 | くも | cloud | Fluffy cloud shape |
| 谷 | たに | valley | V-shape with curves |

### Batch 2: Family & People
| Word | Reading | Meaning | Icon Concept |
|------|---------|---------|--------------|
| パパ | パパ | papa | Simple male face with hat |
| ママ | ママ | mama | Female face, apron hint |
| お姉ちゃん | おねえちゃん | big sister | Girl face, smaller |
| お兄さん | おにいさん | big brother | Boy face |
| 僕 | ぼく | I (male) | Simple figure pointing at self |
| 私 | わたし | I | Neutral figure |
| みんな | みんな | everyone | Multiple small figures |

### Batch 3: Objects
| Word | Reading | Meaning | Icon Concept |
|------|---------|---------|--------------|
| 家 | いえ | house | Simple house outline |
| 帽子 | ぼうし | hat | Top hat (Hobgoblin's hat!) |
| 船 | ふね | ship/boat | Simple sailboat |
| 夢 | ゆめ | dream | Cloud with star/sparkle |
| 旅 | たび | trip | Suitcase or path |
| 話 | はなし | story | Speech bubble |
| 物語 | ものがたり | tale | Open book |

### Batch 4: Actions (Verbs)
| Word | Reading | Meaning | Icon Concept |
|------|---------|---------|--------------|
| 来る | くる | to come | Arrow pointing toward viewer |
| 行く | いく | to go | Arrow pointing away |
| 帰る | かえる | to return | Circular arrow + house |
| 見る | みる | to see | Eye |
| 聞く | きく | to hear | Ear |
| 言う | いう | to say | Speech marks |
| 眠る | ねむる | to sleep | Closed eyes, zzz |
| 起きる | おきる | to wake up | Sun rising, open eyes |
| 飛ぶ | とぶ | to fly | Wings or bird |
| 乗る | のる | to ride | Person on vehicle |
| 作る | つくる | to make | Hammer/tool |

### Batch 5: Adjectives
| Word | Reading | Meaning | Icon Concept |
|------|---------|---------|--------------|
| 大きい | おおきい | big | Large circle |
| 早い | はやい | early/fast | Clock with fast hands |
| 面白い | おもしろい | interesting | Star or sparkle eyes |
| 寂しい | さびしい | lonely | Single figure, rain |
| 暖かい | あたたかい | warm | Sun with rays |
| 危ない | あぶない | dangerous | Warning triangle |
| 素晴らしい | すばらしい | wonderful | Stars/sparkles |

### Batch 6: Abstract & Adverbs
| Word | Reading | Meaning | Icon Concept |
|------|---------|---------|--------------|
| 今 | いま | now | Clock at 12 |
| 今年 | ことし | this year | Calendar |
| 去年 | きょねん | last year | Calendar with arrow back |
| もう | もう | already | Checkmark |
| まだ | まだ | still/yet | Hourglass |
| ここ | ここ | here | Pin/marker |
| そこ | そこ | there | Pin slightly away |
| 何 | なに | what | Question mark |
| 誰 | だれ | who | Person with ? |
| どこ | どこ | where | Compass |

---

## CSS Additions Needed

```css
/* Card icon container */
.card-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  margin-bottom: 1rem;
}

.card-icon svg {
  width: 64px;
  height: 64px;
  opacity: 0.9;
  transition: opacity 0.2s, transform 0.2s;
}

.flashcard:hover .card-icon svg {
  opacity: 1;
  transform: scale(1.05);
}
```

---

## Next Steps

1. **[ ] Create icon module** (`js/icons.js`) with inline SVG definitions
2. **[ ] Build Batch 1** (7 nature icons) as proof of concept  
3. **[ ] Update `cards.js`** to inject icons into card front
4. **[ ] Add CSS** for icon styling
5. **[ ] Test & iterate** on Episode 1
6. **[ ] Scale to remaining batches**

---

## Questions for Review

1. Should icons animate on hover? (subtle pulse/glow?)
2. Fallback for words without icons? (generic category icon?)
3. Should users be able to toggle icons off?
4. Store icon mapping in vocab.json or separate file?

---

*Document created: February 2026*
*Project: Moomin Japanese Trainer*
