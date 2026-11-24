
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

// Initialize Socket.IO
initializeSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Connect to MongoDB
connectDB();

// Start HTTP server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
