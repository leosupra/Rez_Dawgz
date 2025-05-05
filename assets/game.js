let dog, doghouse, bg;
let cars = [];
let gameWon = false;
let dogX, dogY;
let speedIncreaseTimer;
let canvas;
let lanes = [];
let lanePercents = [ 0.137, 0.327, 0.416, 0.578, 0.737, 0.825 ];

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

  dogX = 20;
  dogY = height / 2 - 40;

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
    let currentY = goingDown ? -random(carHeight * 1, carHeight * 4) : height + random(carHeight * 1, carHeight * 4);
    let maxCars = 20;

    while ((goingDown && currentY < height * 2) || (!goingDown && currentY > -height)) {
      carsInLane.push({
        x: laneX,
        y: currentY,
        speed: baseSpeed,
        img: random(cars),
        dir: goingDown
      });

      const gap = random(carHeight * 1, carHeight * 4);
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
  background(bg);

  const carHeight = height * 0.15;
  const carWidth = carHeight * (370 / 800);

  for (let lane of lanes) {
  for (let car of lane.cars) {
    car.y += car.speed;

    if (car.speed > 0 && car.y > height) {
      const minY = Math.min(...lane.cars.map(c => c.y));
      const gap = random(carHeight, carHeight * 4);
      car.y = minY - gap;
    }
    else if (car.speed < 0 && car.y < -carHeight) {
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
    }
  }
}
