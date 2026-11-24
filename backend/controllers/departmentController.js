
const Department = require("../models/Department");
const mongoose = require("mongoose");

// Create department
const createDepartment = async (req, res, next) => {
    try {
        const { name, description, categories } = req.body;

        // Validate required fields
        if (
            typeof name !== "string" ||
            !name.trim() ||
            !Array.isArray(categories) ||
            categories.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Department name and categories are required"
            });
        }

        const normalizedName = name.trim();

        if (normalizedName.length < 2 || normalizedName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Department name must contain 2 to 100 characters"
            });
        }

        if (
            description !== undefined &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Description must be a string"
            });
        }

        if (
            typeof description === "string" &&
            description.length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Description cannot exceed 1000 characters"
            });
        }

        // Normalize and validate categories
        const normalizedCategories = categories.map(category => {
            if (typeof category !== "string") {
                return "";
            }

            return category.trim();
        });

        if (
            normalizedCategories.some(
                category => !category || category.length > 100
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Every category must be a non-empty string of at most 100 characters"
            });
        }

        // Remove duplicate categories (case-insensitive)
        const uniqueCategories = [
            ...new Map(
                normalizedCategories.map(category => [
                    category.toLowerCase(),
                    category
                ])
            ).values()
        ];

        // Check duplicate department
        const existingDepartment = await Department.findOne({
            name: {
                $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i"
            }
        });

        if (existingDepartment) {
            return res.status(409).json({
                success: false,
                message: "Department already exists"
            });
        }

        const department = await Department.create({
            name: normalizedName,
            description: description?.trim() || "",
            categories: uniqueCategories
        });

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            department
        });

    } catch (error) {
        next(error);
    }
};


// Get all departments
const getDepartments = async (req, res, next) => {
    try {
        const departments = await Department.find()
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: departments.length,
            departments
        });

    } catch (error) {
        next(error);
    }
};


// Get department by ID
const getDepartmentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID"
            });
        }

        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.status(200).json({
            success: true,
            department
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentById
};
