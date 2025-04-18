const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('connected successfully to mongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

module.exports = connectDB;

