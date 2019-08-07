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
        this.bullets = [];
        this.action = -1;
        this.health = 100;
        this.rgb_color = color;
        this.color = `rgba(${color.red}, ${color.blue}, ${color.green}, 1)`
        this.alpha = 1;
    }

    collide(obj) {
        if (obj instanceof Bullet && obj.sender !== this) {
            obj.remove();
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
        if(this.bullets.length < 5) {
            let bullet = new Bullet(this.x + this.w / 4, this.y + this.h / 4, this.w / 2, this.h / 2, (this.dx == 0 && this.dy == 0) ? 3 : 3 * this.dx, 3 * this.dy, this);
            this.bullets.push(bullet);
            add(bullet);
        }
    }

    getBullet(i) {
        return this.bullets[i] || Bullet.defaultBullet;
    }

    set_action(action) {
        this.action = action;
        switch (action) {
            case LEFT:
                this.dx = -1;
                this.dy = 0;
                break;
            case UP:
                this.dy = -1;
                this.dx = 0;
                break;
            case RIGHT:
                this.dx = 1;
                this.dy = 0;
                break;
            case DOWN:
                this.dy = 1;
                this.dx = 0;
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
        if (this.outOfBounds()) {
            this.remove();
        }
    }

    remove() {
        this.sender.bullets.splice(this.sender.bullets.indexOf(this), 1);
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

        case 65:
            enemy.set_action(LEFT);
            break;
        case 87:
            enemy.set_action(UP);
            break;
        case 68:
            enemy.set_action(RIGHT);
            break;
        case 83:
            enemy.set_action(DOWN);
            break;
        case 16:
            if(!eShooting) {
                enemy.shoot();
                eShooting = true;
            }
            break;
    }
});

window.addEventListener("keyup", async (e) => {
    switch(e.keyCode) {
        case 32:
            shooting = false;
            break;
        case 16:
            eShooting = false;
            break;
        case 80:
            agentPlaying = !agentPlaying;
            break;
        case 90:
            const temp = player;
            player = enemy;
            enemy = temp;
            enemy.dx = 0;
            enemy.dy = 0;
            break;
        case 88:
            running = !running;
            if(running) animate();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
            break;
        case 84:
            await train(xs, ys);
            break;
    }
});

const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;

let xs = [];
let ys = [];

let running = true;
let agentPlaying = false;

const model = create_model();

let shooting = false;
let player = new Player(0, 0, 10, 10, {
    red: '0',
    green: '255',
    blue: '255'
});
let eShooting = false;
let enemy = new Player(10, 10, 10, 10, {
    red: '255',
    green: '0',
    blue: '0'
});

Bullet.defaultBullet = new Bullet(-1, -1, 0, 0, 0, 0);

let pHealthBar = new HealthBar(2, 2, 30, 5, player);
let eHealthBar = new HealthBar(68, 2, 30, 5, enemy);
let gameObjects = [player, pHealthBar]; //, enemy, eHealthBar];
let i = 0;

function remove(obj) {
    gameObjects.splice(gameObjects.indexOf(obj), 1);
    if (gameObjects.indexOf(obj) < i)
        i--;
    delete obj;
}

function add(obj) {
    gameObjects.push(obj);
}

function get_state() {
    let state = [player.x / 100, player.y / 100, player.dx / 100, player.dy / 100, player.health / 100, enemy.x / 100, enemy.y / 100, enemy.health / 100];
    for(let i = 0; i < 5; i++)
    {
        let bullet = player.getBullet(i);
        state.push(bullet.x / 100, bullet.y / 100, bullet.dx / 100, bullet.dy / 100);
    }
    return state;
}

function get_opposite_state() {
    let state = [enemy.x / 100, enemy.y / 100, enemy.dx / 100, enemy.dy / 100, enemy.health / 100, player.x / 100, player.y / 100, player.health / 100];
    for(let i = 0; i < 5; i++)
    {
        let bullet = enemy.getBullet(i);
        state.push(bullet.x / 100, bullet.y / 100, bullet.dx / 100, bullet.dy / 100);
    }
    return state;
}

function create_model() {
    const model = tf.sequential();
  
    const INPUT_NODES = 28;
    const HIDDEN_LAYERS = [30, 30, 30];
    const NUM_OUTPUT_CLASSES = 5;

    model.add(tf.layers.dense({
        inputDim: INPUT_NODES,
        units: INPUT_NODES,
        kernelInitializer: 'varianceScaling',
        activation: 'tanh'
    }));

    for(let NUM_OF_HIDDEN_NODES of HIDDEN_LAYERS)
        model.add(tf.layers.dense({
            units: NUM_OF_HIDDEN_NODES,
            kernelInitializer: 'varianceScaling',
            activation: 'relu'
        }));

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
    return model;
}

async function train(xs, ys) {
    console.log("Training . . .");
    const xDataset = tf.data.array(xs);
    const yDataset = tf.data.array(ys);
    const xyDataset = tf.data.zip({xs: xDataset, ys: yDataset})
        .batch(4)
        .shuffle(4);
    await model.fitDataset(xyDataset, {
        epochs: 10,
        callbacks: {onEpochEnd: (epoch, logs) => console.log("Epoch " + epoch + ": " + logs.loss)}
    });
    console.log("Done Training!");
}

function animate() {
    if(running)
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, c.width, c.height);
    if(agentPlaying) {
        player.set_action(model.predict(tf.tensor([get_opposite_state()])).argMax(1).dataSync()[0]);
    }
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
    if(player.action >= 0) {
        xs.push(get_opposite_state());
        let y = [0, 0, 0, 0, 0];
        y[player.action] = 1;
        ys.push(y);
    }
    
}

animate();