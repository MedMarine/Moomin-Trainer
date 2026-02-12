#!/usr/bin/env node
/**
 * generate-furigana.js - Pre-compute correct furigana for all example sentences
 * 
 * Uses kuromoji morphological analyzer to produce word-level readings,
 * replacing the broken per-character kanji.json lookup.
 * 
 * Usage:
 *   node generate-furigana.js --episode ep01
 *   node generate-furigana.js --episode all
 *   node generate-furigana.js                  # defaults to all
 * 
 * Output:
 *   Adds a "furigana" field to each example in data/episodes/epXX/vocab.json
 *   containing pre-rendered <ruby> HTML with correct readings.
 */

const fs = require("fs");
const path = require("path");
const kuromoji = require("kuromoji");

// ─── Configuration ───────────────────────────────────────────────────────────

const EPISODES_DIR = path.join(__dirname, "data", "episodes");
const DICT_PATH = path.join(__dirname, "node_modules", "kuromoji", "dict");
const ALL_EPISODES = ["ep01", "ep02", "ep03", "ep04", "ep05"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert katakana string to hiragana
 */
function katakanaToHiragana(str) {
  if (!str) return "";
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/**
 * Check if a string contains any kanji characters
 */
function containsKanji(str) {
  return /[\u4e00-\u9faf\u3400-\u4dbf]/.test(str);
}

/**
 * Check if a character is katakana
 */
function isKatakana(ch) {
  const code = ch.charCodeAt(0);
  return code >= 0x30A0 && code <= 0x30FF;
}

/**
 * Check if a character is hiragana
 */
function isHiragana(ch) {
  const code = ch.charCodeAt(0);
  return code >= 0x3040 && code <= 0x309F;
}

/**
 * Attempt to split okurigana from a token.
 * For example, surface="食べる" with reading="たべる" should produce:
 *   <ruby>食<rt>た</rt></ruby>べる
 * rather than:
 *   <ruby>食べる<rt>たべる</rt></ruby>
 * 
 * This handles the common case where a kanji portion is followed by 
 * hiragana okurigana, making the furigana more natural and readable.
 */
function splitOkurigana(surface, reading) {
  // Find where trailing hiragana starts in the surface
  let surfaceKanjiEnd = surface.length;
  for (let i = surface.length - 1; i >= 0; i--) {
    if (containsKanji(surface[i]) || isKatakana(surface[i])) {
      surfaceKanjiEnd = i + 1;
      break;
    }
    if (i === 0) {
      // Entire string is hiragana – shouldn't happen for kanji tokens,
      // but guard against it
      surfaceKanjiEnd = 0;
    }
  }

  const surfaceStem = surface.slice(0, surfaceKanjiEnd);
  const surfaceTail = surface.slice(surfaceKanjiEnd);

  if (surfaceTail.length === 0 || surfaceStem.length === 0) {
    // No okurigana to split, or no kanji stem
    return null;
  }

  // The reading tail should match the surface tail (okurigana)
  const readingHiragana = katakanaToHiragana(reading);
  if (readingHiragana.endsWith(surfaceTail)) {
    const readingStem = readingHiragana.slice(0, readingHiragana.length - surfaceTail.length);
    if (readingStem.length > 0) {
      return {
        stem: surfaceStem,
        stemReading: readingStem,
        tail: surfaceTail
      };
    }
  }

  return null;
}

/**
 * Generate furigana-annotated HTML for a Japanese text string
 */
function generateFuriganaHTML(tokenizer, text) {
  const tokens = tokenizer.tokenize(text);
  let result = "";
  const unknowns = [];

  for (const token of tokens) {
    const surface = token.surface_form;
    const reading = token.reading; // katakana or undefined

    // Only add furigana to tokens that contain kanji and have a reading
    if (containsKanji(surface) && reading) {
      const hiragana = katakanaToHiragana(reading);

      // Skip furigana if reading is same as surface (pure kana word mistakenly tagged)
      if (hiragana === surface) {
        result += surface;
        continue;
      }

      // Try to split okurigana for more natural display
      const split = splitOkurigana(surface, reading);
      if (split) {
        result += `<ruby>${split.stem}<rt>${split.stemReading}</rt></ruby>${split.tail}`;
      } else {
        result += `<ruby>${surface}<rt>${hiragana}</rt></ruby>`;
      }
    } else if (containsKanji(surface) && !reading) {
      // Unknown word – kuromoji couldn't determine reading
      unknowns.push(surface);
      result += surface;
    } else {
      // Kana, punctuation, etc. – pass through
      result += surface;
    }
  }

  return { html: result, unknowns };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function buildTokenizer() {
  return new Promise((resolve, reject) => {
    kuromoji
      .builder({ dicPath: DICT_PATH })
      .build((err, tokenizer) => {
        if (err) reject(err);
        else resolve(tokenizer);
      });
  });
}

async function processEpisode(tokenizer, episodeId) {
  const vocabPath = path.join(EPISODES_DIR, episodeId, "vocab.json");

  if (!fs.existsSync(vocabPath)) {
    console.warn(`  ⚠ ${vocabPath} not found, skipping`);
    return { processed: 0, unknowns: [] };
  }

  const vocab = JSON.parse(fs.readFileSync(vocabPath, "utf-8"));
  let totalExamples = 0;
  let allUnknowns = [];

  for (const entry of vocab) {
    if (!entry.examples) continue;

    for (const example of entry.examples) {
      if (!example.japanese) continue;

      const { html, unknowns } = generateFuriganaHTML(tokenizer, example.japanese);
      example.furigana = html;
      totalExamples++;

      if (unknowns.length > 0) {
        allUnknowns.push({
          word: entry.id,
          sentence: example.japanese,
          unknowns
        });
      }
    }
  }

  // Write updated vocab back
  fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2) + "\n", "utf-8");

  return { processed: totalExamples, unknowns: allUnknowns };
}

async function main() {
  // Parse command line args
  const args = process.argv.slice(2);
  let episodeArg = "all";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--episode" && args[i + 1]) {
      episodeArg = args[i + 1];
    }
  }

  const episodes = episodeArg === "all" ? ALL_EPISODES : [episodeArg];

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Moomin Trainer – Furigana Generator (kuromoji)");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Episodes: ${episodes.join(", ")}`);
  console.log("");

  // Build tokenizer (loads dictionary – takes a few seconds)
  console.log("  Loading kuromoji dictionary...");
  let tokenizer;
  try {
    tokenizer = await buildTokenizer();
  } catch (err) {
    console.error("  ✗ Failed to load kuromoji dictionary.");
    console.error("    Have you run 'npm install'?");
    console.error("    Error:", err.message);
    process.exit(1);
  }
  console.log("  ✓ Dictionary loaded\n");

  let grandTotal = 0;
  let allUnknowns = [];

  for (const ep of episodes) {
    console.log(`  Processing ${ep}...`);
    const { processed, unknowns } = await processEpisode(tokenizer, ep);
    console.log(`    ✓ ${processed} examples annotated`);
    if (unknowns.length > 0) {
      console.log(`    ⚠ ${unknowns.length} sentences have unknown tokens`);
    }
    grandTotal += processed;
    allUnknowns.push(...unknowns);
  }

  console.log("\n───────────────────────────────────────────────────────────");
  console.log(`  Total: ${grandTotal} examples processed`);

  if (allUnknowns.length > 0) {
    console.log(`\n  ⚠ Unknown tokens requiring manual review:`);
    for (const item of allUnknowns) {
      console.log(`    Word "${item.word}": ${item.unknowns.join(", ")}`);
      console.log(`      in: ${item.sentence}`);
    }
  }

  console.log("\n  Done! Vocab files updated with furigana fields.");
  console.log("═══════════════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
