# ムーミン日本語トレーナー (Moomin Japanese Trainer)

A beautiful, offline-first Japanese vocabulary trainer featuring content from the Moomin anime series. Uses spaced repetition (FSRS algorithm) to help you learn and retain Japanese vocabulary effectively.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-beta-yellow.svg)

## ✨ Features

- **Spaced Repetition System (SRS)** - Uses the FSRS v5 algorithm for optimal memory retention
- **Episode-based Learning** - Vocabulary organized by anime episodes with context
- **Audio Support** - TTS audio for example sentences (via VOICEVOX)
- **Kanji Radical Decomposition** - See what components make up each kanji, with English keywords
- **Kanji Tooltips** - Hover over kanji to see readings, meanings, and radical breakdowns
- **Furigana Toggle** - Show/hide readings above kanji
- **Progress Tracking** - Track your learning streak and statistics
- **Dark Theme** - Easy on the eyes for extended study sessions
- **Offline-First** - Works without internet after initial load
- **Export/Import** - Backup and restore your progress

## 🚀 Quick Start

### Option 1: Direct Use
1. Download or clone this repository
2. Open `index.html` in a modern web browser
3. Start learning!

### Option 2: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser.

## 📁 Project Structure

```
moomin-japanese-trainer/
├── index.html              # Main application
├── css/
│   └── styles.css          # Application styles
├── js/
│   ├── app.js              # Main application logic
│   ├── cards.js            # Card rendering & audio
│   ├── radicals.js         # Kanji radical decomposition
│   ├── storage.js          # LocalStorage management
│   ├── srs.js              # FSRS spaced repetition
│   ├── tooltips.js         # Kanji hover tooltips
│   └── icons.js            # SVG icons for cards
├── data/
│   ├── core/
│   │   ├── kanji.json      # Kanji dictionary
│   │   ├── radicals.json   # Radical decompositions & keywords
│   │   └── radical-keywords.json  # Editable keyword source
│   └── episodes/
│       ├── index.json      # Episode list
│       └── ep01-05/        # Episode vocabulary & lines
├── audio/                  # Generated TTS audio files
│   ├── manifest.json
│   └── ep01-05/
├── generate-audio.js       # Audio generation script
└── generate-radicals.js    # Radical data build script
```

## 🎧 Audio Generation (Optional)

To generate TTS audio for example sentences:

### Prerequisites
- [Node.js](https://nodejs.org/) (v14+)
- [VOICEVOX](https://voicevox.hiroshiba.jp/) running on localhost:50021
- [FFmpeg](https://ffmpeg.org/) (for audio compression)

### Generate Audio
```bash
# Generate for all episodes
node generate-audio.js

# Generate for specific episode
node generate-audio.js ep01
```

### Speaker Configuration
Create `audio/speaker-mappings.json` to customize character voices:
```json
{
  "narrator": 3,
  "moomin": 2,
  "snufkin": 11
}
```

## 🎯 Radical Keywords

The radical decomposition system uses English keywords for kanji components. To edit or add keywords:

1. Edit `data/core/radical-keywords.json`
2. Run `node generate-radicals.js` to rebuild `radicals.json`

Keywords appear on flashcard backs and in kanji tooltips. Components without keywords are shown dimmed. The file ships with 154 of 239 components pre-filled.

## 💾 Data Storage

Your learning progress is stored in your browser's localStorage:

| Key | Description |
|-----|-------------|
| `moomin_cards` | SRS state for each vocabulary card |
| `moomin_progress` | Streak and statistics |
| `moomin_settings` | User preferences |
| `moomin_episodes` | Enabled episodes |

### Privacy Note
- All data stays on your device
- No data is sent to external servers
- Clear browser data to reset everything

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Show answer / Rate "Good" |
| `1` | Rate "Again" |
| `2` | Rate "Hard" |
| `3` | Rate "Good" |
| `4` | Rate "Easy" |

## 🔒 Security

This application implements several security measures:

- **Content Security Policy (CSP)** - Restricts resource loading
- **XSS Protection** - All user-derived content is escaped
- **Input Validation** - Import data is validated and sanitized
- **Path Traversal Protection** - File paths are sanitized

## 🛠️ Development

### Adding New Episodes

1. Create a new folder in `data/episodes/` (e.g., `ep06/`)
2. Add the required JSON files:
   - `meta.json` - Episode metadata
   - `vocab.json` - Vocabulary list
   - `lines.json` - Dialogue lines
3. Update `data/episodes/index.json`
4. Generate audio (optional): `node generate-audio.js ep06`

### Vocabulary Format
```json
{
  "id": "春",
  "word": "春",
  "reading": "はる",
  "meaning": "spring",
  "pos": "noun",
  "jlpt": "N5",
  "examples": [
    {
      "japanese": "春が来た。",
      "english": "Spring has come."
    }
  ]
}
```

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Credits

- **FSRS Algorithm** - [Open Spaced Repetition](https://github.com/open-spaced-repetition)
- **VOICEVOX** - Text-to-speech engine
- **Moomin** - Characters © Moomin Characters™

## 🐛 Known Issues

- Audio may not play on iOS Safari without user interaction first
- Very long vocabulary words may overflow on small screens

## 📝 Changelog

### v1.1.0
- Kanji radical decomposition system (KRADFILE/EDRDG data)
- Component breakdown on flashcard backs
- Radical info in kanji hover tooltips
- 419 kanji decompositions, 239 components, 154 pre-authored keywords
- Build pipeline for radical data (generate-radicals.js)
- Cleaned invalid entries from kanji.json

### v1.0.0
- Initial release
- 5 episodes with vocabulary
- FSRS v5 spaced repetition
- VOICEVOX audio generation
- Dark theme UI

---

Made with ❤️ for Japanese learners
