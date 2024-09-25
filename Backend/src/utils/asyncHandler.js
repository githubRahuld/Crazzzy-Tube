// using promise
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) =>
            next(err)
        );
    };
};

export { asyncHandler };

// //using try catch
// const requestHandlerr = (fn) => async (req, res, next) => {
//     try {
//         return fn(req, res, next);
//     } catch (error) {
//         res.status(err.status || 500).json({
//             success: false,
//             message: err.message,
//         });
//     }
// };
