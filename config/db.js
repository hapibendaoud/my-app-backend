const mongoose = require('mongoose');

const dbURI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        // كنقراو الـ URI من ملف .env نيشان وبلا خيارات قديمة
        await mongoose.connect(dbURI);
        console.log('MongoDB Connected ✅');
    } catch (error) {
        console.error('MongoDB Connection Error ❌', error.message);
        process.exit(1); // إيقاف السيرفر يلا مابغاش يتكونيكطا
    }
};

module.exports = connectDB;