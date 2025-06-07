const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || ["http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true
    },
});

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || ["http://localhost:3000", "http://localhost:5173"],
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
    res.status(200).json({ status: "Server is running" });
});

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("New client connected");

    // Join department room
    socket.on("joinDepartment", (department) => {
        socket.join(department);
        console.log(`Client joined department room: ${department}`);
    });

    // Join user room
    socket.on("joinUser", (userId) => {
        socket.join(userId);
        console.log(`Client joined user room: ${userId}`);
    });

    // Join manager room
    socket.on("joinManager", (managerId) => {
        socket.join(managerId);
        console.log(`Manager joined room: ${managerId}`);
    });

    // Leave request notifications
    socket.on("leaveRequestSubmitted", (data) => {
        // Notify the employee
        io.to(data.employeeId).emit("leaveStatusUpdate", {
            type: 'leave',
            message: "Your leave request has been submitted",
            leaveRequest: data
        });

        // Notify the department
        if (data.department) {
            io.to(data.department).emit("departmentLeaveUpdate", {
                type: 'leave',
                message: `New leave request from ${data.employeeName}`,
                leaveRequest: data
            });
        }
    });

    // Leave status update notifications
    socket.on("leaveStatusUpdated", (data) => {
        // Notify the employee
        io.to(data.employeeId).emit("leaveStatusUpdate", {
            type: 'leave',
            message: `Your leave request has been ${data.status}`,
            leaveRequest: data
        });

        // Notify the department
        if (data.department) {
            io.to(data.department).emit("departmentLeaveUpdate", {
                type: 'leave',
                message: `Leave request from ${data.employeeName} has been ${data.status}`,
                leaveRequest: data
            });
        }

        // Notify managers
        if (data.managers) {
            data.managers.forEach(managerId => {
                io.to(managerId).emit("managerNotification", {
                    type: 'leave',
                    message: `Leave request from ${data.employeeName} has been ${data.status}`,
                    leaveRequest: data
                });
            });
        }
    });

    // Holiday notifications
    socket.on("holidayAnnounced", (data) => {
        io.to(data.department).emit("holidayAnnouncement", {
            message: `New holiday announced: ${data.name}`,
            holiday: data
        });
    });

    // User management notifications
    socket.on("userCreated", (data) => {
        io.to("admin").emit("userCreated", {
            message: `New user registered: ${data.name}`,
            user: data
        });
    });

    // System notifications
    socket.on("systemAlert", (data) => {
        io.to(data.target).emit("systemAlert", {
            message: data.message,
            alert: data
        });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Make io accessible to routes
app.set("io", io);

// Database connection
mongoose
    .connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/leave-management"
    )
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/leaves", require("./routes/leaves"));
app.use("/api/holidays", require("./routes/holidays"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin", require("./routes/adminRoutes"));

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

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
