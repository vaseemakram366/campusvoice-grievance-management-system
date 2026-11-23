
const User = require("../models/User");
const Department = require("../models/Department");
const bcrypt = require("bcrypt");

// Get logged-in user's profile
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            .populate("department", "name");

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

// Admin creates a department officer
const createOfficer = async (req, res, next) => {
    try {
        const { name, email, password, department } = req.body;

        if (!name || !email || !password || !department) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
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

        const departmentExists = await Department.findById(department);

        if (!departmentExists) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const officer = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "officer",
            department
        });

        res.status(201).json({
            success: true,
            message: "Officer created successfully",
            officer: {
                id: officer._id,
                name: officer.name,
                email: officer.email,
                role: officer.role,
                department: officer.department
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    createOfficer
};
