
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Authenticate socket connections
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error("Authentication token required"));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_ACCESS_SECRET
            );

            socket.user = decoded;
            next();

        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        const userRoom = `user:${socket.user.id}`;

        socket.join(userRoom);

        console.log(`User connected to Socket.IO: ${socket.user.id}`);

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.user.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
};

module.exports = {
    initializeSocket,
    getIO
};
