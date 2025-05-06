function draw() {
  if (gameOver) {
    showGameOver();
    return;
  }

  background(bg);

  // render dog
  image(dog, dogX, dogY, dogSize, dogSize);

  // render doghouse
  const houseWidth = dogSize * 1.2;
  const houseHeight = dogSize * 1.2;
  const houseX = width - houseWidth - 20;
  const houseY = height / 2 - houseHeight / 2;
  image(doghouse, houseX, houseY, houseWidth, houseHeight);

  // check for win
  if (
    dogX + dogSize > houseX &&
    dogY + dogSize > houseY &&
    dogY < houseY + houseHeight
  ) {
    gameWon = true;
    console.log("You win!");
    return;
  }

  // draw and update cars
  for (let lane of lanes) {
    for (let car of lane.cars) {
      car.y += car.speed;

      const carHeight = height * 0.15;
      const carWidth = carHeight * (370 / 800);

      if (car.speed > 0 && car.y > height) {
        car.y = -random(carHeight, carHeight * 4);
      } else if (car.speed < 0 && car.y < -carHeight) {
        car.y = height + random(carHeight, carHeight * 4);
      }

      image(car.img, car.x, car.y, carWidth, carHeight);

      // Collision (with buffer)
      const buffer = 10;
      if (
        dogX + dogSize - buffer > car.x &&
        dogX + buffer < car.x + carWidth &&
        dogY + dogSize - buffer > car.y &&
        dogY + buffer < car.y + carHeight
      ) {
        gameOver = true;
        return;
      }
    }
  }

  handleInput();
}
