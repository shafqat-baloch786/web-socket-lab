const User = require('../models/User');
const asyncWrapper = require('../utils/asyncWrapper');
const ErrorHandler =  require('../utils/ErrorHandlerClass');

// Get profile data
const getProfile = asyncWrapper(async (req, res, next) => {
    const user = req.user;

    if (!user) {
        return next(new ErrorHandler('User not found!', 404));
    }

    return res.status(200).json({
        success: true,
        message: "User found!",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
        }

    })

});


// Edit profile
const editProfile = asyncWrapper(async (req, res, next) => {
    const userId = req.user.id;
    const { name, email, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
            name,
            email,
            avatar,
            }

        },
        {
            new: true,
            runValidators: true
        }
    ).select('_id name email avatar isOnline lastSeen createdAt');

    if(!user) {
        return next(new ErrorHandler("User does not exists!", 404));
    }

    return res.status(200).json({
        success: true,
        message: "User udpated successfully!",
        user,
    })
});

module.exports = {
    getProfile,
    editProfile,
}

