const mongoose = require('mongoose');

// تعريف السكيما الخاصة بالمريض (Patient Schema)
const newPatientSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'], // required كتعني إجباري، والميساج غايبان يلا صيفط شي حد بلا سمية
        trim: true, // كتحيد الفراغات الزايدة من الجناب (بحال " محمد ") ترجع ("محمد")
        minlength: [5, 'Full name must be at least 5 characters long'] // شرط باش يكون الاسم على الأقل 5 حروف
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // unique كتعني ممنوع يتعاoud نفس الإيميل ف قاعدة البيانات
        trim: true,
        lowercase: true // كتحول الإيميل دايما لحروف صغيرة باش ما يوقعش تكرار بسبب الحروف الكبيرة
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'] // شرط للأمان
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    birthDate: {
        type: Date // نوع البيانات تاريخ
    },
    bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // هادي كتعني أن القيم المسموح بها هي هادو فقط
        trim: true,
        default: "" 
    },
    role: {
        type: String,
        default: 'patient' // القيمة التلقائية هي مريض، هكا يلا بغيتي تزيد من بعد "admin" أو "doctor"
    }
}, {
    timestamps: true // هادي كتزيد تلقائياً جوج حقول: createdAt (وقت إنشاء الحساب) و updatedAt (وقت تعديل الحساب)
});

// تصدير الموديل (Export) باش نخدمو به ف الـ Controller
module.exports = mongoose.model('Patient', newPatientSchema);