
const User = require("../models/User");
const Department = require("../models/Department");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// Get logged-in user's profile
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
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

        // Validate input types and required fields
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof department !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password ||
            !department.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required and must be valid"
            });
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedName.length < 2 || normalizedName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name must contain 2 to 100 characters"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            normalizedEmail.length > 254 ||
            !emailRegex.test(normalizedEmail)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(department)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID"
            });
        }

        // Check whether email is already registered
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Verify department exists
        const departmentExists = await Department.findById(department);

        if (!departmentExists) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        // Hash officer password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create officer with a fixed role
        const officer = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            role: "officer",
            department: departmentExists._id
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
