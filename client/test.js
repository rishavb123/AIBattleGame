let c = document.getElementById("canvas");
let ctx = c.getContext('2d');

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
        draw(this);
    }

    outOfBounds() {
        return this.x > c.width || this.y > c.height || this.x + this.w < 0 || this.y + this.h < 0;
    }

}

class Player extends GameObject {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.w = 100;
        this.h = 100;
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
        if (this.health <= 0)
            remove(this);
    }

    shoot() {
        add(new Bullet(this.x + this.w / 2 - 25, this.y + this.h / 2 - 25, (this.dx == 0 && this.dy == 0) ? 30 : 3 * this.dx, 3 * this.dy, this));
    }

}

class Bullet extends GameObject {
    constructor(x, y, dx, dy, sender) {
        super();
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.w = 50;
        this.h = 50;
        this.sender = sender;
        this.color = 'white';
    }

    update() {
        super.update();
        if (this.outOfBounds())
            remove(this);
    }

}
let player = new Player(0, 0, 0, 0);
let objs = [player, new Player(300, 0, 0, 0)];
let i = 0;

window.addEventListener("click", () => player.shoot());
window.addEventListener("keydown", (e) => {
    console.log(e.keyCode)
    switch (e.keyCode) {
        case 37:
        case 65:
            player.dx = -10;
            break;
        case 38:
        case 87:
            player.dy = -10;
            break;
        case 39:
        case 68:
            player.dx = 10;
            break
        case 40:
        case 83:
            player.dy = 10;
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.keyCode) {
        case 37:
        case 39:
        case 65:
        case 68:
            player.dx = 0;
            break;
        case 38:
        case 40:
        case 87:
        case 83:
            player.dy = 0;
            break;
        case 32:
            player.shoot();
            break;
    }
})

function draw(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
}

function remove(obj) {
    objs.splice(objs.indexOf(obj), 1);
    if (objs.indexOf(obj) < i)
        i--;
}

function add(obj) {
    objs.push(obj);
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, c.width, c.height);
    for (i = 0; i < objs.length; i++) {
        const obj = objs[i];
        obj.update();
        for (let j = i + 1; j < objs.length; j++) {
            const obj2 = objs[j];
            if (obj.x + obj.w >= obj2.x && obj.x <= obj2.x + obj2.w && obj.y + obj.h >= obj2.y && obj.y <= obj2.y + obj2.h) {
                obj.collide(obj2);
                obj2.collide(obj);
            }
        }
    }
}

animate();