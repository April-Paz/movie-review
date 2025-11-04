const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { 
            dbName: "movie-review" 
        });
        console.log("MongoDB Atlas connected successfully!");
        console.log(`Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error("MongoDB Atlas connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;