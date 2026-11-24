
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initializeSocket = (httpServer) => {
    // Configure allowed frontend origins
    const allowedOrigins = (
        process.env.FRONTEND_URL || "http://localhost:5173"
    )
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean);

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"]
        },

        // Restrict browser connections to approved origins
        allowRequest: (request, callback) => {
            const origin = request.headers.origin;

            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback("Origin not allowed", false);
        }
    });

    // Authenticate socket connections
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication token required"));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_ACCESS_SECRET
            );

            // Validate authenticated user information
            if (!decoded.id) {
                return next(new Error("Invalid authentication payload"));
            }

            socket.user = decoded;
            next();

        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    // Handle authenticated connections
    io.on("connection", (socket) => {
        const userRoom = `user:${socket.user.id}`;

        // Join a private room for this user
        socket.join(userRoom);

        console.log(
            `User connected to Socket.IO: ${socket.user.id}`
        );

        // Handle disconnection
        socket.on("disconnect", (reason) => {
            console.log(
                `User disconnected: ${socket.user.id} (${reason})`
            );
        });
    });

    return io;
};

// Get initialized Socket.IO instance
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
