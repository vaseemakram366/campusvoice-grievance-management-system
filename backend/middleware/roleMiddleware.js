
const VALID_ROLES = ["complainant", "officer", "admin"];

const authorizeRoles = (...allowedRoles) => {

    // Validate role configuration
    const invalidRoles = allowedRoles.filter(
        role => !VALID_ROLES.includes(role)
    );

    if (invalidRoles.length > 0) {
        throw new Error(
            `Invalid role configuration: ${invalidRoles.join(", ")}`
        );
    }

    return (req, res, next) => {

        // Ensure authentication middleware ran first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        // Check user's authorization
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden. You do not have permission."
            });
        }

        next();
    };
};

module.exports = authorizeRoles;
