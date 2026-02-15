/**
 * cards.js - Card rendering and interaction
 * Renders vocabulary flashcards and handles flip/grade interactions
 * Now with TTS audio playback support!
 */

const Cards = (function() {
  let vocabData = [];
  let linesData = [];
  let episodeVocabMap = {}; // Maps episodeId -> Set of vocab IDs
  let audioManifest = null; // Track available audio files
  let currentAudio = null; // Currently playing audio element

  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML-safe text
   */
  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  /**
   * Sanitize an episode ID to prevent path traversal
   * @param {string} episodeId - Episode ID to sanitize
   * @returns {string} Sanitized episode ID
   */
  function sanitizeEpisodeId(episodeId) {
    if (!episodeId || typeof episodeId !== 'string') return 'ep01';
    return episodeId.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 20) || 'ep01';
  }

  /**
   * Load vocabulary data for an episode
   */
  async function loadEpisodeData(episodeId) {
    // Skip if already loaded
    if (episodeVocabMap[episodeId]) {
      return { vocab: getVocabByEpisode(episodeId), lines: [] };
    }
    
    try {
      const [vocabRes, linesRes] = await Promise.all([
        fetch(`data/episodes/${episodeId}/vocab.json`),
        fetch(`data/episodes/${episodeId}/lines.json`)
      ]);
      
      const vocab = await vocabRes.json();
      const lines = await linesRes.json();
      
      // Merge with existing data
      mergeVocab(vocab, episodeId);
      mergeLines(lines);
      
      return { vocab, lines };
    } catch (e) {
      console.error(`Failed to load episode ${episodeId}:`, e);
      return { vocab: [], lines: [] };
    }
  }

  /**
   * Load the audio manifest to know which audio files exist
   */
  async function loadAudioManifest() {
    if (audioManifest) return audioManifest;
    
    try {
      const res = await fetch('audio/manifest.json');
      audioManifest = await res.json();
      console.log('Audio manifest loaded');
      return audioManifest;
    } catch (e) {
      console.log('No audio manifest found - TTS audio disabled');
      audioManifest = { episodes: {} };
      return audioManifest;
    }
  }

  /**
   * Check if audio exists for a specific example
   */
  function hasAudio(episodeId, wordId, exampleIndex) {
    if (!audioManifest) return false;
    const epAudio = audioManifest.episodes[episodeId];
    if (!epAudio) return false;
    const key = `${wordId}_${exampleIndex}`;
    return epAudio[key] === true;
  }

  /**
   * Get the audio file path for an example
   */
  function getAudioPath(episodeId, wordId, exampleIndex) {
    // Sanitize episodeId to prevent path traversal
    const safeEpisodeId = sanitizeEpisodeId(episodeId);
    // Sanitize wordId for filename (same logic as generate-audio.js)
    // Only replace problematic characters, keep Japanese characters
    const safeWordId = String(wordId || '').replace(/[<>:"\/\\|?*]/g, '_').substring(0, 50);
    // Sanitize index
    const safeIndex = Math.max(0, parseInt(exampleIndex) || 0);
    // Try OGG first (compressed), fall back to WAV
    return `audio/${safeEpisodeId}/${safeEpisodeId}_${safeWordId}_${safeIndex}.ogg`;
  }

  /**
   * Get the audio file path for a standalone word pronunciation
   */
  function getWordAudioPath(episodeId, wordId) {
    const safeEpisodeId = sanitizeEpisodeId(episodeId);
    const safeWordId = String(wordId || '').replace(/[<>:"\/\\|?*]/g, '_').substring(0, 50);
    return `audio/${safeEpisodeId}/${safeEpisodeId}_${safeWordId}_word.ogg`;
  }

  /**
   * Check if standalone word audio exists
   */
  function hasWordAudio(episodeId, wordId) {
    if (!audioManifest) return false;
    const epAudio = audioManifest.episodes[episodeId];
    if (!epAudio) return false;
    return epAudio[`${wordId}_word`] === true;
  }

  /**
   * Play standalone word pronunciation audio
   */
  function playWordAudio(episodeId, wordId, buttonEl) {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      document.querySelectorAll('.play-btn.playing, .word-play-btn.playing').forEach(btn => {
        btn.classList.remove('playing');
        btn.innerHTML = btn.classList.contains('word-play-btn') ? '🔊' : '▶';
      });
    }

    const audioPath = getWordAudioPath(episodeId, wordId);
    currentAudio = new Audio(audioPath);

    if (buttonEl) {
      buttonEl.classList.add('playing');
      buttonEl.innerHTML = '⏸';
    }

    currentAudio.onended = () => {
      if (buttonEl) {
        buttonEl.classList.remove('playing');
        buttonEl.innerHTML = '🔊';
      }
      currentAudio = null;
    };

    currentAudio.onerror = () => {
      // Fall back to first example audio if word audio doesn't exist
      if (buttonEl) {
        buttonEl.classList.remove('playing');
        buttonEl.innerHTML = '🔊';
      }
      currentAudio = null;
      // Try playing the first example sentence audio as fallback
      playAudio(episodeId, wordId, 0, null);
    };

    currentAudio.play().catch(e => {
      console.error('Word audio playback failed:', e);
    });
  }

  /**
   * Play audio for an example sentence
   */
  function playAudio(episodeId, wordId, exampleIndex, buttonEl) {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      // Reset all play buttons
      document.querySelectorAll('.play-btn.playing').forEach(btn => {
        btn.classList.remove('playing');
        btn.textContent = '▶';
      });
    }

    const audioPath = getAudioPath(episodeId, wordId, exampleIndex);
    
    currentAudio = new Audio(audioPath);
    
    // Update button state
    if (buttonEl) {
      buttonEl.classList.add('playing');
      buttonEl.textContent = '⏸';
    }

    currentAudio.onended = () => {
      if (buttonEl) {
        buttonEl.classList.remove('playing');
        buttonEl.textContent = '▶';
      }
      currentAudio = null;
    };

    currentAudio.onerror = () => {
      console.error(`Failed to load audio: ${audioPath}`);
      if (buttonEl) {
        buttonEl.classList.remove('playing');
        buttonEl.textContent = '▶';
        buttonEl.classList.add('error');
        setTimeout(() => buttonEl.classList.remove('error'), 1000);
      }
      currentAudio = null;
    };

    currentAudio.play().catch(e => {
      console.error('Audio playback failed:', e);
    });
  }

  /**
   * Stop currently playing audio
   */
  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
      document.querySelectorAll('.play-btn.playing').forEach(btn => {
        btn.classList.remove('playing');
        btn.textContent = '▶';
      });
      document.querySelectorAll('.word-play-btn.playing').forEach(btn => {
        btn.classList.remove('playing');
        btn.innerHTML = '🔊';
      });
    }
  }

  /**
   * Merge new vocabulary with existing (for multi-episode support)
   */
  function mergeVocab(newVocab, episodeId) {
    // Initialize episode vocab set if needed
    if (!episodeVocabMap[episodeId]) {
      episodeVocabMap[episodeId] = new Set();
    }
    
    newVocab.forEach(word => {
      // Track this word as belonging to this episode
      episodeVocabMap[episodeId].add(word.id);
      
      // Tag each example with its source episode and original index for audio lookup
      if (word.examples) {
        word.examples = word.examples.map((ex, idx) => ({
          ...ex,
          sourceEpisode: ex.sourceEpisode || episodeId,
          sourceIndex: ex.sourceIndex !== undefined ? ex.sourceIndex : idx
        }));
      }
      
      const existing = vocabData.find(v => v.id === word.id);
      if (existing) {
        // Merge examples, keeping max 5
        const allExamples = [...(existing.examples || []), ...(word.examples || [])];
        existing.examples = allExamples.slice(0, 5);
        existing.frequency = (existing.frequency || 0) + (word.frequency || 0);
        // Track all episodes this word appears in
        if (!existing.episodes) existing.episodes = [];
        if (!existing.episodes.includes(episodeId)) existing.episodes.push(episodeId);
      } else {
        word.episodes = [episodeId];
        vocabData.push(word);
      }
    });
  }

  /**
   * Merge dialogue lines
   */
  function mergeLines(newLines) {
    newLines.forEach(line => {
      if (!linesData.find(l => l.id === line.id)) {
        linesData.push(line);
      }
    });
  }

  /**
   * Get all loaded vocabulary
   */
  function getVocab() {
    return vocabData;
  }

  /**
   * Get vocabulary for a specific episode
   */
  function getVocabByEpisode(episodeId) {
    if (!episodeVocabMap[episodeId]) {
      return [];
    }
    return vocabData.filter(word => episodeVocabMap[episodeId].has(word.id));
  }

  /**
   * Get vocabulary item by ID
   */
  function getVocabById(id) {
    return vocabData.find(v => v.id === id);
  }

  /**
   * Find example sentences for a word
   */
  function getExamplesForWord(wordId) {
    const word = getVocabById(wordId);
    if (word && word.examples) {
      return word.examples;
    }
    
    // Fall back to searching lines
    return linesData
      .filter(line => line.vocabUsed && line.vocabUsed.includes(wordId))
      .slice(0, 4)
      .map(line => ({
        japanese: line.japanese,
        english: line.english,
        note: line.grammar ? line.grammar.join(', ') : null
      }));
  }

  /**
   * Render a vocabulary flashcard
   */
  function renderCard(wordId, episodeId = null) {
    const word = getVocabById(wordId);
    if (!word) {
      return '<div class="flashcard"><p>Card not found</p></div>';
    }

    // Use first episode if not specified
    const epId = episodeId || (word.episodes && word.episodes[0]) || 'ep01';
    const examples = getExamplesForWord(wordId);
    const cardState = Storage.getCard(`vocab_${wordId}`) || SRS.createCard();

    // Build examples HTML with play buttons
    let examplesHtml = '';
    examples.forEach((ex, idx) => {
      // Use the example's source episode and index for audio lookup
      // This ensures correct audio is played even when examples are merged from multiple episodes
      const audioEpisode = ex.sourceEpisode || epId;
      const audioIndex = ex.sourceIndex !== undefined ? ex.sourceIndex : idx;
      const playButton = `<button class="play-btn" 
        data-episode="${audioEpisode}" 
        data-word="${wordId}" 
        data-index="${audioIndex}"
        title="Play audio">▶</button>`;

      examplesHtml += `
        <div class="example">
          <div class="example-ja japanese">
            ${playButton}
            ${formatJapanese(ex.japanese, ex.furigana || null)}
          </div>
          <div class="example-en">${escapeHtml(ex.english)}</div>
          ${ex.note ? `<div class="example-note">${escapeHtml(ex.note)}</div>` : ''}
        </div>
      `;
    });



    // Word pronunciation play button
    const wordPlayBtn = `<button class="word-play-btn" 
      data-episode="${escapeHtml(epId)}" 
      data-word="${escapeHtml(wordId)}"
      title="Play word pronunciation">🔊</button>`;

    return `
      <div class="flashcard" data-card-id="vocab_${escapeHtml(wordId)}" data-episode="${escapeHtml(epId)}">
        <div class="card-front">
          <div class="word-display japanese">${formatWordWithFurigana(word.word, word.reading)}</div>
          <div class="word-pos">${escapeHtml(word.pos || '')}</div>
          ${wordPlayBtn}
          <div class="flip-hint">タップして答えを表示</div>
        </div>
        <div class="card-back">
          <div class="card-back-word japanese">
            ${wordPlayBtn}
            ${formatWordWithFurigana(word.word, word.reading)}
          </div>
          <div class="word-meaning">${escapeHtml(word.meaning)}</div>
          <div class="examples">
            ${examplesHtml}
          </div>
          ${word.notes ? `<div class="word-notes">💡 ${escapeHtml(word.notes)}</div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Format a word with furigana using ruby tags
   */
  function formatWordWithFurigana(word, reading) {
    if (!reading || !word) return word || '';
    
    // Simple case: single kanji word
    if (word.length === 1) {
      return `<ruby>${word}<rt>${reading}</rt></ruby>`;
    }

    // For compound words, we need smarter parsing
    // For now, just wrap the whole thing
    return `<ruby>${word}<rt>${reading}</rt></ruby>`;
  }

  /**
   * Format Japanese text with furigana.
   * If pre-computed furigana HTML is provided (from kuromoji build step), use it directly.
   * Otherwise, fall back to wrapping kanji with tooltip spans (no furigana).
   * @param {string} text - Japanese text to format
   * @param {string|null} furiganaHtml - Pre-computed furigana HTML from vocab data
   */
  function formatJapanese(text, furiganaHtml) {
    if (!text) return '';
    
    // If pre-computed furigana exists (generated by generate-furigana.js), use it directly
    if (furiganaHtml) {
      // Add .kanji class to kanji within ruby tags for tooltip hover support
      // The furigana HTML has <ruby>KANJI<rt>reading</rt></ruby> structure;
      // we wrap kanji chars in the ruby base text with .kanji spans for tooltips
      return furiganaHtml.replace(
        /(<ruby>)([^<]+)(<rt>)/g,
        (match, rubyOpen, baseText, rtOpen) => {
          const wrapped = baseText.replace(
            /[\u4e00-\u9faf\u3400-\u4dbf]/g,
            (k) => `<span class="kanji">${k}</span>`
          );
          return `${rubyOpen}${wrapped}${rtOpen}`;
        }
      );
    }
    
    // Fallback: no pre-computed furigana — wrap kanji with tooltip spans only
    const kanjiRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/g;
    return text.replace(kanjiRegex, (kanji) => {
      return `<span class="kanji">${kanji}</span>`;
    });
  }


  /**
   * Render vocabulary list item for browser
   */
  function renderVocabListItem(word) {
    const cardState = Storage.getCard(`vocab_${word.id}`);
    const status = cardState ? SRS.getStatus(cardState) : 'new';

    return `
      <div class="vocab-item" data-word-id="${escapeHtml(word.id)}">
        <span class="vocab-word japanese">${escapeHtml(word.word)}</span>
        <span class="vocab-reading">${escapeHtml(word.reading)}</span>
        <span class="vocab-meaning">${escapeHtml(word.meaning)}</span>
        <span class="vocab-status ${escapeHtml(status)}">${escapeHtml(status)}</span>
      </div>
    `;
  }

  /**
   * Handle card flip
   */
  function flipCard(cardElement) {
    cardElement.classList.add('flipped');
  }

  /**
   * Update grade button intervals based on current card state
   */
  function updateGradeButtons(cardId) {
    const cardState = Storage.getCard(cardId) || SRS.createCard();
    const gradeButtons = document.querySelectorAll('.grade-btn');

    gradeButtons.forEach(btn => {
      const grade = parseInt(btn.dataset.grade);
      const interval = SRS.getIntervalString(cardState, grade);
      btn.querySelector('.grade-interval').textContent = interval;
    });
  }

  /**
   * Initialize audio playback event listeners
   * Call this after cards are rendered
   */
  function initAudioListeners(container = document) {
    container.querySelectorAll('.play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't flip card when clicking play
        const { episode, word, index } = btn.dataset;
        playAudio(episode, word, parseInt(index), btn);
      });
    });
    // Word pronunciation play buttons
    container.querySelectorAll('.word-play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't flip card when clicking play
        const { episode, word } = btn.dataset;
        playWordAudio(episode, word, btn);
      });
    });
  }

  // Public API
  return {
    loadEpisodeData,
    loadAudioManifest,
    getVocab,
    getVocabByEpisode,
    getVocabById,
    getExamplesForWord,
    renderCard,
    renderVocabListItem,
    flipCard,
    updateGradeButtons,
    formatJapanese,
    playAudio,
    playWordAudio,
    stopAudio,
    initAudioListeners,
    hasAudio,
    hasWordAudio,
    getAudioPath,
    getWordAudioPath
  };
})();
