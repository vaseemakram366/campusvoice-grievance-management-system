
const Grievance = require("../models/Grievance");

// Pending grievances grouped by department
const getPendingReport = async (req, res, next) => {
    try {
        const report = await Grievance.aggregate([
            {
                $match: {
                    status: {
                        $nin: ["resolved", "rejected"]
                    }
                }
            },
            {
                $group: {
                    _id: "$department",
                    pendingCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "departments",
                    localField: "_id",
                    foreignField: "_id",
                    as: "department"
                }
            },
            {
                $unwind: "$department"
            },
            {
                $project: {
                    _id: 0,
                    department: "$department.name",
                    pendingCount: 1
                }
            },
            {
                $sort: {
                    pendingCount: -1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            report
        });

    } catch (error) {
        next(error);
    }
};


// Average grievance resolution time
const getResolutionReport = async (req, res, next) => {
    try {
        const report = await Grievance.aggregate([
            {
                $match: {
                    status: "resolved"
                }
            },
            {
                $addFields: {
                    resolvedEntry: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$statusHistory",
                                    as: "entry",
                                    cond: {
                                        $eq: ["$$entry.status", "resolved"]
                                    }
                                }
                            },
                            -1
                        ]
                    }
                }
            },
            {
                $match: {
                    resolvedEntry: { $exists: true }
                }
            },
            {
                $project: {
                    resolutionTimeHours: {
                        $divide: [
                            {
                                $subtract: [
                                    "$resolvedEntry.updatedAt",
                                    "$createdAt"
                                ]
                            },
                            3600000
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalResolved: { $sum: 1 },
                    averageResolutionHours: {
                        $avg: "$resolutionTimeHours"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalResolved: 1,
                    averageResolutionHours: {
                        $round: ["$averageResolutionHours", 2]
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            report: report[0] || {
                totalResolved: 0,
                averageResolutionHours: 0
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPendingReport,
    getResolutionReport
};
