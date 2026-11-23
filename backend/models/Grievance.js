
const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Grievance title is required"],
            trim: true
        },

        description: {
            type: String,
            required: [true, "Grievance description is required"]
        },

        category: {
            type: String,
            required: [true, "Category is required"]
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },

        status: {
            type: String,
            enum: ["submitted", "assigned", "in-progress", "resolved", "rejected"],
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
                    required: true
                },

                remark: {
                    type: String,
                    default: ""
                },

                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
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

grievanceSchema.index({ complainant: 1, status: 1 });
grievanceSchema.index({ department: 1, priority: -1 });

module.exports = mongoose.model("Grievance", grievanceSchema);
