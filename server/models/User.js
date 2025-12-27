
const mongoose = require('mongoose');
const bcrypt = requir('bcrypt');

// Creating user schema
const userSchema = new mongoose.schema({
    name: {
        type: String,
        required: [true, 'Name is required!'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required!'],
        trim: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required!'],
    },
    avatar: {
        type: String,
        default: ""
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    socketId: {
        type: String,
        default: null
    },
},
    { timestamps: true },
);

// Hashing the password before saving to database
userSchema.pre('save', async function () {

    // If password field is not modified (usually in edit profile), then skip logic and move to next
    if (!this.isModified("Password")) {
        return next();
    }

    // Otherwise hash the password before saving into database
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// User model
const User = mongoose.model('User', userSchema);

module.exports = User;
