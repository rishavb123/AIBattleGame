const c = document.getElementById("application");
const ctx = c.getContext('2d');

if(window.innerWidth > window.innerHeight) {
    c.width = window.innerHeight;
    c.height = window.innerHeight;
} else {
    c.width = window.innerWidth;
    c.height = window.innerWidth;
}

window.addEventListener("resize", () => {
    if(window.innerWidth > window.innerHeight) {
        c.width = window.innerHeight;
        c.height = window.innerHeight;
    } else {
        c.width = window.innerWidth;
        c.height = window.innerWidth;
    }
});

class GameObject {

    collide() {}

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    }

    outOfBounds() {
        return this.x > 100 || this.y > 100 || this.x + this.w < 0 || this.y + this.h < 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x / 100 * c.width, this.y / 100 * c.height , this.w / 100 * c.width, this.h / 100 * c.height);
    }

}

class Player extends GameObject {
    constructor(x, y, w, h, color) {
        super();
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.dx = 0;
        this.dy = 0;
        this.action = -1;
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
        add(new Bullet(this.x + this.w / 4, this.y + this.h / 4, this.w / 2, this.h / 2, (this.dx == 0 && this.dy == 0) ? 3 : 3 * this.dx, 3 * this.dy, this));
    }

    set_action(action) {
        this.action = action;
        switch (action) {
            case LEFT:
                player.dx = -1;
                player.dy = 0;
                break;
            case UP:
                player.dy = -1;
                player.dx = 0;
                break;
            case RIGHT:
                player.dx = 1;
                player.dy = 0;
                break;
            case DOWN:
                player.dy = 1;
                player.dx = 0;
                break;
        }
    }

}

class Bullet extends GameObject {
    constructor(x, y, w, h, dx, dy, sender) {
        super();
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.w = w;
        this.h = h;
        this.sender = sender;
        this.color = 'white';
    }

    update() {
        super.update();
        if (this.outOfBounds())
            remove(this);
    }

}

class HealthBar extends GameObject {
    constructor(x, y, w, h, player) {
        super();
        this.x = x;
        this.y = y;
        this.total_w = w;
        this.w = w;
        this.h = h;
        this.player = player;
        this.dx = 0;
        this.dy = 0;
    }

    update() {
        this.w = this.total_w * this.player.health / 100;
        ctx.fillStyle = `rgb(${255 - 2.55 * this.player.health}, ${2.55 * this.player.health}, 0)`;
        super.update();
    }
}

window.addEventListener("keydown", (e) => {
    switch (e.keyCode) {
        case 37:
            player.set_action(LEFT);
            break;
        case 38:
            player.set_action(UP);
            break;
        case 39:
            player.set_action(RIGHT);
            break;
        case 40:
            player.set_action(DOWN);
            break;
        case 32:
            if(!shooting) {
                player.shoot();
                shooting = true;
            }
            break;
    }
});

window.addEventListener("keyup", async (e) => {
    switch(e.keyCode) {
        case 32:
            shooting = false;
            break;
        case 90:
            const temp = player;
            player = enemy;
            enemy = temp;
            enemy.dx = 0;
            enemy.dy = 0;
            break;
        case 88:
            running = false;
            train();
            break;
    }
});

const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;

let running = true;
let state = [];

const model = create_model();

let shooting = false;
let player = new Player(0, 0, 10, 10, {
    red: '0',
    green: '255',
    blue: '255'
});
let enemy = new Player(10, 10, 10, 10, {
    red: '255',
    green: '0',
    blue: '0'
});
let pHealthBar = new HealthBar(2, 2, 30, 5, player);
let eHealthBar = new HealthBar(68, 2, 30, 5, enemy);
let gameObjects = [player, pHealthBar];
let i = 0;
let xs = []
let ys = [];

function remove(obj) {
    gameObjects.splice(gameObjects.indexOf(obj), 1);
    if (gameObjects.indexOf(obj) < i)
        i--;
}

function add(obj) {
    gameObjects.push(obj);
}

async function train() {
    running = false;
    const xDataset = tf.data.array(xs);
    const yDataset = tf.data.array(ys);
    const xyDataset = tf.data.zip({xs: xDataset, ys: yDataset})
        .batch(4)
        .shuffle(4);
    await model.fitDataset(xyDataset, {
        epochs: 10,
        callbacks: {onEpochEnd: (epoch, logs) => console.log(logs.loss)}
    });
    await model.save('downloads://model-1');
}

async function get_pixels() {
    const imageData = ctx.getImageData(0, 0, c.width, c.height);
    const imageTensor = tf.image.resizeNearestNeighbor(tf.browser.fromPixels(imageData), [40, 40]);
    let = imageMatrix = await imageTensor.array();
    imageTensor.dispose();
    imageMatrix = imageMatrix.map(row => row.map(p => (.2126 * p[0] + .7152 * p[1] + .0722 * p[2]) / 255));
    imageMatrix = tf.tensor(imageMatrix);
    return imageMatrix;
}

async function update_state() {
    state.push(await get_pixels());
    if(state.length > 4)
        state.shift().dispose();
}

function get_state() {
    return tf.stack(state, 2);
}

function create_model() {
    const model = tf.sequential();
  
    const IMAGE_WIDTH = 40;
    const IMAGE_HEIGHT = 40;
    const IMAGE_CHANNELS = 4; 

    const NUM_OUTPUT_CLASSES = 4;
    
    model.add(tf.layers.conv2d({
        inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
        kernelSize: 7,
        filters: 8,
        strides: 3,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    model.add(tf.layers.conv2d({
        kernelSize: 7,
        filters: 16,
        strides: 3,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    model.add(tf.layers.flatten());

    model.add(tf.layers.dense({
        units: NUM_OUTPUT_CLASSES,
        kernelInitializer: 'varianceScaling',
        activation: 'softmax'
    }));

    const optimizer = tf.train.adam();
    model.compile({
        optimizer: optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });
    // model.save('downloads://random-model');
    return model;
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

async function animate() {
    if(running)
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
    await update_state();
    let arr = [0, 0, 0, 0];
    arr[player.action] = 1
    xs.push(get_state());
    ys.push(arr);
}

animate();