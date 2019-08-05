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

    remove() {
        remove(this);
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
        if (obj instanceof Enemy) {
            hitFeatures.unshift(obj.get_features());
            obj.remove();
            this.health -= 5;
        }
    }

    update() {
        this.color = `rgba(${this.rgb_color.red}, ${this.rgb_color.green}, ${this.rgb_color.blue}, ${this.health / 100})`
        super.update();
        if(this.outOfBounds())
            this.health--;
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

class Enemy extends GameObject{
    constructor(x, y, w, h, maxDx, maxDy, alpha) {
        super();       

        if(Math.random() > 0.9)
            w += 10*randGauss();
        if(Math.random() > 0.9)
            h += 10*randGauss();
        if(Math.random() > 0.9)
            maxDx += 0.5 * randGauss();
        if(Math.random() > 0.9)
            maxDy += 0.5 * randGauss();
        if(Math.random() > 0.9)
            alpha += 0.5 * randGauss();

        if(w > Enemy.maxWidth)
            w = Enemy.maxWidth;
        if(w < Enemy.minWidth)
            w = Enemy.minWidth;
        if(h > Enemy.maxHeight)
            h = Enemy.maxHeight;
        if(h < Enemy.minHeight)
            h = Enemy.minHeight;
        if(maxDx > Enemy.maxSpeed)
            maxDx = Enemy.maxSpeed;
        if(maxDx < Enemy.minSpeed)
            maxDx = Enemy.minSpeed;
        if(maxDy > Enemy.maxSpeed)
            maxDy = Enemy.maxSpeed;
        if(maxDy < Enemy.minSpeed)
            maxDy = Enemy.minSpeed;
        if(alpha > Enemy.maxAlpha)
            alpha = Enemy.maxAlpha;
        if(alpha < Enemy.minAlpha)
            alpha = Enemy.minAlpha;        

        this.x = x;
        this.y = y;
        this.maxDx = maxDx;
        this.maxDy = maxDy;
        this.dx = 0;
        this.dy = 0;
        this.w = w;
        this.h = h;
        this.health = 100;
        this.alpha = alpha;
        this.color = `rgba(255,${255 * alpha},255,${alpha})`;
    }

    update() {
        if(this.x < player.x)
            this.dx = this.maxDx;
        else 
            this.dx = -this.maxDx;
        if(this.y < player.y)
            this.dy = this.maxDy;
        else 
            this.dy = -this.maxDy;
        super.update();
        this.health -= 0.1;
        if (this.outOfBounds() || this.health <= 0) {
            this.remove();
        }
    }

    get_features() {
        return [this.w, this.h, this.maxDx, this.maxDy, this.alpha];
    }

    collide(obj) {
        if (obj instanceof Bullet) {
            obj.sender.health += obj.sender.health < 97.5? 2.5 : 0;
            obj.remove();
            this.health -= 100;
        }
    }

    remove() {
        enemies.splice(enemies.indexOf(this), 1);
        remove(this);
    }

}


class DenseLayer {
    constructor(M1, M2, f=tf.tanh) {
        this.M1 = M1;
        this.M2 = M2;
        this.W = tf.variable(tf.randomNormal([M1, M2]));
        this.b = tf.variable(tf.zeros([M2], 'float32'));
        this.f = f;
    }

    getParams() {
        return [this.W, this.b];
    }

    setParams(params) {
        this.W = params[0].clone();
        this.b = params[1].clone();
        return this;
    }

    clone() {
        return new DenseLayer(this.M1, this.M2).setParams(this.getParams());
    }

    forward(X) {
        return this.f(tf.matMul(X, this.W) + this.b);
    }
}

class DQN {

    constructor(inputNodes, hiddenLayers, outputNodes, gamma=0.9, eps=0.1, minExperience=100, maxExperience=10000, batchSize=32) {
        this.layers = [];
        this.gamma = gamma;
        this.eps = eps;
        this.minExperience = minExperience;
        this.maxExperience = maxExperience;
        this.batchSize = batchSize;

        let M1 = inputNodes;
        for(let M2 of hiddenLayers) {
            this.layers.push(new DenseLayer(M1, M2));
            M1 = M2;
        }
        this.layers.push(new DenseLayer(M1, outputNodes));
        this.optimizer = tf.train.adam();
        this.experience = {
            s: [],
            a: [],
            r: [],
            s2: [],
            done: []
        };
    }

    predict(X) {
        Z = X;
        for(let layer of this.layers) {
            Z = layer.forward(X);
        }
        return Z;
    }

    addExperience(s, a, r, s2, done) {
        if(this.experience.s.length >= this.maxExperience) {
            this.experience.s.shift();
            this.experience.a.shift();
            this.experience.r.shift();
            this.experience.s2.shift();
            this.experience.done.shift();
        }
        this.experience.s.push(s);
        this.experience.a.push(a);
        this.experience.r.push(r);
        this.experience.s2.push(s2);
        this.experience.done.push(done);
    }

    train(targetNetwork) {
        if(this.experience.s.length < this.minExperience)
            return;

        let idx = [];
        let states = [];
        let actions = [];
        let rewards = [];
        let next_states = [];
        let dones = [];
        for(let i = 0; i < this.batchSize; i++) {
            index = Math.floor(Math.random() * this.experience.s.length)
            while(index in idx)
                index = Math.floor(Math.random() * this.experience.s.length)
            idx.push(index);
            states.push(this.experience.s[index]);
            actions.push(this.experience.a[index]);
            rewards.push(this.experience.r[index]);
            next_states.push(this.experience.s2[index]);
            dones.push(this.experience.done[index]);
        }


        let next_Q = tf.max(targetNetwork.predict(tf.tensor(next_states)), 1)

        Y_hat = predict(states);

        let targets = [];

        for(let i = 0; i < rewards.length; i++) {
            if(dones[i])
                targets.push(rewards[i]);
            else
                targets.push(rewards[i] + this.gamma * next_Q[i]);
        }
        this.optimizer.minimize(() => tf.losses.meanSquaredError(targets, ));

    }

    copyTo(toNetwork) {
        for(let i = 0; i < this.layers.length; i++)
            toNetwork.layers[i].setParams(this.layers[i].getParams());
    }

    sampleAction(x) {
        if(Math.random() < this.eps)
            return Math.floor(Math.random() * 4);
        else 
            return tf.argMax(this.predict(tf.tensor([x]))[0])
    }

}

Enemy.minSpeed = 0.1;
Enemy.maxSpeed = 2;

Enemy.minAlpha = 0.2;
Enemy.maxAlpha = 1;

Enemy.minWidth = 3;
Enemy.maxWidth = 25;

Enemy.minHeight = 4;
Enemy.maxHeight = 25;

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
        case 80:
            agentPlaying = !agentPlaying;
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

const INPUT_NODES = 103;
const HIDDEN_LAYERS = [70, 50, 50];
const NUM_OUTPUT_CLASSES = 4;

let xs = [];
let ys = [];

let running = true;
let agentPlaying = false;

const model = new DQN(INPUT_NODES, HIDDEN_LAYERS, NUM_OUTPUT_CLASSES);

let shooting = false;
let player = new Player(0, 0, 5, 5, {
    red: '0',
    green: '255',
    blue: '255'
});
let t = 0;

const maxEnemies = 10;

Bullet.defaultBullet = new Bullet(-1, -1, 0, 0, 0, 0);
Enemy.defaultEnemy = new Enemy(-1, -1, 0, 0, 0, 0, 0);
Enemy.add = (enemy) => {
    if(enemies.length < maxEnemies) {
        enemies.push(enemy)
        add(enemy)
    }
    else
        delete enemy;
}
Enemy.get = (index) => {
    return enemies[index] || Enemy.defaultEnemy;
}

let pHealthBar = new HealthBar(2, 2, 30, 5, player);
let gameObjects = [player, pHealthBar];
let enemies = [];
let hitFeatures = [[5, 5, 0.8, 0.8, 0.8]];
let i = 0;
let numGenerating = 0;

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
    let state = [player.x / 100, player.y / 100, player.health / 100];
    for(let i = 0; i < 5; i++)
    {
        let bullet = player.getBullet(i);
        state.push(bullet.x / 100, bullet.y / 100, bullet.dx / 100, bullet.dy / 100);
    }
    for(let i = 0; i < maxEnemies; i++)
    {
        let enemy = Enemy.get(i);
        state.push(enemy.x, enemy.y, enemy.health);
        state = state.concat(enemy.get_features());
    }
    return state;
}

function reward() {
    return player.health / 100;
}

function create_multiplier() {
    let num = hitFeatures.length;
    let temp = [];
    let multiplierArr = [];
    let sum = 0;
    for(let i = 0; i < num; i++) {
        let multiple = Math.pow(0.8, i);
        temp.push(multiple);
        sum += multiple;
    }
    for(let i = 0; i < num; i++) 
        multiplierArr.push(temp[i] / sum);

    return tf.tensor([multiplierArr]);
}

function randGauss() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function create_model() {
    const model = tf.sequential();

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
    t++;
    if(running)
        requestAnimationFrame(animate);
    ctx.clearRect(0, 0, c.width, c.height);
    if(t%300 == 0) {
        numGenerating += 0.2;
        let [w, h, dx, dy, alpha] = tf.matMul(create_multiplier(), tf.tensor(hitFeatures)).dataSync();
        for(let j = 0; j < numGenerating; j++) {
            const enemy = new Enemy(Math.random() > 0.5? 0 : 100 - w, Math.random() * 100, w, h, dx, dy, alpha);
            Enemy.add(enemy);
        }
    }
    if(agentPlaying) {
        const output = model.predict(tf.tensor([get_state()])).dataSync();
        player.set_action(tf.tensor(output.slice(0, 4)).argMax().dataSync()[0]);
        console.log(output[4]);
        if(output[4] > 0.25)
            player.shoot();
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
        xs.push(get_state());
        let y = [0, 0, 0, 0, shooting? 1: 0];
        y[player.action] = 1;
        ys.push(y);
    }
    
    if(player.health < 0) {
        console.log("game over");
        for(let obj of gameObjects)
            obj.remove();
        player = new Player(0, 0, 5, 5, {
            red: '0',
            green: '255',
            blue: '255'
        });
        pHealthBar = new HealthBar(2, 2, 30, 5, player);
        gameObjects = [player, pHealthBar];
    }

}

animate();