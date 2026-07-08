require("dotenv").config();
const express = require("express");
const connectDB = require('./config/db.js');
const patientRoutes = require("./routes/patientRoutes"); // جبنا لوحة الإرشادات

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// الاتصال بالداتابيز
connectDB();

// أي طلب كيبدا بـ /api/patients غايمشي نيشان لملف patientRoutes
app.use('/api/patients', patientRoutes);


app.get("/", (req, res) => {
    res.send("Welcome to the Patient Management API");
});
app.get("/test", (req, res) => {
    res.send("Welcome to the Patient Management API");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
module.exports = app;