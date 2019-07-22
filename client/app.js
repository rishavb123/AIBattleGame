const c = document.getElementById("application");
const ctx = c.getContext('2d');

c.width = window.innerWidth;
c.height = window.innerHeight;

window.addEventListener("resize", () => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
});

class GameObject {

    collide() {}

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    }

    outOfBounds() {
        return this.x > c.width || this.y > c.height || this.x + this.w < 0 || this.y + this.h < 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

}

class Player extends GameObject {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.w = 50;
        this.h = 50;
        this.dx = 0;
        this.dy = 0;
        this.health = 100;
        this.color = 'rgba(255,0,0,1)';
        this.alpha = 1;
    }

    collide(obj) {
        if (obj instanceof Bullet && obj.sender !== this) {
            remove(obj);
            this.health -= 10;
        }
    }

    update() {
        this.color = `rgba(255,0,0,${this.health/ 100.0})`;
        super.update();
        if(this.outOfBounds())
            this.health--;
        if (this.health <= 0)
            remove(this);
    }

    shoot() {
        add(new Bullet(this.x + this.w / 2 - 12.5, this.y + this.h / 2 - 12.5, (this.dx == 0 && this.dy == 0) ? 30 : 3 * this.dx, 3 * this.dy, this));
    }

}

class Bullet extends GameObject {
    constructor(x, y, dx, dy, sender) {
        super();
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.w = 25;
        this.h = 25;
        this.sender = sender;
        this.color = 'white';
    }

    update() {
        super.update();
        if (this.outOfBounds())
            remove(this);
    }

}

window.addEventListener("keydown", (e) => {
    switch (e.keyCode) {
        case 37:
        case 65:
            player.dx = -10;
            player.dy = 0;
            break;
        case 38:
        case 87:
            player.dy = -10;
            player.dx = 0;
            break;
        case 39:
        case 68:
            player.dx = 10;
            player.dy = 0;
            break
        case 40:
        case 83:
            player.dy = 10;
            player.dx = 0;
            break;
        case 32:
            if(!shooting) {
                player.shoot();
                shooting = true;
            }
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch(e.keyCode) {
        case 32:
            shooting = false;
            break;
    }
});

let shooting = false;
let player = new Player(0, 0);
let gameObjects = [player];
let i = 0;

function remove(obj) {
    gameObjects.splice(gameObjects.indexOf(obj), 1);
    if (gameObjects.indexOf(obj) < i)
        i--;
}

function add(obj) {
    gameObjects.push(obj);
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, c.width, c.height);
    for (i = 0; i < gameObjects.length; i++) {
        const obj = gameObjects[i];
        obj.update();
        for (let j = i + 1; j < gameObjects.length; j++) {
            const obj2 = gameObjects[j];
            if (obj.x + obj.w >= obj2.x && obj.x <= obj2.x + obj2.w && obj.y + obj.h >= obj2.y && obj.y <= obj2.y + obj2.h) {
                obj.collide(obj2);
                obj2.collide(obj);
            }
        }
    }
    ctx.fillStyle = `rgb(${255 - 2.55 * player.health}, ${2.55 * player.health}, 0)`;
    ctx.fillRect(10, 10, 4 * player.health, 25);
}

animate();