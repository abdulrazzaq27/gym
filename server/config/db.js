const mongoose = require('mongoose')

async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to DB")
    }
    catch(err){
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}
module.exports = connectDB;