
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check whether the Authorization header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
        });
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    // Verify access token
    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid access token payload"
            });
        }

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token"
        });
    }

    try {
        // Verify that the user still exists in the database
        const user = await User.findById(decoded.id)
            .select("_id role department");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account no longer exists"
            });
        }

        // Attach current user information to the request
        req.user = {
            ...decoded,
            id: user._id.toString(),
            role: user.role,
            department: user.department
        };

        next();

    } catch (error) {
        next(error);
    }
};

module.exports = protect;
