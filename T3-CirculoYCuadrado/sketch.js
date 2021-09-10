const debug = false;

class Shape {
  constructor(x, y, drot, dpos, theta, r, drawFunc){
    this.x = x;
    this.y = y;
    this.drot = drot;
    this.rotDir = 1;
    this.rot = 0
    this.dpos = dpos;
    this.theta = theta;
    this.movement = p5.Vector.fromAngle(theta, dpos)
    this.r = r;
    this.d = r*2;
    this.drawFunc = drawFunc;
  }
  
  update(){
    let bounced = false;
    if(this.x-this.r<=0 || this.x+this.r>=width){
      this.movement.x*=-1;
      this.invertRotation();
      bounced = true;
    }
    if(this.y-this.r<=0 || this.y+this.r>=height){
      this.movement.y*=-1;
      this.invertRotation();
      bounced = true;
    }
    if(bounced && this.drawFunc == circle){
      setTimeout(() => this.growOrShrink(), 100);
    }
    
    this.x += this.movement.x;
    this.y += this.movement.y;
    
    push();
    translate(this.x, this.y);
    rotate(this.rot += this.drot*this.rotDir);
    this.drawFunc(0, 0, this.d);
    pop();
  }
  
  collide(collider){
    let distX = this.x-collider.x;
    let distY = this.y-collider.y;
    let dist = sqrt(distX**2 + distY**2);
    let minDist = this.r+collider.r;
    
          
    let angle = atan2(distY, distX);
    if(debug){
      //direction line
      push();
      stroke('red')
      translate(this.x, this.y);
      let deg = this.movement.angleBetween(createVector(1,0));
      rotate(degrees(-deg));
      line(0, 0, this.r, 0);
      pop();
      //collider line (direction of collider)
      push();
      stroke('blue')
      translate(this.x, this.y);
      rotate(angle);
      line(0, 0, -this.r, 0);
      pop();
    }
    
    if(dist<minDist){
      this.movement = p5.Vector.fromAngle(angle, this.movement.mag())
      collider.movement = p5.Vector.fromAngle(-angle, collider.movement.mag())
      this.invertRotation();
      if(this.drawFunc == circle){
        setTimeout(() => this.growOrShrink(), 100);
      }
    }
  }
  
  invertRotation(){
    this.drot = random(0,3);
    this.rotDir *= -1;
  }
  
  growOrShrink(){
    this.r = random(this.r*0.9, this.r*1.1);
    this.d = this.r*2;
  }
}

let cir;
let squ;


function setup() {
  createCanvas(720, 400);
  noStroke();
  angleMode(DEGREES);
  rectMode(CENTER);
  cir = new Shape(
    300,
    100,
    0,
    random(0,3),
    random(-180,180),
    60,
    circle
  );
  squ = new Shape(
    300,
    350,
    1,
    random(0,3),
    random(-180,180),
    25,
    square
  );
}

function draw() {
  background('silver');
  
  fill('white');
  cir.update();
  cir.collide(squ);
  
  fill('grey');
  squ.update()
  squ.collide(cir);

  
}