const socket = io('http://localhost:3000');
socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

const FORWARDS = -1
const BACKWARDS = 1;

const c = document.getElementById("application");
const ctx = c.getContext('2d');

c.width = window.innerWidth;
c.height = window.innerHeight;

window.addEventListener("resize", () => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
});

x = 0;

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillRect(++x, 0, 300, 300);
}

animate();