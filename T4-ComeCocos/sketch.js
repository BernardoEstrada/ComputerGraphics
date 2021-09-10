const DEBUG = false;
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;
const KEY_Z = 90;
const SPACE = 32;

let x,
    y,
    speed,
    angle,
    rad,
    cScale,
    maxScale,
    minScale,
    actualRad,
    scaleSpeed,
    scaleSpeedPix,
    score,
    lastSpawn,
    enemies,
    lockSpin;

class enemy{
  constructor(x, y, rad) {
    this.x = x;
    this.y = y;
    this.rad = rad;
  }
  draw() {
    push();
    fill('red');
    ellipse(this.x, this.y, this.rad, this.rad);
    pop();
  }
  collide(x, y, rad) {
    let d = dist(this.x, this.y, x, y);
    if (d < this.rad + rad) {
      return true;
    } else {
      return false;
    }
  }
}

function setup() {
  createCanvas(848, 480);
  noStroke();
  angleMode(DEGREES);
  rectMode(CENTER);

  x = width / 2;
  y = height / 2;
  speed = 5;
  angle = 0;
  rad = 15;
  cScale = 1;
  maxScale = 1;
  minScale = 1/3;
  actualRad = rad * cScale;
  scaleSpeed = 0.1;
  scaleSpeedPix = rad * scaleSpeed;
  score = 0;
  lockSpin = false;

  enemies = [];

  enemies.push(new enemy(300, 200, 10));
  lastSpawn = millis();
}

async function draw() {
  background("silver");

  move();
  if(!lockSpin){
    turn();
  }
  // resize();
  
  spawnEnemies({delay: 3, limit: 5});

  for(let i = 0; i < enemies.length; i++) {
    enemies[i].draw();
    if (enemies[i].collide(x, y, actualRad)){
      enemies.splice(i, 1)
      score += 1;
      cScale += 0.1;
      actualRad = rad * cScale;
      await spin360();
      console.log(score);
    }
  }

  push();
  translate(x, y);
  scale(cScale);
  rotate(angle);
  circle(0, 0, rad*2);
  stroke("black");
  line(0, 0, rad, 0);
  pop();
}
function keyTyped() {
  if (key === " " || key === "z") {
    resize();
  }
  if (key === 'r') {
    setup();
  }
}


function checkKeys(...keys){
  if (keyIsPressed){ //prevents checking what key is pressed when no key is pressed
    for (let i = 0; i < keys.length; i++) {
      if (keyIsDown(keys[i])) {
        return true;
      }
    }
  }
  return false;
}

function move() {
  //move on keypress
  if (checkKeys(LEFT_ARROW, KEY_A) && x - actualRad > 0) {
    x -= speed;
  }
  if (checkKeys(RIGHT_ARROW, KEY_D) && x + actualRad < width) {
    x += speed;
  }
  if (checkKeys(UP_ARROW, KEY_W) && y - actualRad > 0) {
    y -= speed;
  }
  if (checkKeys(DOWN_ARROW, KEY_S) && y + actualRad < height) {
    y += speed;
  }
  //check for discrepancy (when scaling)
  if (x - actualRad <= -1)    { x += scaleSpeedPix; }
  if (x + actualRad > width)  { x -= scaleSpeedPix; }
  if (y - actualRad <= -1)    { y += scaleSpeedPix; }
  if (y + actualRad > height) { y -= scaleSpeedPix; }
}

function turn() {
  if (keyIsPressed) {
    let dx = 0,
      dy = 0;

    if (checkKeys(LEFT_ARROW, KEY_A)) {
      dx -= 1;
    }
    if (checkKeys(RIGHT_ARROW, KEY_D)) {
      dx += 1;
    }
    if (checkKeys(UP_ARROW, KEY_W)) {
      dy -= 1;
    }
    if (checkKeys(DOWN_ARROW, KEY_S)) {
      dy += 1;
    }
    angle = dx || dy ? atan2(dy, dx) : angle;
  }
}

function resize(){
  if (checkKeys(KEY_Z, SPACE) && cScale > minScale) {
    cScale -= scaleSpeed;
    actualRad = rad * cScale;
  } else if (!checkKeys(KEY_Z, SPACE) && cScale < maxScale) {
    cScale += scaleSpeed;
    actualRad = rad * cScale;
  }
}

function spawnEnemies(
  {
    overlapEnemies = false,
    overlapPlayer = false,
    pDistance = 30,
    delay = 3,
    limit = 0
  } = {}
) {
  //choose a random spawn point for the enemy without overlapping with the player or other enemies
  if (millis() - lastSpawn > delay * 1000) {
    let spawnX = random(0, width);
    let spawnY = random(0, height);
    let spawnRad = 10;
    let spawn = true;
    if (!overlapEnemies) {
      for (let i = 0; i < enemies.length; i++) {
        if (
          dist(spawnX, spawnY, enemies[i].x, enemies[i].y) <
          spawnRad + enemies[i].rad
        ) {
          spawn = false;
        }
      }
    }
    if (!overlapPlayer) {
      if (dist(spawnX, spawnY, x, y) < spawnRad + actualRad + pDistance) {
        spawn = false;
      }
    }

    if (spawn && (enemies.length < limit || limit === 0)) {
      enemies.push(new enemy(spawnX, spawnY, spawnRad));
      lastSpawn = millis();
    }
  }
}

async function spin360() {
  reverse = random() > 0.5;
  let oldAngle = angle;
  lockSpin = true;
  for (let i = 0; abs(i) <= 360; i+=reverse?3:-3) {
    angle = oldAngle + i;
    await new Promise(resolve => setTimeout(resolve, 1));
  }
  angle = oldAngle;
  lockSpin = false;
}