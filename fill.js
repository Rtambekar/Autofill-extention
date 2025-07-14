(async () => {
  const { openai_api_key: apiKey } = await new Promise((resolve) =>
    chrome.storage.local.get(['openai_api_key'], resolve)
  );

  if (!apiKey) {
    alert('Please set your OpenAI API key in the popup first!');
    return;
  }

  const inputs = document.querySelectorAll('input, select, textarea');

  const detectedFields = Array.from(inputs).map(input => {
    const label = input.closest('label')?.innerText ||
      document.querySelector(`label[for="${input.id}"]`)?.innerText ||
      input.placeholder || input.getAttribute('aria-label') ||
      input.name || input.id || '';

    return {
      element: input,
      label: label.trim(),
      tag: input.tagName.toLowerCase(),
      type: input.type || '',
    };
  });

  const userData = {
    full_name: "John Doe",
    email: "john@example.com",
    whatsapp_number: "9876543210",
    gender: "male",
    city: "Pune",
    current_state: "Maharashtra",
    graduation_year: "2023",
    degree: "BCom",
    college_name: "MIT WPU",
    job_status: "Fresher",
    department: "Computer Applications"
  };

  for (const field of detectedFields) {
    const labelPrompt = field.label || '';
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Classify the following field label:\n"${labelPrompt}"\n\nReturn only one of the following: full_name, email, whatsapp_number, gender, city, current_state, graduation_year, degree, college_name, job_status, department`
        }]
      })
    });

    const data = await response.json();
    const fieldType = data?.choices?.[0]?.message?.content?.trim();
    if (!userData[fieldType]) continue;

    try {
      field.element.focus();
      field.element.value = userData[fieldType];
      field.element.dispatchEvent(new Event('input', { bubbles: true }));
      field.element.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Filled ${fieldType}: ${userData[fieldType]}`);
    } catch (e) {
      console.warn(`❌ Failed to fill field`, e);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  alert('✅ Autofill complete!');
})();
