let lion, rockImg, bgImg;
let lionX, lionY, lionSpeed = 13;
let score = 0;
let rocks = [];
let rockSpeed = 13;
let maxRocks = 3;
let gameOver = false;
let speedIncreaseTimer;
let myFont;
let canvas;
let bgMusic;
let gameStarted = false; 

function preload() {
  // Load assets - update paths to your actual files
  lion = loadImage('assets/1.chd');
  rockImg = loadImage('assets/2.chd');
  bgImg = loadImage('assets/3.chd');
  bgMusic = loadSound('assets/4.chd');
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  centerCanvas();
  background(0, 0, 0);
  textFont('Arial Black');
  textSize(24);
  
  // Initial lion position
  lionX = 20;
  lionY = height / 2 - 40;
  
  speedIncreaseTimer = millis();
}

function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function windowResized() {
  centerCanvas(); // Re-center when window is resized
}

function draw() {
  // Draw background
  image(bgImg, 0, 0, width, height);
  
  if (!gameStarted) {
    // Show start screen
    displayStartScreen();
  } else {
    if (!gameOver) {
      handleInput();
      updateGame();
      drawGame();
    } else {
      drawGameOver();
    }
  }
}

function displayStartScreen() {
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Soldier, are you ready to protect Leo ?", width * 0.5, height * 0.3);
  fill(255);
  text("Press SPACE to Start", width * 0.5, height * 0.9);
}

function handleInput() {
  if (keyIsDown(UP_ARROW) && lionY > 0) {
    lionY -= lionSpeed;
  }
  if (keyIsDown(DOWN_ARROW) && lionY < height - 80) {
    lionY += lionSpeed;
  }
}

function updateGame() {
  // Increase difficulty over time
  if (millis() - speedIncreaseTimer > 5000) {
    rockSpeed += 0.5;
    maxRocks = min(10, maxRocks + 1);
    speedIncreaseTimer = millis();
  }
  
  // Update rocks
  for (let i = rocks.length - 1; i >= 0; i--) {
    rocks[i].x -= rockSpeed;
    
    // Remove off-screen rocks
    if (rocks[i].x < -rocks[i].w) {
      rocks.splice(i, 1);
      score++;
    }
    // Collision detection
    else if (collision(rocks[i])) {
      gameOver = true;
    }
  }
  
  // Spawn new rocks
  if (random() < 0.05 && rocks.length < maxRocks) {
    spawnRock();
  }
}

function drawGame() {
  // Draw lion
  image(lion, lionX, lionY, 80, 80);
  
  // Draw rocks
  for (let rock of rocks) {
    image(rockImg, rock.x, rock.y, rock.w, rock.h);
  }
  // text
  fill(76, 187, 23);
  textAlign(LEFT, TOP);  // Align text to the top-left corner
  text(`Score: ${score}`, 10, 10); 
}

function drawGameOver() {
  fill(0);
  textAlign(CENTER);
  text(" soldier, You failed in your duty to protect Leo !", width * 0.5, height * 0.3);
  fill(76, 187, 23);
  text(`Your Score: ${score}`, width * 0.5, height * 0.6);
  fill(255);
  text("Press SPACE to Retry", width * 0.5, height * 0.9);
}

function keyPressed() {
  if (key === ' ' && !gameStarted) {
    gameStarted = true; // Start the game when space is pressed
    if (!bgMusic.isPlaying()) {
      bgMusic.loop();  // Start music on first user interaction
      bgMusic.setVolume(0.5);
    }
  }

  if (gameOver && key === ' ') {
    // Reset game state and restart
    score = 0;   // Reset score
    rocks = [];  // Clear all rocks
    lionY = height / 2 - 40;  // Reset lion position
    rockSpeed = 10; // Reset rock speed
    maxRocks = 3;  // Reset max rocks
    gameOver = false;  // Reset game over flag
    speedIncreaseTimer = millis(); // Reset timer  
  }
}

function spawnRock() {
  const w = random(40, 60);
  const h = random(40, 60);
  const y = random(height - h);
  rocks.push({
    x: width,
    y: y,
    w: w,
    h: h
  });
}

function collision(rock) {
  return (lionX < rock.x + rock.w &&
          lionX + 80 > rock.x &&
          lionY < rock.y + rock.h &&
          lionY + 80 > rock.y);
}
