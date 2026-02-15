# Word Audio Play Button - Implementation Plan

## Current State (What Already Exists)

The codebase is **~90% ready** for this feature. Prior work already added:

- **`generate-audio.js`**: Already has `getWordAudioFilename()` function and a full code block that generates `{ep}__{word}_word.ogg` files using the narrator voice. It runs before the example sentence loop for each word.
- **`cards.js`**: Already has `playWordAudio()`, `getWordAudioPath()`, `hasWordAudio()` functions and renders `word-play-btn` (🔊) buttons in both flashcard front/back and vocab browser items.
- **`css/styles.css`**: Already has `.word-play-btn` styling (lines 1128-1195).
- **`app.js`**: Already calls `Cards.initAudioListeners()` which binds click handlers for `.word-play-btn` elements.

## What's Missing

1. **The actual `_word.ogg` audio files** — they've never been generated. The `generate-audio.js` script has the code but hasn't been run since the word-audio feature was added.
2. **Manifest tracking** — `updateManifest()` in `generate-audio.js` doesn't write `{wordId}_word` entries, so `hasWordAudio()` always returns false.
3. **No graceful fallback UI** — when word audio doesn't exist, the 🔊 button silently fails (the `onerror` handler falls back to playing the first example sentence, which also may not clearly indicate what happened).

## Phases

### Phase 1: Fix manifest generation (code change) ✅ DONE

**File:** `generate-audio.js` → `updateManifest()` function

Added word audio tracking to the manifest. The function now checks for `{ep}_{wordId}_word.ogg` files and writes `{wordId}_word: true/false` entries before the example sentence loop.

**Change:** Added 4 lines before the `if (!word.examples) continue;` guard:
```js
// Track standalone word pronunciation audio
const wordFilename = getWordAudioFilename(episodeId, word.id);
const wordFilepath = path.join(episodeAudioDir, wordFilename);
manifest.episodes[episodeId][`${word.id}_word`] = fs.existsSync(wordFilepath);
```

---

### Phase 2: Generate the word audio files
**Action:** Run `node generate-audio.js` with VOICEVOX running.

The script already has the generation code — it will create `_word.ogg` files for every vocab word across all 5 episodes using the narrator (default) speaker. Files that already exist (the example sentence audio) will be skipped.

**Estimated new files:** ~300-400 word audio files across 5 episodes.

**Prerequisites:** VOICEVOX running on localhost:50021, FFmpeg installed.

---

### Phase 3: (Optional) UI polish for missing audio
**File:** `cards.js` → `playWordAudio()` 

Currently if the `_word.ogg` file doesn't exist, it silently falls back to playing the first example sentence. This is actually decent behavior, but we could optionally:
- Dim/hide the 🔊 button when `hasWordAudio()` returns false and no example audio exists either
- Add a brief tooltip "Audio not yet generated" on hover for missing audio

**Scope:** Minor, ~5-10 lines. Can be skipped if the fallback behavior is acceptable.

---

## Execution Order

```
Phase 1 ✅ → Phase 2 → (Optional) Phase 3
  code        run        polish
  change      VOICEVOX
```
