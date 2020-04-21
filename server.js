const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'WebChat Bot';
// run when client connects
io.on('connection', socket => {
   // console.log('New WS connection...');

   socket.on('joinRoom', ({ username, room }) => {

      const user = userJoin(socket.id, username, room);

      socket.join(user.room);

      // welcome current user 
      socket.emit('message', formatMessage(botName, 'Welcome to WebChat!'));

      // broadcast when a user connects
      socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the channel`));
                                              // will emit the messages to all other who are connected to 
                                              // same socket except the user thats connecting

      // send users and room info
      io.to(user.room).emit('roomUsers', {
         room: user.room,
         users: getRoomUsers(user.room)
      });
                                        
   });

   
   // listen for chat message
   socket.on('chatMessage', (msg) => {
      const user = getCurrentUser(socket.id);

      io.to(user.room).emit('message', formatMessage(user.username, msg));
   });

   // runs when client disconnects
   socket.on('disconnect', () => {
      const user = userLeave(socket.id);
      
      if(user){
         io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the channel`));
                                             // socket.broadcast.emit also works fine
      }
      
      // send users and room info
      io.to(user.room).emit('roomUsers', {
         room: user.room,
         users: getRoomUsers(user.room)
      });
   });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

