const User = require('../models/User');
const asyncWrapper = require('../utils/asyncWrapper');


// Get profile data
const getProfile = asyncWrapper(async (req, res, next) => {
    const user = req.user;

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found!"
        })
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


module.exports = {
    getProfile,
}