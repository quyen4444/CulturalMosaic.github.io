function returnToLevels() {
  document.getElementById('flashcard-section').style.display = 'none';
  document.getElementById('levelSelector').style.display = 'block';
}

function handleLevelClick(levelId) {
  const button = document.querySelector(`#level${levelId}Button`);
  if (button.classList.contains('level-active')) {
      showFlashcardSection(levelId);
      
      button.classList.remove('level-active');
      button.classList.add('level-completed');
      
      const nextButton = document.querySelector(`#level${levelId + 1}Button`);
      if (nextButton) {
          nextButton.classList.remove('level-locked');
          nextButton.classList.add('level-active');
      }
  } else if (button.classList.contains('level-locked')) {
      alert(`Level ${levelId} is not available yet! Complete the previous level first.`);
  }
}

function showFlashcardSection(levelId) {
  document.getElementById('levelSelector').style.display = 'none';
  document.getElementById('flashcard-section').style.display = 'block';
  initializeFlashcards(levelId);
}

function initializeLevels() {
  const completedLevels = JSON.parse(localStorage.getItem('completedLevels')) || [1];
  for (let i = 1; i <= 6; i++) {
      const button = document.getElementById(`level${i}Button`);
      if (button && completedLevels.includes(i)) {
          button.classList.remove('level-locked');
          button.classList.add('level-active');
      }
  }
}

function completeLevel(levelId) {
  const completedLevels = JSON.parse(localStorage.getItem('completedLevels')) || [1];
  if (!completedLevels.includes(levelId)) {
      completedLevels.push(levelId + 1);
      localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
      
      const currentButton = document.getElementById(`level${levelId}Button`);
      const nextButton = document.getElementById(`level${levelId + 1}Button`);
      
      if (currentButton) {
          currentButton.classList.remove('level-active');
          currentButton.classList.add('level-completed');
      }
      
      if (nextButton) {
          nextButton.classList.remove('level-locked');
          nextButton.classList.add('level-active');
      }
      
      alert(`Level ${levelId} completed! Level ${levelId + 1} is now unlocked.`);
  }
}

document.addEventListener('DOMContentLoaded', initializeLevels);

class FlashcardPronunciationChecker {
  constructor() {
    if (!('webkitSpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported. Please use Chrome.');
    }
    this.recognition = new webkitSpeechRecognition();
    this.isRecording = false;
    this.hasPermission = false;
    this.setupRecognition();
  }

  setupRecognition() {
    this.recognition.lang = 'zh-CN';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 3;
  }

  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.hasPermission = true;
      // Stop the stream immediately since we only needed it for permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      this.hasPermission = false;
      return false;
    }
  }

  async toggleRecording(card, scoreDisplay, recordButton) {
    if (this.isRecording) {
      this.recognition.stop();
      return;
    }

    // Check for permission if we haven't already
    if (!this.hasPermission) {
      scoreDisplay.textContent = 'Requesting microphone access...';
      const permitted = await this.requestMicrophonePermission();
      if (!permitted) {
        scoreDisplay.textContent = 'Microphone access denied. Please allow microphone access and try again.';
        return;
      }
    }

    this.isRecording = true;
    recordButton.classList.add('recording');
    scoreDisplay.textContent = 'Listening...';

    this.recognition.onresult = ({ results }) => {
      const alternatives = Array.from(results[0]);
      const bestMatch = this.findBestMatch(alternatives, card.traditional);
      if (bestMatch) {
        this.processTranscript(bestMatch, card.traditional, scoreDisplay);
      } else {
        scoreDisplay.textContent = 'No speech detected. Try again.';
      }
    };

    this.setupErrorHandlers(scoreDisplay, recordButton);
    this.startRecognition(recordButton, scoreDisplay);
  }

  findBestMatch(alternatives, reference) {
    return alternatives.reduce((best, current) => {
      const score = this.calculateSimilarity(current.transcript.trim(), reference);
      return score > (best?.score ?? 0) ? { transcript: current.transcript, confidence: current.confidence, score } : best;
    }, null);
  }

  calculateSimilarity(transcript, reference) {
    const t = transcript.replace(/\s+/g, '');
    const r = reference.replace(/\s+/g, '');
    if (t === r) return 1;

    let score = 0;
    const maxLen = Math.max(t.length, r.length);
    const minLen = Math.min(t.length, r.length);

    for (let i = 0; i < minLen; i++) {
      if (t[i] === r[i]) {
        score += 1;
      } else if (r.includes(t[i])) {
        score += 0.5;
      }
    }

    const lengthPenalty = 1 - Math.abs(t.length - r.length) / maxLen;
    return (score / maxLen) * lengthPenalty;
  }

  processTranscript(result, reference, scoreDisplay) {
    const { transcript, confidence, score } = result;
    const accuracy = score * 100;
    const lengthScore = (1 - Math.abs(transcript.length - reference.length) / Math.max(transcript.length, reference.length)) * 100;
    const finalScore = Math.round((accuracy * 0.6) + (confidence * 100 * 0.3) + (lengthScore * 0.1));

    const matchedChars = this.getMatchedCharacters(transcript, reference);
    scoreDisplay.innerHTML = this.generateScoreHTML(transcript, reference, finalScore, matchedChars, accuracy);
  }

  getMatchedCharacters(transcript, reference) {
    const t = transcript.replace(/\s+/g, '');
    const r = reference.replace(/\s+/g, '');
    return [...t].filter((char, i) => char === r[i] || r.includes(char));
  }

  generateScoreHTML(transcript, reference, finalScore, matchedChars, accuracy) {
    const color = finalScore >= 80 ? 'green' : finalScore >= 60 ? 'orange' : 'red';
    const feedback = this.getFeedback(finalScore);
    
    return `
      <div class="score-results">
        <div class="final-score" style="color: ${color}">Score: ${finalScore}%</div>
        <div class="score-details">
            <div>
            <span>You said:</span>
            <div>${transcript}</div>
        </div>
        <div>
            <span>Target:</span>
            <div>${reference}</div>
        </div>
        <div>
            <span>Accuracy:</span>
            <div>${Math.round(accuracy)}%</div>
        </div>
    </div>
    <div class="feedback">${feedback}</div>
</div>
    `;
  }

  getFeedback(score) {
    if (score >= 90) return 'Excellent!';
    if (score >= 80) return 'Very good! Keep practicing!';
    if (score >= 60) return 'Try to match the tones more closely.';
    return 'Keep practicing! Focus on matching the sounds and tones.';
  }

  setupErrorHandlers(scoreDisplay, recordButton) {
    this.recognition.onerror = ({ error }) => {
      console.error('Speech recognition error:', error);
      let errorMessage = 'Recognition error. Please try again.';
      
      if (error === 'not-allowed') {
        errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
        this.hasPermission = false;
      }
      
      scoreDisplay.textContent = errorMessage;
      this.resetRecording(recordButton);
    };
    
    this.recognition.onend = () => this.resetRecording(recordButton);
  }

  startRecognition(recordButton, scoreDisplay) {
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      scoreDisplay.textContent = 'Failed to start recognition. Please try again.';
      this.resetRecording(recordButton);
    }
  }

  resetRecording(recordButton) {
    this.isRecording = false;
    recordButton.classList.remove('recording');
  }
}

// Handler function for pronunciation checks
async function handlePronunciationCheck(event, card) {
  event.preventDefault();
  event.stopPropagation();

  const cardElement = document.querySelector(`#flashcard-${card.id}`);
  if (!cardElement) {
    console.error('Card element not found:', card.id);
    return;
  }

  const recordButton = cardElement.querySelector('.record-button');
  const scoreDisplay = cardElement.querySelector('.score-display');
  if (!recordButton || !scoreDisplay) {
    console.error('Required elements not found:', { recordButton, scoreDisplay });
    return;
  }

  try {
    // Create pronunciation checker instance if it doesn't exist
    if (!cardElement.pronunciationChecker) {
      cardElement.pronunciationChecker = new FlashcardPronunciationChecker();
    }

    await cardElement.pronunciationChecker.toggleRecording(card, scoreDisplay, recordButton);
  } catch (error) {
    console.error('Pronunciation check failed:', error);
    scoreDisplay.textContent = `Error: ${error.message || 'Unknown error'}`;
    recordButton.classList.remove('recording');
  }
}

// Flashcard Flip Functions
function createFlashcard(card) {
  const flashcard = document.createElement("div");
  flashcard.classList.add("thecard");

  const front = document.createElement("div");
  front.classList.add("thefront");
  front.innerHTML = `
      <h2>${card.traditional}</h2>
      <p>Pinyin: ${card.pinyin}</p>
      <p>Bopomofo: ${card.bopomofo}</p>
      <div class="button-group">
          <button class="sound-button" onclick="event.preventDefault(); event.stopPropagation(); speakChinese('${card.traditional}')">
              <i class="fas fa-volume-up"></i>
          </button>
          <button class="record-button">
              <i class="fas fa-microphone"></i>
          </button>
      </div>
      <div class="score-display"></div>
  `;

  const back = document.createElement("div");
  back.classList.add("theback");
  back.innerHTML = `<h2>${card.english}</h2>`;

  flashcard.appendChild(front);
  flashcard.appendChild(back);
  const recordButton = front.querySelector('.record-button');
  const scoreDisplay = front.querySelector('.score-display');
  recordButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();  // Prevent card flip when clicking record button
      pronunciationChecker.toggleRecording(card, scoreDisplay, recordButton);
  });

  flashcard.addEventListener('click', (event) => {
      // Only flip if we're not recording and didn't click the record or sound button
      const isButtonClick = event.target.closest('.record-button, .sound-button');
      if (!pronunciationChecker.isRecording && !isButtonClick) {
          flashcard.classList.toggle('flipped');
      }
  });
  return flashcard;
}

// Function to load flashcards dynamically
async function loadFlashcards(level) {
  try {
      const response = await fetch('flashcard.json');
      const data = await response.json();
      return data.levels[level] || [];
  } catch (error) {
      console.error("Error loading flashcards:", error);
      alert("Failed to load flashcards. Please try again later.");
      return [];
  }
}

// Function to initialize and display flashcards dynamically
async function initializeFlashcards(level) {
  const flashcardContainer = document.getElementById("flashcardContainer");
  flashcardContainer.innerHTML = '<p>Loading flashcards...</p>';

  const loadedCards = await loadFlashcards(level);
  if (loadedCards.length === 0) {
      flashcardContainer.innerHTML = '<p>No flashcards found for this level.</p>';
      return;
  }

  flashcards = loadedCards; // Store loaded cards in global array
  currentPage = 0;
  displayCurrentPage();
}

// Play Sound Function
function speakChinese(text) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.8;

  const voices = window.speechSynthesis.getVoices();
  const chineseVoice = voices.find(voice => voice.lang.includes('zh'));
  if (chineseVoice) utterance.voice = chineseVoice;

  window.speechSynthesis.speak(utterance);
}

// Pagination and Initialization
function displayCurrentPage() {
  const container = document.getElementById("flashcardContainer");
  container.innerHTML = '';
  const startIndex = currentPage * cardsPerPage;
  const endIndex = Math.min(startIndex + cardsPerPage, flashcards.length);

  for (let i = startIndex; i < endIndex; i++) {
      container.appendChild(createFlashcard(flashcards[i]));
  }
  updateNavigationState();
}

function updateNavigationState() {
  const prevButton = document.querySelector('.nav-button:first-child');
  const nextButton = document.querySelector('.nav-button:last-child');
  
  if (prevButton && nextButton) {
      prevButton.disabled = currentPage === 0;
      nextButton.disabled = (currentPage + 1) * cardsPerPage >= flashcards.length;
  }
}

function showNextCards() {
  if ((currentPage + 1) * cardsPerPage < flashcards.length) {
      currentPage++;
      displayCurrentPage(); // Refresh cards based on new currentPage.
  }
}

function showPreviousCards() {
  if (currentPage > 0) {
      currentPage--;
      displayCurrentPage(); // Refresh cards based on new currentPage.
  }
}

window.onload = function() {
  window.speechSynthesis.getVoices();
  if ('speechSynthesis' in window) {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => {
              window.speechSynthesis.getVoices();
          };
      }
      initializeLevels();
  } else {
      alert("Sorry, your browser doesn't support text to speech! Please try using a modern browser like Chrome or Firefox.");
  }
};


// Extract level from URL query parameters
function getLevelFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('level') || "1"; // Default to level 1 if no level is provided.
}

// Global Variables
let flashcards = [];
const pronunciationChecker = new FlashcardPronunciationChecker(); // Instantiate the pronunciation checker.
let currentPage = 0;
const cardsPerPage = 4; // Number of flashcards per page.
