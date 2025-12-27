

// Creating a class to handle errors coming from controllers
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}


module.exports = ErrorHandler;