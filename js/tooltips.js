/**
 * tooltips.js - Kanji hover tooltip system
 * Provides readings and meanings on hover/tap
 */

const Tooltips = (function() {
  let tooltip = null;
  let activeKanji = null;
  let kanjiData = {};

  /**
   * Initialize the tooltip system
   */
  function init() {
    tooltip = document.getElementById('tooltip');
    if (!tooltip) {
      console.error('Tooltip element not found');
      return;
    }

    // Mouse events for desktop
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    // Touch events for mobile
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
  }

  /**
   * Load kanji data from JSON
   */
  async function loadKanjiData() {
    try {
      const response = await fetch('data/core/kanji.json');
      kanjiData = await response.json();
    } catch (e) {
      console.warn('Could not load kanji.json:', e);
      kanjiData = {};
    }
  }

  /**
   * Handle mouseover on kanji elements
   */
  function handleMouseOver(e) {
    const kanji = e.target.closest('.kanji');
    if (!kanji) return;
    showTooltip(kanji);
  }

  /**
   * Handle mouseout from kanji elements
   */
  function handleMouseOut(e) {
    const kanji = e.target.closest('.kanji');
    if (kanji) {
      hideTooltip();
    }
  }

  /**
   * Handle touch start on mobile
   */
  function handleTouchStart(e) {
    const kanji = e.target.closest('.kanji');
    
    if (kanji) {
      e.preventDefault();
      if (activeKanji === kanji) {
        hideTooltip();
      } else {
        showTooltip(kanji);
      }
    } else if (activeKanji) {
      hideTooltip();
    }
  }

  /**
   * Handle touch end
   */
  function handleTouchEnd(e) {
    // Prevent ghost clicks
    if (activeKanji) {
      e.preventDefault();
    }
  }

  /**
   * Show tooltip for a kanji element
   */
  function showTooltip(kanji) {
    activeKanji = kanji;

    // Get data from element attributes or kanji dictionary
    const char = kanji.textContent.trim();
    const reading = kanji.dataset.reading || getReading(char);
    const meaning = kanji.dataset.meaning || getMeaning(char);

    // Update tooltip content
    tooltip.querySelector('.tooltip-reading').textContent = reading;
    tooltip.querySelector('.tooltip-meaning').textContent = meaning;

    // Position tooltip
    positionTooltip(kanji);

    // Show
    tooltip.classList.add('visible');
  }

  /**
   * Hide the tooltip
   */
  function hideTooltip() {
    activeKanji = null;
    tooltip.classList.remove('visible');
  }

  /**
   * Position tooltip near the kanji element
   */
  function positionTooltip(kanji) {
    const rect = kanji.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Default: above and centered
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - 8;

    // Keep within viewport horizontally
    const padding = 10;
    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }

    // If no room above, show below
    if (top < padding) {
      top = rect.bottom + 8;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  /**
   * Get reading from kanji dictionary
   */
  function getReading(char) {
    if (kanjiData[char] && kanjiData[char].readings) {
      return kanjiData[char].readings[0];
    }
    return '?';
  }

  /**
   * Get reading for a kanji character (public API for other modules)
   * @param {string} char - Single kanji character
   * @returns {string} Primary reading or '?' if not found
   */
  function getKanjiReading(char) {
    return getReading(char);
  }

  /**
   * Get meaning from kanji dictionary
   */
  function getMeaning(char) {
    if (kanjiData[char] && kanjiData[char].meanings) {
      return kanjiData[char].meanings[0];
    }
    return '?';
  }

  /**
   * Toggle furigana visibility
   */
  function toggleFurigana(show) {
    document.body.classList.toggle('show-furigana', show);
    Storage.set('SETTINGS', {
      ...Storage.get('SETTINGS'),
      showFurigana: show
    });
  }

  // Public API
  return {
    init,
    loadKanjiData,
    toggleFurigana,
    hideTooltip,
    getKanjiReading
  };
})();
