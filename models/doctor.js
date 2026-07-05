const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
    {
        // الاسم الكامل للدكتور
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        // البريد الإلكتروني
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        // كلمة المرور (مشفرة)
        password: {
            type: String,
            required: true,
        },
        // رقم الهاتف
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        // التخصص الطبي
        specialization: {
            type: String,
            required: true,
            trim: true,
        },
        licenseNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        experience: {
            type: String,
            required: true,
            min: 0,
        },
        clinicAddress: {
            type: String,
            required: true,
            trim: true,
        },
        bio: {
            type: String,
            trim: true,
        },
        consultationFee: {
            type: String,
            required: true,
            min: 0,
        }, 
        role: {
            type: String,
            enum: ['doctor', 'patient'],
            default: 'doctor',
        },
    },
    {
        timestamps: true, // كتزيد تلقائياً createdAt و updatedAt
    }
);

// تصدير الموديل بنظام CommonJS الصحيح
module.exports = mongoose.model("Doctor", doctorSchema);