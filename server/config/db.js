const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;


// Connecting database
const connectDB = async () => {
    try {
        const connection = await mongoose.connect(MONGO_URI);
        console.log("Mongodb database connected!");
    } catch (error) {
        console.log("Error while connecting mongodb", error);
    }
}

module.exports = connectDB;