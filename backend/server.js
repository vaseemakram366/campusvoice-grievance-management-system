
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const { initializeSocket } = require("./sockets/socket");

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Create HTTP server for Express and Socket.IO
const httpServer = http.createServer(app);

// Configure allowed frontend origins
const allowedOrigins = (
    process.env.FRONTEND_URL || "http://localhost:5173"
)
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests without an Origin header (e.g. Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
initializeSocket(httpServer);

// Test route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CampusVoice API is running!"
    });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/grievances", require("./routes/grievanceRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});

// Centralized error handling middleware
app.use(errorHandler);

// Start server only after MongoDB connection succeeds
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        httpServer.listen(PORT, () => {
            console.log(`CampusVoice server running on port ${PORT}`);
            console.log("Allowed frontend origins:", allowedOrigins);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
