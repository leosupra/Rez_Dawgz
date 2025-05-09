let startScreen;
let gameStarted = false;
let dog, doghouse, bg;
let cars = [];
let dogX, dogY, dogWidth, dogHeight, dogSpeed;
let houseX, houseY, houseWidth, houseHeight;
let gameOver = false;
let gameOverScreen;
let canvas;
let lanes = [];
let lanePercents = [0.137, 0.327, 0.416, 0.578, 0.737, 0.825];
let carHeight;

let level = 1;
let levelIntro = true;
let levelStartTime = 0;
let showingWin = false;
let winDisplayStart = 0;

let dogFrames = { UP: [], DOWN: [], LEFT: [], RIGHT: [], STAND: null };
let frameIndex = 0;
let frameTimer = 0;
const frameDelay = 10;
let currentDirection = null;

function preload() {
  startScreen = loadImage('assets/poster.jpg');
  gameOverScreen = loadImage('assets/gameover.jpg');
  doghouse    = loadImage('assets/house.png');
  bg          = loadImage('assets/background.jpg');

  dogFrames.UP[0]    = loadImage('assets/up1.png');
  dogFrames.UP[1]    = loadImage('assets/up2.png');
  dogFrames.DOWN[0]  = loadImage('assets/down1.png');
  dogFrames.DOWN[1]  = loadImage('assets/down2.png');
  dogFrames.LEFT[0]  = loadImage('assets/left1.png');
  dogFrames.LEFT[1]  = loadImage('assets/left2.png');
  dogFrames.RIGHT[0] = loadImage('assets/right1.png');
  dogFrames.RIGHT[1] = loadImage('assets/right2.png');
  dogFrames.STAND    = loadImage('assets/stand.png');

  for (let i = 1; i <= 4; i++) {
    cars.push(loadImage(`assets/car${i}.jpg`));
  }
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  centerCanvas();
  textFont('Arial Black');
  textSize(24);
  noLoop();
}

function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function respawnCar(car, lane) {
  const maxMultiplier = 4;
  const gap = random(carHeight * 0.5, carHeight * maxMultiplier) * car.speedFactor;
  const isMovingDown = car.speed > 0;

  let referenceY;

  if (isMovingDown) {
    referenceY = Math.min(...lane.cars.map(c => c.y));
    car.y = referenceY - carHeight - gap;
  } else {
    referenceY = Math.max(...lane.cars.map(c => c.y));
    car.y = referenceY + carHeight + gap;
  }
}

function updateCarsOnly() {
  for (let lane of lanes) {
    for (let car of lane.cars) {
      car.y += car.speed;
      if ((car.speed > 0 && car.y > height) || (car.speed < 0 && car.y < -carHeight)) {
        respawnCar(car, lane);
      }
    }
  }
}

function draw() {
  if (!gameStarted) {
    drawStartScreen();
    return;
  }
  if (gameOver) {
    showGameOver();
    return;
  }
  if (showingWin) {
    showWin();
    if (millis() - winDisplayStart > 3000) {
      level++;
      showingWin = false;
      startLevel();
    }
    return;
  }
  if (levelIntro) {
    updateCarsOnly();
    showLevelIntro();
    if (millis() - levelStartTime > 3000) {
      levelIntro = false;
    }
    return;
  }
  drawGamePlay();
}

function drawStartScreen() {
  imageMode(CORNER);
  image(startScreen, 0, 0, width, height);
  fill('#C0C0C0'); stroke(0); strokeWeight(4);
  textAlign(CENTER, CENTER); textSize(64);
  text("The Hard Way", width/2, height*0.1);
  fill('#FFD700'); stroke(0); strokeWeight(3);
  textSize(32);
  text("Press SPACE to Start", width/2, height*0.955);
  fill('#C0C0C0'); stroke(0); textSize(12);
  textAlign(RIGHT, BOTTOM);
  text("Developed by LEO", width*0.99, height*0.98);
}

function drawGamePlay() {
  background(bg);
  const carWidth = carHeight * (370 / 800);
  drawDog();
  updateAnimation();
  handleInput();
  image(doghouse, houseX, houseY, houseWidth, houseHeight);
  if (dogReachedHouse()) {
    showingWin      = true;
    winDisplayStart = millis();
    return;
  }
  for (let lane of lanes) {
    for (let car of lane.cars) {
      car.y += car.speed;
      if ((car.speed > 0 && car.y > height) || (car.speed < 0 && car.y < -carHeight)) {
        respawnCar(car, lane);
      }
      push();
      if (car.dir) {
        translate(car.x + carWidth/2, car.y + carHeight/2);
        rotate(PI);
        imageMode(CENTER);
        image(car.img, 0, 0, carWidth, carHeight);
      } else {
        imageMode(CORNER);
        image(car.img, car.x, car.y, carWidth, carHeight);
      }
      pop();
      const pad = dogHeight * 0.1;
      if (
        dogX + pad < car.x + carWidth - pad &&
        dogX + dogWidth - pad > car.x + pad &&
        dogY + pad < car.y + carHeight - pad &&
        dogY + dogHeight - pad > car.y + pad
      ) {
        gameOver = true;
      }
    }
  }
}

function drawDog() {
  if (!currentDirection) {
    image(dogFrames.STAND, dogX, dogY, dogWidth, dogHeight);
  } else {
    const frames = dogFrames[currentDirection];
    image(frames[frameIndex], dogX, dogY, dogWidth, dogHeight);
  }
}

function updateAnimation() {
  if (currentDirection) {
    frameTimer++;
    if (frameTimer >= frameDelay) {
      frameIndex = (frameIndex + 1) % 2;
      frameTimer = 0;
    }
  } else {
    frameIndex = 0; frameTimer = 0;
  }
}

function handleInput() {
  if (currentDirection === 'UP')       dogY = max(0, dogY - dogSpeed);
  else if (currentDirection === 'DOWN')dogY = min(height - dogHeight, dogY + dogSpeed);
  else if (currentDirection === 'LEFT')dogX = max(0, dogX - dogSpeed);
  else if (currentDirection === 'RIGHT')dogX = min(width - dogWidth, dogX + dogSpeed);
}

function keyPressed() {

  if (key === ' ' && !gameStarted && !gameOver) {
    gameStarted = true;
    gameOver    = false;
    showingWin  = false;
    level       = 1;
    lanes       = [];
    startLevel();
    loop();
    return;
  }

  if (gameOver && keyCode === ENTER) {
    gameStarted = false;
    gameOver    = false;
    showingWin  = false;
    levelIntro  = true;
    level       = 1;
    noLoop(); 
    return;
  }

  if (!currentDirection) {
    if (keyIsDown(UP_ARROW))       currentDirection = 'UP';
    else if (keyIsDown(DOWN_ARROW))currentDirection = 'DOWN';
    else if (keyIsDown(LEFT_ARROW))currentDirection = 'LEFT';
    else if (keyIsDown(RIGHT_ARROW))currentDirection = 'RIGHT';
  }
}


function keyReleased() {
  if ((keyCode === UP_ARROW    && currentDirection === 'UP')    ||
      (keyCode === DOWN_ARROW  && currentDirection === 'DOWN')  ||
      (keyCode === LEFT_ARROW  && currentDirection === 'LEFT')  ||
      (keyCode === RIGHT_ARROW && currentDirection === 'RIGHT')) {
    currentDirection = null;
  }
}

function startLevel() {
  dogHeight = height * 0.15;
  dogWidth  = (257 / 463) * dogHeight;
  dogSpeed  = height * 0.0033;
  dogX      = 20;
  dogY      = height/2 - dogHeight/2;
  houseWidth  = height * 0.16;
  houseHeight = houseWidth * (381/500);
  houseX      = width*0.997 - houseWidth;
  houseY      = random(0, height - houseHeight);
  const lanesCount  = lanePercents.length;
  const speedFactor = Math.pow(1.1, level - 1);
  carHeight = height * 0.18;
  lanes     = [];
  for (let i = 0; i < lanesCount; i++) {
    const laneX     = lanePercents[i] * width;
    const goingDown = (i % 2 === 0);
    let baseSpeed   = height * 0.003 * speedFactor;
    if ([1,2,4,5].includes(i)) baseSpeed *= 1.3;
    baseSpeed *= goingDown ? 1 : -1;
    let carsInLane = [];
    let currentY   = goingDown
                   ? -random(carHeight*2, carHeight*4)*speedFactor
                   :  height+random(carHeight*2, carHeight*4)*speedFactor;
    for (let c = 0; c < 20; c++) {
      carsInLane.push({
        x: laneX,
        y: currentY,
        speed: baseSpeed,
        img: random(cars),
        dir: goingDown,
        speedFactor
      });
      const gap = random(carHeight*2, carHeight*4)*speedFactor;
      currentY += goingDown ? gap : -gap;
    }
    lanes.push({ cars: carsInLane });
  }
  const introMs = 3000;
  const fps     = frameRate() > 0 ? frameRate() : 60;
  const steps   = Math.ceil((introMs/1000) * fps);
  for (let i = 0; i < steps; i++) {
    updateCarsOnly();
  }
  levelIntro     = true;
  levelStartTime = millis();
  loop();
}

function dogReachedHouse() {
  return (
    dogX < houseX+houseWidth &&
    dogX+dogWidth > houseX &&
    dogY < houseY+houseHeight &&
    dogY+dogHeight > houseY
  );
}

function showGameOver() {
  imageMode(CORNER);
  image(gameOverScreen, 0, 0, width, height); 

  fill('#FF3B3B');
  textAlign(CENTER, CENTER);
  textSize(48);
  text(`Game Over ! You reached Level ${level}`, width / 2, height * 0.1);
  fill(255)
  textSize(24);
  text("Press ENTER to return to Main Menu", width / 2, height * 0.95);
}



function showWin() {
  background(0);
  fill('#00FF00');
  textAlign(CENTER, CENTER);
  textSize(height * 0.1);
  text("You Win!", width/2, height/2);
}

function showLevelIntro() {
  background(0, 200);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(height * 0.08);
  text(`Level ${level}`, width/2, height/2);
}
