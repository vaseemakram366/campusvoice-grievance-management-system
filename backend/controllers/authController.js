
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate access and refresh tokens
const generateTokens = (user) => {
    const payload = {
        id: user._id.toString(),
        role: user.role
    };

    const accessToken = jwt.sign(
        payload,
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};

// Hash refresh token before storing it in database
const hashToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

// Register a new complainant
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "complainant"
        });

        // Generate tokens and store hashed refresh token
        const tokens = generateTokens(user);

        user.refreshTokenHash = hashToken(tokens.refreshToken);
        await user.save();

        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            ...tokens
        });

    } catch (error) {
        next(error);
    }
};


// Login existing user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password with stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate new tokens on successful login
        const tokens = generateTokens(user);

        user.refreshTokenHash = hashToken(tokens.refreshToken);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            ...tokens
        });

    } catch (error) {
        next(error);
    }
};


// Generate new access and refresh tokens
const refreshAccessToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        // Verify refresh token signature and expiry
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        // Find user and retrieve stored token hash
        const user = await User.findById(decoded.id)
            .select("+refreshTokenHash");

        if (
            !user ||
            !user.refreshTokenHash ||
            user.refreshTokenHash !== hashToken(refreshToken)
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or revoked refresh token"
            });
        }

        // Rotate tokens and invalidate the previous refresh token
        const tokens = generateTokens(user);

        user.refreshTokenHash = hashToken(tokens.refreshToken);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            ...tokens
        });

    } catch (error) {
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        next(error);
    }
};


// Logout and revoke refresh token
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id)
            .select("+refreshTokenHash");

        if (
            !user ||
            user.refreshTokenHash !== hashToken(refreshToken)
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or revoked refresh token"
            });
        }

        // Remove stored refresh token to revoke the session
        user.refreshTokenHash = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        next(error);
    }
};


module.exports = {
    register,
    login,
    refreshAccessToken,
    logout
};
