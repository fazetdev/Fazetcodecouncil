// API Configuration
const API_KEYS = {
  openai: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_KEY',
  deepseek: process.env.DEEPSEEK_API_KEY || 'YOUR_DEEPSEEK_KEY', 
  gemini: process.env.GEMINI_API_KEY || 'YOUR_GEMINI_KEY'
};

const API_CONFIG = {
  chatgpt: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    headers: { 'Authorization': `Bearer ${API_KEYS.openai}` }
  },
  deepseek: {
    url: 'https://api.deepseek.com/chat/completions', 
    model: 'deepseek-chat',
    headers: { 'Authorization': `Bearer ${API_KEYS.deepseek}` }
  },
  gemini: {
    url: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEYS.gemini}`,
    model: 'gemini-pro'
  }
};

// Your existing code
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

  // CHANGED: Use real APIs instead of simulateResponses
  askRealAI(query);
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

// NEW: Real API function
async function askRealAI(query) {
  const allAIs = ['chatgpt', 'deepseek', 'gemini'];
  const targets = selectedAI === 'all' ? allAIs : [selectedAI];

  targets.forEach(ai => {
    const el = document.getElementById(`response-${ai}`);
    el.innerHTML = `<div class="typing-indicator"><div class="typing-dots"><span></span><span></span><span></span></div> ${ai.toUpperCase()} is responding...</div>`;
  });

  // Make API calls in parallel
  const promises = targets.map(ai => callAI(ai, query));
  
  try {
    await Promise.all(promises);
  } catch (error) {
    console.error('API Error:', error);
  }
}

// NEW: Individual AI call function
async function callAI(ai, query) {
  const el = document.getElementById(`response-${ai}`);
  const config = API_CONFIG[ai];
  
  try {
    let response;

    if (ai === 'gemini') {
      // Gemini API format
      response = await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: query }]
          }]
        })
      });
    } else {
      // ChatGPT & DeepSeek format
      response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: query }],
          max_tokens: 1000
        })
      });
    }

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract response text
    let responseText;
    if (ai === 'gemini') {
      responseText = data.candidates[0].content.parts[0].text;
    } else {
      responseText = data.choices[0].message.content;
    }

    el.innerHTML = `<p><strong>${ai.toUpperCase()}:</strong> ${responseText}</p>`;
    
  } catch (error) {
    el.innerHTML = `<p style="color: #ef4444;"><strong>${ai.toUpperCase()} Error:</strong> ${error.message}</p>`;
  }
}
