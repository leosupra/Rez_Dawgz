let dog, doghouse, bg;
let cars = [];
let gameWon = false;
let dogX, dogY;
let speedIncreaseTimer;
let canvas;
let lanes = [];

function preload() {
  dog = loadImage('assets/rez.png');
  doghouse = loadImage('assets/house.png');
  bg = loadImage('assets/background.jpg');

  for (let i = 1; i <= 4; i++) {
    cars.push(loadImage(`assets/car${i}.jpg`));
  }
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  centerCanvas();
  background(0, 0, 0);
  textFont('Arial Black');
  textSize(24);
  
  // Initial Dog position
  dogX = 20;
  dogY = height / 2 - 40;
  
  speedIncreaseTimer = millis();

  const carsPerLane = 3;
  const carHeight = height * 0.1;
  const spacing = carHeight * 1.8;

  for (let i = 0; i < 6; i++) {
    const laneX = (0.1 + i * 0.13) * width;
    const goingDown = i % 2 === 0;
    const laneCars = [];

    for (let j = 0; j < carsPerLane; j++) {
      const baseY = goingDown
        ? -j * spacing
        : height + j * spacing;

      laneCars.push({
        x: laneX,
        y: baseY,
        speed: random(2, 4) * (goingDown ? 1 : -1),
        img: cars[i % cars.length],
        dir: goingDown
      });
    }

    lanes.push(laneCars);
  }
}

function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function draw() {
  background(bg);

  for (let lane of lanes) {
    for (let car of lane) {
      car.y += car.speed;

      const carHeight = height * 0.2;
      const carWidth = carHeight * (370 / 800); // exact ratio of your image

      // Wrap car vertically
      if (car.speed > 0 && car.y > height) {
        car.y = -carHeight;
      }
      if (car.speed < 0 && car.y < -carHeight) {
        car.y = height;
      }

      push(); // Save transformation state

      if (car.dir) {
        // Top-down (need 180° rotation)
        translate(car.x + carWidth / 2, car.y + carHeight / 2);
        rotate(PI);
        imageMode(CENTER);
        image(car.img, 0, 0, carWidth, carHeight);
      } else {
        // Bottom-up (normal)
        imageMode(CORNER);
        image(car.img, car.x, car.y, carWidth, carHeight);
      }

      pop(); // Restore state
    }
  }
}

