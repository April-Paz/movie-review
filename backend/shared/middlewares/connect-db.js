const mongoose = require('mongoose');

const connectDB = async (req, res, next) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { 
            dbName: "movie-review" 
        });
        console.log("MongoDB Atlas connected!");
        next();
    } catch (error) {
        console.log(error);
        throw new Error("MongoDB Atlas connection failed!");
    }
};

module.exports = connectDB;