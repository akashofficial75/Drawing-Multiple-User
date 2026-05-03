const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// index.html ফাইলটি যেখানে আছে সেটি সার্ভ করা
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" } 
});

const rooms = {};

io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, username }) => {
        socket.join(roomId);
        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push({ id: socket.id, username });
        io.to(roomId).emit('user-list', rooms[roomId]);
    });

    socket.on('draw', (data) => {
        socket.to(data.roomId).emit('draw-data', data);
    });

    socket.on('clear', (roomId) => {
        socket.to(roomId).emit('clear-canvas');
    });

    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter(u => u.id !== socket.id);
            io.to(roomId).emit('user-list', rooms[roomId]);
        }
    });
});

// Render-এর জন্য পোর্ট সেটআপ
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));