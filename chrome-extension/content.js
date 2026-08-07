(() => {
  'use strict';

  const EDITOR_ADAPTERS = {
    'chatgpt.com': {
      getEditor: () => document.querySelector('#prompt-textarea') || document.querySelector('[contenteditable="true"][data-placeholder]'),
      getText: (el) => el.innerText || el.textContent || '',
      setText: (el, text) => {
        el.focus();
        const dt = new DataTransfer();
        dt.setData('text/plain', text);
        document.execCommand('selectAll', false, null);
        el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      }
    },
    'chat.openai.com': {
      getEditor: () => document.querySelector('#prompt-textarea') || document.querySelector('[contenteditable="true"]'),
      getText: (el) => el.innerText || el.textContent || '',
      setText: (el, text) => {
        el.focus();
        const dt = new DataTransfer();
        dt.setData('text/plain', text);
        document.execCommand('selectAll', false, null);
        el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      }
    },
    'claude.ai': {
      getEditor: () => document.querySelector('[contenteditable="true"]'),
      getText: (el) => el.innerText || el.textContent || '',
      setText: (el, text) => {
        el.focus();
        const dt = new DataTransfer();
        dt.setData('text/plain', text);
        document.execCommand('selectAll', false, null);
        el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      }
    },
    'gemini.google.com': {
      getEditor: () => document.querySelector('.ql-editor') || document.querySelector('[role="textbox"]') || document.querySelector('[contenteditable="true"]'),
      getText: (el) => el.innerText || el.textContent || '',
      setText: (el, text) => {
        el.focus();
        el.innerHTML = `<p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
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

  function createFAB() {
    if (fab) return;
    fab = document.createElement('div');
    fab.id = 'pm-fab';
    fab.innerHTML = `
      <div class="pm-fab-inner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
      </div>
      <div class="pm-fab-tooltip">Analyze with PromptMentor</div>
    `;
    fab.addEventListener('click', handleAnalyze);
    document.body.appendChild(fab);
  }

  function positionFAB(editor) {
    if (!fab || !editor) return;
    const rect = editor.getBoundingClientRect();
    fab.style.position = 'fixed';
    fab.style.top = `${rect.top + 8}px`;
    fab.style.left = `${rect.right - 50}px`;
    fab.style.zIndex = '2147483647';
  }

  function createPanel() {
    if (panel) panel.remove();
    panel = document.createElement('div');
    panel.id = 'pm-panel';
    panel.className = 'pm-panel';
    document.body.appendChild(panel);
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
            ↑ Use Refined Prompt
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
      }
      closePanel();
    });

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
    p.classList.add('pm-panel-visible');
  }

  function closePanel() {
    if (panel) {
      panel.classList.remove('pm-panel-visible');
      setTimeout(() => { if (panel) panel.remove(); panel = null; }, 250);
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
    }
  }

  const observer = new MutationObserver(() => {
    tryAttach();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('resize', () => {
    if (currentEditor) positionFAB(currentEditor);
  });

  window.addEventListener('scroll', () => {
    if (currentEditor) positionFAB(currentEditor);
  }, true);

  setTimeout(tryAttach, 1500);
  setTimeout(tryAttach, 3000);
  setTimeout(tryAttach, 5000);
})();
