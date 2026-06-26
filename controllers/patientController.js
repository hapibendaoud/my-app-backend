const Patient = require('../models/newPatient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// الدالة الخاصة بتسجيل المريض الجديد
exports.registerPatient = async (req, res) => {
    try {
        const { fullName, email, password, phone, birthDate } = req.body;

        // 1. التحقق من الحقول الإجبارية
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: "You must fill all required fields" });
        }

        // 2. التأكد واش المريض ديجا مسجل
        const patientExists = await Patient.findOne({ email });
        if (patientExists) {
            return res.status(400).json({ message: "This email is already in use" });
        }

        // 3. تشفير كلمة المرور
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. إنشاء المريض الجديد ف الداتابيز
        const newPatient = new Patient({
            fullName,
            email,
            password: hashedPassword,
            phone,
            birthDate
        });

        // حفظ ف الـ Database
        await newPatient.save();

        // 5. استجابة بنجاح (تأكد من الأقواس هنا!)
        return res.status(201).json({
            message: "Patient account created successfully in the database",
            patient: {
                id: newPatient._id,
                fullName: newPatient.fullName,
                email: newPatient.email
            }
        });

    } catch (error) {
        console.error("Error f register:", error);
        // ضروري هاد السطر باش يلا وقع أي خطأ، بوستمان يحبس ويجيك جواب 500
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};





// دالة خاصة بتسجيل الدخول ديال المريض
// دالة تسجيل الدخول (Login)


exports.loginPatient = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. التحقق واش دخل الإيميل والمودباس
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        // 2. نقلبو على المريض ف الداتابيز بالإيميل ديالو
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(401).json({ message: "Invalid email or password" }); // الإيميل ما كاينش
        }

        // 3. مقارنة المودباس العادي لي صيفط مع المشفر لي مخبّي ف الداتابيز
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" }); // المودباس غلاط
        }
        const token = jwt.sign(
                { id: patient._id, role: patient.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
        // 4. استجابة بنجاح (نقدرو نزيدو JWT Token هنا من بعد للأمان)
        return res.status(200).json({
            message: "Login successful!",
            token: token, // هاهو التوكن واجد طاير لليوزر
            patient: { id: patient._id, fullName: patient.fullName }
        });
    } catch (error) {
        console.error("Error f login:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};