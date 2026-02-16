/**
 * app.js - Main application controller
 * Handles initialization, view routing, and global state
 */

const App = (function() {
  // Current view state
  let currentView = 'dashboard';
  let currentEpisode = null;
  
  // Review session state
  let reviewQueue = [];
  let reviewIndex = 0;
  let sessionStats = { total: 0, completed: 0 };

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
   * Initialize the application
   */
  async function init() {
    console.log('Moomin Japanese Trainer initializing...');

    // Initialize subsystems
    Tooltips.init();
    await Tooltips.loadKanjiData();
    await Radicals.init();
    
    // Load audio manifest for TTS playback
    await Cards.loadAudioManifest();

    // Load saved settings
    applySettings();

    // Load episode data (we load all available episodes, but only ACTIVE ones count toward review)
    const episodes = Storage.get('EPISODES') || ['ep01'];
    for (const ep of episodes) {
      await Cards.loadEpisodeData(ep);
    }

    // Set up event listeners
    setupNavigation();
    setupReviewControls();
    setupSettings();
    setupBrowseFilters();

    // Update dashboard
    updateDashboard();

    // Show initial view
    showView('dashboard');

    console.log('Initialization complete');
  }

  /**
   * Apply saved settings
   */
  function applySettings() {
    const settings = Storage.get('SETTINGS');
    
    if (settings.showFurigana) {
      document.body.classList.add('show-furigana');
      const toggle = document.getElementById('setting-furigana');
      if (toggle) toggle.checked = true;
    }

    if (settings.showFuriganaFront) {
      document.body.classList.add('show-furigana-front');
      const toggle = document.getElementById('setting-furigana-front');
      if (toggle) toggle.checked = true;
    }

    const newPerDay = document.getElementById('setting-new-per-day');
    if (newPerDay) {
      newPerDay.value = settings.newPerDay || 20;
    }
  }

  /**
   * Set up navigation buttons
   */
  function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        showView(view);
      });
    });
  }

  /**
   * Show a specific view
   */
  function showView(viewName) {
    currentView = viewName;

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.add('hidden');
    });
    
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.classList.remove('hidden');
    }

    // View-specific initialization
    switch (viewName) {
      case 'dashboard':
        updateDashboard();
        break;
      case 'browse':
        updateBrowseView();
        break;
      case 'review':
        // Review is started via button, not nav
        break;
    }
  }

  /**
   * Get vocabulary only from ACTIVE episodes
   */
  function getActiveVocab() {
    const activeEpisodes = Storage.getActiveEpisodes();
    const allVocab = Cards.getVocab();
    
    return allVocab.filter(word => {
      // Check if any of the word's episodes are active
      if (word.episodes) {
        return word.episodes.some(ep => activeEpisodes.includes(ep));
      }
      return false;
    });
  }

  /**
   * Update dashboard statistics
   * Categories:
   * - New: Cards never reviewed (due === null)
   * - Due Today: Graduated cards (step = -1) that are due now
   * - Learning: Cards in learning phase (step >= 0) - shows total, not just due
   * - Mastered: Cards with interval >= 21 days
   */
  function updateDashboard() {
    const vocab = getActiveVocab();  // Only count ACTIVE episode vocab
    const settings = Storage.get('SETTINGS');
    const progress = Storage.get('PROGRESS');

    let newCount = 0;
    let learningCount = 0;  // All cards in learning phase
    let dueCount = 0;       // Graduated cards due today
    let masteredCount = 0;  // Cards with interval >= 21 days

    vocab.forEach(word => {
      const cardState = Storage.getCard(`vocab_${word.id}`);
      
      if (!cardState || cardState.due === null) {
        // Never reviewed
        newCount++;
      } else if (SRS.isLearning(cardState)) {
        // In learning phase (step >= 0)
        learningCount++;
      } else {
        // Graduated (step = -1)
        if (SRS.isMature(cardState)) {
          masteredCount++;
        }
        if (SRS.isDue(cardState)) {
          dueCount++;
        }
      }
    });

    // Cap new cards at daily limit for display
    const newToday = Math.min(newCount, settings.newPerDay || 20);

    // Update display
    document.getElementById('stat-new').textContent = newToday;
    document.getElementById('stat-learning').textContent = learningCount;
    document.getElementById('stat-due').textContent = dueCount;
    document.getElementById('stat-mastered').textContent = masteredCount;
    document.getElementById('streak-count').textContent = progress.streak.current || 0;

    // Enable/disable start button
    const startBtn = document.getElementById('start-review');
    
    // Count cards actually ready for review: new (capped), learning (if due), and due
    let learningDueCount = 0;
    vocab.forEach(word => {
      const cardState = Storage.getCard(`vocab_${word.id}`);
      if (cardState && SRS.isLearning(cardState) && SRS.isDue(cardState)) {
        learningDueCount++;
      }
    });
    
    const totalReady = newToday + learningDueCount + dueCount;
    startBtn.disabled = totalReady === 0;
    startBtn.textContent = totalReady > 0 
      ? `Start Review (${totalReady} cards)` 
      : 'No cards due';

    // Update episode list
    updateEpisodeList();
  }

  /**
   * Update episode list in dashboard with activation checkboxes
   */
  async function updateEpisodeList() {
    const container = document.getElementById('episode-list');
    
    try {
      const response = await fetch('data/episodes/index.json');
      const data = await response.json();
      const activeEpisodes = Storage.getActiveEpisodes();
      
      let html = '';
      data.episodes.forEach((ep, index) => {
        const isActive = activeEpisodes.includes(ep.id);
        const isFirstEpisode = index === 0;
        
        // Calculate stats for this episode
        const epVocab = Cards.getVocabByEpisode(ep.id);
        let epNew = 0, epLearning = 0, epMastered = 0;
        epVocab.forEach(word => {
          const cardState = Storage.getCard(`vocab_${word.id}`);
          if (!cardState || cardState.due === null) {
            epNew++;
          } else if (SRS.isLearning(cardState)) {
            epLearning++;
          } else if (SRS.isMature(cardState)) {
            epMastered++;
          }
        });
        
        html += `
          <div class="episode-card ${ep.available ? '' : 'disabled'} ${isActive ? 'active' : ''}" data-episode="${escapeHtml(ep.id)}">
            <label class="episode-toggle" onclick="event.stopPropagation();">
              <input type="checkbox" 
                class="episode-checkbox" 
                data-episode="${escapeHtml(ep.id)}"
                ${isActive ? 'checked' : ''}
                ${!ep.available ? 'disabled' : ''}
                title="${isActive ? 'Remove from flashcard deck' : 'Add to flashcard deck'}">
              <span class="episode-toggle-slider"></span>
            </label>
            <span class="episode-number">${escapeHtml(String(ep.id).replace('ep', ''))}</span>
            <div class="episode-info">
              <div class="episode-title">${escapeHtml(ep.title)}</div>
              <div class="episode-title-en">${escapeHtml(ep.titleEn)}</div>
            </div>
            <div class="episode-mini-stats">
              <span class="mini-stat new" title="New words">${epNew}</span>
              <span class="mini-stat learning" title="Learning">${epLearning}</span>
              <span class="mini-stat mastered" title="Mastered">${epMastered}</span>
            </div>
          </div>
        `;
      });
      
      container.innerHTML = html;
      
      // Add click handlers for episode cards (to view details)
      container.querySelectorAll('.episode-card:not(.disabled)').forEach(card => {
        card.addEventListener('click', (e) => {
          // Don't trigger if clicking the checkbox/toggle
          if (e.target.closest('.episode-toggle')) return;
          
          const episodeId = card.dataset.episode;
          showEpisodeStudy(episodeId);
        });
      });
      
      // Add change handlers for checkboxes
      container.querySelectorAll('.episode-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const episodeId = checkbox.dataset.episode;
          const isActive = checkbox.checked;
          
          Storage.setEpisodeActive(episodeId, isActive);
          
          // Update the card visual state
          const card = checkbox.closest('.episode-card');
          if (card) {
            card.classList.toggle('active', isActive);
          }
          
          // Refresh dashboard stats
          updateDashboard();
        });
      });
    } catch (e) {
      container.innerHTML = '<p class="text-muted">Could not load episodes</p>';
    }
  }

  /**
   * Show episode study view
   */
  async function showEpisodeStudy(episodeId) {
    currentEpisode = episodeId;
    
    // Ensure episode data is loaded
    await Cards.loadEpisodeData(episodeId);
    
    // Load episode metadata
    let meta = {};
    try {
      const response = await fetch(`data/episodes/${episodeId}/meta.json`);
      meta = await response.json();
    } catch (e) {
      console.error('Failed to load episode meta:', e);
    }

    // Get vocabulary for this episode
    const vocab = Cards.getVocabByEpisode(episodeId);
    const isActive = Storage.isEpisodeActive(episodeId);
    
    // Calculate stats for this episode
    let newCount = 0, learningCount = 0, reviewCount = 0, masteredCount = 0;
    vocab.forEach(word => {
      const cardState = Storage.getCard(`vocab_${word.id}`);
      if (!cardState || cardState.due === null) {
        newCount++;
      } else if (SRS.isLearning(cardState)) {
        learningCount++;
      } else if (SRS.isMature(cardState)) {
        masteredCount++;
      } else {
        reviewCount++;  // Graduated but not yet mature
      }
    });

    // Create episode study view if it doesn't exist
    let studyView = document.getElementById('view-episode-study');
    if (!studyView) {
      studyView = document.createElement('div');
      studyView.id = 'view-episode-study';
      studyView.className = 'view episode-study hidden';
      document.getElementById('app').appendChild(studyView);
    }

    // Render episode study content
    studyView.innerHTML = `
      <div class="episode-study-header">
        <button class="back-btn" id="back-to-dashboard">← Back</button>
        <div class="episode-study-title">
          <h2 class="japanese">${escapeHtml(meta.title || 'Episode')}</h2>
          <p class="text-muted">${escapeHtml(meta.titleEn || '')}</p>
        </div>
      </div>
      
      <div class="episode-activation-banner ${isActive ? 'active' : ''}">
        <label class="activation-toggle">
          <input type="checkbox" id="episode-active-toggle" ${isActive ? 'checked' : ''}>
          <span class="activation-slider"></span>
        </label>
        <div class="activation-text">
          <strong>${isActive ? 'Active in Flashcard Deck' : 'Not in Flashcard Deck'}</strong>
          <small>${isActive ? 'Words from this episode will appear in daily reviews' : 'Enable to add these words to your daily reviews'}</small>
        </div>
      </div>
      
      <div class="episode-stats-grid">
        <div class="stat-card new">
          <div class="stat-value">${newCount}</div>
          <div class="stat-label">New</div>
        </div>
        <div class="stat-card learning">
          <div class="stat-value">${learningCount}</div>
          <div class="stat-label">Learning</div>
        </div>
        <div class="stat-card review">
          <div class="stat-value">${reviewCount}</div>
          <div class="stat-label">Review</div>
        </div>
        <div class="stat-card mastered">
          <div class="stat-value">${masteredCount}</div>
          <div class="stat-label">Mastered</div>
        </div>
      </div>
      
      <div class="study-options">
        <h3>Study Options</h3>
        <button class="study-btn" id="study-all">
          <span class="study-btn-icon">📚</span>
          <span class="study-btn-text">
            <strong>Study All Vocabulary</strong>
            <small>Review all ${vocab.length} words</small>
          </span>
        </button>
        <button class="study-btn" id="study-new">
          <span class="study-btn-icon">✨</span>
          <span class="study-btn-text">
            <strong>Learn New Words</strong>
            <small>${newCount} new words to learn</small>
          </span>
        </button>
        <button class="study-btn" id="browse-vocab">
          <span class="study-btn-icon">📖</span>
          <span class="study-btn-text">
            <strong>Browse Vocabulary</strong>
            <small>View all words with examples</small>
          </span>
        </button>
      </div>
      
      <div class="vocab-preview">
        <h3>Vocabulary Preview</h3>
        <div class="vocab-grid" id="vocab-preview-grid">
          ${renderVocabPreview(vocab.slice(0, 12))}
        </div>
        ${vocab.length > 12 ? `<p class="text-muted text-center">+ ${vocab.length - 12} more words</p>` : ''}
      </div>
    `;

    // Hide all views and show episode study
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    studyView.classList.remove('hidden');

    // Set up event listeners
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
      showView('dashboard');
    });

    document.getElementById('study-all').addEventListener('click', () => {
      startEpisodeReview('all');
    });

    document.getElementById('study-new').addEventListener('click', () => {
      startEpisodeReview('new');
    });

    document.getElementById('browse-vocab').addEventListener('click', () => {
      showEpisodeVocabBrowser();
    });

    // Episode activation toggle
    document.getElementById('episode-active-toggle').addEventListener('change', (e) => {
      const newIsActive = e.target.checked;
      Storage.setEpisodeActive(episodeId, newIsActive);
      
      // Update banner visual
      const banner = document.querySelector('.episode-activation-banner');
      banner.classList.toggle('active', newIsActive);
      banner.querySelector('strong').textContent = newIsActive ? 'Active in Flashcard Deck' : 'Not in Flashcard Deck';
      banner.querySelector('small').textContent = newIsActive ? 'Words from this episode will appear in daily reviews' : 'Enable to add these words to your daily reviews';
    });

    // Add hover handlers for vocab preview items (show popup on hover)
    setupVocabPreviewHovers(studyView);
  }

  /**
   * Render vocabulary preview grid
   */
  function renderVocabPreview(vocab) {
    return vocab.map(word => {
      const cardState = Storage.getCard(`vocab_${word.id}`);
      const status = getCardStatusLabel(cardState);
      return `
        <div class="vocab-preview-item" data-word-id="${escapeHtml(word.id)}">
          <span class="vocab-preview-word japanese">${escapeHtml(word.word)}</span>
          <span class="vocab-preview-reading">${escapeHtml(word.reading)}</span>
          <span class="vocab-preview-meaning">${escapeHtml(word.meaning)}</span>
          <span class="vocab-status ${escapeHtml(status)}">${escapeHtml(status)}</span>
        </div>
      `;
    }).join('');
  }

  /**
   * Get a human-readable status label for a card
   */
  function getCardStatusLabel(cardState) {
    if (!cardState || cardState.due === null) return 'new';
    if (SRS.isLearning(cardState)) return 'learning';
    if (SRS.isMature(cardState)) return 'mastered';
    return 'review';
  }

  /**
   * Show detailed vocabulary browser for episode
   */
  function showEpisodeVocabBrowser() {
    const vocab = Cards.getVocabByEpisode(currentEpisode);
    
    let browserView = document.getElementById('view-episode-vocab');
    if (!browserView) {
      browserView = document.createElement('div');
      browserView.id = 'view-episode-vocab';
      browserView.className = 'view episode-vocab hidden';
      document.getElementById('app').appendChild(browserView);
    }

    browserView.innerHTML = `
      <div class="episode-study-header">
        <button class="back-btn" id="back-to-episode">← Back</button>
        <h2>Vocabulary Browser</h2>
      </div>
      
      <div class="vocab-search">
        <input type="text" id="vocab-search-input" placeholder="Search vocabulary..." class="search-input">
      </div>
      
      <div class="vocab-list detailed" id="episode-vocab-list">
        ${vocab.map(word => renderDetailedVocabItem(word)).join('')}
      </div>
    `;

    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    browserView.classList.remove('hidden');

    document.getElementById('back-to-episode').addEventListener('click', () => {
      showEpisodeStudy(currentEpisode);
    });

    // Search functionality
    document.getElementById('vocab-search-input').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const container = document.getElementById('episode-vocab-list');
      
      const filtered = vocab.filter(word => 
        word.word.includes(query) ||
        word.reading.includes(query) ||
        word.meaning.toLowerCase().includes(query)
      );
      
      container.innerHTML = filtered.map(word => renderDetailedVocabItem(word)).join('');
      
      // Initialize word play buttons on filtered results
      Cards.initAudioListeners(container);
      
      // Re-add click handlers with text selection protection
      container.querySelectorAll('.vocab-detail-item').forEach(item => {
        let mouseDownTime = 0;
        
        item.addEventListener('mousedown', () => {
          mouseDownTime = Date.now();
        });
        
        item.addEventListener('click', (e) => {
          if (e.target.closest('.play-btn') || e.target.closest('.word-play-btn')) return;
          const timeDiff = Date.now() - mouseDownTime;
          const hasSelection = window.getSelection().toString().length > 0;
          if (timeDiff > 200 || hasSelection) return;
          
          item.classList.toggle('expanded');
          if (item.classList.contains('expanded')) {
            Cards.initAudioListeners(item);
          }
        });
      });
    });

    // Initialize word play buttons on the whole browser view (visible before expand)
    Cards.initAudioListeners(browserView);

    // Add expand/collapse handlers with text selection protection
    browserView.querySelectorAll('.vocab-detail-item').forEach(item => {
      let mouseDownTime = 0;
      let mouseDownTarget = null;
      
      item.addEventListener('mousedown', (e) => {
        mouseDownTime = Date.now();
        mouseDownTarget = e.target;
      });
      
      item.addEventListener('click', (e) => {
        // Don't toggle if clicking on play button
        if (e.target.closest('.play-btn') || e.target.closest('.word-play-btn')) return;
        
        // Don't toggle if user is selecting text (held mouse down for >200ms or text is selected)
        const timeDiff = Date.now() - mouseDownTime;
        const hasSelection = window.getSelection().toString().length > 0;
        if (timeDiff > 200 || hasSelection) return;
        
        item.classList.toggle('expanded');
        // Initialize audio listeners when expanded
        if (item.classList.contains('expanded')) {
          Cards.initAudioListeners(item);
        }
      });
    });
  }

  /**
   * Render detailed vocabulary item with examples
   */
  function renderDetailedVocabItem(word) {
    const cardState = Storage.getCard(`vocab_${word.id}`);
    const status = getCardStatusLabel(cardState);
    const episodeId = currentEpisode || (word.episodes && word.episodes[0]) || 'ep01';
    
    let examplesHtml = '';
    if (word.examples && word.examples.length > 0) {
      examplesHtml = word.examples.map((ex, idx) => {
        // Use the example's source episode and index for audio lookup
        const audioEpisode = ex.sourceEpisode || episodeId;
        const audioIndex = ex.sourceIndex !== undefined ? ex.sourceIndex : idx;
        return `
        <div class="example">
          <div class="example-ja japanese">
            <button class="play-btn" 
              data-episode="${escapeHtml(audioEpisode)}" 
              data-word="${escapeHtml(word.id)}" 
              data-index="${escapeHtml(audioIndex)}"
              title="Play audio">▶</button>
            ${Cards.formatJapanese(ex.japanese, ex.furigana || null)}
          </div>
          <div class="example-en">${escapeHtml(ex.english)}</div>
          ${ex.note ? `<div class="example-note">💡 ${escapeHtml(ex.note)}</div>` : ''}
        </div>
      `;
      }).join('');
    }

    // Word pronunciation play button for vocab browser
    const wordPlayBtn = `<button class="word-play-btn" 
      data-episode="${escapeHtml(episodeId)}" 
      data-word="${escapeHtml(word.id)}"
      title="Play word pronunciation">🔊</button>`;

    return `
      <div class="vocab-detail-item" data-word-id="${escapeHtml(word.id)}">
        <div class="vocab-detail-header">
          <div class="vocab-detail-word">
            ${wordPlayBtn}
            <span class="vocab-word japanese">${escapeHtml(word.word)}</span>
            <span class="vocab-reading">${escapeHtml(word.reading)}</span>
          </div>
          <div class="vocab-detail-meta">
            <span class="vocab-pos">${escapeHtml(word.pos || '')}</span>
            <span class="vocab-status ${escapeHtml(status)}">${escapeHtml(status)}</span>
            ${word.jlpt ? `<span class="vocab-jlpt">${escapeHtml(word.jlpt)}</span>` : ''}
          </div>
        </div>
        <div class="vocab-detail-meaning">${escapeHtml(word.meaning)}</div>
        ${word.notes ? `<div class="vocab-detail-notes">💡 ${escapeHtml(word.notes)}</div>` : ''}
        <div class="vocab-detail-examples">
          ${examplesHtml}
        </div>
      </div>
    `;
  }

  /**
   * Start review for current episode
   */
  function startEpisodeReview(mode) {
    const vocab = Cards.getVocabByEpisode(currentEpisode);
    const settings = Storage.get('SETTINGS');
    
    reviewQueue = [];
    reviewIndex = 0;

    vocab.forEach(word => {
      const cardId = `vocab_${word.id}`;
      const cardState = Storage.getCard(cardId);
      const isNew = !cardState || cardState.due === null;
      
      if (mode === 'all' || (mode === 'new' && isNew)) {
        reviewQueue.push({
          id: cardId,
          wordId: word.id,
          state: cardState || SRS.createCard()
        });
      }
    });

    if (mode === 'new') {
      reviewQueue = reviewQueue.slice(0, settings.newPerDay || 20);
    }

    if (reviewQueue.length === 0) {
      alert('No cards to review!');
      return;
    }

    sessionStats = {
      total: reviewQueue.length,
      completed: 0
    };

    showView('review');
    showNextCard();
  }

  /**
   * Set up hover popups for vocabulary preview items
   */
  function setupVocabPreviewHovers(container) {
    // Create popup element if it doesn't exist
    let popup = document.getElementById('vocab-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'vocab-popup';
      popup.className = 'vocab-popup';
      document.body.appendChild(popup);
    }

    container.querySelectorAll('.vocab-preview-item').forEach(item => {
      item.addEventListener('mouseenter', (e) => {
        const wordId = item.dataset.wordId;
        const word = Cards.getVocabById(wordId);
        if (!word) return;

        // Build popup content
        let content = `
          <div class="vocab-popup-word japanese">${escapeHtml(word.word)}</div>
          <div class="vocab-popup-reading">${escapeHtml(word.reading)}</div>
          <div class="vocab-popup-meaning">${escapeHtml(word.meaning)}</div>
        `;
        
        if (word.pos) {
          content += `<div class="vocab-popup-pos">${escapeHtml(word.pos)}</div>`;
        }
        
        if (word.notes) {
          content += `<div class="vocab-popup-notes">💡 ${escapeHtml(word.notes)}</div>`;
        }
        
        if (word.examples && word.examples.length > 0) {
          const ex = word.examples[0];
          content += `
            <div class="vocab-popup-example">
              <div class="vocab-popup-example-ja japanese">${escapeHtml(ex.japanese)}</div>
              <div class="vocab-popup-example-en">${escapeHtml(ex.english)}</div>
            </div>
          `;
        }

        popup.innerHTML = content;
        popup.classList.add('visible');

        // Position popup near the item
        positionVocabPopup(popup, item);
      });

      item.addEventListener('mouseleave', () => {
        popup.classList.remove('visible');
      });

      // Also click to go to vocab browser for more details
      item.addEventListener('click', () => {
        showEpisodeVocabBrowser();
      });
    });
  }

  /**
   * Position the vocabulary popup near the target element
   */
  function positionVocabPopup(popup, target) {
    const rect = target.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const padding = 10;

    // Default: position to the right of the item
    let left = rect.right + padding;
    let top = rect.top;

    // If not enough room on the right, position to the left
    if (left + popupRect.width > window.innerWidth - padding) {
      left = rect.left - popupRect.width - padding;
    }

    // If still not enough room, position below
    if (left < padding) {
      left = rect.left;
      top = rect.bottom + padding;
    }

    // Keep within viewport vertically
    if (top + popupRect.height > window.innerHeight - padding) {
      top = window.innerHeight - popupRect.height - padding;
    }
    if (top < padding) {
      top = padding;
    }

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  }

  /**
   * Set up review session controls
   */
  function setupReviewControls() {
    // Start review button
    document.getElementById('start-review').addEventListener('click', startReview);

    // Close review button
    document.getElementById('close-review').addEventListener('click', () => {
      showView('dashboard');
    });

    // Show answer button
    document.getElementById('show-answer').addEventListener('click', showAnswer);

    // Grade buttons
    document.querySelectorAll('.grade-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const grade = parseInt(btn.dataset.grade);
        gradeCard(grade);
      });
    });
  }

  /**
   * Start a review session (from dashboard - uses only ACTIVE episodes)
   */
  function startReview() {
    const vocab = getActiveVocab();  // Only ACTIVE episode vocab
    const settings = Storage.get('SETTINGS');
    
    reviewQueue = [];
    reviewIndex = 0;

    // Build review queue
    const newCards = [];
    const learningCards = [];
    const dueCards = [];

    vocab.forEach(word => {
      const cardId = `vocab_${word.id}`;
      const cardState = Storage.getCard(cardId);

      if (!cardState || cardState.due === null) {
        newCards.push({ id: cardId, wordId: word.id, state: cardState || SRS.createCard() });
      } else if (SRS.isLearning(cardState) && SRS.isDue(cardState)) {
        learningCards.push({ id: cardId, wordId: word.id, state: cardState });
      } else if (SRS.isDue(cardState)) {
        dueCards.push({ id: cardId, wordId: word.id, state: cardState });
      }
    });

    // Order: learning first, then due, then new (capped)
    const cappedNew = newCards.slice(0, settings.newPerDay || 20);
    reviewQueue = [...learningCards, ...dueCards, ...cappedNew];

    if (reviewQueue.length === 0) {
      alert('No cards to review!');
      return;
    }

    sessionStats = {
      total: reviewQueue.length,
      completed: 0
    };

    // Clear episode context for dashboard reviews
    currentEpisode = null;

    // Show review view
    showView('review');
    showNextCard();
  }

  /**
   * Show the next card in the review queue
   */
  function showNextCard() {
    if (reviewIndex >= reviewQueue.length) {
      // Session complete
      finishReview();
      return;
    }

    const card = reviewQueue[reviewIndex];
    const container = document.getElementById('card-container');
    
    // Stop any playing audio from previous card
    Cards.stopAudio();
    
    // Render card with episode context for audio paths
    const word = Cards.getVocabById(card.wordId);
    const episodeId = currentEpisode || (word && word.episodes && word.episodes[0]) || 'ep01';
    container.innerHTML = Cards.renderCard(card.wordId, episodeId);
    
    // Initialize audio play buttons
    Cards.initAudioListeners(container);
    
    // Add click-to-flip handler on the flashcard itself
    const flashcard = container.querySelector('.flashcard');
    if (flashcard) {
      let mouseDownTime = 0;

      flashcard.addEventListener('mousedown', () => {
        mouseDownTime = Date.now();
      });

      flashcard.addEventListener('click', (e) => {
        // Don't flip if clicking on interactive elements
        if (e.target.closest('.play-btn') || e.target.closest('.word-play-btn')) return;
        
        // Don't flip if user is selecting text (held mouse >200ms or has active selection)
        const timeDiff = Date.now() - mouseDownTime;
        const hasSelection = window.getSelection().toString().length > 0;
        if (timeDiff > 200 || hasSelection) return;
        
        if (flashcard.classList.contains('flipped')) {
          // Flip back to front to review again
          flashcard.classList.remove('flipped');
          document.getElementById('show-answer').classList.remove('hidden');
          document.getElementById('grade-buttons').classList.add('hidden');
        } else {
          // Show answer
          showAnswer();
        }
      });
    }

    // Update progress
    updateReviewProgress();

    // Reset UI state
    document.getElementById('show-answer').classList.remove('hidden');
    document.getElementById('grade-buttons').classList.add('hidden');

    // Update grade button intervals
    Cards.updateGradeButtons(card.id);
  }

  /**
   * Show the answer side of the current card
   */
  function showAnswer() {
    const flashcard = document.querySelector('.flashcard');
    if (flashcard) {
      Cards.flipCard(flashcard);
    }

    document.getElementById('show-answer').classList.add('hidden');
    document.getElementById('grade-buttons').classList.remove('hidden');
  }

  /**
   * Grade the current card and move to next
   */
  function gradeCard(grade) {
    const card = reviewQueue[reviewIndex];
    
    // Calculate new state
    const newState = SRS.calculate(card.state, grade);
    
    // Save to storage
    Storage.setCard(card.id, newState);
    Storage.incrementReviews();

    // Update streak on first review of the day
    if (sessionStats.completed === 0) {
      Storage.updateStreak();
    }

    sessionStats.completed++;

    // If card needs re-review soon (learning), add back to queue
    if (newState.step >= 0) {
      reviewQueue.push({
        ...card,
        state: newState
      });
    }

    // Move to next card
    reviewIndex++;
    showNextCard();
  }

  /**
   * Update review progress display
   */
  function updateReviewProgress() {
    const progress = (sessionStats.completed / sessionStats.total) * 100;
    document.getElementById('review-progress').style.width = `${progress}%`;

    // Update counts
    let newCount = 0, learningCount = 0, dueCount = 0;
    
    for (let i = reviewIndex; i < reviewQueue.length; i++) {
      const card = reviewQueue[i];
      if (!card.state || card.state.due === null) newCount++;
      else if (SRS.isLearning(card.state)) learningCount++;
      else dueCount++;
    }

    document.getElementById('review-new').textContent = newCount;
    document.getElementById('review-learning').textContent = learningCount;
    document.getElementById('review-due').textContent = dueCount;
  }

  /**
   * Finish the review session
   */
  function finishReview() {
    Storage.updateCardCounts();
    
    alert(`Review complete! ${sessionStats.completed} cards reviewed.`);
    
    // Return to episode study if we came from there, otherwise dashboard
    if (currentEpisode) {
      showEpisodeStudy(currentEpisode);
    } else {
      showView('dashboard');
    }
  }

  /**
   * Set up settings controls
   */
  function setupSettings() {
    // Furigana toggle (card back, examples, browse)
    document.getElementById('setting-furigana').addEventListener('change', (e) => {
      Tooltips.toggleFurigana(e.target.checked);
    });

    // Furigana on card front toggle
    document.getElementById('setting-furigana-front').addEventListener('change', (e) => {
      Tooltips.toggleFuriganaFront(e.target.checked);
    });

    // New cards per day
    document.getElementById('setting-new-per-day').addEventListener('change', (e) => {
      const settings = Storage.get('SETTINGS');
      settings.newPerDay = parseInt(e.target.value) || 20;
      Storage.set('SETTINGS', settings);
    });

    // Export
    document.getElementById('export-btn').addEventListener('click', () => {
      const data = Storage.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moomin-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Import
    document.getElementById('import-btn').addEventListener('click', () => {
      document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          Storage.importAll(data);
          alert('Import successful! Refreshing...');
          location.reload();
        } catch (err) {
          alert('Import failed: ' + err.message);
        }
      };
      reader.readAsText(file);
    });

    // Reset
    document.getElementById('reset-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
        Storage.resetAll();
        location.reload();
      }
    });
  }

  /**
   * Set up browse view filters
   */
  function setupBrowseFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateBrowseView(btn.dataset.filter);
      });
    });
  }

  /**
   * Update the vocabulary browser view
   */
  function updateBrowseView(filter = 'all') {
    const vocab = getActiveVocab();  // Only show ACTIVE episode vocab in browse
    const container = document.getElementById('vocab-list');

    const filtered = vocab.filter(word => {
      if (filter === 'all') return true;
      
      const cardState = Storage.getCard(`vocab_${word.id}`);
      const status = getCardStatusLabel(cardState);
      
      return status === filter;
    });

    let html = '';
    filtered.forEach(word => {
      html += Cards.renderVocabListItem(word);
    });

    container.innerHTML = html || '<p class="text-muted text-center">No vocabulary found</p>';
  }

  // Public API
  return {
    init
  };
})();

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
