let startScreen;
let gameStarted = false;
let dog, doghouse, bg;
let cars = [];
let dogX, dogY, dogWidth, dogHeight, dogSpeed;
let houseX, houseY, houseWidth, houseHeight;
let gameOver = false;
let canvas;
let lanes = [];
let lanePercents = [0.137, 0.327, 0.416, 0.578, 0.737, 0.825];

let level = 1;
let levelIntro = true;
let levelStartTime = 0;
let showingWin = false;
let winDisplayStart = 0;

let dogFrames = {
  UP: [],
  DOWN: [],
  LEFT: [],
  RIGHT: [],
  STAND: null
};

let frameIndex = 0;
let frameTimer = 0;
const frameDelay = 10;

let currentDirection = null;

function preload() {
  startScreen = loadImage('assets/poster.jpg');
  doghouse = loadImage('assets/house.png');
  bg = loadImage('assets/background.jpg');

  dogFrames.UP[0] = loadImage('assets/up1.png');
  dogFrames.UP[1] = loadImage('assets/up2.png');
  dogFrames.DOWN[0] = loadImage('assets/down1.png');
  dogFrames.DOWN[1] = loadImage('assets/down2.png');
  dogFrames.LEFT[0] = loadImage('assets/left1.png');
  dogFrames.LEFT[1] = loadImage('assets/left2.png');
  dogFrames.RIGHT[0] = loadImage('assets/right1.png');
  dogFrames.RIGHT[1] = loadImage('assets/right2.png');
  dogFrames.STAND = loadImage('assets/stand.png');

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
    showLevelIntro();
    if (millis() - levelStartTime > 4000) {
      levelIntro = false;
    }
    return;
  }

  drawGamePlay();
}

function drawStartScreen() {
  imageMode(CORNER);
  image(startScreen, 0, 0, width, height);

  fill('#C0C0C0');
  stroke(0);
  strokeWeight(4);
  textAlign(CENTER, CENTER);
  textSize(64);
  text("The Hard Way", width / 2, height * 0.1);

  fill('#FFD700');
  stroke(0);
  strokeWeight(3);
  textSize(32);
  text("Press SPACE to Start", width / 2, height * 0.955);

  fill('#C0C0C0');
  stroke(0);
  textSize(12);
  textAlign(RIGHT, BOTTOM);
  text("Developed by LEO", width * 0.99, height * 0.98);
}

function drawGamePlay() {
  background(bg);

  const carHeight = height * 0.18;
  const carWidth = carHeight * (370 / 800);

  drawDog();
  updateAnimation();
  handleInput();

  image(doghouse, houseX, houseY, houseWidth, houseHeight);

  if (dogReachedHouse()) {
    showingWin = true;
    winDisplayStart = millis();
    return;
  }

  for (let lane of lanes) {
    for (let car of lane.cars) {
      car.y += car.speed;

      if (car.speed > 0 && car.y > height) {
        const minY = Math.min(...lane.cars.map(c => c.y));
        car.y = minY - random(carHeight, carHeight * 4);
      } else if (car.speed < 0 && car.y < -carHeight) {
        const maxY = Math.max(...lane.cars.map(c => c.y));
        car.y = maxY + random(carHeight, carHeight * 4);
      }

      push();
      if (car.dir) {
        translate(car.x + carWidth / 2, car.y + carHeight / 2);
        rotate(PI);
        imageMode(CENTER);
        image(car.img, 0, 0, carWidth, carHeight);
      } else {
        imageMode(CORNER);
        image(car.img, car.x, car.y, carWidth, carHeight);
      }
      pop();

      const padding = dogHeight * 0.1;
      if (
        dogX + padding < car.x + carWidth - padding &&
        dogX + dogWidth - padding > car.x + padding &&
        dogY + padding < car.y + carHeight - padding &&
        dogY + dogHeight - padding > car.y + padding
      ) {
        gameOver = true;
        return;
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
    frameIndex = 0;
    frameTimer = 0;
  }
}

function handleInput() {
  if (currentDirection === 'UP') dogY = max(0, dogY - dogSpeed);
  else if (currentDirection === 'DOWN') dogY = min(height - dogHeight, dogY + dogSpeed);
  else if (currentDirection === 'LEFT') dogX = max(0, dogX - dogSpeed);
  else if (currentDirection === 'RIGHT') dogX = min(width - dogWidth, dogX + dogSpeed);
}

function keyPressed() {
  if (!gameStarted && key === ' ') {
    gameStarted = true;
    startLevel();
    loop();
    return;
  }

  if (!currentDirection) {
    if (keyIsDown(UP_ARROW)) currentDirection = 'UP';
    else if (keyIsDown(DOWN_ARROW)) currentDirection = 'DOWN';
    else if (keyIsDown(LEFT_ARROW)) currentDirection = 'LEFT';
    else if (keyIsDown(RIGHT_ARROW)) currentDirection = 'RIGHT';
  }
}

function keyReleased() {
  if ((keyCode === UP_ARROW && currentDirection === 'UP') ||
      (keyCode === DOWN_ARROW && currentDirection === 'DOWN') ||
      (keyCode === LEFT_ARROW && currentDirection === 'LEFT') ||
      (keyCode === RIGHT_ARROW && currentDirection === 'RIGHT')) {
    currentDirection = null;
  }
}

function startLevel() {
  dogHeight = height * 0.15;
  dogWidth = (257 / 463) * dogHeight;
  dogSpeed = height * 0.0033;
  dogX = 20;
  dogY = height / 2 - dogHeight / 2;

  houseWidth = height * 0.16;
  houseHeight = houseWidth * (381 / 500);
  houseX = width * 0.997 - houseWidth;
  houseY = random(0, height - houseHeight);

  const carHeight = height * 0.3;
  const carWidth = carHeight * (370 / 800);
  const lanesCount = 6;
  lanes = [];

  for (let i = 0; i < lanesCount; i++) {
    const laneX = lanePercents[i] * width;
    const goingDown = i % 2 === 0;
    let baseSpeed = height * 0.003 * Math.pow(1.1, level - 1);
    if ([1, 2, 4, 5].includes(i)) baseSpeed *= 1.3;
    baseSpeed *= goingDown ? 1 : -1;

    let carsInLane = [];
    let currentY = goingDown ? -random(carHeight, carHeight * 4) : height + random(carHeight, carHeight * 4);
    let maxCars = 20;

    while ((goingDown && currentY < height * 2) || (!goingDown && currentY > -height)) {
      carsInLane.push({
        x: laneX,
        y: currentY,
        speed: baseSpeed,
        img: random(cars),
        dir: goingDown
      });

      const gap = random(carHeight, carHeight * 4);
      currentY += goingDown ? gap : -gap;
      if (--maxCars <= 0) break;
    }

    lanes.push({ cars: carsInLane });
  }

  levelIntro = true;
  levelStartTime = millis();
  loop();
}

function dogReachedHouse() {
  return (
    dogX < houseX + houseWidth &&
    dogX + dogWidth > houseX &&
    dogY < houseY + houseHeight &&
    dogY + dogHeight > houseY
  );
}

function showGameOver() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(height * 0.1);
  text("Game Over", width / 2, height / 2);
  noLoop();
}

function showWin() {
  background(0);
  fill('#00FF00');
  textAlign(CENTER, CENTER);
  textSize(height * 0.1);
  text("You Win!", width / 2, height / 2);
}

function showLevelIntro() {
  background(0, 200);
  fill('#FFD700');
  textAlign(CENTER, CENTER);
  textSize(height * 0.1);
  text(`Level ${level}`, width / 2, height / 2);
}
