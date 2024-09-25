class ApiError extends Error {
    constructor(
        statusCode = 500,
        message = "something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        //optional
        if (stack) {
            // stack = proper place of error
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;

// class ApiError extends Error {
//     constructor(
//         message = "Something went wrong", // Default message
//         statusCode = 500, // Default status code
//         errors = [], // Additional error details
//         data = null // Additional data (if any)
//     ) {
//         super(message);
//         this.statusCode = statusCode;
//         this.errors = errors;
//         this.data = data;
//         this.success = false;

//         // Capture the stack trace only if not provided
//         if (!this.stack) {
//             Error.captureStackTrace(this, this.constructor);
//         }
//     }
// }

// export default ApiError;
