let dog, doghouse, bg;
let cars = [];
let gameWon = false;
let dogX, dogY;
let dogSize, dogSpeed = 5;
let speedIncreaseTimer;
let canvas;
let lanes = [];
let lanePercents = [0.137, 0.327, 0.416, 0.578, 0.737, 0.825];

function preload() {
  dog = loadImage('assets/rez.png');
  doghouse = loadImage('assets/house.png');
  bg = loadImage('assets/background.jpg');

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
  background(0, 0, 0);
  textFont('Arial Black');
  textSize(24);

  dogSize = height * 0.1;
  dogX = 20;
  dogY = height / 2 - dogSize / 2;

  speedIncreaseTimer = millis();

  const carHeight = height * 0.15;
  const carWidth = carHeight * (370 / 800);
  const lanesCount = 6;
  lanes = [];

  for (let i = 0; i < lanesCount; i++) {
    const laneX = lanePercents[i] * width;
    const goingDown = i % 2 === 0;
    let baseSpeed = 2;
    if ([1, 2, 4, 5].includes(i)) {
      baseSpeed *= 1.3;
    }
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

    lanes.push({
      cars: carsInLane,
      lastRespawnY: goingDown ? -carHeight : height
    });
  }
}

function draw() {
  if (gameOver) {
    showGameOver(); // Keep drawing the black screen
    return;
  }

  if (gameWon) return;

  background(bg);

  const carHeight = height * 0.15;
  const carWidth = carHeight * (370 / 800);

  image(dog, dogX, dogY, dogSize, dogSize);

  const houseWidth = dogSize * 1.2;
  const houseHeight = dogSize * 1.2;
  const houseX = width - houseWidth - 20;
  const houseY = height / 2 - houseHeight / 2;
  image(doghouse, houseX, houseY, houseWidth, houseHeight);

  if (
    dogX + dogSize > houseX &&
    dogY + dogSize > houseY &&
    dogY < houseY + houseHeight
  ) {
    gameWon = true;
    console.log("You win!");
    return;
  }

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

      // Draw car
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

      // Collision detection
      const padding = dogSize * 0.15;
      if (
        dogX + padding < car.x + carWidth - padding &&
        dogX + dogSize - padding > car.x + padding &&
        dogY + padding < car.y + carHeight - padding &&
        dogY + dogSize - padding > car.y + padding
      ) {
        gameOver = true;
        return; // Skip drawing anything else, next frame will show game over
      }
    }
  }

  handleInput();
}


function showGameOver() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(height * 0.1);
  text("Game Over", width / 2, height / 2);
}
