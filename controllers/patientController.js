require('dotenv').config();
const Appointment = require("../models/appointments");
const Nurse = require("../models/newNurse");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/newPatient');
const Doctor = require('../models/doctor');

// الدالة الخاصة بتسجيل المريض الجديد
exports.registerPatient = async (req, res) => {
    try {
        const { fullName, email, password, phone, birthDate } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: "You must fill all required fields" });
        }

        const patientExists = await Patient.findOne({ email });
        if (patientExists) {
            return res.status(400).json({ message: "This email is already Used" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newPatient = new Patient({
            fullName,
            email,
            password: hashedPassword,
            phone,
            birthDate
        });

        await newPatient.save();

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
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};

// دالة تسجيل الدخول (Login)
exports.loginPatient = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            const patient = await Patient.findOne({ email });
            if (!patient) {
                return res.status(401).json({ message: "Invalid email or password" });
            }
            const isMatch = await bcrypt.compare(password, patient.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }
            const token = jwt.sign(
                { id: patient._id, role: patient.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            return res.status(201).json({
                message: `Welcome Back ${patient.fullName}!`,
                token: token,
                role: patient.role,
                patient: { id: patient._id, fullName: patient.fullName }
            });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign(
            { id: doctor._id, role: doctor.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        return res.status(201).json({
            message: "Welcome Back Doctor!",
            token: token,
            role: doctor.role,
            patient: { id: doctor._id, fullName: doctor.fullName }
        });
    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        const { patientId, fullName, appointmentDate, appointmentTime, visitType, reason } = req.body;

        if (!patientId || !fullName || !appointmentDate || !appointmentTime || !visitType || !reason) {
            return res.status(400).json({ message: "You must fill all required fields" });
        }

        const patientExists = await Patient.findById(patientId);
        if (!patientExists) {
            return res.status(400).json({ message: "You are not a registered patient" });
        }

        const appointmentExists = await Appointment.findOne({ status : { $in: ["Pending", "Confirmed"] } });
        if (appointmentExists && appointmentExists.status === "Pending") {
            return res.status(400).json({ message: "You have already a pending appointment at this time" });
        } else if (appointmentExists && appointmentExists.status === "Confirmed") {
            return res.status(400).json({ message: "You have already a Confirmed appointment at this time" });
        }

        const newAppointment = new Appointment({
            patientId,
            fullName,
            appointmentDate,
            appointmentTime,
            visitType,
            reason
        });

        await newAppointment.save();

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
        const { fullName, email, age, phone, description } = req.body;

        if (!fullName || !email || !age || !phone || !description) {
            return res.status(400).json({ message: "You must fill all required fields" });
        }

        const nurseExists = await Nurse.findOne({ 
            $or: [{ email: email }, { phone: phone }] 
        });
        
        if (nurseExists) {
            return res.status(400).json({ message: "A nurse with this email and phone number already exists" });
        }
        
        const newNurse = new Nurse({
            fullName,
            email,
            age,
            phone,
            description
        });

        await newNurse.save();

        return res.status(201).json({
            message: "Nurse added successfully in the database",
            nurse: newNurse
        });

    } catch (error) {
        console.error("Error in addNurse:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};

exports.getNurses = async (req, res) => {
    try{
        const nurses = await Nurse.find();

        if(!nurses || nurses.length === 0){
            return res.status(404).json({message: "No Nurses found"})
        }

        return res.status(200).json(nurses);

    } catch (error) {
        console.error("Error in getNurses:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        let token = req.headers['token'] || req.headers['authorization']; 

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }
        
        if (token && token.startsWith('Bearer ')) {
            token = token.split(' ')[1]; 
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const appointments = await Appointment.find().populate('patientId').lean(); 
        
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "No appointments found" });
        }

        const dateNow = new Date();

        for (const appot of appointments) {
            const patient = appot.patientId; 
            
            if (patient && patient.birthDate) {
                const birthday = new Date(patient.birthDate); 
                
                let age = dateNow.getFullYear() - birthday.getFullYear();
                const monthDifference = dateNow.getMonth() - birthday.getMonth();
                if (monthDifference < 0 || (monthDifference === 0 && dateNow.getDate() < birthday.getDate())) {
                    age--;  
                }

                appot.age = age; 
                appot.fullName = patient.fullName; 
                appot.phone = patient.phone; 
            }
        }

        return res.status(200).json(appointments);

    } catch (error) {
        console.error("Error in getAppointments:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};

exports.getPatientAppointments = async (req, res) => {
    try {
        let token = req.headers['token'] || req.headers['authorization']; 

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }
        
        if (token && token.startsWith('Bearer ')) {
            token = token.split(' ')[1]; 
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const patientId = decoded.id;
        const appointments = await Appointment.find({ patientId: patientId }).lean(); 
        
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "No appointments found for this patient" });
        }

        return res.status(200).json(appointments);

    } catch (error) {
        console.error("Error in getPatientAppointments:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};

exports.registerDoctor = async (req, res) => {
    try {
        const { fullName, specialization, email, phoneNumber, password, licenseNumber, experience, clinicAddress, bio, consultationFee } = req.body;

        if (!fullName || !email || !password || !phoneNumber || !specialization || !licenseNumber || !experience || !clinicAddress || !bio || !consultationFee) {
            return res.status(400).json({ message: "You must fill all required fields" });
        }

        const doctorExists = await Doctor.findOne({ email });
        if (doctorExists) {
            return res.status(400).json({ message: "This email is already Used" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newDoctor = new Doctor({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            specialization,
            licenseNumber,
            experience,
            clinicAddress,
            bio,
            consultationFee
        });

        await newDoctor.save();

        return res.status(201).json({
            message: "Doctor account created successfully in the database",
            doctor: {
                id: newDoctor._id,
                fullName: newDoctor.fullName,
                email: newDoctor.email,
                phoneNumber: newDoctor.phoneNumber,
                specialization: newDoctor.specialization,
                licenseNumber: newDoctor.licenseNumber,
                experience: newDoctor.experience,
                clinicAddress: newDoctor.clinicAddress,
                bio: newDoctor.bio,
                consultationFee: newDoctor.consultationFee
            }
        });

    } catch (error) {
        console.error("Error in registerDoctor:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};

exports.getDoctorOrPatient = async (req, res) => {
    try {
        let token = req.headers['token'] || req.headers['authorization']; 
        const role = req.headers['role'] || req.headers['x-role']; 

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        if (token && token.startsWith('Bearer ')) {
            token = token.split(' ')[1]; 
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const userId = decoded.id; 
        if (!userId) {
            return res.status(400).json({ message: "User ID is missing in token payload" });
        }

        if (role === "doctor") {
            const doctor = await Doctor.findById(userId).select('-password').lean();
            if (!doctor) {
                return res.status(404).json({ message: "Doctor not found" });
            }
            return res.status(200).json(doctor);

        } else if (role === "patient") {
            const patient = await Patient.findById(userId).select('-password').lean();
            if (!patient) {
                return res.status(404).json({ message: "Patient not found" });
            }
            if(patient.birthDate) {
                let newDate = new Date();
                let birthDate = new Date(patient.birthDate);
                let age = newDate.getFullYear() - birthDate.getFullYear();
                const monthDifference = newDate.getMonth() - birthDate.getMonth();
                if (monthDifference < 0 || (monthDifference === 0 && newDate.getDate() < birthDate.getDate())) {
                    age--;
                }
                patient.age = age;
            }
            return res.status(200).json(patient);

        } else {
            return res.status(400).json({ message: "Invalid role provided" });
        }

    } catch (error) {
        console.error("Error in getDoctorOrPatient:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};

exports.statusUpdate = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { status } = req.body;
        // ✅ تم إصلاحها لـ let لتفادي كراش السيرفر
        let token = req.headers['token'] || req.headers['authorization']; 

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }
        if (token && token.startsWith('Bearer ')) {
            token = token.split(' ')[1]; 
        }
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.status === status) {
            return res.status(400).json({ message: `Appointment is already ${status}` });
        }

        appointment.status = status;
        await appointment.save();

        return res.status(200).json({
            message: "Appointment status updated successfully",
            appointment: appointment
        });

    } catch (error) {
        console.error("Error in statusUpdate:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};