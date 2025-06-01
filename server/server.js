const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Database connection
mongoose
    .connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/leave-management"
    )
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Socket.io connection
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/leaves", require("./routes/leaves"));
app.use("/api/holidays", require("./routes/holidays"));
app.use("/api/users", require("./routes/users"));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ message: "Invalid JSON format" });
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
    }

    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
    }

    res.status(500).json({ message: "Something went wrong!" });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.url}` });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
