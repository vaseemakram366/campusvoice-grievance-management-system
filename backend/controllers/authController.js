
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

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
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
            name: name.trim(),
            email: normalizedEmail,
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

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid email and password are required"
            });
        }

        // Explicitly select password because User schema hides it by default
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

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

        if (
            typeof refreshToken !== "string" ||
            !refreshToken
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid refresh token is required"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token payload"
            });
        }

        // Generate replacement tokens
        const tokens = generateTokens({
            _id: decoded.id,
            role: decoded.role
        });

        const oldTokenHash = hashToken(refreshToken);
        const newTokenHash = hashToken(tokens.refreshToken);

        // Atomically rotate refresh token
        const user = await User.findOneAndUpdate(
            {
                _id: decoded.id,
                role: decoded.role,
                refreshTokenHash: oldTokenHash
            },
            {
                $set: {
                    refreshTokenHash: newTokenHash
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or revoked refresh token"
            });
        }

        res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            ...tokens
        });

    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "CastError"
        ) {
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

        if (
            typeof refreshToken !== "string" ||
            !refreshToken
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid refresh token is required"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token payload"
            });
        }

        // Atomically revoke the matching refresh token
        const user = await User.findOneAndUpdate(
            {
                _id: decoded.id,
                role: decoded.role,
                refreshTokenHash: hashToken(refreshToken)
            },
            {
                $set: {
                    refreshTokenHash: null
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or revoked refresh token"
            });
        }

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "CastError"
        ) {
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
