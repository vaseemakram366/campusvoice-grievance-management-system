
const Department = require("../models/Department");

// Create department
const createDepartment = async (req, res, next) => {
    try {
        const { name, description, categories } = req.body;

        if (!name || !categories || !categories.length) {
            return res.status(400).json({
                success: false,
                message: "Department name and categories are required"
            });
        }

        const existingDepartment = await Department.findOne({
            name: name.trim()
        });

        if (existingDepartment) {
            return res.status(409).json({
                success: false,
                message: "Department already exists"
            });
        }

        const department = await Department.create({
            name,
            description,
            categories
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
        const departments = await Department.find().sort({ name: 1 });

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
        const department = await Department.findById(req.params.id);

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
