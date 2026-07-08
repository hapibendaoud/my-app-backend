// config/db.js
const mongoose = require('mongoose');

let isConnected = false; // كنعقلو على حالة الاتصال

const connectDB = async () => {
    if (isConnected) {
        console.log('=> Using existing database connection');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
        isConnected = db.connections[0].readyState;
        console.log('=> New database connection established');
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};

module.exports = connectDB;