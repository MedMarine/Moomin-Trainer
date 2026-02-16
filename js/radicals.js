/**
 * radicals.js - Kanji radical decomposition system
 * Provides radical/component breakdown data for kanji learning.
 * 
 * Based on the EDRDG KRADFILE project (CC-BY-SA 3.0).
 * Component keywords are hand-authored for mnemonic learning.
 */

const Radicals = (function() {
  let components = {};      // char -> { strokes, keyword, hint }
  let decompositions = {};  // kanji -> [component, component, ...]
  let loaded = false;

  /**
   * Load radical data from JSON
   */
  async function init() {
    if (loaded) return;
    
    try {
      const response = await fetch('data/core/radicals.json');
      const data = await response.json();
      
      components = data.components || {};
      decompositions = data.decompositions || {};
      loaded = true;
      
      console.log(`Radicals loaded: ${Object.keys(decompositions).length} kanji, ${Object.keys(components).length} components`);
    } catch (e) {
      console.warn('Could not load radicals.json:', e);
      components = {};
      decompositions = {};
    }
  }

  /**
   * Get the radical decomposition for a kanji character
   * @param {string} kanji - Single kanji character
   * @returns {Array|null} Array of component characters, or null if not found
   */
  function getDecomposition(kanji) {
    return decompositions[kanji] || null;
  }

  /**
   * Get component info (keyword, strokes, hint)
   * @param {string} component - Single component character
   * @returns {Object|null} Component data or null
   */
  function getComponent(component) {
    return components[component] || null;
  }

  /**
   * Get the keyword for a component
   * @param {string} component - Single component character
   * @returns {string} Keyword or empty string
   */
  function getKeyword(component) {
    const comp = components[component];
    return comp ? comp.keyword : '';
  }

  /**
   * Get decomposition with full component details for a kanji
   * @param {string} kanji - Single kanji character
   * @returns {Array|null} Array of {char, keyword, strokes, hint} objects
   */
  function getDetailedDecomposition(kanji) {
    const parts = decompositions[kanji];
    if (!parts) return null;
    
    return parts.map(char => ({
      char,
      keyword: getKeyword(char),
      strokes: components[char] ? components[char].strokes : 0,
      hint: components[char] ? components[char].hint : ''
    }));
  }

  /**
   * Get decomposition for all kanji characters in a word
   * @param {string} word - Japanese word (may contain kanji, kana, etc.)
   * @returns {Array} Array of {kanji, components} for each kanji found
   */
  function getWordDecomposition(word) {
    if (!word) return [];
    
    const kanjiRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/g;
    const results = [];
    let match;
    
    while ((match = kanjiRegex.exec(word)) !== null) {
      const kanji = match[0];
      const detail = getDetailedDecomposition(kanji);
      if (detail) {
        results.push({ kanji, components: detail });
      }
    }
    
    return results;
  }

  /**
   * Render a radical breakdown HTML block for a word
   * Shows each kanji's component radicals with keywords
   * @param {string} word - The vocabulary word
   * @returns {string} HTML string for the breakdown display, or empty string
   */
  function renderBreakdown(word) {
    const decomp = getWordDecomposition(word);
    if (decomp.length === 0) return '';

    let html = '<div class="radical-breakdown">';
    html += '<div class="radical-breakdown-label">Components</div>';
    
    decomp.forEach(({ kanji, components: comps }) => {
      html += '<div class="radical-kanji-row">';
      html += `<span class="radical-kanji-char japanese">${escapeHtml(kanji)}</span>`;
      html += '<span class="radical-equals">=</span>';
      html += '<span class="radical-parts">';
      
      comps.forEach((comp, idx) => {
        if (idx > 0) {
          html += '<span class="radical-plus">+</span>';
        }
        const keywordClass = comp.keyword ? '' : ' no-keyword';
        const tooltip = comp.hint ? ` title="${escapeHtml(comp.hint)}"` : '';
        html += `<span class="radical-component${keywordClass}"${tooltip}>`;
        html += `<span class="radical-component-char japanese">${escapeHtml(comp.char)}</span>`;
        if (comp.keyword) {
          html += `<span class="radical-component-keyword">${escapeHtml(comp.keyword)}</span>`;
        }
        html += '</span>';
      });
      
      html += '</span>';
      html += '</div>';
    });
    
    html += '</div>';
    return html;
  }

  /**
   * Get a compact radical string for tooltips
   * e.g., "言 say + 五 five + 口 mouth"
   * @param {string} kanji - Single kanji character
   * @returns {string} Compact breakdown string, or empty string
   */
  function getTooltipString(kanji) {
    const detail = getDetailedDecomposition(kanji);
    if (!detail) return '';
    
    return detail
      .filter(c => c.keyword)
      .map(c => `${c.char} ${c.keyword}`)
      .join(' + ');
  }

  /**
   * Find all kanji that contain a specific component
   * @param {string} component - Component character to search for
   * @returns {Array} Array of kanji characters containing this component
   */
  function findKanjiWithComponent(component) {
    const results = [];
    for (const [kanji, parts] of Object.entries(decompositions)) {
      if (parts.includes(component)) {
        results.push(kanji);
      }
    }
    return results;
  }

  /**
   * Get all unique components used across all loaded decompositions
   * Sorted by stroke count
   * @returns {Array} Array of {char, keyword, strokes, hint, kanjiCount}
   */
  function getAllComponents() {
    return Object.entries(components)
      .map(([char, data]) => ({
        char,
        keyword: data.keyword || '',
        strokes: data.strokes || 0,
        hint: data.hint || '',
        kanjiCount: findKanjiWithComponent(char).length
      }))
      .sort((a, b) => a.strokes - b.strokes || a.char.localeCompare(b.char));
  }

  /**
   * Check if radical data is loaded
   * @returns {boolean}
   */
  function isLoaded() {
    return loaded;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  // Public API
  return {
    init,
    getDecomposition,
    getComponent,
    getKeyword,
    getDetailedDecomposition,
    getWordDecomposition,
    renderBreakdown,
    getTooltipString,
    findKanjiWithComponent,
    getAllComponents,
    isLoaded
  };
})();
