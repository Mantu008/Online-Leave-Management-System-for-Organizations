const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middlewares/authMiddleware");
const { sendLoginNotification } = require("../utils/email");

dotenv.config();

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post(
    "/register",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Please include a valid email"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
        body("department").notEmpty().withMessage("Department is required"),
        body("position").notEmpty().withMessage("Position is required"),
        body("joiningDate")
            .isISO8601()
            .toDate()
            .withMessage("Joining date is required"),
        body("role")
            .isIn(["employee", "manager", "admin"])
            .withMessage("Invalid role"),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                name,
                email,
                password,
                department,
                role,
                position,
                joiningDate,
            } = req.body;

            // Check if user exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: "User already exists" });
            }

            // Create new user
            user = new User({
                name,
                email,
                password,
                department,
                role,
                position,
                joiningDate,
            });

            await user.save();

            // Create token
            const token = jwt.sign(
                { userId: user._id.toString() },
                process.env.JWT_SECRET,
                { expiresIn: "24h" },
            );

            console.log("Generated token payload:", {
                userId: user._id.toString(),
            });

            res.status(201).json({
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    position: user.position,
                    joiningDate: user.joiningDate,
                    leaveBalance: user.leaveBalance,
                },
            });
        } catch (err) {
            console.error("Register error:", err);
            res.status(500).json({
                message: "Server error during registration",
            });
        }
    },
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Please include a valid email"),
        body("password").exists().withMessage("Password is required"),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;
            console.log("Login attempt for email:", email);

            // Check if user exists
            const user = await User.findOne({ email });
            if (!user) {
                console.log("User not found:", email);
                return res.status(400).json({ message: "Invalid credentials" });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                console.log("Invalid password for user:", email);
                return res.status(400).json({ message: "Invalid credentials" });
            }

            console.log("Login successful for user:", {
                id: user._id,
                role: user.role,
            });

            // Create token
            const token = jwt.sign(
                { userId: user._id.toString() },
                process.env.JWT_SECRET,
                { expiresIn: "24h" },
            );

            console.log("Generated token payload:", {
                userId: user._id.toString(),
            });

            // Ensure leaveBalance exists and update lastLogin without triggering full validation
            const updatePayload = {
                lastLogin: new Date(),
            };
            if (!user.leaveBalance) {
                updatePayload.leaveBalance = {
                    annual: 20,
                    sick: 10,
                    casual: 5,
                };
            }
            await User.updateOne(
                { _id: user._id },
                { $set: updatePayload },
                { runValidators: false },
            );

            const userResponse = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                leaveBalance: user.leaveBalance,
            };

            console.log("Sending response:", {
                token: token.substring(0, 20) + "...",
                user: userResponse,
            });

            // Fire-and-forget login email notification (do not block login if email fails)
            try {
                console.log(
                    "Sending login email notification to:",
                    process.env.GMAIL_USER,
                );
                await sendLoginNotification(
                    process.env.GMAIL_USER || user.email,
                    user.name,
                    {
                        ip: req.ip,
                        userAgent: req.headers["user-agent"],
                        timestamp: new Date().toISOString(),
                    },
                );
            } catch (mailErr) {
                console.warn(
                    "Login email notification failed:",
                    mailErr?.message || mailErr,
                );
            }

            res.json({
                token,
                user: userResponse,
            });
        } catch (err) {
            console.error("Login error:", err);
            res.status(500).json({ message: "Server error during login" });
        }
    },
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure leaveBalance exists without triggering full validation for legacy users
        if (!user.leaveBalance) {
            await User.updateOne(
                { _id: user._id },
                { $set: { leaveBalance: { annual: 20, sick: 10, casual: 5 } } },
                { runValidators: false },
            );
            // Refresh document after update
            user.leaveBalance = { annual: 20, sick: 10, casual: 5 };
        }

        res.json(user);
    } catch (err) {
        console.error("Get user error:", err);
        res.status(500).json({ message: "Server error while fetching user" });
    }
});

// @route   PATCH /api/auth/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private (Admin)
router.patch(
    "/users/:id/role",
    [
        protect,
        body("role")
            .isIn(["employee", "manager", "admin"])
            .withMessage("Invalid role"),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Check if user is admin
            if (req.user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Not authorized to update user roles" });
            }

            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            user.role = req.body.role;
            await user.save();

            res.json({
                message: "User role updated successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                },
            });
        } catch (err) {
            console.error("Update role error:", err);
            res.status(500).json({
                message: "Server error while updating role",
            });
        }
    },
);

module.exports = router;
// Test email route (non-production only)
if (process.env.NODE_ENV !== "production") {
    // Quick env check endpoint
    router.get("/env-check", (req, res) => {
        res.json({
            loadedFrom: process.env._ENV_LOADED_FROM || "unknown",
            GMAIL_USER_present: Boolean(process.env.GMAIL_USER),
            GMAIL_PASS_present: Boolean(process.env.GMAIL_PASS),
            node_env: process.env.NODE_ENV || "undefined",
        });
    });

    router.get("/test-email", async (req, res) => {
        try {
            if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
                return res
                    .status(400)
                    .json({
                        message: "Missing GMAIL_USER or GMAIL_PASS in env",
                    });
            }
            await sendLoginNotification(process.env.GMAIL_USER, "Test User", {
                ip: req.ip,
                userAgent: req.headers["user-agent"],
                timestamp: new Date().toISOString(),
            });
            return res.json({
                message: `Test email sent to ${process.env.GMAIL_USER}`,
            });
        } catch (e) {
            return res
                .status(500)
                .json({ message: e?.message || "Failed to send test email" });
        }
    });
}
