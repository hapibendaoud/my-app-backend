const mongoose = require('mongoose');

const dbURI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        // إيلا كان السيرفر ديجا متصل بالداتابايز، كمل نيشان بلا ما تعاود الاتصال
        if (mongoose.connection.readyState >= 1) {
            return;
        }

        // الاتصال بالـ URI من ملف .env
        await mongoose.connect(dbURI);
        console.log('MongoDB Connected ✅');
    } catch (error) {
        console.error('MongoDB Connection Error ❌', error.message);
        // بلاش من process.exit(1) هنا فـ Vercel حيت كتحرق الـ Function كاملة
    }
};

module.exports = connectDB;