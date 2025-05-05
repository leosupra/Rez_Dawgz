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

function draw() {
  background(bg);

  for (let lane of lanes) {
    for (let car of lane) {
      car.y += car.speed;

      const carHeight = height * 0.1;

      if (car.speed > 0 && car.y > height) {
        car.y = -carHeight;
      }
      if (car.speed < 0 && car.y < -carHeight) {
        car.y = height;
      }

      image(car.img, car.x, car.y, width * 0.08, carHeight);
    }
  }
}
