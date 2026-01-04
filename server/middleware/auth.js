const ErrorHandler = require('../utils/ErrorHandlerClass');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


// Checking if token available in headers
const auth = async (req, res, next) => {
    try {

        let token = req.headers.authorization;
        if (!token) {
            return res.status(404).json({
                success: false,
                message: "You are not allowed to view this content!"
            })
        }

        // Allow if user is authorized
        if (token && token.startsWith('Bearer')) {
            token = token.split(' ')[1];
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decode.id).select('_id name email avatar isOnline lastSeen createdAt');
            req.user = user;
        }
        
        next();
    } catch (error) {
        console.log("Error", error);
        return next(new ErrorHandler("Error", 400));
    }
}


module.exports = auth;