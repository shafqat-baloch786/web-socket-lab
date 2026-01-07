const User = require('../models/User');
const asyncWrapper = require('../utils/asyncWrapper');


const allUsers = asyncWrapper(async(req, res, next) => {

    // Fetch all users, exclude myself
    const users = await User.find({
        _id: { $ne: req.user.id}
    }, 'name isOnline lastSeen avatar email');

    return res.status(200).json({
        users
    });
});


module.exports = {
    allUsers,
}

