/**
 * VOICEVOX Audio Generator for Moomin Trainer
 * 
 * Generates TTS audio files for all example sentences using VOICEVOX,
 * then converts them to compressed OGG format.
 * 
 * Prerequisites:
 * - Node.js installed
 * - VOICEVOX running on localhost:50021
 * - FFmpeg installed (for audio conversion)
 * 
 * Usage:
 *   node generate-audio.js [episodeId]
 * 
 * Examples:
 *   node generate-audio.js          # Generate for all episodes
 *   node generate-audio.js ep01     # Generate for episode 1 only
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync, execFile } = require('child_process');

// ============================================
// Configuration
// ============================================

const VOICEVOX_BASE = 'http://127.0.0.1:50021';
const DATA_DIR = './data/episodes';
const AUDIO_DIR = './audio';
const TEMP_DIR = './audio/temp';

// Output format: 'ogg', 'mp3', or 'wav'
const OUTPUT_FORMAT = 'ogg';

// Audio quality settings
const AUDIO_SETTINGS = {
  ogg: '-c:a libvorbis -q:a 4',  // Quality 4 is good balance (0-10 scale)
  mp3: '-c:a libmp3lame -q:a 4', // Quality 4 = ~165 kbps VBR
  wav: ''  // No conversion needed
};

// Default character to speaker ID mapping
// These are fallback values - the script will try to load saved mappings first
const DEFAULT_CHARACTER_SPEAKERS = {
  'ナレーター': 3,      
  'ムーミン': 2,        
  'ムーミンパパ': 13,   
  'ムーミンママ': 14,    
  'スノフキン': 11,     
  'スニフ': 2,        
  'ミー': 8,          
  'フローレン': 8,      
  'スノーク': 13,       
  'ヘムレン': 13,       
  '謎の生き物': 2,      
  'default': 3          
};

let CHARACTER_SPEAKERS = { ...DEFAULT_CHARACTER_SPEAKERS };

// ============================================
// Utility Functions
// ============================================

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ buffer, statusCode: res.statusCode });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${buffer.toString().substring(0, 100)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Speaker Mapping
// ============================================

function loadSpeakerMappings() {
  // Try to load from a mappings file (exported from the web UI)
  const mappingsFile = path.join(AUDIO_DIR, 'speaker-mappings.json');
  
  if (fs.existsSync(mappingsFile)) {
    try {
      const mappings = JSON.parse(fs.readFileSync(mappingsFile, 'utf8'));
      console.log('✓ Loaded speaker mappings from speaker-mappings.json');
      
      // Convert character IDs to Japanese names for matching
      const charIdToJa = {
        'narrator': 'ナレーター',
        'moomin': 'ムーミン',
        'moominpapa': 'ムーミンパパ',
        'moominmama': 'ムーミンママ',
        'snufkin': 'スノフキン',
        'sniff': 'スニフ',
        'littlemy': 'ミー',
        'snorkmaiden': 'フローレン',
        'snork': 'スノーク',
        'hemulen': 'ヘムレン',
        'mystery': '謎の生き物'
      };
      
      Object.entries(mappings).forEach(([charId, speakerId]) => {
        const jaName = charIdToJa[charId];
        if (jaName && speakerId) {
          CHARACTER_SPEAKERS[jaName] = parseInt(speakerId);
        }
      });
      
      // Also set default to narrator's voice
      if (mappings.narrator) {
        CHARACTER_SPEAKERS['default'] = parseInt(mappings.narrator);
      }
      
      return true;
    } catch (e) {
      console.log(`⚠ Failed to parse mappings file: ${e.message}`);
    }
  }
  
  console.log('ℹ Using default speaker mappings');
  console.log('  Tip: Save mappings from the web UI to audio/speaker-mappings.json');
  return false;
}

// ============================================
// VOICEVOX API Functions
// ============================================

async function checkVoicevoxConnection() {
  try {
    const res = await httpRequest(`${VOICEVOX_BASE}/speakers`);
    const speakers = JSON.parse(res.buffer.toString());
    console.log(`✓ VOICEVOX connected. ${speakers.length} speakers available.`);
    return speakers;
  } catch (e) {
    console.error(`✗ Failed to connect to VOICEVOX: ${e.message}`);
    console.error('  Make sure VOICEVOX is running on localhost:50021');
    return null;
  }
}

async function generateAudio(text, speakerId) {
  // Step 1: Create audio query
  const queryUrl = `${VOICEVOX_BASE}/audio_query?speaker=${speakerId}&text=${encodeURIComponent(text)}`;
  const queryRes = await httpRequest(queryUrl, { method: 'POST' });
  const query = JSON.parse(queryRes.buffer.toString());

  // Step 2: Synthesize
  const synthUrl = `${VOICEVOX_BASE}/synthesis?speaker=${speakerId}`;
  const synthRes = await httpRequest(synthUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });

  return synthRes.buffer;
}

// ============================================
// Audio Conversion
// ============================================

function convertAudio(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const settings = AUDIO_SETTINGS[OUTPUT_FORMAT] || '';
    // Use execFile with argument array to prevent command injection
    const args = ['-y', '-i', inputPath];
    if (settings) {
      args.push(...settings.split(' ').filter(s => s));
    }
    args.push(outputPath, '-loglevel', 'error');
    
    execFile('ffmpeg', args, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve();
      }
    });
  });
}

// ============================================
// File Utilities
// ============================================

function sanitizeFilename(str) {
  // Replace problematic characters but keep Japanese
  return str.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
}

function getAudioFilename(episodeId, wordId, exampleIndex) {
  const safeWordId = sanitizeFilename(wordId);
  return `${episodeId}_${safeWordId}_${exampleIndex}.${OUTPUT_FORMAT}`;
}

function loadVocab(episodeId) {
  const vocabPath = path.join(DATA_DIR, episodeId, 'vocab.json');
  if (!fs.existsSync(vocabPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
}

function loadLines(episodeId) {
  const linesPath = path.join(DATA_DIR, episodeId, 'lines.json');
  if (!fs.existsSync(linesPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(linesPath, 'utf8'));
}

function getEpisodeIds() {
  const indexPath = path.join(DATA_DIR, 'index.json');
  if (!fs.existsSync(indexPath)) {
    return fs.readdirSync(DATA_DIR)
      .filter(f => f.startsWith('ep') && fs.statSync(path.join(DATA_DIR, f)).isDirectory());
  }
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  return index.episodes.map(e => e.id);
}

// ============================================
// Audio Generation
// ============================================

function getSpeakerForText(text, lines) {
  if (lines) {
    const line = lines.find(l => l.japanese === text);
    if (line && line.speaker) {
      return CHARACTER_SPEAKERS[line.speaker] || CHARACTER_SPEAKERS['default'];
    }
  }
  return CHARACTER_SPEAKERS['default'];
}

async function generateForEpisode(episodeId, lines, hasFFmpeg) {
  const vocab = loadVocab(episodeId);
  if (!vocab) {
    console.log(`  No vocab found for ${episodeId}, skipping.`);
    return { generated: 0, skipped: 0, failed: 0 };
  }

  const episodeAudioDir = path.join(AUDIO_DIR, episodeId);
  ensureDir(episodeAudioDir);
  
  if (hasFFmpeg && OUTPUT_FORMAT !== 'wav') {
    ensureDir(TEMP_DIR);
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const word of vocab) {
    if (!word.examples || word.examples.length === 0) continue;

    for (let i = 0; i < word.examples.length; i++) {
      const example = word.examples[i];
      const filename = getAudioFilename(episodeId, word.id, i);
      const filepath = path.join(episodeAudioDir, filename);

      // Skip if already exists
      if (fs.existsSync(filepath)) {
        skipped++;
        continue;
      }

      const speakerId = getSpeakerForText(example.japanese, lines);

      try {
        process.stdout.write(`  ${word.word} [${i + 1}/${word.examples.length}]...`);
        
        const audioBuffer = await generateAudio(example.japanese, speakerId);
        
        if (hasFFmpeg && OUTPUT_FORMAT !== 'wav') {
          // Save temp WAV, convert to target format
          const tempPath = path.join(TEMP_DIR, `temp_${Date.now()}.wav`);
          fs.writeFileSync(tempPath, audioBuffer);
          
          await convertAudio(tempPath, filepath);
          
          // Clean up temp file
          fs.unlinkSync(tempPath);
        } else {
          // Save as WAV directly
          fs.writeFileSync(filepath, audioBuffer);
        }
        
        console.log(' ✓');
        generated++;

        // Small delay to not overwhelm VOICEVOX
        await new Promise(r => setTimeout(r, 50));
      } catch (e) {
        console.log(` ✗ ${e.message}`);
        failed++;
      }
    }
  }

  return { generated, skipped, failed };
}

// ============================================
// Manifest Generation
// ============================================

function updateManifest(episodeId, vocab) {
  const manifestPath = path.join(AUDIO_DIR, 'manifest.json');
  let manifest = { version: '1.0.0', generatedAt: null, episodes: {} };
  
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (e) {
      // Start fresh
    }
  }
  
  manifest.generatedAt = new Date().toISOString();
  manifest.format = OUTPUT_FORMAT;
  
  if (!manifest.episodes[episodeId]) {
    manifest.episodes[episodeId] = {};
  }
  
  // Check which files actually exist
  const episodeAudioDir = path.join(AUDIO_DIR, episodeId);
  
  for (const word of vocab) {
    if (!word.examples) continue;
    
    for (let i = 0; i < word.examples.length; i++) {
      const filename = getAudioFilename(episodeId, word.id, i);
      const filepath = path.join(episodeAudioDir, filename);
      const key = `${word.id}_${i}`;
      
      manifest.episodes[episodeId][key] = fs.existsSync(filepath);
    }
  }
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ムーミン TTS Generator - VOICEVOX Audio Generation');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check FFmpeg
  const hasFFmpeg = checkFFmpeg();
  if (hasFFmpeg) {
    console.log(`✓ FFmpeg found. Will output ${OUTPUT_FORMAT.toUpperCase()} files.`);
  } else {
    console.log('⚠ FFmpeg not found. Will output WAV files (larger size).');
    console.log('  Install FFmpeg for compressed audio output.\n');
  }

  // Check VOICEVOX connection
  const speakers = await checkVoicevoxConnection();
  if (!speakers) {
    process.exit(1);
  }

  // Load speaker mappings
  loadSpeakerMappings();
  
  console.log('\nSpeaker assignments:');
  Object.entries(CHARACTER_SPEAKERS).forEach(([char, id]) => {
    if (char !== 'default') {
      console.log(`  ${char}: Speaker ID ${id}`);
    }
  });

  // Get target episode(s)
  const targetEpisode = process.argv[2];
  let episodeIds;

  if (targetEpisode) {
    episodeIds = [targetEpisode];
    console.log(`\nTarget: ${targetEpisode}\n`);
  } else {
    episodeIds = getEpisodeIds();
    console.log(`\nProcessing all ${episodeIds.length} episodes...\n`);
  }

  // Ensure audio directory exists
  ensureDir(AUDIO_DIR);

  // Generate for each episode
  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const epId of episodeIds) {
    console.log(`\n▶ Episode: ${epId}`);
    console.log('─'.repeat(40));

    const lines = loadLines(epId);
    const vocab = loadVocab(epId);

    if (!vocab) {
      console.log('  No vocabulary data found, skipping.');
      continue;
    }

    // Generate vocab example audio
    const stats = await generateForEpisode(epId, lines, hasFFmpeg);

    console.log(`\n  Summary: ${stats.generated} generated, ${stats.skipped} skipped, ${stats.failed} failed`);

    totalGenerated += stats.generated;
    totalSkipped += stats.skipped;
    totalFailed += stats.failed;

    // Update manifest for this episode
    updateManifest(epId, vocab);
  }

  // Clean up temp directory
  if (fs.existsSync(TEMP_DIR)) {
    try {
      fs.rmdirSync(TEMP_DIR);
    } catch (e) {
      // Ignore if not empty
    }
  }

  // Final summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Format:    ${hasFFmpeg ? OUTPUT_FORMAT.toUpperCase() : 'WAV'}`);
  console.log(`  Generated: ${totalGenerated}`);
  console.log(`  Skipped:   ${totalSkipped} (already exist)`);
  console.log(`  Failed:    ${totalFailed}`);
  console.log(`  Output:    ${path.resolve(AUDIO_DIR)}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
