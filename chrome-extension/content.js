(() => {
  'use strict';

  const EDITOR_ADAPTERS = {
    'chatgpt.com': {
      getEditor: () => document.querySelector('#prompt-textarea') || document.querySelector('[contenteditable="true"][data-placeholder]'),
      getText: (el) => el.innerText || el.textContent || '',
      setText: (el, text) => {
        el.focus();
        try {
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(el);
          sel.removeAllRanges();
          sel.addRange(range);
          document.execCommand('delete', false, null);
        } catch (e) {}
        el.innerHTML = '';
        const dt = new DataTransfer();
        dt.setData('text/plain', text);
        const pasteEvent = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
        el.dispatchEvent(pasteEvent);
        if (!el.innerText || !el.innerText.trim()) {
          el.innerText = text;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    },
    'chat.openai.com': {
      getEditor: () => document.querySelector('#prompt-textarea') || document.querySelector('[contenteditable="true"]'),
      getText: (el) => el.innerText || el.textContent || '',
      setText: (el, text) => {
        el.focus();
        try {
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(el);
          sel.removeAllRanges();
          sel.addRange(range);
          document.execCommand('delete', false, null);
        } catch (e) {}
        el.innerHTML = '';
        const dt = new DataTransfer();
        dt.setData('text/plain', text);
        const pasteEvent = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
        el.dispatchEvent(pasteEvent);
        if (!el.innerText || !el.innerText.trim()) {
          el.innerText = text;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    },
    'claude.ai': {
      getEditor: () => document.querySelector('[contenteditable="true"]'),
      getText: (el) => el.innerText || el.textContent || '',
      setText: (el, text) => {
        el.focus();
        try {
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(el);
          sel.removeAllRanges();
          sel.addRange(range);
          document.execCommand('delete', false, null);
        } catch (e) {}
        el.innerHTML = '';
        const dt = new DataTransfer();
        dt.setData('text/plain', text);
        const pasteEvent = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
        el.dispatchEvent(pasteEvent);
        if (!el.innerText || !el.innerText.trim()) {
          el.innerText = text;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    },
    'gemini.google.com': {
      getEditor: () => document.querySelector('.ql-editor') || document.querySelector('[role="textbox"]') || document.querySelector('[contenteditable="true"]'),
      getText: (el) => el.innerText || el.textContent || '',
      setText: (el, text) => {
        el.focus();
        el.innerHTML = '';
        const paragraphs = text.split('\n').map(line => `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;') || '<br>'}</p>`).join('');
        el.innerHTML = paragraphs;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  const hostname = window.location.hostname;
  const adapter = EDITOR_ADAPTERS[hostname];
  if (!adapter) return;

  let fab = null;
  let panel = null;
  let currentEditor = null;
  let isAnalyzing = false;
  let isDragging = false;
  let dragHasMoved = false;
  let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
  let userHasCustomPos = false;

  function getScoreColor(val) {
    if (val >= 85) return '#10b981';
    if (val >= 70) return '#8b5cf6';
    if (val >= 50) return '#f59e0b';
    return '#ef4444';
  }

  function getScoreLabel(val) {
    if (val >= 85) return 'Master Level';
    if (val >= 70) return 'Strong';
    if (val >= 50) return 'Developing';
    return 'Needs Work';
  }

  let hoverTimer = null;

  function createFAB() {
    if (fab) return;
    fab = document.createElement('div');
    fab.id = 'pm-fab';
    fab.title = 'Drag to move • Right-click or click for full score';
    fab.innerHTML = `
      <div class="pm-fab-inner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
        <span class="pm-fab-badge"></span>
      </div>
      <div class="pm-fab-hover-card">
        <div class="pm-hover-header">
          <span class="pm-hover-sparkle">✨</span>
          <span>PromptMentor AI</span>
        </div>
        <div class="pm-hover-desc">Prompt improvement detected!</div>
        <button class="pm-quick-btn" id="pm-quick-overwrite-btn">
          ⚡ One-Click Refine & Overwrite
        </button>
        <div class="pm-hover-sub">Right-click or click icon for full score breakdown</div>
      </div>
    `;

    setupDragging(fab);

    function keepHover() {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
      fab.classList.add('pm-hover-active');
    }

    function scheduleLeave() {
      if (hoverTimer) clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        fab.classList.remove('pm-hover-active');
        hoverTimer = null;
      }, 1000);
    }

    fab.addEventListener('mouseenter', keepHover);
    fab.addEventListener('mouseleave', scheduleLeave);

    fab.addEventListener('click', (e) => {
      if (dragHasMoved) return;
      if (e.target.closest('#pm-quick-overwrite-btn')) {
        handleQuickOverwrite();
        return;
      }
      handleAnalyze();
    });

    fab.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      handleAnalyze();
    });

    document.body.appendChild(fab);
  }

  function setupDragging(element) {
    element.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('#pm-quick-overwrite-btn')) return;

      isDragging = true;
      dragHasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      const rect = element.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      function onMouseMove(moveEvent) {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          dragHasMoved = true;
          userHasCustomPos = true;
          element.style.left = `${initialLeft + dx}px`;
          element.style.top = `${initialTop + dy}px`;
          element.style.right = 'auto';
          element.style.bottom = 'auto';

          if (panel && panel.classList.contains('pm-panel-visible')) {
            positionPanelNextToFAB();
          }
        }
      }

      function onMouseUp() {
        isDragging = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  function positionFAB(editor) {
    if (!fab || !editor || userHasCustomPos) return;
    const rect = editor.getBoundingClientRect();
    fab.style.position = 'fixed';
    fab.style.top = `${Math.max(10, rect.top + 8)}px`;
    fab.style.left = `${Math.min(window.innerWidth - 60, rect.right - 50)}px`;
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
    fab.style.zIndex = '2147483647';
  }

  function checkInputAndGlow() {
    const editor = adapter.getEditor();
    if (!editor || !fab) return;
    const text = adapter.getText(editor).trim();
    if (text.length >= 6) {
      fab.classList.add('pm-fab-glowing');
    } else {
      fab.classList.remove('pm-fab-glowing');
    }
  }

  function positionPanelNextToFAB() {
    if (!panel || !fab) return;
    const fabRect = fab.getBoundingClientRect();
    const panelWidth = 340;
    const gap = 8;

    let left = fabRect.left - panelWidth - gap;
    if (left < 10) {
      left = fabRect.right + gap;
    }

    if (left + panelWidth > window.innerWidth - 10) {
      left = window.innerWidth - panelWidth - 10;
    }

    let top = fabRect.top;
    const panelHeight = Math.min(window.innerHeight * 0.8, 520);
    if (top + panelHeight > window.innerHeight - 10) {
      top = window.innerHeight - panelHeight - 10;
    }
    if (top < 10) top = 10;

    panel.style.position = 'fixed';
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.style.transform = 'none';
  }

  function createPanel() {
    if (panel) panel.remove();
    panel = document.createElement('div');
    panel.id = 'pm-panel';
    panel.className = 'pm-panel';
    document.body.appendChild(panel);
    positionPanelNextToFAB();
    return panel;
  }

  function renderLoading() {
    const p = createPanel();
    p.innerHTML = `
      <div class="pm-panel-header">
        <div class="pm-panel-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          <span>PromptMentor</span>
        </div>
        <button class="pm-close-btn" id="pm-close">&times;</button>
      </div>
      <div class="pm-panel-body pm-loading">
        <div class="pm-spinner"></div>
        <p>Analyzing your prompt with Gemini AI...</p>
      </div>
    `;
    p.querySelector('#pm-close').addEventListener('click', closePanel);
    p.classList.add('pm-panel-visible');
    positionPanelNextToFAB();
  }

  function renderResults(data) {
    const p = createPanel();
    const scoreColor = getScoreColor(data.score);
    const scoreLabel = getScoreLabel(data.score);
    const tagsHtml = data.tags.map(t => `
      <span class="pm-tag ${t.status === 'pass' ? 'pm-tag-pass' : 'pm-tag-fail'}">
        ${t.status === 'pass' ? '✓' : '✗'} ${t.label}
      </span>
    `).join('');

    p.innerHTML = `
      <div class="pm-panel-header">
        <div class="pm-panel-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          <span>PromptMentor</span>
        </div>
        <button class="pm-close-btn" id="pm-close">&times;</button>
      </div>

      <div class="pm-panel-body">
        <div class="pm-score-section">
          <div class="pm-score-ring" style="--score-color: ${scoreColor}; --score-pct: ${data.score}%">
            <div class="pm-score-value">${data.score}</div>
          </div>
          <div class="pm-score-info">
            <div class="pm-score-label" style="color: ${scoreColor}">${scoreLabel}</div>
            <div class="pm-score-sub">AI Quality Score</div>
          </div>
        </div>

        <div class="pm-tags-section">
          ${tagsHtml}
        </div>

        <div class="pm-advice-section">
          <div class="pm-advice-label">💡 Coach Advice</div>
          <p class="pm-advice-text">${data.coachAdvice}</p>
        </div>

        <div class="pm-actions">
          <button class="pm-btn pm-btn-primary" id="pm-use-refined">
            ↑ Overwrite Written Prompt
          </button>
          <button class="pm-btn pm-btn-secondary" id="pm-dismiss">
            Dismiss
          </button>
        </div>
      </div>
    `;

    p.querySelector('#pm-close').addEventListener('click', closePanel);
    p.querySelector('#pm-dismiss').addEventListener('click', closePanel);
    p.querySelector('#pm-use-refined').addEventListener('click', () => {
      if (currentEditor && data.finalPrompt) {
        adapter.setText(currentEditor, data.finalPrompt);
        showToast('Prompt completely overwritten!');
      }
      closePanel();
    });

    positionPanelNextToFAB();
    requestAnimationFrame(() => p.classList.add('pm-panel-visible'));
  }

  function renderError(msg) {
    const p = createPanel();
    p.innerHTML = `
      <div class="pm-panel-header">
        <div class="pm-panel-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          <span>PromptMentor</span>
        </div>
        <button class="pm-close-btn" id="pm-close">&times;</button>
      </div>
      <div class="pm-panel-body">
        <div class="pm-error">
          <p>❌ ${msg}</p>
        </div>
      </div>
    `;
    p.querySelector('#pm-close').addEventListener('click', closePanel);
    positionPanelNextToFAB();
    p.classList.add('pm-panel-visible');
  }

  function closePanel() {
    if (panel) {
      panel.classList.remove('pm-panel-visible');
      setTimeout(() => { if (panel) panel.remove(); panel = null; }, 250);
    }
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'pm-toast';
    toast.innerHTML = `<span>✨ ${msg}</span>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('pm-toast-visible'));
    setTimeout(() => {
      toast.classList.remove('pm-toast-visible');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  async function handleQuickOverwrite() {
    const editor = adapter.getEditor();
    if (!editor) return;
    currentEditor = editor;
    const promptText = adapter.getText(editor).trim();

    if (!promptText || promptText.length < 3) {
      showToast('Please type a prompt first!');
      return;
    }

    showToast('Optimizing & overwriting prompt...');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyzePrompt',
        prompt: promptText
      });

      if (response && response.success && response.data?.finalPrompt) {
        adapter.setText(editor, response.data.finalPrompt);
        showToast('Prompt overwritten with AI optimized version!');
      } else {
        showToast('Failed to optimize prompt. Check API key.');
      }
    } catch (err) {
      showToast('Optimization error');
    }
  }

  async function handleAnalyze() {
    if (isAnalyzing) return;
    const editor = adapter.getEditor();
    if (!editor) return;

    currentEditor = editor;
    const promptText = adapter.getText(editor).trim();

    if (!promptText || promptText.length < 3) {
      renderError('Please type a prompt first before analyzing.');
      return;
    }

    isAnalyzing = true;
    renderLoading();

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyzePrompt',
        prompt: promptText
      });

      if (response && response.success) {
        renderResults(response.data);
      } else {
        renderError(response?.error || 'Analysis failed. Check your API key in the extension popup.');
      }
    } catch (err) {
      renderError(err.message || 'Failed to communicate with extension.');
    } finally {
      isAnalyzing = false;
    }
  }

  function tryAttach() {
    const editor = adapter.getEditor();
    if (editor) {
      currentEditor = editor;
      createFAB();
      positionFAB(editor);
      checkInputAndGlow();
    }
  }

  const observer = new MutationObserver(() => {
    tryAttach();
    checkInputAndGlow();
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  document.addEventListener('input', () => {
    checkInputAndGlow();
  });
  document.addEventListener('keyup', () => {
    checkInputAndGlow();
  });

  window.addEventListener('resize', () => {
    if (currentEditor && !userHasCustomPos) positionFAB(currentEditor);
    if (panel && panel.classList.contains('pm-panel-visible')) positionPanelNextToFAB();
  });

  window.addEventListener('scroll', () => {
    if (currentEditor && !userHasCustomPos) positionFAB(currentEditor);
    if (panel && panel.classList.contains('pm-panel-visible')) positionPanelNextToFAB();
  }, true);

  setTimeout(tryAttach, 1000);
  setTimeout(tryAttach, 2500);
  setTimeout(tryAttach, 4000);
})();

