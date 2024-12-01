class FlashcardPronunciationChecker {
    constructor() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser. Please use Chrome.');
            return;
        }
        this.recognition = new webkitSpeechRecognition();
        this.recognition.lang = 'zh-CN';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
    }

    toggleRecording(card, scoreDisplay, recordButton) {
        // Stop if already recording
        if (this.isRecording) {
            this.recognition.stop();
            return;
        }

        // Reset state
        this.isRecording = true;
        recordButton.classList.add('recording');
        scoreDisplay.textContent = 'Listening...';

        // Comprehensive result handling
        this.recognition.onresult = (event) => {
            if (event.results.length > 0) {
                const transcript = event.results[0][0].transcript.trim();
                const confidence = event.results[0][0].confidence;

                if (transcript) {
                    this.processTranscript(transcript, card.traditional, scoreDisplay, confidence);
                } else {
                    scoreDisplay.textContent = 'No speech detected. Try again.';
                }
            }
        };

        // Error and end state handlers
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            scoreDisplay.textContent = 'Recognition error. Please try again.';
            this.resetRecording(recordButton);
        };

        this.recognition.onend = () => {
            this.resetRecording(recordButton);
        };

        // Start recognition
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Start recognition error:', error);
            scoreDisplay.textContent = 'Failed to start recognition.';
            this.resetRecording(recordButton);
        }
    }

    processTranscript(transcript, reference, scoreDisplay, confidence) {
        const accuracyDetails = this.calculateAccuracy(transcript, reference);
        
        const finalScore = Math.round(
            (accuracyDetails.characterAccuracy * 0.7) + 
            (confidence * 100 * 0.3)
        );

        scoreDisplay.innerHTML = `
            <div class="score-results">
                <div class="final-score">Score: ${finalScore}%</div>
                <div class="score-details">
                    <div>You said: ${transcript}</div>
                    <div>Target: ${reference}</div>
                    <div>Matched: ${accuracyDetails.matchedCharacters.join('')}</div>
                    <div>Accuracy: ${Math.round(accuracyDetails.characterAccuracy)}%</div>
                </div>
            </div>
        `;
    }

    calculateAccuracy(transcript, reference) {
        const t = transcript.replace(/\s+/g, '');
        const r = reference.replace(/\s+/g, '');

        if (t === r) return { characterAccuracy: 100, matchedCharacters: r.split('') };

        const matchedCharacters = [];
        let workingRef = r;

        for (let char of t.split('')) {
            const index = workingRef.indexOf(char);
            if (index !== -1) {
                matchedCharacters.push(char);
                workingRef = workingRef.slice(0, index) + workingRef.slice(index + 1);
            }
        }

        const characterAccuracy = (matchedCharacters.length / Math.max(t.length, r.length)) * 100;

        return { characterAccuracy, matchedCharacters };
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
    utterance.lang = 'zh-TW';
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
    const prevButton = document.querySelector('button[onclick="showPreviousCards()"]');
    const nextButton = document.querySelector('button[onclick="showNextCards()"]');

    prevButton.disabled = currentPage === 0;
    nextButton.disabled = (currentPage + 1) * cardsPerPage >= flashcards.length;
}

function showNextCards() {
    if ((currentPage + 1) * cardsPerPage < flashcards.length) {
        currentPage++;
        displayCurrentPage();
    }
}

function showPreviousCards() {
    if (currentPage > 0) {
        currentPage--;
        displayCurrentPage();
    }
}

window.onload = function () {
    window.speechSynthesis.getVoices();
    if ('speechSynthesis' in window) {
        displayCurrentPage();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = displayCurrentPage;
        }
    } else {
        alert("Sorry, your browser doesn't support text to speech! Please try using a modern browser like Chrome or Firefox.");
    }
};

const flashcards = [
   { traditional: "一", pinyin: "Yī", bopomofo: "ㄧ", english: "1" },
    { traditional: "二", pinyin: "Èr", bopomofo: "ㄦ", english: "2" },
    { traditional: "三", pinyin: "Sān", bopomofo: "ㄙㄢ", english: "3" },
    { traditional: "四", pinyin: "Sì", bopomofo: "ㄙˋ", english: "4" },
    { traditional: "五", pinyin: "Wǔ", bopomofo: "ㄨˇ", english: "5" },
    { traditional: "六", pinyin: "Liù", bopomofo: "ㄌㄧㄡˋ", english: "6" },
    { traditional: "七", pinyin: "Qī", bopomofo: "ㄑㄧ", english: "7" },
    { traditional: "八", pinyin: "Bā", bopomofo: "ㄅㄚ", english: "8" },
    { traditional: "九", pinyin: "Jiǔ", bopomofo: "ㄐㄧㄡˇ", english: "9" },
    { traditional: "十", pinyin: "Shí", bopomofo: "ㄕˊ", english: "10" },
    { traditional: "你好", pinyin: "Nǐ hǎo", bopomofo: "ㄋㄧˇ ㄏㄠˇ", english: "Hello" },
    { traditional: "歡迎", pinyin: "Huān yíng", bopomofo: "ㄏㄨㄢ ㄧㄥˊ", english: "Welcome" },
    { traditional: "是", pinyin: "Shì", bopomofo: "ㄕˋ", english: "Yes" },
    { traditional: "不是", pinyin: "Bù shì", bopomofo: "ㄅㄨˊ ㄕˋ", english: "No" },
    { traditional: "謝謝", pinyin: "Xiè xiè", bopomofo: "ㄒㄧㄝˋ ㄒㄧㄝˋ", english: "Thank You" },
    { traditional: "不客氣", pinyin: "Bù kè qì", bopomofo: "ㄅㄨˋ ㄎㄜˋ ㄑㄧˋ", english: "You're Welcome", description: "A response to thank you" },
    { traditional: "不會", pinyin: "Bù huì", bopomofo: "ㄅㄨˋ ㄏㄨㄟˋ", english: "No trouble at all", description: "Also response to thank you, but only have this meaning in Taiwan" },
    { traditional: "對不起", pinyin: "Duì bù qǐ", bopomofo: "ㄉㄨㄟˋ ㄅㄨˋ ㄑㄧˇ", english: "Sorry" },
    { traditional: "沒關係", pinyin: "Méi guān xì", bopomofo: "ㄇㄟˊ ㄍㄨㄢ ㄒㄧˋ", english: "It's Okay", description: "A respond to an apology" },
    { traditional: "我叫", pinyin: "Wǒ jiào", bopomofo: "ㄨㄛˇ ㄐㄧㄠˋ", english: "My name is", description: "Used to introduce oneself" }
];
const pronunciationChecker = new FlashcardPronunciationChecker();
let currentPage = 0;
const cardsPerPage = 4;

// Dialogue Game State
let currentDialogueIndex = 0;
let isTyping = false;

// Dialogue Data
const dialogueData = [
    {
        scene: 'https://cdn.crtkl.com/wp-content/uploads/sites/1/2021/01/taiwan-airport-duty-free-02.jpg',
        npcText: '你好！歡迎來到台灣',
        context: '*The NPC greets the player warmly as they exit customs.*',
        question: 'What is Mei Lin saying?',
        choices: [
            { id: 'A', text: 'Hello! Welcome to Taiwan!', correct: true },
            { id: 'B', text: 'Thank you! Goodbye!', correct: false },
            { id: 'C', text: 'Hello! Nice to meet you!', correct: false }
        ],
        feedback: {
            correct: 'Correct! Mei Lin smiles and continues with the conversation.',
            incorrect: "Actually, I said 'Hello! Welcome to Taiwan!' You'll hear '歡迎來到' often when someone welcomes you somewhere."
        },
        audio: 'path/to/audio/welcome.mp3'
    },
    {
        scene: 'airport-lobby.jpg',
        npcText: '我叫美林。I’ll help you get settled and show you around so you can enjoy your time here...Oh, it seems I almost forgot one of your bags!',
        context: '*The NPC apologizes sincerely.*',
        question: 'How do you respond to Mei Lin’s apology?',
        choices: [
            { id: 'A', text: '沒關係 (Méi guān xì)', correct: true },
            { id: 'B', text: '謝謝 (Xiè xiè)', correct: false },
            { id: 'C', text: '你好 (Nǐ hǎo)', correct: false }
        ],
        feedback: {
            correct: 'Correct! Mei Lin says, “Thank you!”',
            incorrect: "You’d say 沒關係 (Méi guān xì) to mean 'It's okay' in response to an apology. It's a polite way to let someone know you’re not upset."
        }
    },
    {
        npcText: 'Let me help you find your luggage. How many bags do you have?',
        context: '*A picture of 3 bags is shown.*',
        question: 'Select the correct number for 3 bags.',
        choices: [
            { id: 'A', text: '三 (sān)', correct: true },
            { id: 'B', text: '十 (shí)', correct: false },
            { id: 'C', text: '六 (liù)', correct: false }
        ],
        feedback: {
            correct: 'Correct! Mei Lin nods and hands the player their luggage.',
            incorrect: 'The correct answer is 三 (sān). This is the number three, which will be helpful when you need to count things here.'
        }
    },
    {
        npcText: 'This is your hotel reservation. You’re in room 三十一 (31). Let’s get you checked in, and I’ll tell you about some places to visit.',
        question: 'How would you say the number 75?',
        choices: [
            { id: 'A', text: '七十五 (qī shí wǔ)', correct: true },
            { id: 'B', text: '一百 (yī bǎi)', correct: false },
            { id: 'C', text: '五十七 (wǔ shí qī)', correct: false }
        ],
        feedback: {
            correct: 'Correct! Mei Lin directs the player toward the hotel.',
            incorrect: 'Actually, 七十五 (qī shí wǔ) is seventy-five. In Mandarin, we combine "seven" (七) and "ten" (十) with "five" (五) to make seventy-five.'
        }
    },
    {
        npcText: 'Taiwan is full of beautiful sights! For example, 台北 101 (Tái běi 101) is one of the tallest skyscrapers in the world. It\'s a must-see here in Taiwan!',
    },
    {
        npcText: 'Another great spot is 日月潭, or Sun Moon Lake. It’s famous for its crystal-clear water and scenic mountain views.',
    },
    {
        npcText: 'And if you’re into history, the National Palace Museum is full of amazing artifacts from ancient Chinese dynasties.',},
    {
        npcText: 'Alright, here’s your hotel.',
        question: 'What does “xiè xiè” mean?',
        choices: [
            { id: 'A', text: '謝謝 (xiè xiè)', correct: true },
            { id: 'B', text: '你好 (nǐ hǎo)', correct: false },
            { id: 'C', text: '再見 (zài jiàn)', correct: false }
        ],
        feedback: {
            correct: 'Correct! Mei Lin nods approvingly.',
            incorrect: "You mean 謝謝 (xiè xiè), which means 'Thank you'."
        }
    },
    {
        npcText: '不客氣! That’s one way to respond to "Thank you." Another way we say this in Taiwan is 不會 (bù huì).',
    },
    {
        npcText: 'Now you’re all set to start exploring Taiwan! I hope you enjoy your stay and maybe even visit 台中 (Tái zhōng) and the famous 逢甲夜市 (Fengjia Night Market) for some great food!',
    }
];


// Function to start the game (called from flashcard section)
function startGame() {
    document.getElementById('flashcard-section').classList.add('hidden');
    document.getElementById('dialogue-game-section').classList.remove('hidden');
    startDialogue();
}

// Function to handle typewriter effect
function typewriterEffect(text, element, speed = 20) {
    return new Promise(resolve => {
        isTyping = true;
        element.textContent = '';
        let i = 0;
        
          // Ensure text is properly encoded
          const sanitizedText = text.normalize('NFKC'); 
          
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                isTyping = false;
                element.classList.remove('typing');
                resolve();
            }
        }
        
        element.classList.add('typing');
        type();
    });
}

async function startDialogue() {
    const currentDialogue = dialogueData[currentDialogueIndex];
    const dialogueTextElement = document.getElementById('dialogueText');
    const contextElement = document.getElementById('contextText');
    const questionElement = document.getElementById('questionText');
    const choicesContainer = document.getElementById('choicesContainer');
    const continueButton = document.getElementById('continueButton');

    // Reset content
      dialogueTextElement.textContent = '';
      contextElement.textContent = '';
      questionElement.textContent = '';
      choicesContainer.innerHTML = '';
      
      // Explicitly hide choices container when no choices are present
      if (!currentDialogue.choices || currentDialogue.choices.length === 0) {
          choicesContainer.style.visibility = 'hidden';
          choicesContainer.style.display = 'none';
      }
      
      continueButton.classList.add('hidden');

    // Update scene image if it exists
    if (currentDialogue.scene) {
        document.getElementById('sceneImage').src = currentDialogue.scene;
    }

    // Type out the NPC text
    await typewriterEffect(currentDialogue.npcText, dialogueTextElement);

    // Add context in italics if it exists
    if (currentDialogue.context) {
        contextElement.textContent = currentDialogue.context;
        contextElement.style.fontStyle = 'italic';
    }

    // Add question in bold if it exists
    if (currentDialogue.question) {
        questionElement.textContent = currentDialogue.question;
        questionElement.style.fontWeight = 'bold';
    }

    // Display choices if they exist, otherwise show the "Next" button
    if (currentDialogue.choices && currentDialogue.choices.length > 0) {
        displayChoices(currentDialogue.choices);
    } else {
        continueButton.classList.remove('hidden');
    }
}

// Function to display choices as a pop-up
function displayChoices(choices) {
    const choicesContainer = document.getElementById('choicesContainer');
    const continueButton = document.getElementById('continueButton');
    
     // Clear previous choices and ensure visibility
     choicesContainer.innerHTML = '';
     choicesContainer.style.visibility = 'visible';
     choicesContainer.style.display = 'block';
     
     // Hide "Next" button while displaying choices
     continueButton.classList.add('hidden');
 
     // Add choice buttons
     choices.forEach(choice => {
         const button = document.createElement('button');
         button.className = 'choice-button';
         button.textContent = `${choice.id}. ${choice.text}`;
         button.onclick = () => handleChoice(choice);
         choicesContainer.appendChild(button);
     });
}

// Function to handle choice selection
function handleChoice(choice) {
    const currentDialogue = dialogueData[currentDialogueIndex];
    const feedbackElement = document.getElementById('feedbackMessage');
    const continueButton = document.getElementById('continueButton');
    const choicesContainer = document.getElementById('choicesContainer');
    
    // Disable all choice buttons
    document.querySelectorAll('.choice-button').forEach(button => {
        button.disabled = true;
    });
    
    // Show feedback
    feedbackElement.textContent = choice.correct ? 
        currentDialogue.feedback.correct : 
        currentDialogue.feedback.incorrect;
    feedbackElement.className = `feedback-message ${choice.correct ? 'correct' : 'incorrect'}`;
    feedbackElement.style.display = 'block';
    
    // Hide the choices container after selection
    setTimeout(() => {
        choicesContainer.style.visibility = 'hidden';
        choicesContainer.style.display = 'none';
    }, 1000);
    
    // Show continue button
    continueButton.classList.remove('hidden');
}

// Function to play audio
function playAudio(audioFile) {
    const audio = new Audio(audioFile);
    audio.play().catch(error => console.log('Audio playback failed:', error));
}

// Event listener for audio button
document.getElementById('audioButton').addEventListener('click', () => {
    const currentDialogue = dialogueData[currentDialogueIndex];
    playAudio(currentDialogue.audio);
});

// Function to continue to next dialogue
document.getElementById('continueButton').addEventListener('click', () => {
    currentDialogueIndex++;
    
    if (currentDialogueIndex >= dialogueData.length) {
        // Game complete - implement end game logic here
        alert('Dialogue complete!');
        return;
    }
    
     // Reset UI elements
     document.getElementById('feedbackMessage').className = 'feedback-message';
     document.getElementById('feedbackMessage').textContent = '';
     document.getElementById('choicesContainer').innerHTML = '';
     document.getElementById('continueButton').classList.add('hidden');
 
     // Start next dialogue
     startDialogue();
});
