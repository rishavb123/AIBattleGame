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

    draw(draw=true) {
        if(draw) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x / 100 * c.width, this.y / 100 * c.height , this.w / 100 * c.width, this.h / 100 * c.height);
        }
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
            if(hitFeatures.length > 7)
                hitFeatures.pop();
            obj.remove();
            this.health -= 25;
        }
    }

    update(draw=true) {
        this.color = `rgba(${this.rgb_color.red}, ${this.rgb_color.green}, ${this.rgb_color.blue}, ${this.health / 100})`
        super.update(draw);
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

    update(draw=true) {
        super.update(draw);
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
        this.side = this.x == 0? -1 : 1;
    }

    update(draw=true) {
        if(this.x < player.x)
            this.dx = this.maxDx;
        else 
            this.dx = -this.maxDx;
        if(this.y < player.y)
            this.dy = this.maxDy;
        else 
            this.dy = -this.maxDy;
        super.update(draw);
        this.health -= 0.8;
        if (this.outOfBounds() || this.health <= 0) {
            this.remove();
        }
    }

    get_features() {
        return [this.w, this.h, this.maxDx, this.maxDy, this.alpha, this.side];
    }

    get_normalized_features() {
        return [this.w / 100, this.h / 100, this.maxDx / 100, this.maxDy / 100, this.alpha, this.side];
    }

    collide(obj) {
        if (obj instanceof Bullet) {
            obj.sender.health += obj.sender.health < 90? 10 : 0;
            obj.remove();
            this.health -= 100;
        }
    }

    remove() {
        enemies.splice(enemies.indexOf(this), 1);
        remove(this);
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
            train(100);
            break;
    }
});

const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;

const INPUT_NODES = 123;
const NUM_OUTPUT_CLASSES = 4;

let running = true;
let agentPlaying = false;

let shooting = false;
let player = new Player(Math.random() * 95, Math.random() * 95, 5, 5, {
    red: '0',
    green: '255',
    blue: '255'
});

let env = {};
env.getNumStates = () => INPUT_NODES;
env.getMaxNumActions = () => NUM_OUTPUT_CLASSES;
let spec = { 
    alpha: 0.01,
    num_hidden_units: 70
};
let agent = new RL.DQNAgent(env, spec);

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
let hitFeatures = [[5, 5, 0.8, 0.8, 0.8, 0]];
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
        state.push(enemy.x / 100, enemy.y / 100, enemy.dx / 100, enemy.dy / 100, enemy.health / 100);
        let arr = enemy.get_normalized_features();
        arr.pop(); arr.pop();
        state = state.concat(arr);
    }
    return state;
}

function get_reward() {
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

function train(N = 500) {
    totalRewards = [];
    for(let n = 1; n <= N; n++) {
        totalReward = playOne();
        totalRewards.push(totalReward);
        if(n%10 == 0) {
            console.log("episode:", n, "\n\ttotal reward:", totalReward, "\n\taverage total reward:", tf.tensor(totalRewards).mean().dataSync()[0], "\n\ttotal rewards:", totalRewards);
            totalRewards = [];
        }
    }
    reset();
    alert("Done Training!");
}

function reset() {
    t = 0;
    for(let obj of gameObjects)
        obj.remove();
    player = new Player(Math.random() * 95, Math.random() * 95, 5, 5, {
        red: '0',
        green: '255',
        blue: '255'
    });
    numGenerating = 0;
    pHealthBar = new HealthBar(2, 2, 30, 5, player);
    gameObjects = [player, pHealthBar];
}

function step(action) {
    player.set_action(action);
    for(let k = 0; k < 1; k++) {
        t++;
        if(t%300 == 0) {
            numGenerating += 0.2;
            let [w, h, dx, dy, alpha, side] = tf.matMul(create_multiplier(), tf.tensor(hitFeatures)).dataSync();
            for(let j = 0; j < numGenerating; j++) {
                const enemy = new Enemy(Math.random() > 0.3? (Math.random() > 0.5? 0 : 100 - w): (side < 0? 0 : 100 - w), Math.random() * 100, w, h, dx, dy, alpha);
                Enemy.add(enemy);
            }
        }
        for (i = 0; i < gameObjects.length; i++) {
            const obj = gameObjects[i];
            obj.update(false);
            for (let j = i + 1; j < gameObjects.length; j++) {
                const obj2 = gameObjects[j];
                if (obj.x + obj.w >= obj2.x && obj.x <= obj2.x + obj2.w && obj.y + obj.h >= obj2.y && obj.y <= obj2.y + obj2.h) {
                    obj.collide(obj2);
                    obj2.collide(obj);
                }
            }
        }
    }
    return [get_state(), get_reward(), player.health <= 0];
}

function playOne() {
    reset();
    let iterations = 0;
    let totalReward = 0;
    let done = false;
    let reward;
    let state = get_state();

    while(!done && iterations < 2000) {
        let action = agent.act(state);
        [state, reward, done] = step(action);
        totalReward += reward;

        if(done)
            reward = -10;
        iterations++;
        agent.learn(reward);
    }

    return totalReward;
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
    if(agentPlaying && t%10 == 0) {
        player.set_action(agent.act(get_state()));
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
    if(player.health <= 0) {
        reset();
    }

}

animate();