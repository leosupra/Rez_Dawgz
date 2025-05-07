let dog, doghouse, bg;
let cars = [];
let gameWon = false;
let gameOver = false;
let dogX, dogY, dogSpeed;
let speedIncreaseTimer;
let canvas;
let lanes = [];
let lanePercents = [0.137, 0.327, 0.416, 0.578, 0.737, 0.825];
let dogWidth, dogHeight;

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

function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  centerCanvas();
  background(0);
  textFont('Arial Black');
  textSize(24);

  dogHeight = height * 0.15; 
  dogWidth = (257 / 463) * dogHeight; 

  dogSpeed = height * 0.0025;
  dogX = 20;
  dogY = height / 2 - dogHeight / 2; 

  speedIncreaseTimer = millis();

  const carHeight = height * 0.22;
  const carWidth = carHeight * (370 / 800);
  const lanesCount = 6;
  lanes = [];

  for (let i = 0; i < lanesCount; i++) {
    const laneX = lanePercents[i] * width;
    const goingDown = i % 2 === 0;
    let baseSpeed = height * 0.003;
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

    lanes.push({ cars: carsInLane, lastRespawnY: goingDown ? -carHeight : height });
  }
}

function draw() {
  if (gameOver) {
    showGameOver();
    return;
  }
  if (gameWon) {
    showWin();
    return;
  }

  background(bg);

  const carHeight = height * 0.15;
  const carWidth = carHeight * (370 / 800);

  drawDog();
  updateAnimation();

  const houseWidth = 100;
  const houseHeight = 100;
  const houseX = width - houseWidth - 20;
  const houseY = height / 2 - houseHeight / 2;
  image(doghouse, houseX, houseY, houseWidth, houseHeight);

  if (
    dogX < houseX + houseWidth &&
    dogX + dogWidth > houseX &&
    dogY < houseY + houseHeight &&
    dogY + dogHeight > houseY
  ) {
    gameWon = true;
    noLoop();
  }

  handleInput();

  for (let lane of lanes) {
    for (let car of lane.cars) {
      car.y += car.speed;

      if (car.speed > 0 && car.y > height) {
        const minY = Math.min(...lane.cars.map(c => c.y));
        const gap = random(carHeight, carHeight * 4);
        car.y = minY - gap;
      } else if (car.speed < 0 && car.y < -carHeight) {
        const maxY = Math.max(...lane.cars.map(c => c.y));
        const gap = random(carHeight, carHeight * 4);
        car.y = maxY + gap;
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

      const padding = dogHeight * 0.15;
      if (
        dogX + padding < car.x + carWidth - padding &&
        dogX + dogWidth - padding > car.x + padding &&
        dogY + padding < car.y + carHeight - padding &&
        dogY + dogHeight - padding > car.y + padding
      ) {
        showGameOver();
        noLoop();
        return;
      }
    }
  }
}

function drawDog() {
  if (!currentDirection) {
    image(dogFrames.STAND, dogX, dogY, dogWidth, dogHeight); 
  } else {
    let frames = dogFrames[currentDirection];
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
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(height * 0.1);
  text("You Win!", width / 2, height / 2);
  noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerCanvas();
}
