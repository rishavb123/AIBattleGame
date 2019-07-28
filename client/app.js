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
    constructor(x, y, color) {
        super();
        this.x = x;
        this.y = y;
        this.w = 50;
        this.h = 50;
        this.dx = 0;
        this.dy = 0;
        this.health = 100;
        this.rgb_color = color;
        this.color = `rgba(${color.red}, ${color.blue}, ${color.green}, 1)`
        this.alpha = 1;
    }

    collide(obj) {
        if (obj instanceof Bullet && obj.sender !== this) {
            remove(obj);
            this.health -= 10;
        }
    }

    update() {
        this.color = `rgba(${this.rgb_color.red}, ${this.rgb_color.green}, ${this.rgb_color.blue}, ${this.health / 100})`
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

class Model {

}

window.addEventListener("keydown", (e) => {
    switch (e.keyCode) {
        case 37:
            player.dx = -10;
            player.dy = 0;
            break;
        case 38:
            player.dy = -10;
            player.dx = 0;
            break;
        case 39:
            player.dx = 10;
            player.dy = 0;
            break;
        case 40:
            player.dy = 10;
            player.dx = 0;
            break;
        case 32:
            if(!shooting) {
                player.shoot();
                shooting = true;
            }
            break;
        case 65:
            player.dx = -10;
            player.dy = 0;
            break;
        case 87:
            player.dy = -10;
            player.dx = 0;
            break;
        case 68:
            player.dx = 10;
            player.dy = 0;
            break;
        case 83:
            player.dy = 10;
            player.dx = 0;
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch(e.keyCode) {
        case 32:
            shooting = false;
            console.log(get_pixels());
            break;
    }
});

let shooting = false;
let player = new Player(0, 0, {
    red: '0',
    green: '0',
    blue: '255'
});
let enemy = new Player(100, 100, {
    red: '255',
    green: '0',
    blue: '0'
});
let gameObjects = [player, enemy];
let i = 0;

function remove(obj) {
    gameObjects.splice(gameObjects.indexOf(obj), 1);
    if (gameObjects.indexOf(obj) < i)
        i--;
}

function add(obj) {
    gameObjects.push(obj);
}

function get_state() {
    let state = [enemy.x, enemy.y, enemy.dx, enemy.dy, enemy.health, player.x, player.y, player.health];
    let actions = [player.dx, player.dy];
    return [state, actions];
}

function get_pixels() {
    const imageData = ctx.getImageData(0, 0, c.width, c.height);
    let imageMatrix = [];

    const pixels = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    for(let x = 0; x < w; x++) {
        imageMatrix.push([]);
        for(let y = 0; y < h; y++)
            imageMatrix[x].push(0);
    }

    for (let i = 0; i < w * h; i++) {

        const r = pixels[i*4] / 255.0;
        const g = pixels[i*4+1] / 255.0;
        const b = pixels[i*4+2] / 255.0;
        // const a = pixels[i*4+3];

        const p = .2126 * r + .7152 * g + .0722 * b;

        const y = parseInt(i / w, 10);
        const x = i - y * w;
        console.log(p);
        imageData[x][y] = p;

    }
    return imageData;
}

function get_enemy_state() {
    let state = [player.x, player.y, player.dx, player.dy, player.health, enemy.x, enemy.y, enemy.health];
    let actions = [enemy.dx, enemy.dy];
    return [state, actions];
}

function send_request() {
    const Http = new XMLHttpRequest();
    const state = get_state();
    const url='http://localhost:4000?' + state[0] + ";" + state[1];
    console.log("sending thing to: " + url)
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = (e) => {
        console.log(Http.responseText)
    }
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

    // send_request();


    ctx.fillStyle = `rgb(${255 - 2.55 * player.health}, ${2.55 * player.health}, 0)`;
    ctx.fillRect(10, 10, 4 * player.health, 25);

    ctx.fillStyle = `rgb(${2.55 * enemy.health}, ${255 - 2.55 * enemy.health}, 0)`;
    ctx.fillRect(c.width - 410, 10, 4 * enemy.health, 25);
}

animate();