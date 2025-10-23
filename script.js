// Your existing DOM references
const aiButtons = document.querySelectorAll('.ai-btn');
const askButton = document.getElementById('askButton');
const clearButton = document.getElementById('clearButton');
const exampleButton = document.getElementById('exampleButton');
const queryInput = document.getElementById('userQuery');

let selectedAI = 'all';

// AI selection buttons
aiButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    aiButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedAI = btn.getAttribute('data-ai');
  });
});

// Ask button
askButton.addEventListener('click', () => {
  const query = queryInput.value.trim();
  if (!query) return alert('Please enter a question first.');
  askRealAI(query);
});

// Clear button
clearButton.addEventListener('click', () => {
  document.querySelectorAll('.response-content').forEach(el => {
    el.innerHTML = '';
  });
  queryInput.value = '';
});

// Example button
exampleButton.addEventListener('click', () => {
  queryInput.value = 'Explain how REST API works with Node.js and Express.';
});

// Function to ask all selected AIs
async function askRealAI(query) {
  const allAIs = ['chatgpt', 'deepseek', 'gemini'];
  const targets = selectedAI === 'all' ? allAIs : [selectedAI];

  // Show typing indicator
  targets.forEach(ai => {
    const el = document.getElementById(`response-${ai}`);
    el.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dots"><span></span><span></span><span></span></div> 
        ${ai.toUpperCase()} is responding...
      </div>
    `;
  });

  // Call APIs in parallel
  const promises = targets.map(ai => callAI(ai, query));
  await Promise.all(promises);
}

// Individual API call
async function callAI(ai, query) {
  const el = document.getElementById(`response-${ai}`);
  
  try {
    const response = await fetch(`/api/${ai}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error);

    el.innerHTML = `<p><strong>${ai.toUpperCase()}:</strong> ${data.text}</p>`;

  } catch (err) {
    el.innerHTML = `<p style="color: #ef4444;"><strong>${ai.toUpperCase()} Error:</strong> ${err.message}</p>`;
  }
}
