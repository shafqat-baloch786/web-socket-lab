

// Creating global error handler middeleware to handle errors
const errorMiddleware = (error, req, res, next) => {

    // Check if error data is coming, if not assing custom data
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    // Check if we are in development phase
    if(process.env.NODE_ENV === 'development') {
        console.log("Error", error);
        return res.status(error.statusCode).json({
            message: error.message,
            status: error.status,
            stack: error.stack
        })
    }

    // Check if we are in production
    if(process.env.NODE_ENV === 'production') {
        if(!error.isOperational) {
            return res.status(500).json({
                message: "Something went wrong!",
                status: 'Error'
            })
        }
    }


    // Return the error
    return res.status(error.statusCode).json({
        message: error.message,
        status: error.status
    });

}

module.exports = errorMiddleware