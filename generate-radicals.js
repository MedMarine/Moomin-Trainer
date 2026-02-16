#!/usr/bin/env node
/**
 * generate-radicals.js - Build radical decomposition data
 * 
 * Merges the base KRADFILE decomposition data with hand-authored
 * keywords from radical-keywords.json to produce data/core/radicals.json.
 * 
 * Data sources:
 * - Decompositions: EDRDG KRADFILE project (CC-BY-SA 3.0)
 *   https://www.edrdg.org/krad/kradinf.html
 *   Unicode conversion based on bhffmnn/krad-unicode
 * - Keywords/hints: radical-keywords.json (hand-authored)
 * 
 * Usage: node generate-radicals.js
 * 
 * To update with full KRADFILE data:
 * 1. Download krad.json and krad_components.json from
 *    https://github.com/bhffmnn/krad-unicode (or hoffmannjp fork)
 * 2. Place them in data/core/
 * 3. Run this script with --from-krad flag:
 *    node generate-radicals.js --from-krad
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'core');

function loadJSON(filepath) {
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function buildFromExisting() {
  // Load the existing radicals.json (bootstrapped from Python build script)
  const radicalsPath = path.join(DATA_DIR, 'radicals.json');
  if (!fs.existsSync(radicalsPath)) {
    console.error('Error: data/core/radicals.json not found.');
    console.error('Run the bootstrap script first or use --from-krad with krad-unicode JSON files.');
    process.exit(1);
  }
  
  const radicals = loadJSON(radicalsPath);
  
  // Load keywords if available
  const keywordsPath = path.join(DATA_DIR, 'radical-keywords.json');
  if (fs.existsSync(keywordsPath)) {
    const keywords = loadJSON(keywordsPath);
    
    // Merge keywords into components
    let merged = 0;
    for (const [char, kw] of Object.entries(keywords)) {
      if (radicals.components[char]) {
        if (kw.keyword) {
          radicals.components[char].keyword = kw.keyword;
          merged++;
        }
        if (kw.hint) {
          radicals.components[char].hint = kw.hint;
        }
      }
    }
    console.log(`Merged ${merged} keywords from radical-keywords.json`);
  } else {
    console.log('No radical-keywords.json found, using existing keywords.');
  }
  
  return radicals;
}

function buildFromKrad() {
  // Build from krad-unicode JSON files
  const kradPath = path.join(DATA_DIR, 'krad.json');
  const componentsPath = path.join(DATA_DIR, 'krad_components.json');
  const keywordsPath = path.join(DATA_DIR, 'radical-keywords.json');
  
  if (!fs.existsSync(kradPath)) {
    console.error('Error: data/core/krad.json not found.');
    console.error('Download from https://github.com/bhffmnn/krad-unicode');
    process.exit(1);
  }
  
  const krad = loadJSON(kradPath);
  const kradComponents = fs.existsSync(componentsPath) ? loadJSON(componentsPath) : {};
  const keywords = fs.existsSync(keywordsPath) ? loadJSON(keywordsPath) : {};
  
  // Also load kanji.json to filter to only kanji we use
  const kanjiPath = path.join(DATA_DIR, 'kanji.json');
  const kanjiData = fs.existsSync(kanjiPath) ? loadJSON(kanjiPath) : null;
  
  // Build decompositions (filter to our kanji if available)
  const decompositions = {};
  const usedComponents = new Set();
  
  for (const [kanji, parts] of Object.entries(krad)) {
    // If we have kanji.json, only include kanji that are in it
    // (single-character keys only)
    if (kanjiData && !kanjiData[kanji]) continue;
    if (kanji.length !== 1) continue;
    
    decompositions[kanji] = parts;
    parts.forEach(p => usedComponents.add(p));
  }
  
  // Build components table
  const components = {};
  for (const char of usedComponents) {
    components[char] = {
      strokes: kradComponents[char] || 0,
      keyword: (keywords[char] && keywords[char].keyword) || '',
      hint: (keywords[char] && keywords[char].hint) || ''
    };
  }
  
  console.log(`Built ${Object.keys(decompositions).length} decompositions`);
  console.log(`Using ${Object.keys(components).length} unique components`);
  
  return {
    _meta: {
      source: 'EDRDG KRADFILE/RADKFILE project (CC-BY-SA 3.0)',
      url: 'https://www.edrdg.org/krad/kradinf.html',
      unicode_conversion: 'Based on bhffmnn/krad-unicode',
      description: 'Radical decompositions for kanji used in the Moomin Japanese Trainer',
      note: 'Component keywords and hints are authored in radical-keywords.json and merged by generate-radicals.js'
    },
    components,
    decompositions
  };
}

// Main
const useKrad = process.argv.includes('--from-krad');
const result = useKrad ? buildFromKrad() : buildFromExisting();

// Write output
const outputPath = path.join(DATA_DIR, 'radicals.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n', 'utf-8');

// Stats
const decomCount = Object.keys(result.decompositions).length;
const compCount = Object.keys(result.components).length;
const keywordCount = Object.values(result.components).filter(c => c.keyword).length;

console.log(`\nWrote ${outputPath}`);
console.log(`  Kanji decompositions: ${decomCount}`);
console.log(`  Unique components: ${compCount}`);
console.log(`  Components with keywords: ${keywordCount}/${compCount}`);
if (keywordCount < compCount) {
  console.log(`  ⚠ ${compCount - keywordCount} components still need keywords in radical-keywords.json`);
}
