const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Importamos los motores que te dio Claude
const { GameRoom } = require('./gameStateManager'); 

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Aquí guardaremos todas las salas activas
const rooms = new Map();

// Función para generar un código de sala aleatorio (Ej: FT4X)
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // 1. EVENTO: Crear Sala (Admin)
    socket.on('create_room', (config) => {
        let roomId = generateRoomCode();
        // Nos aseguramos de que el código sea único
        while (rooms.has(roomId)) {
            roomId = generateRoomCode();
        }

        // Creamos la instancia del juego usando el administrador de estados de Claude
        const roomInstance = new GameRoom(roomId, config);
        rooms.set(roomId, roomInstance);

        // El admin se une a la sala de Socket.IO
        socket.join(roomId);
        socket.roomId = roomId;
        socket.isHost = true;

        // Le devolvemos el código al frontend
        socket.emit('room_created', { roomId, config });
        console.log(`Sala creada: ${roomId} por el host ${socket.id}`);
    });

    // 2. EVENTO: Unirse a Sala (Jugador)
    socket.on('join_room', (data) => {
        const { roomId, playerName } = data;
        const room = rooms.get(roomId.toUpperCase());

        if (!room) {
            return socket.emit('room_error', { message: 'La sala no existe.' });
        }

        // Comprobar si la sala está llena (según el límite del admin)
        if (room.players && room.players.size >= room.config.maxPlayers) {
            return socket.emit('room_error', { message: 'La sala está llena.' });
        }

        // Unir al jugador a la sala de Socket.IO
        socket.join(roomId);
        socket.roomId = roomId;
        socket.isHost = false;
        socket.playerName = playerName;

        // Agregamos el jugador a la lógica del juego de Claude
        // (Asumiendo que tu gameStateManager tiene un método addPlayer o similar)
        if (typeof room.addPlayer === 'function') {
            room.addPlayer(socket.id, playerName);
        } else if (room.players) {
            room.players.set(socket.id, { name: playerName, score: 0 });
        }

        socket.emit('room_joined', { roomId, playerName });
        
        // Avisar a todos en la sala que entró alguien para actualizar el Lobby
        io.to(roomId).emit('player_joined', { playerName, id: socket.id });
    });

    // Desconexión
    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
        if (socket.roomId && rooms.has(socket.roomId)) {
            const room = rooms.get(socket.roomId);
            if (socket.isHost) {
                // Si el admin se va, se cierra la sala
                io.to(socket.roomId).emit('room_error', { message: 'El administrador cerró la sala.' });
                rooms.delete(socket.roomId);
            } else {
                if (room.players) room.players.delete(socket.id);
                io.to(socket.roomId).emit('player_left', { id: socket.id });
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
