const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // 1. إيلا كان ديجا متصل، كمل نيشان بلا ما تفتح اتصال جديد
        if (mongoose.connection.readyState >= 1) {
            console.log('Using existing MongoDB connection ♻️');
            return;
        }

        // 2. نقراو المتغير لداخل وسط الـ Function باش نضمنوا أنه واجد 100%
        const dbURI = process.env.MONGO_URI;

        if (!dbURI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        // 3. الاتصال مع خيارات الاستقرار لـ Serverless
        await mongoose.connect(dbURI, {
            serverSelectionTimeoutMS: 5000, // تسنى 5 ثواني كحد أقصى
            socketTimeoutMS: 45000,         // إغلاق الكونمسيون إيلا تعطلات بزاف
        });

        console.log('MongoDB Connected ✅');
    } catch (error) {
        console.error('MongoDB Connection Error ❌:', error.message);
        // بلاش من process.exit(1) هنا حيت كتحرق السيرفر ف Vercel
    }
};

module.exports = connectDB;