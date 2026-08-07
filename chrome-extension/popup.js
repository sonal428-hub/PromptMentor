document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('pm-api-key');
  const saveBtn = document.getElementById('pm-save');
  const clearBtn = document.getElementById('pm-clear');
  const toggleBtn = document.getElementById('pm-toggle-vis');
  const statusDot = document.getElementById('pm-status-dot');
  const statusText = document.getElementById('pm-status-text');
  const messageEl = document.getElementById('pm-message');

  function updateStatus(hasKey) {
    if (hasKey) {
      statusDot.classList.add('pm-active');
      statusText.textContent = 'Gemini API Key Active';
      statusText.style.color = '#6ee7b7';
    } else {
      statusDot.classList.remove('pm-active');
      statusText.textContent = 'No API Key Set (fallback mode)';
      statusText.style.color = '#f59e0b';
    }
  }

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `pm-message pm-${type}`;
    setTimeout(() => {
      messageEl.textContent = '';
      messageEl.className = 'pm-message';
    }, 3000);
  }

  chrome.storage.sync.get(['pm_api_key'], (result) => {
    const key = result.pm_api_key || '';
    if (key) {
      apiKeyInput.value = key;
      updateStatus(true);
    } else {
      updateStatus(false);
    }
  });

  saveBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key || key.length < 5) {
      showMessage('Please enter a valid API key', 'error');
      return;
    }
    chrome.storage.sync.set({ pm_api_key: key }, () => {
      updateStatus(true);
      showMessage('API key saved successfully!', 'success');
    });
  });

  clearBtn.addEventListener('click', () => {
    chrome.storage.sync.remove(['pm_api_key'], () => {
      apiKeyInput.value = '';
      updateStatus(false);
      showMessage('API key cleared', 'success');
    });
  });

  let visible = false;
  toggleBtn.addEventListener('click', () => {
    visible = !visible;
    apiKeyInput.type = visible ? 'text' : 'password';
    toggleBtn.textContent = visible ? '🙈' : '👁️';
  });
});
