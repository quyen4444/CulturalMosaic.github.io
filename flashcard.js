// Function to handle level button clicks
function handleLevelClick(levelId) {
    const button = document.getElementById(`level${levelId}Button`);
    if (button.classList.contains('level-active')) {
        showFlashcardSection(levelId); // Pass levelId
    } else if (button.classList.contains('level-locked')) {
        alert(`Level ${levelId} is not available yet! Complete the previous level first.`);
    }
}

function showFlashcardSection(levelId) {
    document.getElementById("level-buttons").style.display = "none";
    const flashcardSection = document.getElementById("flashcard-section");
    flashcardSection.style.display = "block";
    initializeFlashcards(levelId); // Pass the selected level
}

// Function to initialize levels
function initializeLevels() {
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels')) || [1];
    for (let i = 1; i <= 5; i++) {
        const button = document.getElementById(`level${i}Button`);
        if (completedLevels.includes(i)) {
            button.classList.remove('level-locked');
            button.classList.add('level-active');
        }
    }
}


class FlashcardPronunciationChecker {
    constructor() {
        if (!('webkitSpeechRecognition' in window)) {
            throw new Error('Speech recognition not supported. Please use Chrome.');
        }
        this.recognition = new webkitSpeechRecognition();
        this.setupRecognition();
    }

    setupRecognition() {
        this.recognition.lang = 'zh-CN';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 3; // Get multiple alternatives for better matching
    }

    toggleRecording(card, scoreDisplay, recordButton) {
        if (this.isRecording) {
            this.recognition.stop();
            return;
        }

        this.isRecording = true;
        recordButton.classList.add('recording');
        scoreDisplay.textContent = 'Listening...';

        this.recognition.onresult = ({ results }) => {
            const alternatives = Array.from(results[0]);
            const bestMatch = this.findBestMatch(alternatives, card.traditional);
            bestMatch ? this.processTranscript(bestMatch, card.traditional, scoreDisplay)
                     : scoreDisplay.textContent = 'No speech detected. Try again.';
        };

        this.setupErrorHandlers(scoreDisplay, recordButton);
        this.startRecognition(scoreDisplay, recordButton);
    }

    findBestMatch(alternatives, reference) {
        return alternatives.reduce((best, current) => {
            const score = this.calculateSimilarity(current.transcript.trim(), reference);
            return score > (best?.score ?? 0) ? { ...current, score } : best;
        }, null);
    }

    calculateSimilarity(transcript, reference) {
        const t = transcript.replace(/\s+/g, '');
        const r = reference.replace(/\s+/g, '');
        
        if (t === r) return 1;
        
        // Character matching with position weight
        let score = 0;
        const len = Math.max(t.length, r.length);
        const minLen = Math.min(t.length, r.length);
        
        for (let i = 0; i < minLen; i++) {
            if (t[i] === r[i]) {
                // Characters in correct position get higher weight
                score += 1;
            } else if (r.includes(t[i])) {
                // Characters present but in wrong position get partial credit
                score += 0.5;
            }
        }
        
        // Penalize length differences
        const lengthPenalty = 1 - Math.abs(t.length - r.length) / len;
        
        return (score / len) * lengthPenalty;
    }

    processTranscript(result, reference, scoreDisplay) {
        const { transcript, confidence, score } = result;
        const accuracy = score * 100;
        
        // Weight distribution: accuracy (60%), pronunciation confidence (30%), length match (10%)
        const lengthScore = (1 - Math.abs(transcript.length - reference.length) / Math.max(transcript.length, reference.length)) * 100;
        const finalScore = Math.round(
            (accuracy * 0.6) +
            (confidence * 100 * 0.3) +
            (lengthScore * 0.1)
        );

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
        return `
            <div class="score-results">
                <div class="final-score" style="color: ${color}">Score: ${finalScore}%</div>
                <div class="score-details">
                    <div>You said: ${transcript}</div>
                    <div>Target: ${reference}</div>
                    <div>Matched: ${matchedChars.join('')}</div>
                    <div>Accuracy: ${Math.round(accuracy)}%</div>
                </div>
            </div>
        `;
    }

    setupErrorHandlers(scoreDisplay, recordButton) {
        this.recognition.onerror = ({ error }) => {
            console.error('Speech recognition error:', error);
            scoreDisplay.textContent = 'Recognition error. Please try again.';
            this.resetRecording(recordButton);
        };
        this.recognition.onend = () => this.resetRecording(recordButton);
    }

    startRecognition(scoreDisplay, recordButton) {
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Start recognition error:', error);
            scoreDisplay.textContent = 'Failed to start recognition.';
            this.resetRecording(recordButton);
        }
    }

    resetRecording(recordButton) {
        this.isRecording = false;
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

// Function to dynamically load flashcards for a level
async function loadFlashcards(level) {
    try {
        const response = await fetch('flashcard.json'); // Fetch flashcard data
        const data = await response.json();
        return data.levels[level] || []; // Return flashcards for the specific level
    } catch (error) {
        console.error("Error loading flashcards:", error);
        alert("Failed to load flashcards. Please try again later.");
        return [];
    }
}

// Function to initialize and display flashcards dynamically
async function initializeFlashcards(level) {
    const flashcardContainer = document.getElementById("flashcardContainer");
    flashcardContainer.innerHTML = '<p>Loading flashcards...</p>'; // Show loading message

    const loadedFlashcards = await loadFlashcards(level); // Fetch flashcards for the level
    flashcardContainer.innerHTML = ''; // Clear loading message

    if (loadedFlashcards.length === 0) {
        flashcardContainer.innerHTML = '<p>No flashcards found for this level.</p>';
        return;
    }

    loadedFlashcards.forEach((card) => {
        flashcardContainer.appendChild(createFlashcard(card));
    });

    currentPage = 0; // Reset pagination
    displayCurrentPage(); // Paginate the cards
}

// Record Functions
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
        recordButton.classList.add('recording');
        scoreDisplay.textContent = 'Processing...';

        const result = await pronunciationChecker.startAssessment(card);

        scoreDisplay.innerHTML = `
            <div class="score-main">Score: ${result.pronunciation}%</div>
            <div class="score-details">
                <div>Fluency: ${result.details.fluency}%</div>
                <div>Accuracy: ${result.details.accuracy}%</div>
                <div>Confidence: ${result.details.confidence}%</div>
            </div>
        `;
        scoreDisplay.style.display = 'block';
    } catch (error) {
        console.error('Pronunciation check failed:', error);
        alert(`Failed to record pronunciation. Error: ${error.message || 'Unknown error'}`);
    } finally {
        recordButton.classList.remove('recording');
    }
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
        container.appendChild(createFlashcard(flashcards[i])); // Flashcards now created dynamically.
    }
    updateNavigationState();
}

function updateNavigationState() {
    const prevButton = document.querySelector('button[onclick="showPreviousCards()"]');
    const nextButton = document.querySelector('button[onclick="showNextCards()"]');

    prevButton.disabled = currentPage === 0;
    nextButton.disabled = (currentPage + 1) * cardsPerPage >= flashcards.length;
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

// UPDATED: Use dynamic data loading and pronunciation checking
window.onload = function () {
    window.speechSynthesis.getVoices();
    if ('speechSynthesis' in window) {
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = () => {};
        }
        initializeLevels(); 
    } else {
        alert("Sorry, your browser doesn't support text to speech! Please try using a modern browser like Chrome or Firefox.");
    }
};

// Function to load flashcards dynamically based on selected level
async function loadFlashcards() {
    const level = getLevelFromURL(); // Get level from query parameters
    try {
        const response = await fetch('flashcard.json'); // Fetch JSON data
        const data = await response.json();
        const flashcardsForLevel = data.levels[level]; // Filter flashcards by level.

        if (!flashcardsForLevel) {
            alert("No flashcards found for this level.");
            return [];
        }
        return flashcardsForLevel;
    } catch (error) {
        console.error("Error loading flashcards:", error);
        alert("Failed to load flashcards. Please try again later.");
        return [];
    }
}

// Extract level from URL query parameters
function getLevelFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('level') || "1"; // Default to level 1 if no level is provided.
}

// UPDATED: Initialize flashcards with dynamic data
async function initializeFlashcards() {
    const flashcardContainer = document.getElementById("flashcardContainer");
    flashcardContainer.innerHTML = '<p>Loading flashcards...</p>'; // Show loading message.

    const loadedFlashcards = await loadFlashcards(); // Fetch flashcards for the level.
    if (loadedFlashcards.length === 0) return; // Exit if no flashcards available.

    flashcards.splice(0, flashcards.length, ...loadedFlashcards); // Replace global flashcards array.
    currentPage = 0;
    displayCurrentPage(); // Render the flashcards dynamically.
}

// Global Variables
const flashcards = [];
const pronunciationChecker = new FlashcardPronunciationChecker(); // Instantiate the pronunciation checker.
let currentPage = 0;
const cardsPerPage = 4; // Number of flashcards per page.
