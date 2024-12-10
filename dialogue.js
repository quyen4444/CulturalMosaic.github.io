function redirectToIndex() {
    window.location.href = 'index.html';
}

function returnToLevels() {
    document.getElementById('dialogue-game-section').style.display = 'none';
    document.getElementById('levelSelector').style.display = 'block';
}

function handleLevelClick(levelId) {
    const button = document.querySelector(`#level${levelId}Button`);
    if (button.classList.contains('level-active')) {
        showDialogueSection(levelId);
        
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

function showDialogueSection(levelId) {
    document.getElementById('levelSelector').style.display = 'none';
    document.getElementById('dialogue-game-section').style.display = 'block';
    initializeDialogue(levelId);
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

document.addEventListener('DOMContentLoaded', initializeLevels);

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

async function initializeDialogue(levelId) {
    try {
        const response = await fetch('dialogue.json');
        const data = await response.json();
        dialogueData = data.levels[levelId];
        currentDialogueIndex = 0;
        startDialogue();
    } catch (error) {
        console.error('Failed to load dialogue:', error);
    }
}

let currentDialogueIndex = 0;

const elements = {
    dialogueText: document.getElementById('dialogueText'),
    contextText: document.getElementById('contextText'),
    questionText: document.getElementById('questionText'),
    choicesContainer: document.getElementById('choicesContainer'),
    continueButton: document.getElementById('continueButton'),
    sceneImage: document.getElementById('sceneImage'),
    feedbackMessage: document.getElementById('feedbackMessage')
};


function startDialogue() {
    const currentDialogue = dialogueData[currentDialogueIndex];
    if (!currentDialogue || !currentDialogue.npcText) return;

    const { npcText, context, question, choices, scene } = currentDialogue;
    resetUI();
    
    // Update scene image if it exists
    if (scene) elements.sceneImage.src = scene;
    
    // Display NPC text and add TTS
    elements.dialogueText.innerHTML = processChineseText(npcText);

    // Wait before displaying context
    setTimeout(() => {
        if (context) {
            elements.contextText.textContent = context;
            elements.contextText.style.fontStyle = 'italic';
        }

        // Wait before displaying the question
        setTimeout(() => {
            if (question) {
                elements.questionText.textContent = question;
                elements.questionText.style.fontWeight = 'bold';
                
                // Display choices if they exist
                if (choices?.length) {
                    displayChoices(choices);
                } else {
                    elements.continueButton.classList.remove('hidden');
                }
            } else {
                elements.continueButton.classList.remove('hidden');
            }
        }, 1000); // Delay for question appearance (1 second after context)
    }, 1000); // Delay for context appearance (1 second after NPC text)
}

// Process Chinese Text for TTS
function processChineseText(text) {
    const chineseRegex = /[\u4e00-\u9fa5]+/g;
    return text.replace(chineseRegex, match => `<span class="playable-text" onclick="playChinese('${match}')">${match}</span>`);
}

// Play Chinese Text with Web Speech API
function playChinese(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; // Use 'zh-TW' if you want traditional Taiwanese Mandarin
    utterance.rate = 0.8;

    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(voice => voice.lang.includes('zh'));
    if (chineseVoice) utterance.voice = chineseVoice;

    window.speechSynthesis.speak(utterance);
}

// Display Choices
function displayChoices(choices) {
    elements.choicesContainer.style.display = 'block';
    choices.forEach(({ id, text }) => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = `${id}. ${text}`;
        button.addEventListener('click', () => handleChoice(id));
        elements.choicesContainer.appendChild(button);
    });
}

// Handle Choice
function handleChoice(selectedId) {
    const currentDialogue = dialogueData[currentDialogueIndex];
    const { choices, feedback } = currentDialogue;

    const selectedChoice = choices.find(choice => choice.id === selectedId);
    const feedbackText = selectedChoice.correct
        ? feedback.correct
        : feedback.incorrect;

    elements.feedbackMessage.textContent = feedbackText;
    elements.feedbackMessage.style.display = 'block';
    elements.feedbackMessage.className = `feedback-message ${selectedChoice.correct ? 'correct' : 'incorrect'}`;

    // Hide choices and show continue button
    elements.choicesContainer.style.display = 'none';
    elements.continueButton.classList.remove('hidden');
}

// Reset UI for each dialogue
function resetUI() {
    elements.dialogueText.textContent = '';
    elements.contextText.textContent = '';
    elements.questionText.textContent = '';
    elements.choicesContainer.innerHTML = '';
    elements.feedbackMessage.textContent = '';
    elements.feedbackMessage.style.display = 'none';
    elements.continueButton.classList.add('hidden');
    elements.choicesContainer.style.display = 'none';
}

// Continue Dialogue
elements.continueButton.addEventListener('click', () => {
    currentDialogueIndex++;
    if (currentDialogueIndex >= dialogueData.length) {
        alert('Dialogue complete!');
        return;
    }
    startDialogue();
});
