const aiButtons = document.querySelectorAll('.ai-btn');
const askButton = document.getElementById('askButton');
const clearButton = document.getElementById('clearButton');
const exampleButton = document.getElementById('exampleButton');
const queryInput = document.getElementById('userQuery');

let selectedAI = 'all';

aiButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    aiButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedAI = btn.getAttribute('data-ai');
  });
});

askButton.addEventListener('click', () => {
  const query = queryInput.value.trim();
  if (!query) return alert('Please enter a question first.');

  simulateResponses(query);
});

clearButton.addEventListener('click', () => {
  document.querySelectorAll('.response-content').forEach(el => {
    el.innerHTML = '';
  });
  queryInput.value = '';
});

exampleButton.addEventListener('click', () => {
  queryInput.value = 'Explain how REST API works with Node.js and Express.';
});

function simulateResponses(query) {
  const responses = {
    chatgpt: `ChatGPT says: For ${query}, you can think in terms of request–response architecture.`,
    deepseek: `DeepSeek suggests: Try coding the logic using Express routes and middleware.`,
    gemini: `Gemini reviews: Make sure your code follows REST conventions and is well documented.`
  };

  const allAIs = ['chatgpt', 'deepseek', 'gemini'];
  const targets = selectedAI === 'all' ? allAIs : [selectedAI];

  targets.forEach(ai => {
    const el = document.getElementById(`response-${ai}`);
    el.innerHTML = `<div class="typing-indicator"><div class="typing-dots"><span></span><span></span><span></span></div> ${ai.toUpperCase()} is responding...</div>`;

    setTimeout(() => {
      el.textContent = responses[ai];
    }, 1500 + Math.random() * 1500);
  });
}
