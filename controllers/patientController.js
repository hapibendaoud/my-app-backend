require('dotenv').config();
const Appointment = require("../models/appointments");
const Nurse = require("../models/newNurse");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/newPatient');




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
        console.error("Error in register:", error);
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
        console.error("Error in login:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};


exports.createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, appointmentTime, visitType, reason } = req.body;

        // 1. التحقق من الحقول الإجبارية
        if (!patientId || !doctorId || !appointmentDate || !appointmentTime || !visitType || !reason) {
            return res.status(400).json({ message: "You must fill all required fields" });
        }

        const patientExists = await Patient.findById(patientId);
        if (!patientExists) {
            return res.status(400).json({ message: "You are not a registered patient" });
        }

        const appointmentExists = await Appointment.findOne({ status : { $in: ["pending", "confirmed"] } });
        if (appointmentExists && appointmentExists.status === "pending") {
            return res.status(400).json({ message: "You have already a pending appointment at this time" });
        } else if (appointmentExists && appointmentExists.status === "confirmed") {
            return res.status(400).json({ message: "You have already a confirmed appointment at this time" });
        }

        const doctorExists = await Patient.findById(doctorId);
        if (!doctorExists) {
            return res.status(400).json({ message: "The specified doctor does not exist" });
        }

        // 2. إنشاء الموعد الجديد ف الداتابيز
        const newAppointment = new Appointment({
            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            visitType,
            reason
        });

        // حفظ ف الـ Database
        await newAppointment.save();

        // 3. استجابة بنجاح
        return res.status(201).json({
            message: "Appointment created successfully in the database",
            appointment: newAppointment
        });

    } catch (error) {
        console.error("Error in createAppointment:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};


exports.addNurse = async (req, res) => {
    try {
        const { fullName, email, age, phone } = req.body;

        // 1. التحقق من الحقول الإجبارية
        if (!fullName || !email || !age || !phone) {
            return res.status(400).json({ message: "You must fill all required fields" });
        }

        // 2. 🔥 التعديل: التأكد واش الإيميل أو الهاتف ديجا مستعملين عند شي ممرضة أخرى
        const nurseExists = await Nurse.findOne({ 
            $or: [{ email: email }, { phone: phone }] 
        });
        
        if (nurseExists) {
            return res.status(400).json({ message: "A nurse with this email and phone number already exists" });
        }
        
        // 3. إنشاء الممرضة الجديدة ف الداتابيز
        const newNurse = new Nurse({
            fullName,
            email,
            age,
            phone
        });

        // حفظ ف الـ Database
        await newNurse.save();

        // 4. استجابة بنجاح
        return res.status(201).json({
            message: "Nurse added successfully in the database",
            nurse: newNurse
        });

    } catch (error) {
        console.error("Error in addNurse:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};
