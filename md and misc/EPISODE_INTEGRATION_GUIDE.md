# Episode Integration Guide
## Adding New Dialogue Scripts to the Moomin Japanese Trainer

---

## Overview

This guide documents the workflow for converting raw dialogue transcriptions into properly formatted trainer data. The process has three main phases:

1. **Cleaning** — Fix transcription/translation errors in raw dialogue
2. **Extraction** — Identify vocabulary and create structured data
3. **Integration** — Merge new content with existing data

---

## Phase 1: Dialogue Cleaning

### 1.1 Input Format

Raw dialogue scripts arrive in this format:
```
[timestamp_start - timestamp_end]
JA: Japanese text
EN: English translation
```

### 1.2 Common Issues to Fix

**Transcription Errors (Japanese)**
- Misheard words (similar sounds)
- Missing particles
- Incorrect kanji (OCR-style errors)
- Run-on sentences that should be split
- Character name variations (ムーミン vs ムーミントロール)

**Translation Errors (English)**
- Literal translations that miss nuance
- Wrong tense or aspect
- Omitted context
- Speaker intent not captured
- Mistranslations due to homophones

**Missing Translations**
- Lines with only Japanese
- Partial translations
- Placeholder text

### 1.3 Cleaning Checklist

For each line:
- [ ] Japanese makes grammatical sense
- [ ] Japanese matches what would naturally be said in context
- [ ] English captures meaning (not necessarily literal)
- [ ] English reflects appropriate register (formal/casual)
- [ ] Speaker attribution is correct
- [ ] Timestamps don't overlap with adjacent lines

### 1.4 Cleaning Examples

#### Example 1: Misaligned Translation (Episode 1)

**Before:**
```
[234.80s - 237.69s]
JA: 私どうしてこの家で冬眠してたの
EN: I forgot.
```

**After:**
```
[234.80s - 237.69s]
JA: 私どうしてこの家で冬眠してたの
EN: Why was I hibernating in this house?
```

The EN was incorrectly assigned from the following line.

#### Example 2: Cascading Misalignment (Episode 3)

When translations are shifted by multiple lines:

**Before:**
```
[148.38s - 152.38s]
JA: ああ、失敗だ!僕には才能がないんだ!
EN: Stop it, Onii-san

[152.38s - 156.38s]
JA: お兄さんは前に、陸を走る船を作ったじゃない
EN: I don't have the talent

[156.38s - 157.38s]
JA: あんなもの!
EN: (missing)
```

**After:**
```
[145.38s - 148.38s]
JA: やめて、お兄さん!大事な設計図でしょ?
EN: Stop it, big brother! That's an important blueprint, isn't it?

[148.38s - 152.38s]
JA: ああ、失敗だ!僕には才能がないんだ!
EN: Ah, it's a failure! I don't have any talent!

[152.38s - 156.38s]
JA: お兄さんは前に、陸を走る船を作ったじゃない
EN: But big brother, you made a land-sailing ship before, didn't you?
```

#### Example 3: Transcription Error - Homophone (Episode 3)

**Before:**
```
[847.74s]
JA: どういうわけか、急に地震がなくなってしまったのです
EN: That's why I suddenly lost my confidence
```

Issue: 地震 (jishin = earthquake) is wrong, context indicates 自信 (jishin = confidence)

**After:**
```
[847.74s]
JA: どういうわけか、急に自信がなくなってしまったのです
EN: For some reason, I suddenly lost my confidence.
```

#### Example 4: Character Corruption

**Before:**
```
[175.27s]
JA: 水の上だ���て進みやしない
```

**After:**
```
[175.27s]
JA: 水の上だって進みやしない
EN: It won't even move on water.
```

#### Example 5: Mishearing (Episode 1)

**Before:**
```
[273.06s - 275.79s]
JA: お母ちゃんの体の声が悪くなったんだ
EN: Mom's health has gotten worse.
```

Issue: 声 (koe = voice) should be 具合 (guai = condition)

**After:**
```
[273.06s - 275.79s]
JA: お母ちゃんの体の具合が悪くなったんだ
EN: Mom's health has gotten worse.
```

---

## Phase 2: Vocabulary Extraction

### 2.1 What to Extract

Extract vocabulary that:
- Appears in the episode dialogue
- Is useful for learners (JLPT N5-N2 typically)
- Has clear context from example sentences

**DO NOT extract:**
- Character names (proper nouns)
- Onomatopoeia (unless very common)
- Extremely rare/specialized terms
- Particles (these go in core/particles.json)

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

Good examples should:
- Clearly demonstrate the word's meaning
- Show the word in its natural grammatical context
- Be relatively simple (not overly complex)
- Ideally show different conjugations/usages

**Prioritize sentences that:**
1. Use the word in dictionary form first
2. Show common conjugations (て-form, た-form, ない-form)
3. Are memorable or emotionally engaging
4. Don't require too many unknown words

### 2.4 Frequency Counting

Count all instances where the vocabulary word appears:
- Dictionary form: 来る → count
- Conjugated forms: 来た, 来て, 来い, 来ない → all count toward 来る
- Compound forms: 帰ってくる → counts for both 帰る and 来る

---

## Phase 3: Integration

### 3.1 Handling Existing Vocabulary

When a word already exists in previous episodes:

**Check existing entry:**
```javascript
const existing = existingVocab.find(v => v.id === newWord.id);
```

**If word exists:**
1. Compare example sentences
2. Add new examples if they're better or fill gaps (max 5 total)
3. Update frequency count (sum across episodes)
4. Do NOT duplicate the word entry

**Better examples are ones that:**
- Show a conjugation not yet covered
- Are simpler/clearer
- Have more natural translations
- Come from memorable scenes

### 3.2 Merging Algorithm

```javascript
function mergeVocab(existingVocab, newVocab) {
  const merged = [...existingVocab];
  const existingIds = new Set(existingVocab.map(v => v.id));
  
  for (const word of newVocab) {
    if (existingIds.has(word.id)) {
      // Find and update existing
      const existing = merged.find(v => v.id === word.id);
      existing.frequency += word.frequency;
      
      // Merge examples (keep best 5)
      const allExamples = [...existing.examples, ...word.examples];
      existing.examples = selectBestExamples(allExamples, 5);
    } else {
      // Add new word
      merged.push(word);
    }
  }
  
  return merged;
}
```

### 3.3 Lines.json Format

Each dialogue line becomes:

```json
{
  "id": "ep03_001",           // Episode + sequence number
  "timestamp": "99.54s",      // Start timestamp
  "speaker": "ナレーター",      // Character name in Japanese
  "japanese": "Full Japanese sentence here",
  "english": "Full English translation here",
  "vocabUsed": ["春", "来る"], // IDs of vocab words that appear
  "grammar": ["〜たことがある (have experienced)"]  // Grammar points
}
```

### 3.4 File Locations

```
data/
└── episodes/
    ├── index.json        # Update with new episode
    └── ep03/             # New episode folder
        ├── meta.json     # Episode metadata
        ├── vocab.json    # Episode vocabulary
        └── lines.json    # Episode dialogue
```

---

## Step-by-Step Integration Workflow

### Step 1: Create Episode Folder

```
data/episodes/ep03/
```

### Step 2: Create meta.json

```json
{
  "id": "ep03",
  "series": "楽しいムーミン一家",
  "episode": 3,
  "title": "浜で見つけた難破船",
  "titleEn": "The Shipwreck on the Beach",
  "description": "Brief description of episode plot.",
  "difficulty": "beginner",
  "vocabCount": 0,    // Update after extraction
  "lineCount": 0      // Update after extraction
}
```

### Step 3: Clean Raw Dialogue

1. Copy raw dialogue to working file
2. Review each line for issues (see 1.2)
3. Fix transcription errors
4. Fix translation errors
5. Fill in missing translations
6. Verify speaker attributions

### Step 4: Extract Vocabulary

1. Read through cleaned dialogue
2. Identify learnable vocabulary
3. Create vocab entries with schema from 2.2
4. Count frequency for each word
5. Select best 1-5 examples per word
6. Check against existing vocab (avoid duplicates)

### Step 5: Create lines.json

1. Convert cleaned dialogue to JSON format
2. Assign sequential IDs (ep03_001, ep03_002...)
3. Fill in vocabUsed array for each line
4. Add grammar point annotations

### Step 6: Update index.json

Add the new episode to the registry:

```json
{
  "episodes": [
    // ... existing episodes ...
    {
      "id": "ep03",
      "title": "浜で見つけた難破船",
      "titleEn": "The Shipwreck on the Beach",
      "available": true,
      "vocabCount": 80,
      "lineCount": 175
    }
  ]
}
```

### Step 7: Validate

- [ ] All vocab IDs are unique (or intentionally merged)
- [ ] All line IDs are sequential and unique
- [ ] vocabUsed references exist in vocab.json
- [ ] JSON files are valid (no syntax errors)
- [ ] Counts in meta.json match actual content

---

## Quality Standards

### Vocabulary Quality

**Frequency threshold:** Words appearing only once may still be included if:
- They're common/useful outside this episode
- They're key to understanding the plot
- They're at a level appropriate for learners

**JLPT alignment:** When uncertain about level:
- N5: Most basic/common words
- N4: Common daily vocabulary  
- N3: Intermediate vocabulary
- N2: More nuanced/literary terms
- N1: Advanced/rare (usually skip)

### Translation Quality

**Natural > Literal:** Translations should read naturally in English even if not word-for-word.

**Context matters:** Same Japanese can translate differently based on:
- Speaker's gender/age
- Emotional context
- Relationship between speakers

**Example:**
- 僕は行く → "I'll go" (male speaker, casual)
- 私は行きます → "I will go" (neutral/female, polite)

### Example Sentence Selection

**Cap at 5 examples per word.** Prioritize:
1. Clear demonstration of meaning
2. Different grammatical forms
3. Memorable/emotional lines
4. Shorter sentences when equally useful
5. Lines with fewer unknown dependencies

---

## Notes on Episode-Specific Handling

### Character Dialogue Patterns

- **ムーミン**: Male, uses 僕, casual speech
- **ムーミンパパ**: Male, uses 私/俺, sometimes formal
- **ムーミンママ**: Female, uses 私, gentle speech, わ/のよ endings
- **ミー**: Female, uses 私, blunt, casual, あんた
- **スノフキン**: Male, uses 僕, calm, philosophical
- **スニフ**: Male, uses 僕, whiny, scared
- **フローレン**: Female, uses 私, polite
- **ナレーター**: Formal, explanatory

### Common Grammar Points to Tag

When filling in the `grammar` array, include:
- Verb conjugations (て-form, た-form, conditional, etc.)
- Sentence-ending particles (ね, よ, か, の, etc.)
- Common patterns (〜ている, 〜たい, 〜ことがある, etc.)
- Keigo when used (ます, です, etc.)

---

## Appendix: JSON Validation

Use this structure to validate your files:

**vocab.json** - Array of vocab objects
**lines.json** - Array of line objects  
**meta.json** - Single object with episode metadata
**index.json** - Object with episodes array

All files must be valid JSON. Test with:
```bash
# In the project directory
node -e "JSON.parse(require('fs').readFileSync('data/episodes/ep03/vocab.json'))"
```

---

*Document Version: 1.0*
*Created: February 2025*
