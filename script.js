const axeImg = new Image();
axeImg.src =
  'https://stackblitz.com/storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd1N3RHc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--2ef11198d16b70d1b07810aa0beb886a9260dd64/hatchet.png';
const invertAxeImg = new Image();
invertAxeImg.src =
  'https://stackblitz.com/storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMHF3RHc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--be53297481e28b22221acdea1c07577731738509/image.png';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';

let scrollX = 0;
let scrollY = 0;

let mouseX = 0;
let mouseY = 0;

let frame = 0;

let objects = [];
let trees = [];

const inputs = {
  up: 0,
  down: 0,
  left: 0,
  right: 0,
  shift: 0,
  space: 0,
  click: 0,
};

function Vector2(x, y) {
  this.x = x === undefined ? 0 : x;
  this.y = y === undefined ? 0 : y;
}

Vector2.prototype = {
  set: function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
  },

  clone: function () {
    return new Vector2(this.x, this.y);
  },

  add: function (vector) {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  },

  subtract: function (vector) {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  },

  scale: function (scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  },

  dot: function (vector) {
    return this.x * vector.x + this.y + vector.y;
  },

  moveTowards: function (vector, t) {
    // Linearly interpolates between vectors A and B by t.
    // t = 0 returns A, t = 1 returns B
    t = Math.min(t, 1); // still allow negative t
    var diff = vector.subtract(this);
    return this.add(diff.scale(t));
  },

  magnitude: function () {
    return Math.sqrt(this.magnitudeSqr());
  },

  magnitudeSqr: function () {
    return this.x * this.x + this.y * this.y;
  },

  distance: function (vector) {
    return Math.sqrt(this.distanceSqr(vector));
  },

  distanceSqr: function (vector) {
    var deltaX = this.x - vector.x;
    var deltaY = this.y - vector.y;
    return deltaX * deltaX + deltaY * deltaY;
  },

  normalize: function () {
    var mag = this.magnitude();
    var vector = this.clone();
    if (Math.abs(mag) < 1e-9) {
      vector.x = 0;
      vector.y = 0;
    } else {
      vector.x /= mag;
      vector.y /= mag;
    }
    return vector;
  },

  angle: function () {
    return Math.atan2(this.y, this.x);
  },

  rotate: function (alpha) {
    var cos = Math.cos(alpha);
    var sin = Math.sin(alpha);
    var vector = new Vector2();
    vector.x = this.x * cos - this.y * sin;
    vector.y = this.x * sin + this.y * cos;
    return vector;
  },

  toPrecision: function (precision) {
    var vector = this.clone();
    vector.x = vector.x.toFixed(precision);
    vector.y = vector.y.toFixed(precision);
    return vector;
  },

  toString: function () {
    var vector = this.toPrecision(1);
    return '[' + vector.x + '; ' + vector.y + ']';
  },
};

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};

const player = {
  x: 500,
  y: 350,
  w: 40,
  h: 40,
  startW: this.w,
  startH: this.h,
  speed: 3,
  sprintMultiplier: 1.5,

  draw: function () {
    ctx.beginPath();
    ctx.fillStyle = 'White';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.roundRect(this.x - scrollX, this.y - scrollY, this.w, this.h, 5);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    /*ctx.beginPath();
		ctx.moveTo(this.x + this.w / 2 - scrollX, this.y + this.h / 2 - scrollY);
		ctx.lineWidth = 5;
		ctx.strokeStyle = "red";
		ctx.lineTo(mouseX, mouseY);
		ctx.stroke();
		ctx.strokeStyle = "black";
		ctx.closePath();*/

    let eye1Position = {
      x: this.x + this.w / 4 - scrollX,
      y: this.y + this.h / 4 - scrollY,
    };
    let eye2Position = {
      x: this.x + this.w - this.w / 4 - 2 - scrollX,
      y: this.y + this.h / 4 - scrollY,
    };

    function drawEyes(x, y, w, h) {
      if (eye1Position.x < mouseX) {
        eye1Position.x++;
      }

      if (eye1Position.x > mouseX) {
        eye1Position.x -= 2;
      }

      if (eye2Position.x < mouseX) {
        eye2Position.x += 2;
      }

      if (eye2Position.x > mouseX) {
        eye2Position.x -= 2;
      }

      if (eye1Position.y < mouseY) {
        eye1Position.y += 2;
      }

      if (eye1Position.y > mouseY) {
        eye1Position.y -= 2;
      }

      if (eye2Position.y < mouseY) {
        eye2Position.y += 2;
      }

      if (eye2Position.y > mouseY) {
        eye2Position.y -= 2;
      }

      ctx.beginPath();
      ctx.roundRect(eye1Position.x, eye1Position.y, 1, h / 3, 5);
      ctx.stroke();
      ctx.roundRect(eye2Position.x + 1, eye2Position.y, 1, h / 3, 5);
      ctx.stroke();
      ctx.closePath();
    }

    drawEyes(this.x - scrollX, this.y - scrollY, this.w, this.h);
  },

  move: function () {
    let speed;

    if ((inputs.right || inputs.left) && (inputs.up || inputs.down)) {
      speed = this.speed / 1.25;
    } else {
      speed = this.speed;
    }

    if (inputs.shift || inputs.space) {
      speed *= this.sprintMultiplier;
    }

    this.collision(speed);

    scrollX += (this.x - scrollX) / 20 - canvas.clientWidth / 40;
    scrollY += (this.y - scrollY) / 20 - canvas.clientHeight / 42;
  },

  collision: function (speed) {
    this.verticalCollision(speed);
    this.horizontalCollision(speed);
  },

  verticalCollision: function (speed) {
    this.y += (inputs.down - inputs.up) * speed;

    for (let i = 0; i < objects.length; i++) {
      if (checkCollision(this, objects[i].collider)) {
        this.y -= (inputs.down - inputs.up) * speed * 2;
      }
    }
  },

  horizontalCollision: function (speed) {
    this.x += (inputs.right - inputs.left) * speed;

    for (let i = 0; i < objects.length; i++) {
      if (checkCollision(this, objects[i].collider)) {
        this.x -= (inputs.right - inputs.left) * speed * 2;
      }
    }
  },
};

const tool = {
  x: player.x,
  y: player.y,
  dx: 0,
  dy: 0,
  w: 70,
  h: 80,
  image: axeImg,
  radius: 100,
  postion: new Vector2(player.x, player.y),
  drawX: player.x,
  drawY: player.y,
  target: player,
  range: 75,
  damage: 10,

  move: function () {
    this.x = this.target.x;
    this.y = this.target.y;

    let inputX = this.drawX < mouseX;

    if (inputX == 0) {
      inputX = -1;
    }

    let inputY = this.drawY < mouseY;

    if (inputY == 0) {
      inputY = -1;
    }

    this.drawX = mouseX;
    this.drawY = mouseY;

    let position = clampPositionToCircle(
      this.drawX - this.w / 2,
      this.drawY - this.h / 2,
      this.target.x - scrollX - this.target.w / 2,
      this.target.y - scrollY - this.target.h / 2,
      100
    );

    this.drawX = position.x;
    this.drawY = position.y;
    //this.drawY += Math.cos(frame/20)*5;
  },

  draw: function () {
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'rgba(150, 80, 0, 0.9)';
    ctx.lineWidth = 5;
    if (this.target.x - scrollX - this.target.w / 2 < this.drawX) {
      if (inputs.click == 1 && Math.sin(frame / 10) > 0) {
        ctx.translate(this.drawX + this.w / 2, this.drawY + this.h * 1.1);
        ctx.rotate(45);

        /*ctx.roundRect(this.drawX-handleWidth/2, this.drawY-this.h/2, handleWidth, this.h, 10);
		    ctx.stroke();*/
        ctx.drawImage(axeImg, 0, 0, -this.w, -this.h);
        ctx.fill();

        ctx.rotate(-45);
        ctx.translate(-(this.drawX + this.w / 2), -(this.drawY + this.h * 1.1));
      } else {
        ctx.drawImage(axeImg, this.drawX, this.drawY, this.w, this.h);
        ctx.fill();
      }
    } else {
      if (inputs.click == 1 && Math.sin(frame / 10) > 0) {
        ctx.translate(this.drawX + this.w, this.drawY + this.h / 2);
        ctx.rotate(-45);

        /*ctx.roundRect(this.drawX-handleWidth/2, this.drawY-this.h/2, handleWidth, this.h, 10);
		    ctx.stroke();*/
        ctx.drawImage(invertAxeImg, 0, 0, -this.w, -this.h);
        ctx.fill();

        ctx.rotate(45);
        ctx.translate(-(this.drawX + this.w), -(this.drawY + this.h / 2));
      } else {
        ctx.drawImage(invertAxeImg, this.drawX, this.drawY, this.w, this.h);
        ctx.fill();
      }
    }
    //ctx.fillRect((this.drawX-this.w/2), (this.drawY-this.h/2), 50, 50);
    ctx.closePath();
  },
};

function mainLoop() {
  moveLoop();
  drawLoop();

  frame++;
  requestAnimationFrame(mainLoop);
}

class Wall {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = c;
    this.canCollide = true;
    this.collider = new Collider(this.x, this.y, this.w, this.h);
    objects.push(this);
  }

  update() {
    this.collider.update(this);
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'black';
    ctx.roundRect(this.x - scrollX, this.y - scrollY, this.w, this.h, 5);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }
}

class Collider {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  update(target) {
    this.x = target.x;
    this.y = target.y;
  }
}

function Item(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  objects.push(this);
}

Item.prototype = {
  canCollide: false,
  offScreen: false,
  canDestroy: false,
  selected: false,
  canBeHarvested: false,
  health: 100,

  getObjectId: function () {
    for (let i = 0; i < objects.length; i++) {
      if (objects[i] == this) {
        return i;
      }
    }
  },

  deleteSelf: function () {
    for (let i = 0; i < objects.length; i++) {
      if (
        checkCollision(this.collider, objects[i].collider) &&
        objects[i].canCollide &&
        objects[i] != this
      ) {
        objects.splice(this.getObjectId(), 1);
      }
    }
  },

  getHit: function () {
    if (
      checkCollision(this.collider, tool) &&
      this.canBeHarvested &&
      this.canDestroy
    ) {
      this.health -= tool.damage;
      alert(this.health);
    }
  },
};

function Tree(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  objects.push(this);
  trees.push(this);
}

Tree.prototype = Object.create(Item.prototype);
Tree.prototype.constructor = Tree;

Tree.prototype.canCollide = true;
Tree.prototype.canDestroy = true;
Tree.prototype.canBeHarvested = true;

Tree.prototype.checkOffScreen = function () {
  if (
    this.x - scrollX < 0 ||
    this.x - scrollX > canvas.clientWidth ||
    this.y - scrollY < 0 ||
    this.y - scrollY > canvas.clientHeight
  ) {
    this.canCollide = false;
    this.offScreen = true;
  }
};

Tree.prototype.getTreeId = function () {
  for (let i = 0; i < trees.length; i++) {
    if (trees[i] == this) {
      return i;
    }
  }
};

Tree.prototype.deleteSelfTree = function () {
  for (let i = 0; i < trees.length; i++) {
    if (
      checkCollision(this.collider, trees[i].collider) &&
      trees[i].canCollide &&
      trees[i] != this
    ) {
      console.log('deleting');
      trees.splice(this.getTreeId(), 1);
    }
  }
};

Tree.prototype.update = function () {
  //this.collider.update({x: this.x, y: this.y + this.h / 2.5 + this.h/9});
  this.hover = checkCollision(
    {
      x: this.collider.w / 2 + this.collider.x - scrollX,
      y: this.collider.y - scrollY,
      w: this.collider.w,
      h: this.collider.h,
    },
    { x: mouseX, y: mouseY, w: 25, h: 25 }
  );
  this.selected =
    this.hover &&
    checkDistance(
      { x: this.collider.x - scrollX, y: this.collider.y - scrollY },
      { x: tool.drawX, y: tool.drawY }
    ) < 50;
};

Tree.prototype.draw = function () {
  ctx.beginPath();
  ctx.arc(this.x - scrollX, this.y - scrollY, this.w, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
};

function OakTree(x, y, w, h, health) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.health = health;
  this.collider = new Collider(
    this.x,
    this.h / 8 + this.y,
    this.w / 4,
    this.h / 2
  );
  objects.push(this);
  trees.push(this);
}

OakTree.prototype = Object.create(Tree.prototype);
OakTree.prototype.constructor = OakTree;

OakTree.prototype.draw = function () {
  ctx.beginPath();
  ctx.fillStyle = 'rgba(150, 80, 0, 0.7)';

  if (this.selected) {
    ctx.fillStyle = 'rgba(200, 130, 0, 0.7)';
  }

  ctx.lineWidth = 4;
  ctx.strokeStyle = 'black';
  ctx.roundRect(
    this.x - scrollX,
    this.h / 8 + this.y - scrollY,
    this.w / 4,
    this.h / 2,
    5
  );
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(0, 150, 0, 0.9)';

  if (this.selected) {
    ctx.fillStyle = 'rgba(50, 200, 50, 0.9)';
  }

  ctx.strokeStyle = 'darkgreen';
  ctx.arc(
    this.x + this.w / 7.5 - scrollX,
    this.y - scrollY,
    (this.w + this.h) / 2 / 3,
    0,
    2 * Math.PI
  );
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
};

let tree = new OakTree(100, 100, 125, 150);
console.log(tree.offScreen, tree.canCollide);
console.log(tree.getObjectId());

function checkDistance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
  );
}

function getAngle(dy, dx) {
  return ((Math.atan2(dy, -dx) * 180) / Math.PI + 360) % 360;
}

function checkCollision(a, b) {
  return !(
    a.y + a.h < b.y ||
    a.y > b.y + b.h ||
    a.x + a.w < b.x ||
    a.x > b.x + b.w
  );
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function spawnTrees(x, y, w, h, amount, areaWidth, areaHeight) {
  let spawnAmount = amount;

  for (let i = 0; i < spawnAmount; i++) {
    let oak = new OakTree(
      getRandomInt(x - areaWidth / 2, x + areaWidth / 2),
      getRandomInt(y - areaHeight / 2, y + areaHeight / 2),
      w,
      h
    );
    oak.deleteSelf();
    oak.deleteSelfTree();
  }
}

function findDirectionOfMouse(x, y) {
  return (
    Math.atan(x - mouseX / y - mouseY) +
    ((y - mouseY > canvas.height / 2) * 180 +
      (x - mouseX > canvas.width / 2) * 180)
  );
}

function clampPositionToCircle(x, y, cx, cy, radius) {
  let dx = x - cx;
  let dy = y - cy;
  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > radius) {
    let scale = radius / distance;

    dx *= scale;
    dy *= scale;
  }

  return {
    x: cx + dx,
    y: cy + dy,
  };
}

function moveLoop() {
  for (let i = 0; i < objects.length; i++) {
    objects[i].update();
    if (objects[i].health != null) {
      objects[i].getHit();
    }
  }
  wall.update();
  player.move();
  tool.move();
}

function drawLoop() {
  ctx.beginPath();
  ctx.fillStyle = 'rgb(150, 200, 150)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.closePath();

  player.draw();

  for (let i = 0; i < objects.length; i++) {
    objects[i].draw();
  }

  wall.draw();
  tool.draw();
}

let wall = new Wall(500, 150, 100, 100, 'rgb(150, 150, 150)');

spawnTrees(200, 200, 125, 150, 500, 10000, 10000);

mainLoop();

window.addEventListener('keydown', function (e) {
  if (e.key == 'w') {
    inputs.up = 1;
  }
  if (e.key == 's') {
    inputs.down = 1;
  }
  if (e.key == 'a') {
    inputs.left = 1;
  }
  if (e.key == 'd') {
    inputs.right = 1;
  }
  if (e.code == 'Space') {
    inputs.space = 1;
  }
  if (e.key == 'Shift') {
    inputs.shift = 1;
  }
});

window.addEventListener('keyup', function (e) {
  if (e.key == 'w') {
    inputs.up = 0;
  }
  if (e.key == 's') {
    inputs.down = 0;
  }
  if (e.key == 'a') {
    inputs.left = 0;
  }
  if (e.key == 'd') {
    inputs.right = 0;
  }
  if (e.code == 'Space') {
    inputs.space = 0;
  }
  if (e.key == 'Shift') {
    inputs.shift = 0;
  }
});

window.addEventListener('mousemove', function (e) {
  mouseX = e.offsetX;
  mouseY = e.offsetY;
});

window.addEventListener('mousedown', function () {
  inputs.click = 1;
});

window.addEventListener('mouseup', function () {
  inputs.click = 0;
});

window.requestAnimationFrame(mainLoop);