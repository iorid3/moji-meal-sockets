const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors')


// change origin to ["https://moji-meals.vercel.app"] when finished
const io = new Server(server, {
  cors: {
    origin: ["https://moji-meals.vercel.app"],
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true
  }
});

app.use(cors())

const PORT = process.env.PORT || 8888;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const users = {};

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  users[socket.id] = {left: 0, top: 0}

  // message everybody including the messenger
  io.emit("init_user", users)
  // io.emit("joined")
  socket.on("user_ready", (txt) => {
    io.emit("joined", socket.id, txt)
  });

  socket.on('mouse_xy',(x,y)=>{
    console.log(x,y)
    //io.emit('update_mouse',x,y)
    users[socket.id].left =x;
    users[socket.id].top= y;
    socket.broadcast.emit('init_user',users)
  })

  socket.on("disconnect", ()=>{
    delete users[socket.id];
    io.emit("init_user", users)
  })
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});