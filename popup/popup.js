document.getElementById('saveKeyBtn').addEventListener('click', () => {
  const key = document.getElementById('apiKey').value;
  chrome.storage.local.set({ openai_api_key: key }, () => {
    alert('🔐 API Key saved!');
  });
});

document.getElementById('fillBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['fill.js']
  });
});
