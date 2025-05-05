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
  
  dogX = 20;
  dogY = height / 2 - 40;
  
  speedIncreaseTimer = millis();

  const carHeight = height * 0.1;
  const carWidth = carHeight * (370 / 800);
  const lanesCount = 6;
  lanes = [];
  
  for (let i = 0; i < lanesCount; i++) {
    const laneX = (0.1 + i * 0.13) * width;
    const goingDown = i % 2 === 0;
    const laneCars = [];
  
    let baseSpeed = 2;
    if ([1, 2, 4, 5].includes(i)) {
      baseSpeed *= 1.3;
    }
    baseSpeed *= goingDown ? 1 : -1;
  
    let currentY = goingDown ? -random(carHeight * 3, carHeight * 8) : height + random(carHeight * 3, carHeight * 8);
    let maxCars = 20; // Prevent infinite loop just in case
  
    while ((goingDown && currentY < height * 2) || (!goingDown && currentY > -height)) {
      laneCars.push({
        x: laneX,
        y: currentY,
        speed: baseSpeed,
        img: cars[i % cars.length],
        dir: goingDown
      });
  
      const gap = random(carHeight * 3, carHeight * 8);
      currentY += goingDown ? gap : -gap;
  
      if (--maxCars <= 0) break; // failsafe
    }
  
    lanes.push(laneCars);
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
      const carWidth = carHeight * (370 / 800); 

      if (car.speed > 0 && car.y > height) {
        car.y = -carHeight;
      }
      if (car.speed < 0 && car.y < -carHeight) {
        car.y = height;
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



