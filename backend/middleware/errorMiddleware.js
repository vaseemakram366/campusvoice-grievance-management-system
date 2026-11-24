
const errorHandler = (err, req, res, next) => {
    console.error("API Error:", {
        method: req.method,
        url: req.originalUrl,
        message: err.message
    });

    let statusCode = err.statusCode || 500;
    let message = "Internal Server Error";

    // MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        message = "Duplicate value already exists";
    }

    // MongoDB validation error
    else if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(error => error.message)
            .join(", ");
    }

    // Invalid MongoDB ObjectId
    else if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    // Invalid JSON request body
    else if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        statusCode = 400;
        message = "Invalid JSON request body";
    }

    // Request body too large
    else if (err.status === 413) {
        statusCode = 413;
        message = "Request body is too large";
    }

    // Known client errors
    else if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Expose unexpected error details only in development
    else if (process.env.NODE_ENV === "development") {
        message = err.message || "Internal Server Error";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;
