# ムーミン TTS Audio System

This document explains how to generate and use Text-to-Speech audio for example sentences in the Moomin Japanese Trainer.

## Overview

The TTS system uses **VOICEVOX** to generate natural-sounding Japanese audio for all example sentences. Each character can be assigned a different voice to match their personality.

## Prerequisites

1. **VOICEVOX** - Download and install from [voicevox.hiroshiba.jp](https://voicevox.hiroshiba.jp/)
2. **Node.js** - Required for the audio generation script (v14+)

## Quick Start

### 1. Start VOICEVOX

Launch the VOICEVOX application. It will start a local HTTP server on `localhost:50021`.

### 2. Configure Speaker Mappings

Open `tts-trainer.html` in your browser to:
- See all available VOICEVOX speakers
- Assign speakers to each Moomin character
- Preview voices before generating

Or edit the speaker mappings directly in `generate-audio.js`:

```javascript
const CHARACTER_SPEAKERS = {
  'ナレーター': 3,      // Zundamon (normal)
  'ムーミン': 1,        // Shikoku Metan (normal)
  'ムーミンパパ': 13,   // Ryusei Aoyama
  // ... etc
};
```

### 3. Generate Audio

Run the Node.js script:

```bash
# Generate for all episodes
node generate-audio.js

# Generate for a specific episode
node generate-audio.js ep01
```

Generated audio files will be saved to `audio/{episodeId}/`.

### 4. Update Manifest

After generating, update `audio/manifest.json` to track which files exist:

```json
{
  "episodes": {
    "ep01": {
      "春_0": true,
      "春_1": true,
      // ...
    }
  }
}
```

## File Structure

```
audio/
├── manifest.json       # Tracks which audio files exist
├── ep01/
│   ├── ep01_春_0.wav
│   ├── ep01_春_1.wav
│   ├── ep01_来る_0.wav
│   └── ...
├── ep02/
│   └── ...
```

## Using Audio in the App

Once audio files are generated, play buttons (▶) will appear next to each example sentence:

- In flashcard review mode
- In the vocabulary browser
- Click to play, click again to stop

## Speaker Recommendations

Here are some suggested voice assignments for Moomin characters:

| Character | Japanese | Suggested Voice | Style |
|-----------|----------|-----------------|-------|
| Narrator | ナレーター | ずんだもん | Normal - Calm narration |
| Moomin | ムーミン | 四国めたん | Normal - Young, friendly |
| Moominpapa | ムーミンパパ | 青山龍星 | Normal - Mature male |
| Moominmama | ムーミンママ | ずんだもん | Amaama - Gentle, warm |
| Snufkin | スノフキン | No.7 | Normal - Cool, relaxed |
| Sniff | スニフ | もち子さん | Normal - Timid, nervous |
| Little My | ミー | ナースロボ | Normal - Energetic, sharp |
| Snorkmaiden | フローレン | 春日部つむぎ | Normal - Young female |

## API Reference

### VOICEVOX Endpoints Used

```
GET  /speakers           - List available speakers
POST /audio_query        - Create synthesis query
POST /synthesis          - Generate audio from query
```

### Example API Usage

```javascript
// Step 1: Create audio query
const queryRes = await fetch(
  `http://localhost:50021/audio_query?speaker=3&text=${encodeURIComponent('こんにちは')}`,
  { method: 'POST' }
);
const query = await queryRes.json();

// Step 2: Synthesize
const audioRes = await fetch(
  `http://localhost:50021/synthesis?speaker=3`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  }
);
const audioBlob = await audioRes.blob();
```

## Troubleshooting

### "VOICEVOX not connected"

- Make sure VOICEVOX is running
- Check if `http://localhost:50021/speakers` returns data
- Try restarting VOICEVOX

### Audio not playing

- Check browser console for errors
- Verify the audio file exists in the correct path
- Ensure manifest.json is updated

### Poor audio quality

- Try different VOICEVOX speakers
- Adjust speed/pitch settings in the audio query
- Some speakers work better for certain text patterns

## Advanced: Custom Voice Settings

You can customize synthesis parameters in the audio query:

```javascript
query.speedScale = 1.0;      // Speech speed (0.5-2.0)
query.pitchScale = 0.0;      // Pitch adjustment (-0.15 to 0.15)
query.intonationScale = 1.0; // Intonation variation
query.volumeScale = 1.0;     // Volume level
```
