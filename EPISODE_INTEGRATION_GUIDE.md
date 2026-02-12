# Episode Integration Guide
## Adding New Dialogue Scripts to the Moomin Japanese Trainer

---

## Overview

This guide documents the workflow for converting raw dialogue transcriptions into properly formatted trainer data. The process has five main phases:

1. **Cleaning** — Fix transcription/translation errors in raw dialogue
2. **Extraction** — Identify vocabulary and create structured data
3. **Integration** — Merge new content with existing data
4. **Furigana Generation** — Pre-compute correct furigana for all example sentences
5. **Audio Generation** — Create TTS audio files for examples

> **Note on Furigana:** After creating/updating vocab.json for an episode, run
> `node generate-furigana.js --episode epXX` to add morphologically-correct
> furigana annotations. This replaces the old per-character kanji.json lookup
> with word-level readings from kuromoji. See FURIGANA_FIX.md for details.

---

## Phase 1: Dialogue Cleaning

### 1.1 Input Format

Raw dialogue scripts arrive in this format:
```
[timestamp_start - timestamp_end]
Speaker: Character Name
JA: Japanese text
EN: English translation
```

### 1.2 Common Issues to Fix

**Transcription Errors (Japanese)**
- Misheard words (similar sounds)
- Missing particles
- Incorrect kanji (OCR-style errors or homophones)
- Run-on sentences that should be split
- Character corruption (e.g., `だ���て` → `だって`)

**Character Name Standardization**
Use these consistent names:
- ムーミン (not ムーミントロール)
- ムーミンパパ (not パパ alone in speaker field)
- ムーミンママ
- スノークのおじょうさん (or フローレン)
- スニフ
- ミー (not リトルミイ)
- スナフキン
- ナレーター

**Translation Errors (English)**
- Literal translations that miss nuance
- Wrong tense or aspect
- Omitted context
- Speaker intent not captured
- Cascading misalignments (translations shifted by multiple lines)

### 1.3 Cleaning Checklist

For each line:
- [ ] Japanese makes grammatical sense
- [ ] Japanese matches what would naturally be said in context
- [ ] English captures meaning (not necessarily literal)
- [ ] English reflects appropriate register (formal/casual)
- [ ] Speaker attribution is correct and uses standard names
- [ ] Timestamps don't overlap with adjacent lines
- [ ] No character corruption (check for ���)

### 1.4 Cleaning Examples

#### Example 1: Homophone Error (Common!)

**Before:**
```
JA: どういうわけか、急に地震がなくなってしまったのです
EN: For some reason, I suddenly lost my confidence.
```

Issue: 地震 (jishin = earthquake) should be 自信 (jishin = confidence)

**After:**
```
JA: どういうわけか、急に自信がなくなってしまったのです
EN: For some reason, I suddenly lost my confidence.
```

#### Example 2: Character Corruption

**Before:**
```
JA: 水の上だ���て進みやしない
```

**After:**
```
JA: 水の上だって進みやしない
EN: It won't even move on water.
```

#### Example 3: Cascading Translation Misalignment

When translations are shifted by multiple lines, you need to realign them:

**Before:**
```
[148.38s]
JA: ああ、失敗だ!僕には才能がないんだ!
EN: Stop it, Onii-san

[152.38s]
JA: お兄さんは前に、陸を走る船を作ったじゃない
EN: I don't have the talent
```

**After:**
```
[145.38s]
JA: やめて、お兄さん!大事な設計図でしょ?
EN: Stop it, big brother! That's an important blueprint, isn't it?

[148.38s]
JA: ああ、失敗だ!僕には才能がないんだ!
EN: Ah, it's a failure! I don't have any talent!

[152.38s]
JA: お兄さんは前に、陸を走る船を作ったじゃない
EN: But big brother, you made a land-sailing ship before, didn't you?
```

#### Example 4: Speaker Attribution Fix

**Before:**
```
Speaker: パパ
JA: さあ、船に乗って
```

**After:**
```
Speaker: ムーミンパパ
JA: さあ、船に乗って
```

---

## Phase 2: Vocabulary Extraction

### 2.1 What to Extract

Extract vocabulary that:
- Appears in the episode dialogue
- Is useful for learners (JLPT N5-N3 primarily)
- Has clear context from example sentences

**DO NOT extract:**
- Character names (proper nouns)
- Onomatopoeia (unless very common)
- Extremely rare/specialized terms
- Simple particles alone (は, が, を go in core data)

### 2.2 Vocabulary Entry Schema

```json
{
  "id": "来る",              // Dictionary form (unique identifier)
  "word": "来る",            // Display form
  "reading": "くる",         // Hiragana reading
  "pos": "verb (irregular)", // Part of speech
  "meaning": "to come",      // Primary English meaning
  "notes": "Irregular verb. Past: 来た. Te-form: 来て.",  // Learning tips
  "jlpt": "N5",             // JLPT level (N5-N1)
  "frequency": 12,          // Count in this episode
  "examples": [             // 1-5 best example sentences
    {
      "japanese": "春が来たんだ！",
      "english": "Spring has come!",
      "note": "past tense (た-form)"
    }
  ]
}
```

### 2.3 Selecting Example Sentences

**Cap at 5 examples per word.** Prioritize:
1. Clear demonstration of meaning
2. Different grammatical forms (て-form, た-form, ない-form)
3. Shorter sentences when equally useful
4. Memorable or emotionally engaging lines
5. Lines with fewer unknown dependencies

**Good examples should:**
- Use the word in a clear, unambiguous context
- Ideally show the word in different conjugations
- Not require extensive other vocabulary to understand

### 2.4 Frequency Counting

Count all instances where the vocabulary word appears:
- Dictionary form: 来る → count
- Conjugated forms: 来た, 来て, 来い, 来ない → all count toward 来る
- Compound forms: 帰ってくる → counts for both 帰る and 来る

---

## Phase 3: Integration

### 3.1 Handling Existing Vocabulary (CRITICAL)

When a word already exists in previous episodes, **DO NOT duplicate** it. Instead:

1. **Keep existing entry** in original episode's vocab.json
2. **Add new examples** if they show new conjugations or are better
3. **Update frequency** count if tracking cumulative
4. **Track source episode/index** for each example (for audio lookup)

### 3.2 Example Tracking for Audio

Each example must track where it came from so audio plays correctly:

```json
{
  "japanese": "春が来た！",
  "english": "Spring has come!",
  "note": "past tense",
  "sourceEpisode": "ep01",  // Added when merging
  "sourceIndex": 0          // Original index in source episode
}
```

When the app merges vocabulary across episodes, it preserves these fields so `audio/ep01/ep01_来る_0.ogg` plays for this example even if viewing it in ep05's vocabulary browser.

### 3.3 Merging Algorithm

The app's `cards.js` handles merging automatically:

```javascript
function mergeVocab(newVocab, episodeId) {
  newVocab.forEach(word => {
    // Tag examples with source
    word.examples = word.examples.map((ex, idx) => ({
      ...ex,
      sourceEpisode: ex.sourceEpisode || episodeId,
      sourceIndex: ex.sourceIndex !== undefined ? ex.sourceIndex : idx
    }));
    
    const existing = vocabData.find(v => v.id === word.id);
    if (existing) {
      // Merge examples (keep max 5)
      const allExamples = [...existing.examples, ...word.examples];
      existing.examples = allExamples.slice(0, 5);
      existing.frequency += word.frequency;
      if (!existing.episodes.includes(episodeId)) {
        existing.episodes.push(episodeId);
      }
    } else {
      word.episodes = [episodeId];
      vocabData.push(word);
    }
  });
}
```

### 3.4 Practical Approach: New Words Only in New Episodes

The simplest approach is:
1. **Check existing vocabulary** across all episodes before adding
2. **Only add truly new words** to new episode's vocab.json
3. **Add new examples** for existing words by editing the original episode file

This keeps data clean and avoids merge complexity.

### 3.5 File Locations

```
data/
└── episodes/
    ├── index.json        # Update with new episode
    └── ep##/             # New episode folder
        ├── meta.json     # Episode metadata
        ├── vocab.json    # Episode vocabulary (new words only)
        └── lines.json    # Episode dialogue
```

---

## Phase 4: Audio Generation

### 4.1 Prerequisites

- Node.js installed
- VOICEVOX engine running locally on port 50021
- FFmpeg installed (for OGG compression)

### 4.2 Speaker Mapping

Create/update `audio/speaker-mappings.json`:

```json
{
  "default": 2,
  "characters": {
    "ムーミン": 2,
    "ムーミンパパ": 13,
    "ムーミンママ": 3,
    "スノークのおじょうさん": 14,
    "フローレン": 14,
    "スニフ": 47,
    "ミー": 8,
    "スナフキン": 11,
    "ナレーター": 46
  }
}
```

### 4.3 Running Audio Generation

```bash
# Generate audio for a specific episode
node generate-audio.js ep05

# This will:
# 1. Read vocab.json for the episode
# 2. Generate WAV files via VOICEVOX
# 3. Convert to OGG with FFmpeg
# 4. Update audio/manifest.json
```

### 4.4 Audio File Naming Convention

```
audio/ep01/ep01_春_0.ogg    # Episode_Word_ExampleIndex.ogg
audio/ep01/ep01_春_1.ogg
audio/ep01/ep01_来る_0.ogg
```

Characters problematic for filenames (`<>:"/\|?*`) are replaced with underscores.

### 4.5 Manifest Format

```json
{
  "generatedAt": "2025-02-07T...",
  "episodes": {
    "ep01": {
      "春_0": true,
      "春_1": true,
      "来る_0": true
    },
    "ep02": {
      "船_0": true
    }
  }
}
```

---

## Step-by-Step Integration Workflow

### Step 1: Create Episode Folder

```bash
mkdir data/episodes/ep06
```

### Step 2: Create meta.json

```json
{
  "id": "ep06",
  "series": "楽しいムーミン一家",
  "episode": 6,
  "title": "Episode Title in Japanese",
  "titleEn": "Episode Title in English",
  "description": "Brief description of episode plot.",
  "difficulty": "beginner",
  "vocabCount": 0,
  "lineCount": 0
}
```

### Step 3: Clean Raw Dialogue

1. Copy raw dialogue to working file
2. Review each line for issues (see Phase 1)
3. Fix transcription/translation errors
4. Standardize speaker names
5. Check for character corruption

### Step 4: Extract Vocabulary

1. Read through cleaned dialogue
2. Identify learnable vocabulary
3. **Check against existing episodes** to avoid duplicates
4. Create vocab entries with schema from 2.2
5. Count frequency for each word
6. Select best 1-5 examples per word

### Step 5: Create lines.json

```json
[
  {
    "id": "ep06_001",
    "timestamp": "99.54s",
    "speaker": "ナレーター",
    "japanese": "Full Japanese sentence",
    "english": "Full English translation",
    "vocabUsed": ["春", "来る"],
    "grammar": ["〜たことがある"]
  }
]
```

### Step 6: Update index.json

```json
{
  "episodes": [
    // ... existing ...
    {
      "id": "ep06",
      "title": "日本語タイトル",
      "titleEn": "English Title",
      "available": true,
      "vocabCount": 80,
      "lineCount": 175
    }
  ]
}
```

### Step 7: Generate Audio

```bash
# Start VOICEVOX engine first
node generate-audio.js ep06
```

### Step 8: Validate

- [ ] All vocab IDs are unique across ALL episodes
- [ ] All line IDs are sequential and unique within episode
- [ ] vocabUsed references exist in vocab.json
- [ ] JSON files are valid (no syntax errors)
- [ ] Counts in meta.json and index.json match actual content
- [ ] Audio files generated and manifest updated
- [ ] Test in browser: load episode, play audio, check tooltips

---

## Quality Standards

### Vocabulary Quality

**JLPT alignment:**
- N5: Most basic/common words (prioritize)
- N4: Common daily vocabulary (include)
- N3: Intermediate vocabulary (include selectively)
- N2-N1: Advanced (usually skip unless contextually important)

**Frequency threshold:**
- Words appearing only once may still be included if useful outside episode
- Common words should always be included

### Translation Quality

**Natural > Literal:** 
Translations should read naturally in English.

**Context matters:**
Same Japanese can translate differently based on speaker, emotion, relationship.

**Examples:**
- 僕は行く → "I'll go" (male, casual)
- 私は行きます → "I will go" (neutral/polite)
- 行け！ → "Go!" (commanding)

### Example Sentence Selection

Prioritize sentences that:
1. Clearly demonstrate meaning
2. Show different conjugations
3. Are memorable/emotional
4. Are relatively short
5. Don't require many unknown words

---

## Common Mistakes to Avoid

1. **Duplicating vocabulary** across episodes (check existing first!)
2. **Forgetting sourceEpisode/sourceIndex** on examples (breaks audio)
3. **Using non-standard speaker names** (breaks TTS voice mapping)
4. **Including character corruption** from source transcripts
5. **Misaligned translations** (verify JA matches EN meaning)
6. **Exceeding 5 examples per word** (keep it focused)
7. **Forgetting to update index.json** counts
8. **Not validating JSON** before committing

---

## Notes on Episode-Specific Handling

### Character Dialogue Patterns

| Character | Pronouns | Speech Style | Sentence Endings |
|-----------|----------|--------------|------------------|
| ムーミン | 僕 | Casual | よ, ね |
| ムーミンパパ | 私/俺 | Sometimes formal | のだ, だよ |
| ムーミンママ | 私 | Gentle, polite | わ, のよ |
| ミー | 私/あたし | Blunt, rude | わよ, でしょ |
| スナフキン | 僕 | Calm, philosophical | さ, だね |
| スニフ | 僕 | Whiny, scared | よぅ, だよぅ |
| ナレーター | N/A | Formal, explanatory | ます, です |

### Common Grammar Points to Tag

When filling in the `grammar` array:
- Verb forms: て-form, た-form, ない-form, 命令形, 意向形
- Sentence endings: ね, よ, か, の, わ, ぞ
- Patterns: 〜ている, 〜たい, 〜ことがある, 〜てしまう
- Keigo: ます, です, ございます

---

*Document Version: 2.0*
*Updated: February 2025*
*Changes: Added audio generation phase, example source tracking, speaker standardization, multi-episode vocabulary handling, and validation checklist*
