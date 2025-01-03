<?php 
session_start();
include("connect.php"); // Added missing semicolon
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="page2.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Sour+Gummy:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <title>Select Level</title>
</head>
<body>
    <nav>
        <div class="nav_content">
            <div class="my_logo"><a href="#">Cultural Mosaic</a></div>
            <div class="home">
                <img id="home_image" src="photos/account.png" alt="">
                <a href="#">Home</a>
            </div>
            <div class="card">
                <img id="card_image" src="photos/card.png" alt="">
                <a href="flashcard1.html">Flash Card</a>
            </div>
            <div class="quiz">
                <img id="quiz_image" src="photos/quiz.png" alt="">
                <a href="quiz1.html">Quiz</a>
            </div>
            <div class="game">
                <img id="game_image" src="photos/game.png" alt="">
                <a href="game.php">Game</a>
            </div>
            <div class="logout">
                <img id="logout_image" src="photos/logout.png" alt="">
                <a href="logout.php">Log out</a>
            </div>
            <div class="return">
                <a href="page1.php">Return</a>
            </div>
        </div>
    </nav>
    <div class="container">
        <div class="content">
            <img id="image" src="photos/backgroundpage2.png" alt="">
        </div>
    </div>

    <script>
        window.embeddedChatbotConfig = {
        chatbotId: "upzNOO-jH7jMR1l5yLCyX",
        domain: "www.chatbase.co"
        }
        </script>
        <script
        src="https://www.chatbase.co/embed.min.js"
        chatbotId="upzNOO-jH7jMR1l5yLCyX"
        domain="www.chatbase.co"
        defer>
        </script>

    <div>
        <button style="top: 345px; left: 373px;" onclick="alert('Level 5 not available yet')">Start</button>
        <button style="top: 320px; left: 525px;" onclick="location.href='1.html'">1</button>
        <button style="top: 500px; left: 440px;" onclick="alert('Level 2 not available yet')">2</button>
        <button style="top: 640px; left: 650px;" onclick="alert('Level 3 not available yet')">3</button>
        <button style="top: 740px; left: 500px;" onclick="alert('Level 4 not available yet')">4</button>
        <button style="top: 840px; left: 570px;" onclick="alert('Level 4 not available yet')">5</button>
        
    </div>


</body>
</html>
