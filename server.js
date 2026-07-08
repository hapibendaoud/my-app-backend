require("dotenv").config();
const express = require("express");
const cors = require("cors"); // 1. زدنا الاستيراد ديال CORS هنا
const connectDB = require('./config/db.js');
const patientRoutes = require("./routes/patientRoutes");

const app = express();

// 2. تفعيل الـ CORS (ضروري يتحط قبل الـ Routes وقبل express.json)
app.use(cors({
    origin: "http://localhost:3000", // مسموح للـ Front-end ديالك فـ الـ localhost يتصل بالـ Backend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // إلا كنتي غاتصيفط الكوكيز مستقبلاً
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

// الاتصال بالداتابيز
connectDB();

// الـ Routes ديالك
app.use('/api/patients', patientRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the Patient Management API");
});
app.get("/test", (req, res) => {
    res.send("Welcome to the Patient Management API");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
module.exports = app;