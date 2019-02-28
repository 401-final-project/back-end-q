// 'use strict'
require('dotenv').config()
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

class Q {
  constructor(namespace){
    this.validRooms = [];
    this.namespace = namespace;
    this.adminNamespace = io.of(`/${namespace}`);
    
    this.adminNamespace.on('connect', (socket)=> {
      socket.on('join', (room, cb) => {
        let newFunction = this.handleJoin.bind(this, room, socket);
        newFunction(room, socket);
      });
    });

    io.on('connect', (socket) => {
      socket.on('publish', (namespace, room, payload) => {
        console.log(`publish detected: ${namespace}, ${room}, ${payload}`);
        this.adminNamespace.to(room).emit(room, payload);
      });
    });
  }
  
  monitorEvent(room){
    this.validRooms.push(room);
  }

  handleJoin(room, socket){
    if (this.validRooms.includes(room)){
      console.log(`Server: Connecting a user to room: ${room}, in namespace: ${this.namespace}`);
      socket.join(room);
    } else {
      console.log(`Server: Rejecting a user from room: ${room}, in namespace: ${this.namespace}`);
    }
  }
}

const db = new Q('users');

// database rooms
db.monitorEvent('create');
db.monitorEvent('update');
db.monitorEvent('destroy');

const port = process.env.PORT;
http.listen(port, function(){
  console.log(`listening on ${port}`);
});

