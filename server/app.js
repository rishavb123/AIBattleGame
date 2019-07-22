const express = require('express');
const app = express();
const port = 3000;
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));
const io = require('socket.io')(server);

io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});