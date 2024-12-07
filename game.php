<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Flags Game</title>
    <!-- Google Fonts -->
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
      rel="stylesheet"
    />
    <!-- Stylesheet -->
    <link rel="stylesheet" href="game.css" />
  </head>
  <body>
    <div class="container">
      <h3>Drag & Drop The Photos Over Their Respective Words</h3>
      <div class="draggable-objects"></div>
      <div class="drop-points"></div>
    </div>
    <div class="controls-container">
      <p id="result"></p>
      <button id="start">Start Game</button>
    </div>
    <!-- Script -->
    <script src="game.js"></script>
  </body>
</html>