const images = [
  "photos/1-1.png"
];

const texts = [
  "你好! My name is Alex. 我叫 Alex.",
  "Hi, Alex! 歡迎 to the language exchange. I'm Jamie.",
  "Nice to meet you. Is this your first time here?",
  "Yes, it is. I’m still learning, so please correct me if I make mistakes.",
  "No problem. Let’s practice together!",
  "Okay. Let’s start with numbers. Can you teach me how to say 1 to 10 in Mandarin?",
  "Sure! Listen carefully: 一, 二, 三, 四, 五, 六, 七, 八, 九, 十.",
  "Got it! Let me try: 一, 二, 三, 四, 五...",
  "That’s great! You’re almost fluent already!",
  "Haha, thanks. How do you say 'yes' and 'no' in Mandarin?",
  "For 'yes,' you say 是. For 'no,' you say 不是.",
  "Oh, that’s simple. 是, 不是.",
  "Perfect! Now, what do you say when someone thanks you?",
  "Uh... 'thank you' is 謝謝, right?",
  "Yes! And you can respond with 不客氣 or, in Taiwan, people often say 不會.",
  "謝謝 for explaining that. 不會.",
  "Haha, you got it! Now, how about apologizing?",
  "Let me guess... is it 對不起?",
  "Exactly! And if someone apologizes, you can say 沒關係 to mean 'it’s okay.'",
  "Cool! This is fun. Let’s keep going. By the way, do you know how to introduce yourself in Mandarin?",
  "你好, 我叫 Alex.",
  "Thanks! I’ll practice more at home. This is really helpful.",
  "You’re welcome—不客氣 or 不會!",
  "Haha, now you’re showing off."
];

let currentIndex = 0;

function next() {
  // Move to the next text
  currentIndex += 1;
  updateContent();

  // Check if it's the last text
  if (currentIndex === texts.length - 1) {
    document.getElementById("nextButton").disabled = true;
  }
}

function updateContent() {
  // Update text only
  document.getElementById("text").textContent = texts[currentIndex];
  
  // Play text-to-speech
  playTextToSpeech(texts[currentIndex]);
  
  // Add tooltips to Chinese words
  addChineseWordTooltips();
}

function playTextToSpeech(text) {
  window.speechSynthesis.cancel(); // Stop any ongoing speech
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Detect language based on the text content
  const isChinese = /[\u4e00-\u9fa5]/.test(text); // Regex checks for Chinese characters
  utterance.lang = isChinese ? 'zh-CN' : 'en-US'; // Set language based on text content
  utterance.rate = 0.8; // Adjust speech rate

  // Select appropriate voice
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.includes(isChinese ? 'zh' : 'en'));
  if (voice) utterance.voice = voice;

  // Speak the text
  window.speechSynthesis.speak(utterance);
}

// Function to add tooltips with Chinese translations
function addChineseWordTooltips() {
  const textElement = document.getElementById("text");
  
  // Regex to find Chinese characters
  const chineseRegex = /[\u4e00-\u9fa5]+/g;
  const matches = textElement.textContent.match(chineseRegex);
  
  if (matches) {
    // Convert text content to HTML with wrapped Chinese words
    let htmlContent = textElement.textContent;
    
    matches.forEach(chineseWord => {
      // Replace the original word with a wrapped version
      htmlContent = htmlContent.replace(
        chineseWord,
        `<span class="chinese-word" data-word="${chineseWord}" style="
          cursor: help; 
          background-color: lightskyblue; 
          padding: 0 2px; 
          margin: 0 2px; 
          border-radius: 3px;
          position: relative;">
          ${chineseWord}
          <span class="tooltip" style="
            display: none;
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background-color: black;
            color: white;
            padding: 5px;
            border-radius: 3px;
            white-space: nowrap;
            z-index: 10;">
            Fetching translation...
          </span>
        </span>`
      );
    });
    
    // Update the text element's HTML
    textElement.innerHTML = htmlContent;
    
    // Add event listeners to Chinese words
    document.querySelectorAll('.chinese-word').forEach(wordElement => {
      wordElement.addEventListener('mouseenter', async (e) => {
        const tooltip = e.currentTarget.querySelector('.tooltip');
        const chineseWord = e.currentTarget.getAttribute('data-word');
        
        tooltip.style.display = 'block';
        tooltip.textContent = await fetchChineseTranslation(chineseWord);
      });
      
      wordElement.addEventListener('mouseleave', (e) => {
        const tooltip = e.currentTarget.querySelector('.tooltip');
        tooltip.style.display = 'none';
      });
    });
  }
}

// Fetch Chinese word translation
async function fetchChineseTranslation(word) {
  try {
    // Replace this with a valid translation API
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=zh|en`);
    const data = await response.json();
    return data.responseData.translatedText || 'No translation available';
  } catch (error) {
    console.error('Translation API error:', error);
    return 'Translation unavailable';
  }
}

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
  // Set the static image
  document.getElementById("image").src = images[0];
  
  // Set the first text
  updateContent();

  // Enable the "Next" button initially
  const nextButton = document.getElementById("nextButton");
  nextButton.disabled = false;
});
