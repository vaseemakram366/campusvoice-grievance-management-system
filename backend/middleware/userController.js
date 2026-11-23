
const User = require("../models/User");

// Get logged-in user's profile
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile };
