
const asyncWrapper = require('../utils/asyncWrapper');
const User = require('../models/User');
const ErrorHandler = require('../utils/ErrorHandlerClass');
const generateToken = require('../utils/generateToken');

// New user register
const register = asyncWrapper(async (req, res, next) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    // Check if user already exists
    if (userExists) {
        return next(new ErrorHandler('User already exists!', 400));
    }

    const user = await User.create({
        name,
        email,
        password
    });

    // Calling the auth and sending user id as argument to auth
    const token = generateToken(user._id);

    // Success response
    return res.status(201).json({
        success: true,
        message: 'User registerd successfuly!',
        token: token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        }

    });

});


// Login user
const login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Checking if user exists
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const isPasswordMatched = user.comparePassword(password);
    if(!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password!", 404));
    }

    // Generating token to make sure user is logged in inside of browser
    const token = generateToken(user._id);
    return res.status(200).json({
        token,
        success: true,
        message: "User logged in!",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    })
});



// Exporting controllers
module.exports = {
    register,
    login,
}