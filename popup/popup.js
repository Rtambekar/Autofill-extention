document.getElementById('fillBtn').addEventListener('click', async () => {
  const type = document.getElementById('docType').value;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: fetchAndFill,
    args: [type]
  });
});

// This runs inside the webpage
async function fetchAndFill(type) {
  const res = await fetch(`http://localhost:3000/fields?type=${type}`);
  const fields = await res.json();
  console.log("📡 Fetched fields:", fields);

  fields.forEach(field => {
    const normalized = field.fieldName.replace(/_/g, ' ').toLowerCase();

    const input = 
      document.querySelector(`[name="${field.fieldName}"]`) ||
      document.querySelector(`[id="${field.fieldName}"]`) ||
      Array.from(document.querySelectorAll('input')).find(el => {
        const placeholder = el.getAttribute('placeholder')?.toLowerCase();
        return placeholder && placeholder.includes(normalized);
      });

    if (input) {
      input.value = field.value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      console.log(`✅ Filled ${field.fieldName} with "${field.value}"`);
    } else {
      console.warn(`⚠️ Could not find input for "${field.fieldName}"`);
    }
  });
}
