 // Function to redirect the user to the flashcards page when clicking "Enter" on Level 1
 function startLevel() {
    window.location.href = "level1.html"; // Redirect to flashcards page
  }

  function handleLevelClick(levelId) {
    const button = document.querySelector(`.level-button:nth-child(${levelId})`);
    
    if (button.classList.contains('level-active')) {
        // Redirect to different pages based on level
        switch(levelId) {
            case 1:
                window.location.href = "level1.html";
                break;
            case 2:
                window.location.href = "level2.html";
                break;
            case 3:
                window.location.href = "level3.html";
                break;
            case 4:
                window.location.href = "level4.html";
                break;
        }
        
        button.classList.remove('level-active');
        button.classList.add('level-completed');
        
        const nextButton = document.querySelector(`.level-button:nth-child(${levelId + 1})`);
        if (nextButton) {
            nextButton.classList.remove('level-locked');
            nextButton.classList.add('level-active');
        }
    } else if (button.classList.contains('level-locked')) {
        alert("This level is locked! Complete the previous level first.");
    }
}