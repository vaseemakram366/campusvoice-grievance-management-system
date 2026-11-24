
const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Grievance title is required"],
            trim: true,
            minlength: [5, "Title must contain at least 5 characters"],
            maxlength: [150, "Title cannot exceed 150 characters"]
        },

        description: {
            type: String,
            required: [true, "Grievance description is required"],
            trim: true,
            minlength: [10, "Description must contain at least 10 characters"],
            maxlength: [5000, "Description cannot exceed 5000 characters"]
        },

        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
            maxlength: [100, "Category cannot exceed 100 characters"]
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },

        status: {
            type: String,
            enum: [
                "submitted",
                "assigned",
                "in-progress",
                "resolved",
                "rejected"
            ],
            default: "submitted"
        },

        complainant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        assignedOfficer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },

        statusHistory: [
            {
                status: {
                    type: String,
                    enum: [
                        "submitted",
                        "assigned",
                        "in-progress",
                        "resolved",
                        "rejected"
                    ],
                    required: true
                },

                remark: {
                    type: String,
                    trim: true,
                    maxlength: [1000, "Remark cannot exceed 1000 characters"],
                    default: ""
                },

                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },

                updatedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

// Indexes for frequently queried fields
grievanceSchema.index({ complainant: 1, status: 1 });
grievanceSchema.index({ department: 1, priority: -1 });
grievanceSchema.index({ assignedOfficer: 1, status: 1 });
grievanceSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Grievance", grievanceSchema);
