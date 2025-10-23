// API Configuration - You'll enter these via setup form
let API_KEYS = {
  openai: '',
  deepseek: '', 
  gemini: ''
};

// Load keys from localStorage
function loadKeys() {
  const saved = localStorage.getItem('fazetdev_api_keys');
  if (saved) {
    API_KEYS = JSON.parse(saved);
    return true;
  }
  return false;
}

// Show API setup modal if no keys
if (!loadKeys()) {
  // We'll add the modal HTML and show it
  showApiSetupModal();
}

// Your existing DOM code
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
  
  // Check if keys are loaded
  if (!API_KEYS.openai || !API_KEYS.deepseek || !API_KEYS.gemini) {
    return alert('Please set up your API keys first.');
  }
  
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

// Real API calls - DIRECT from browser
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

// Individual API call - DIRECT to AI services
async function callAI(ai, query) {
  const el = document.getElementById(`response-${ai}`);

  try {
    let response;
    
    if (ai === 'chatgpt') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEYS.openai}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: query }],
          max_tokens: 1000
        })
      });
    }
    else if (ai === 'deepseek') {
      response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEYS.deepseek}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: query }],
          max_tokens: 1000
        })
      });
    }
    else if (ai === 'gemini') {
      response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEYS.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }]
        })
      });
    }

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract response text
    let text;
    if (ai === 'gemini') {
      text = data.candidates[0].content.parts[0].text;
    } else {
      text = data.choices[0].message.content;
    }

    el.innerHTML = `<p><strong>${ai.toUpperCase()}:</strong> ${text}</p>`;

  } catch (err) {
    el.innerHTML = `<p style="color: #ef4444;"><strong>${ai.toUpperCase()} Error:</strong> ${err.message}</p>`;
  }
}

// API Setup Modal Functions
function showApiSetupModal() {
  // We'll add this modal to your HTML
  const modalHtml = `
    <div id="api-setup-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div style="background: #1e293b; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%;">
        <h3 style="color: white; margin-bottom: 10px;">🔐 Enter Your API Keys</h3>
        <p style="color: #94a3b8; margin-bottom: 20px;">Your keys are stored locally in your browser only</p>
        
        <input type="password" placeholder="OpenAI API Key" id="setup-openai" style="width: 100%; padding: 12px; margin: 8px 0; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white;">
        <input type="password" placeholder="DeepSeek API Key" id="setup-deepseek" style="width: 100%; padding: 12px; margin: 8px 0; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white;">
        <input type="password" placeholder="Gemini API Key" id="setup-gemini" style="width: 100%; padding: 12px; margin: 8px 0; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white;">
        
        <button onclick="saveApiKeys()" style="width: 100%; padding: 15px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; margin-top: 15px; cursor: pointer;">Save & Start Using</button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', modalHtml);
}

function saveApiKeys() {
  API_KEYS = {
    openai: document.getElementById('setup-openai').value,
    deepseek: document.getElementById('setup-deepseek').value,
    gemini: document.getElementById('setup-gemini').value
  };
  
  localStorage.setItem('fazetdev_api_keys', JSON.stringify(API_KEYS));
  document.getElementById('api-setup-modal').remove();
  
  alert('API keys saved! You can now use the Code Council.');
}
